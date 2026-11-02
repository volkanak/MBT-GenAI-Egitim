"""
Eğitim içeriğini TEK KAYNAKTAN üretir:
  _kaynak/*.py  (# %% hücreli betikler)  →  M*/..._baslangic.ipynb + ..._cozum.ipynb
  _kaynak/*.md                           →  modül klasörlerindeki README / ADIMLAR / kontrol listesi
  hepsi                                  →  platform/icerik.js (sunum platformu verisi)

Kullanım:  python3 _kaynak/build.py
İçerik değiştirdiğinizde notebook'ları elle değil, _kaynak altındaki dosyaları düzenleyip bunu çalıştırın.
"""
from __future__ import annotations

import json
import re
import shutil
from pathlib import Path

KAYNAK = Path(__file__).resolve().parent
KOK = KAYNAK.parent
AYAR = json.loads((KAYNAK / "ayarlar.json").read_text(encoding="utf-8"))
REPO_ADI = AYAR["github_repo"].split("/")[-1]

# ------------------------------------------------------------------ Modül tanımları
MODULLER = [
    dict(id="m0", kod="00", baslik="Kurulum ve Ortam Kontrolü", zaman="Eğitim öncesi", sure=0,
         format="Hazırlık", demo="Çalışan ortam", klasor="00_Kurulum", kaynak="00_kurulum.py",
         nb="00_kurulum", tek=True,
         akis=[("T-15 dk", "Notebook'u Colab'da çalıştır, embedding modelini indir"),
               ("T-10 dk", "M2-M5 notebook'larını ayrı sekmelerde aç ve kurulum hücrelerini çalıştır"),
               ("T-5 dk", ".NET API ve React dev sunucusunu başlat")],
         notlar=["Colab Secrets'a ANTHROPIC_API_KEY ekleyin ve 'Notebook access'i açın.",
                 "Her Colab notebook'u ayrı bir runtime'dır; kurulum hücresi her birinde bir kez çalışır.",
                 "İnternet kesintisine karşı çözüm notebook'larını bir kez çalıştırıp çıktılarıyla kaydedin."]),
    dict(id="m1", kod="M1", baslik="Açılış, GenAI temelleri ve AI destekli karar verme", zaman="0:00–0:15", sure=15,
         format="Sunum + mini demo", demo="Yapılandırılmış çıktı veren karar prompt'u",
         klasor="M1_GenAI_Karar", kaynak="01_karar_prompt.py", nb="M1",
         akis=[("0-10", "Sunum: token, context, halüsinasyon, karar destek döngüsü"),
               ("10-12", "İlk çağrı + serbest metin karar"), ("12-15", "Pydantic şema ile yapılandırılmış karar")],
         notlar=["Serbest metin cevabı ekranda bırakıp 'bunu koda nasıl bağlarız?' sorusunu sorun.",
                 "Modelin politikaları bilmediğini vurgulayın: M5'teki sonuçla karşılaştıracağız."]),
    dict(id="m2", kod="M2", baslik="Embedding ve vektör veritabanları", zaman="0:15–0:35", sure=20,
         format="Canlı kodlama", demo="Dokümanları indeksleyen RAG hattı",
         klasor="M2_Embedding_RAG", kaynak="02_embedding_rag.py", nb="M2",
         akis=[("0-3", "Embedding ısı haritası"), ("3-8", "Yükleme ve parçalama"),
               ("8-14", "Embedding + Chroma"), ("14-18", "RAG cevabı + halüsinasyon testi"), ("18-20", "Soru-cevap")],
         notlar=["'ön ödeme' sorusunun 'avans' dokümanını bulması anlamsal aramanın en iyi kanıtıdır.",
                 "Zaman kalırsa chunk_size'ı 150 yapıp sonucun bozulduğunu gösterin."]),
    dict(id="m3", kod="M3", baslik="Graph ile anlamsallaştırma ve kişiselleştirme (GraphRAG)", zaman="0:35–0:55", sure=20,
         format="Canlı kodlama", demo="Kullanıcı profiline göre sıralanan sonuçlar",
         klasor="M3_GraphRAG", kaynak="03_graphrag.py", nb="M3",
         akis=[("0-3", "Vektör aramanın sınırları"), ("3-7", "LLM ile üçlü çıkarma"), ("7-10", "Graf çizimi"),
               ("10-16", "Kişiselleştirilmiş PageRank + birleşik skor"), ("16-20", "3 kullanıcı karşılaştırması")],
         notlar=["Karşılaştırma tablosu modülün 'aha' anıdır; yeterince zaman bırakın.",
                 "alfa=1.0 ile kişiselleştirmenin kapandığını canlı gösterin."]),
    dict(id="ara", kod="☕", baslik="Ara", zaman="0:55–1:05", sure=10, format="—", demo="—", klasor=None,
         akis=[("Eğitmen", "M4 notebook'unda kurulum hücresini çalıştır, .NET API'yi başlat")], notlar=[]),
    dict(id="m4", kod="M4", baslik="LangChain ve LangGraph", zaman="1:05–1:25", sure=20,
         format="Canlı kodlama", demo="Araç kullanan, durumlu tek ajan",
         klasor="M4_LangChain_LangGraph", kaynak="04_langgraph_ajan.py", nb="M4",
         akis=[("0-3", "LangChain vs LangGraph"), ("3-8", "@tool ile araçlar"), ("8-13", "Grafı kurma"),
               ("13-18", "Çalıştırma, adımları izleme, thread hafızası"), ("18-20", "Soru-cevap")],
         notlar=["Docstring'i değiştirip modelin araç seçiminin değiştiğini göstermek etkilidir.",
                 "t1 / t2 thread karşılaştırması 'durumlu' kavramını somutlaştırır."]),
    dict(id="m5", kod="M5", baslik="Agentic AI, multi-agent ve MCP (Ek)", zaman="1:25–1:50", sure=25,
         format="Demo + tartışma", demo="Supervisor yönetimli 3 ajanlı ekip",
         klasor="M5_MultiAgent_MCP", kaynak="05_multi_agent_mcp.py", nb="M5",
         akis=[("0-6", "MCP sunucusu ve istemcisi"), ("6-12", "Uzman ajanlar + supervisor grafı"),
               ("12-18", "Ekibi çalıştır, M1 kararıyla karşılaştır"), ("18-25", "Tartışma")],
         notlar=["Ekip çalışması 1-2 dakika sürebilir; bu sırada supervisor çıktılarını yorumlayın.",
                 "M1'deki kararı yan sekmede açık tutun: politika ihlallerinin yakalanması güçlü bir kapanıştır."]),
    dict(id="m6", kod="M6", baslik=".NET Core + React ile uçtan uca AI", zaman="1:50–2:15", sure=25,
         format="Canlı kodlama", demo="Streaming yapan sohbet ve karar ekranı",
         klasor="M6_DotNet_React", kaynak="06_dotnet_react.md", nb=None,
         akis=[("0-3", "Adım 1: Minimal API"), ("3-7", "Adım 2: Mesaj geçmişi"), ("7-13", "Adım 3: SSE streaming"),
               ("13-20", "Adım 4: React akış"), ("20-25", "Adım 5: Karar ekranı")],
         notlar=["En riskli modül: Her adımda takılırsanız api/ ve web/ klasöründeki hazır koda geçin.",
                 "curl -N ile streaming'i tarayıcıdan önce terminalde göstermek mekanizmayı netleştirir."]),
    dict(id="m7", kod="M7", baslik="Üretime hazırlık: eval, güvenlik, maliyet", zaman="2:15–2:25", sure=10,
         format="Sunum", demo="Kontrol listesi", klasor="M7_Uretim", kaynak="07_uretim.md", nb=None,
         ek_nb=("07_eval_guvenlik.py", "M7_eval_guvenlik"),
         akis=[("0-8", "Kontrol listesi"), ("8-10", "Opsiyonel: eval + prompt injection demo")],
         notlar=["Katılımcılara kendi projeleri için listeyi işaretletin."]),
    dict(id="m8", kod="🎤", baslik="Kapanış ve soru-cevap", zaman="2:25–2:30", sure=5, format="Tartışma",
         demo="Sonraki adımlar", klasor="M8_Kapanis", kaynak="08_kapanis.md", nb=None,
         akis=[("0-5", "Özet tablo, sonraki adımlar, soru-cevap")], notlar=[]),
]

# ------------------------------------------------------------------ Kurulum hücresi
KURULUM = f'''# ⚙️ Ortam hazırlığı: Colab'da ve yerel Jupyter'da çalışır
import os, sys, subprocess
REPO_URL = "https://github.com/{AYAR["github_repo"]}.git"   # ← kendi GitHub reponuz
KOK = next((os.path.abspath(p) for p in [".", "..", "/content/{REPO_ADI}"]
            if os.path.exists(os.path.join(p, "ortak.py"))), None)
if KOK is None:  # Colab: repoyu klonla
    subprocess.run(["git", "clone", "-q", REPO_URL, "/content/{REPO_ADI}"], check=True)
    KOK = "/content/{REPO_ADI}"
try:
    import langgraph, chromadb, langchain_anthropic, sentence_transformers, langchain_mcp_adapters  # noqa
except ImportError:
    print("Paketler kuruluyor (1-3 dk)…")
    subprocess.run([sys.executable, "-m", "pip", "install", "-q", "-r", f"{{KOK}}/requirements.txt"], check=True)
sys.path.insert(0, KOK); os.chdir(KOK)
from ortak import *
api_anahtari_yukle()
print("Hazır ✔  Model:", MODEL)'''

# ------------------------------------------------------------------ Ayrıştırıcılar
TODO_RE = re.compile(r"^# TODO-BASLA:\s*(.*)$")


def py_hucreleri(yol: Path) -> list[dict]:
    """'# %%' ile bölünmüş betiği hücre listesine çevirir."""
    hucreler, aktif = [], None
    for satir in yol.read_text(encoding="utf-8").splitlines():
        if satir.startswith("# %%"):
            if aktif:
                hucreler.append(aktif)
            etiket = satir[4:].strip()
            if etiket == "@KURULUM":
                hucreler.append({"tur": "kod", "satirlar": KURULUM.splitlines(), "kurulum": True})
                aktif = None
            else:
                aktif = {"tur": "md" if etiket.startswith("[markdown]") else "kod", "satirlar": []}
            continue
        if aktif is not None:
            aktif["satirlar"].append(satir)
    if aktif:
        hucreler.append(aktif)

    for h in hucreler:
        s = h["satirlar"]
        while s and not s[-1].strip():
            s.pop()
        while s and not s[0].strip():
            s.pop(0)
        if h["tur"] == "md":
            h["satirlar"] = [re.sub(r"^# ?", "", x) for x in s]
    return [h for h in hucreler if h["satirlar"]]


def kod_parcalari(satirlar: list[str]) -> list[dict]:
    """Kod hücresini normal ve canlı kodlama (TODO) parçalarına böler."""
    parcalar, mevcut, canli, ipucu = [], [], False, ""
    for s in satirlar:
        m = TODO_RE.match(s)
        if m:
            if mevcut:
                parcalar.append({"canli": False, "kod": "\n".join(mevcut)})
            mevcut, canli, ipucu = [], True, m.group(1)
        elif s.strip() == "# TODO-BITIR":
            parcalar.append({"canli": True, "ipucu": ipucu, "kod": "\n".join(mevcut)})
            mevcut, canli = [], False
        else:
            mevcut.append(s)
    if mevcut:
        parcalar.append({"canli": False, "kod": "\n".join(mevcut)})
    return parcalar


def kod_metni(parcalar: list[dict], surum: str) -> str:
    out = []
    for p in parcalar:
        if not p["canli"]:
            out.append(p["kod"])
        elif surum == "cozum":
            out.append(f"# ✍️ Canlı kodlama: {p['ipucu']}\n{p['kod']}")
        else:
            out.append(f"# ✍️ TODO: {p['ipucu']}\n...")
    return "\n".join(out)


def md_hucreleri(yol: Path) -> list[dict]:
    """Markdown'ı metin ve kod bloklarına böler (platform için)."""
    hucreler, tampon, kod, dil = [], [], None, ""
    for satir in yol.read_text(encoding="utf-8").splitlines():
        if satir.startswith("```"):
            if kod is None:
                if "".join(tampon).strip():
                    hucreler.append({"tur": "md", "kaynak": "\n".join(tampon).strip()})
                tampon, kod, dil = [], [], satir[3:].strip() or "text"
            else:
                hucreler.append({"tur": "kod", "dil": dil, "parcalar": [{"canli": False, "kod": "\n".join(kod)}]})
                kod = None
            continue
        (kod if kod is not None else tampon).append(satir)
    if "".join(tampon).strip():
        hucreler.append({"tur": "md", "kaynak": "\n".join(tampon).strip()})
    # "## " başlıklarında md hücrelerini böl → sunum modunda her adım ayrı slayt
    sonuc = []
    for h in hucreler:
        if h["tur"] != "md":
            sonuc.append(h)
            continue
        for blok in re.split(r"\n(?=## )", h["kaynak"]):
            if blok.strip():
                sonuc.append({"tur": "md", "kaynak": blok.strip()})
    return sonuc


# ------------------------------------------------------------------ Notebook yazıcı
def notebook_yaz(hucreler: list[dict], hedef: Path, surum: str) -> None:
    cells = []
    for i, h in enumerate(hucreler):
        if h["tur"] == "md":
            src, tip = "\n".join(h["satirlar"]), "markdown"
        else:
            src, tip = kod_metni(kod_parcalari(h["satirlar"]), surum), "code"
        cell = {"cell_type": tip, "id": f"h{i:02d}", "metadata": {}, "source": src.splitlines(keepends=True)}
        if tip == "code":
            cell.update(execution_count=None, outputs=[])
        cells.append(cell)
    nb = {"cells": cells, "nbformat": 4, "nbformat_minor": 5,
          "metadata": {"kernelspec": {"name": "python3", "display_name": "Python 3"},
                       "language_info": {"name": "python"}, "colab": {"provenance": []}}}
    hedef.parent.mkdir(parents=True, exist_ok=True)
    hedef.write_text(json.dumps(nb, ensure_ascii=False, indent=1), encoding="utf-8")


def sozdizimi_kontrol(hucreler: list[dict], ad: str) -> int:
    import ast

    hata = 0
    for h in hucreler:
        if h["tur"] != "kod":
            continue
        kod = kod_metni(kod_parcalari(h["satirlar"]), "cozum")
        try:
            compile(kod, ad, "exec", flags=ast.PyCF_ALLOW_TOP_LEVEL_AWAIT)
        except SyntaxError as e:
            hata += 1
            print(f"  ⚠️  {ad}: {e}")
    return hata


def colab_url(yol: str) -> str:
    return f"https://colab.research.google.com/github/{AYAR['github_repo']}/blob/{AYAR['dal']}/{yol}"


def readme_yaz(m: dict, notebooklar: list[tuple[str, str]]) -> None:
    satirlar = [f"# {m['kod']} · {m['baslik']}", "",
                f"**Zaman:** {m['zaman']} · **Süre:** {m['sure']} dk · **Format:** {m['format']} · **Demo çıktısı:** {m['demo']}", ""]
    if notebooklar:
        satirlar += ["## Notebook'lar", ""]
        for etiket, yol in notebooklar:
            satirlar.append(f"- **{etiket}:** [{Path(yol).name}]({Path(yol).name}) · "
                            f"[![Colab'da aç](https://colab.research.google.com/assets/colab-badge.svg)]({colab_url(yol)})")
        satirlar.append("")
    satirlar += ["## Akış", "", "| Dakika | Adım |", "|---|---|"] + [f"| {a} | {b} |" for a, b in m["akis"]]
    if m["notlar"]:
        satirlar += ["", "## Eğitmen notları", ""] + [f"- {n}" for n in m["notlar"]]
    (KOK / m["klasor"] / "README.md").write_text("\n".join(satirlar) + "\n", encoding="utf-8")


# ------------------------------------------------------------------ Ana akış
def main() -> None:
    hata = 0
    platform = []
    for m in MODULLER:
        kayit = {k: v for k, v in m.items() if k not in ("kaynak", "nb", "ek_nb", "tek")}
        kayit["akis"] = [list(x) for x in m["akis"]]
        kayit["hucreler"], kayit["notebooklar"] = [], []
        if not m["klasor"]:
            platform.append(kayit)
            continue
        klasor = KOK / m["klasor"]
        klasor.mkdir(exist_ok=True)
        notebooklar: list[tuple[str, str]] = []

        def py_isle(kaynak: str, nb_adi: str, tek: bool):
            nonlocal hata
            hucreler = py_hucreleri(KAYNAK / kaynak)
            hata += sozdizimi_kontrol(hucreler, kaynak)
            surumler = [("cozum", nb_adi)] if tek else [("baslangic", f"{nb_adi}_baslangic"), ("cozum", f"{nb_adi}_cozum")]
            for surum, ad in surumler:
                notebook_yaz(hucreler, klasor / f"{ad}.ipynb", surum)
                etiket = "Notebook" if tek else ("Başlangıç (katılımcı)" if surum == "baslangic" else "Çözüm (eğitmen)")
                notebooklar.append((etiket, f"{m['klasor']}/{ad}.ipynb"))
            return hucreler

        if m["kaynak"].endswith(".py"):
            hucreler = py_isle(m["kaynak"], m["nb"], m.get("tek", False))
            for h in hucreler:
                if h["tur"] == "md":
                    kayit["hucreler"].append({"tur": "md", "kaynak": "\n".join(h["satirlar"])})
                else:
                    kayit["hucreler"].append({"tur": "kod", "dil": "python", "kurulum": h.get("kurulum", False),
                                              "parcalar": kod_parcalari(h["satirlar"])})
        else:
            kayit["hucreler"] = md_hucreleri(KAYNAK / m["kaynak"])
            hedef_ad = {"m6": "ADIMLAR.md", "m7": "kontrol_listesi.md"}.get(m["id"])
            if hedef_ad:
                shutil.copy(KAYNAK / m["kaynak"], klasor / hedef_ad)
            if "ek_nb" in m:
                py_isle(m["ek_nb"][0], m["ek_nb"][1], True)

        kayit["notebooklar"] = [{"etiket": e, "yol": y, "colab": colab_url(y)} for e, y in notebooklar]
        if m["id"] == "m8":
            shutil.copy(KAYNAK / m["kaynak"], klasor / "README.md")
        else:
            readme_yaz(m, notebooklar)
        platform.append(kayit)

    veri = {"ayarlar": AYAR, "moduller": platform}
    (KOK / "platform").mkdir(exist_ok=True)
    (KOK / "platform" / "icerik.js").write_text(
        "// Otomatik üretildi: _kaynak/build.py. Elle düzenlemeyin.\nwindow.EGITIM = "
        + json.dumps(veri, ensure_ascii=False, indent=1) + ";\n", encoding="utf-8")
    # Yerel kullanım için şablonu tam bir HTML belgesine sar (çift tıkla açılabilir)
    sablon = (KOK / "platform" / "_sablon.html").read_text(encoding="utf-8")
    (KOK / "platform" / "index.html").write_text(
        '<!doctype html>\n<html lang="tr">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
        "</head>\n<body>\n" + sablon + "\n</body>\n</html>\n", encoding="utf-8")
    print(f"✔ {len(platform)} modül üretildi · sözdizimi hatası: {hata}")


if __name__ == "__main__":
    main()
