"""
ortak.py — Eğitim boyunca modüller arasında paylaşılan yardımcılar.

M2'de canlı yazılan RAG kodu, M3/M4/M5/M7'de tekrar yazılmasın diye burada da durur.
Notebook'lar bu dosyayı `from ortak import ...` ile kullanır.
"""
from __future__ import annotations

import json
import os
from functools import lru_cache
from pathlib import Path

KOK = Path(__file__).resolve().parent
VERI = KOK / "data"

# Tüm eğitimde tek bir yerden değiştirilebilen model adı.
MODEL = os.environ.get("EGITIM_MODEL", "claude-opus-5-5")
EMBEDDING_MODELI = "intfloat/multilingual-e5-small"  # Türkçe destekli, ücretsiz, ~120 MB

# Reddedilen (refusal) isteklerde sunucu tarafında başka modele geçiş (beta).
# Hesabınızda desteklenmiyorsa otomatik olarak kapatılır.
YEDEK_MODEL_ACIK = True


# ---------------------------------------------------------------- M1 · Karar şeması
# M1'de canlı yazılır; M5 (ekip çıktısı) ve M6 (.NET karar ekranı) aynı alanları kullanır.
from typing import Literal

from pydantic import BaseModel, Field


class Karar(BaseModel):
    karar: Literal["onayla", "reddet", "incele"] = Field(description="Önerilen karar")
    gerekce: str = Field(description="Kararın 2-3 cümlelik gerekçesi")
    riskler: list[str] = Field(description="Tespit edilen başlıca riskler")
    kosullar: list[str] = Field(description="Onay için sağlanması gereken koşullar (yoksa boş liste)")
    guven: float = Field(description="0 ile 1 arasında güven skoru")


# ---------------------------------------------------------------- Kurulum
def api_anahtari_yukle() -> None:
    """ANTHROPIC_API_KEY'i Colab Secrets → ortam değişkeni → elle giriş sırasıyla bulur."""
    if os.environ.get("ANTHROPIC_API_KEY"):
        return
    try:
        from google.colab import userdata  # type: ignore

        os.environ["ANTHROPIC_API_KEY"] = userdata.get("ANTHROPIC_API_KEY")
        return
    except Exception:
        pass
    from getpass import getpass

    os.environ["ANTHROPIC_API_KEY"] = getpass("ANTHROPIC_API_KEY: ")


@lru_cache(maxsize=1)
def istemci():
    import anthropic

    api_anahtari_yukle()
    return anthropic.Anthropic()


def sohbet_modeli(**kw):
    """LangChain/LangGraph için sohbet modeli (M4, M5)."""
    from langchain_anthropic import ChatAnthropic

    api_anahtari_yukle()
    return ChatAnthropic(model=MODEL, max_tokens=kw.pop("max_tokens", 4096), **kw)


def yapilandirilmis_sor(prompt: str, sema, sistem: str | None = None, max_tokens: int = 4096):
    """Pydantic şemasına uygun, doğrulanmış çıktı döndürür (M1'deki yöntem)."""
    global YEDEK_MODEL_ACIK
    import anthropic

    kw = dict(model=MODEL, max_tokens=max_tokens,
              messages=[{"role": "user", "content": prompt}], output_format=sema)
    if sistem:
        kw["system"] = sistem
    c = istemci()
    if YEDEK_MODEL_ACIK:
        try:
            r = c.beta.messages.parse(**kw, betas=["server-side-fallback-2026-07-01"],
                                      extra_body={"fallbacks": "default"})
        except anthropic.BadRequestError:
            YEDEK_MODEL_ACIK = False
            r = c.messages.parse(**kw)
    else:
        r = c.messages.parse(**kw)
    if r.stop_reason == "refusal":
        raise RuntimeError("Model isteği güvenlik nedeniyle reddetti.")
    return r.parsed_output


def metin_sor(prompt: str, sistem: str | None = None, max_tokens: int = 4096) -> str:
    kw = dict(model=MODEL, max_tokens=max_tokens, messages=[{"role": "user", "content": prompt}])
    if sistem:
        kw["system"] = sistem
    r = istemci().messages.create(**kw)
    if r.stop_reason == "refusal":
        return "[Model bu isteği reddetti]"
    return "".join(b.text for b in r.content if b.type == "text")


# ---------------------------------------------------------------- Veri
def dokumanlari_yukle() -> list[dict]:
    return json.loads((VERI / "dokumanlar.json").read_text(encoding="utf-8"))


def kullanicilari_yukle() -> list[dict]:
    return json.loads((VERI / "kullanicilar.json").read_text(encoding="utf-8"))


# ---------------------------------------------------------------- M2 · RAG
class RagIndeksi:
    """Dokümanları parçalara böler, embedding'ler, Chroma'ya yazar ve arar."""

    def __init__(self, dokumanlar: list[dict], parca_boyu: int = 400, ortusme: int = 60):
        import chromadb
        from langchain_text_splitters import RecursiveCharacterTextSplitter
        from sentence_transformers import SentenceTransformer

        self.model = SentenceTransformer(EMBEDDING_MODELI)
        bolucu = RecursiveCharacterTextSplitter(chunk_size=parca_boyu, chunk_overlap=ortusme)
        ids, metinler, meta = [], [], []
        for d in dokumanlar:
            for i, parca in enumerate(bolucu.split_text(d["metin"])):
                ids.append(f"{d['id']}#{i}")
                metinler.append(parca)
                meta.append({"dok_id": d["id"], "baslik": d["baslik"], "departman": d["departman"]})
        vektorler = self.model.encode([f"passage: {m}" for m in metinler], normalize_embeddings=True)
        db = chromadb.EphemeralClient()
        try:
            db.delete_collection("dokumanlar")
        except Exception:
            pass
        self.koleksiyon = db.create_collection("dokumanlar", metadata={"hnsw:space": "cosine"})
        self.koleksiyon.add(ids=ids, documents=metinler, embeddings=vektorler.tolist(), metadatas=meta)
        self.parca_sayisi = len(ids)

    def ara(self, soru: str, k: int = 4) -> list[dict]:
        q = self.model.encode([f"query: {soru}"], normalize_embeddings=True)
        s = self.koleksiyon.query(query_embeddings=q.tolist(), n_results=k)
        return [
            {"id": i, "dok_id": m["dok_id"], "baslik": m["baslik"], "parca": d, "skor": round(1 - dist, 3)}
            for i, d, m, dist in zip(s["ids"][0], s["documents"][0], s["metadatas"][0], s["distances"][0])
        ]


@lru_cache(maxsize=1)
def rag_indeksi() -> RagIndeksi:
    return RagIndeksi(dokumanlari_yukle())


RAG_SISTEM = (
    "Sen Atlas Teknoloji'nin kurumsal politika asistanısın. Yalnızca verilen bağlamı kullan. "
    "Her bilginin sonunda kaynağı [DOK-xx] biçiminde göster. Bağlamda cevap yoksa "
    "'Bu bilgi dokümanlarda yok' de."
)


def baglam_olustur(sonuclar: list[dict]) -> str:
    return "\n\n".join(f"[{r['dok_id']}] {r['baslik']}\n{r['parca']}" for r in sonuclar)


def rag_cevapla(soru: str, k: int = 4) -> str:
    sonuclar = rag_indeksi().ara(soru, k)
    return metin_sor(f"Bağlam:\n{baglam_olustur(sonuclar)}\n\nSoru: {soru}", sistem=RAG_SISTEM)


# ---------------------------------------------------------------- M3 · Graf
def graf_kur():
    """Kullanıcı → konu ← doküman ve konu ↔ konu ilişkilerinden bilgi grafı."""
    import networkx as nx

    G = nx.Graph()
    for d in dokumanlari_yukle():
        G.add_node(d["id"], tur="dokuman", etiket=d["baslik"])
        for k in d["konular"]:
            G.add_node(k, tur="konu", etiket=k)
            G.add_edge(d["id"], k, iliski="ILGILI")
    for u in kullanicilari_yukle():
        G.add_node(u["id"], tur="kullanici", etiket=u["ad"])
        for k in u["ilgi_alanlari"]:
            G.add_node(k, tur="konu", etiket=k)
            G.add_edge(u["id"], k, iliski="ILGILENIR")
    for a, rel, b in json.loads((VERI / "graf_ucluleri.json").read_text(encoding="utf-8")):
        G.add_node(a, tur="konu", etiket=a)
        G.add_node(b, tur="konu", etiket=b)
        G.add_edge(a, b, iliski=rel)
    return G


def kisisel_sirala(soru: str, kullanici_id: str, alfa: float = 0.5, k: int = 6) -> list[dict]:
    """Skor = alfa · vektör benzerliği + (1-alfa) · kişiselleştirilmiş PageRank.
    Geniş bir aday havuzu (20 parça) alınır, doküman başına en iyi parça tutulur, yeniden sıralanır."""
    import networkx as nx

    G = graf_kur()
    ppr = nx.pagerank(G, personalization={kullanici_id: 1.0})
    dok_ppr = {n: v for n, v in ppr.items() if G.nodes[n]["tur"] == "dokuman"}
    en_buyuk = max(dok_ppr.values())
    adaylar = {}
    for r in rag_indeksi().ara(soru, 20):
        adaylar.setdefault(r["dok_id"], r)   # sonuçlar skora göre sıralı → ilk gelen en iyisi
    for r in adaylar.values():
        r["graf"] = round(dok_ppr.get(r["dok_id"], 0) / en_buyuk, 3)
        r["final"] = round(alfa * r["skor"] + (1 - alfa) * r["graf"], 3)
    return sorted(adaylar.values(), key=lambda r: r["final"], reverse=True)[:k]


# ---------------------------------------------------------------- M4 · Araç fonksiyonları
def onay_yetkilisi(tutar_tl: float, butce_disi: bool = False) -> str:
    """DOK-01 onay matrisinin deterministik karşılığı."""
    if tutar_tl <= 50_000:
        y = "Departman Müdürü"
    elif tutar_tl <= 500_000:
        y = "Departman Müdürü + Finans Müdürü"
    elif tutar_tl <= 2_000_000:
        y = "CFO (Genel Müdür Yardımcısı)"
    else:
        y = "Genel Müdür + Yönetim Kurulu bilgilendirmesi"
    if butce_disi and "Finans" not in y:
        y += " + Finans Müdürü (bütçe dışı)"
    return y


def guvenli_hesapla(ifade: str) -> float:
    """Sadece aritmetik: + - * / ( ) % ve sayılar."""
    import ast
    import operator as op

    izinli = {ast.Add: op.add, ast.Sub: op.sub, ast.Mult: op.mul, ast.Div: op.truediv,
              ast.Mod: op.mod, ast.Pow: op.pow, ast.USub: op.neg}

    def _d(n):
        if isinstance(n, ast.Constant) and isinstance(n.value, (int, float)):
            return n.value
        if isinstance(n, ast.BinOp) and type(n.op) in izinli:
            return izinli[type(n.op)](_d(n.left), _d(n.right))
        if isinstance(n, ast.UnaryOp) and type(n.op) in izinli:
            return izinli[type(n.op)](_d(n.operand))
        raise ValueError("Yalnızca aritmetik ifadeler desteklenir")

    return _d(ast.parse(ifade.replace(",", "."), mode="eval").body)
