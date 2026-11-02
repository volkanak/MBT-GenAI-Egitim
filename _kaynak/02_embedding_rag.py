# %% [markdown]
# # M2 · Embedding ve Vektör Veritabanları
# **Süre:** 20 dk canlı kodlama · **Demo çıktısı:** Dokümanları indeksleyen RAG hattı
#
# | Dakika | Adım |
# |---|---|
# | 0-3 | Embedding nedir? Benzerlik ısı haritası |
# | 3-8 | Dokümanları yükleme ve parçalama (chunking) |
# | 8-14 | Embedding + Chroma'ya indeksleme |
# | 14-18 | Retriever + LLM = RAG, kaynak gösteren cevap |
# | 18-20 | Soru-cevap |
#
# ```
# Dokümanlar → Parçala → Embedding → Vektör DB
#                                          ↓  (benzerlik araması)
#                    Soru → Embedding → En yakın k parça → LLM + bağlam → Kaynaklı cevap
# ```

# %% @KURULUM

# %% [markdown]
# ## 1️⃣ Embedding: anlamı sayıya çevirmek
# Aynı anlama gelen cümleler, **farklı kelimelerle** yazılsa da vektör uzayında birbirine yakındır.

# %%
from sentence_transformers import SentenceTransformer
import matplotlib.pyplot as plt
import numpy as np

emb_model = SentenceTransformer(EMBEDDING_MODELI)

cumleler = [
    "Tedarikçiye avans ödemesi için teminat gerekir",
    "Satıcıya ön ödeme yaparken banka garantisi istenir",
    "Çalışanlar Salı ve Perşembe ofise gelir",
    "Kediler süt içmeyi sever",
]
V = emb_model.encode([f"query: {c}" for c in cumleler], normalize_embeddings=True)
print("Vektör boyutu:", V.shape)

benzerlik = V @ V.T  # normalize vektörlerde iç çarpım = kosinüs benzerliği
plt.imshow(benzerlik, cmap="Blues", vmin=0.6, vmax=1)
plt.xticks(range(4), [c[:18] + "…" for c in cumleler], rotation=30, ha="right")
plt.yticks(range(4), [c[:18] + "…" for c in cumleler])
for i in range(4):
    for j in range(4):
        plt.text(j, i, f"{benzerlik[i, j]:.2f}", ha="center", va="center")
plt.title("Kosinüs benzerliği"); plt.colorbar(); plt.show()

# %% [markdown]
# ## 2️⃣ Dokümanları yükle ve parçala

# %%
import pandas as pd

dokumanlar = dokumanlari_yukle()
pd.DataFrame(dokumanlar)[["id", "baslik", "departman", "konular"]]

# %%
from langchain_text_splitters import RecursiveCharacterTextSplitter

# TODO-BASLA: 400 karakterlik, 60 karakter örtüşmeli bir bölücü ile dokümanları parçalayın
bolucu = RecursiveCharacterTextSplitter(chunk_size=400, chunk_overlap=60)
parcalar = []
for d in dokumanlar:
    for i, metin in enumerate(bolucu.split_text(d["metin"])):
        parcalar.append({"id": f"{d['id']}#{i}", "metin": metin,
                         "meta": {"dok_id": d["id"], "baslik": d["baslik"], "departman": d["departman"]}})
# TODO-BITIR
print(len(dokumanlar), "doküman →", len(parcalar), "parça")
print(parcalar[0])

# %% [markdown]
# ## 3️⃣ Embedding'le ve vektör veritabanına yaz (Chroma)  ✍️ *canlı kodlama*
# > e5 modelleri dokümanlar için `passage:`, sorular için `query:` ön ekini bekler.

# %%
import chromadb

# TODO-BASLA: Parçaları embedding'leyin ve kosinüs metrikli bir Chroma koleksiyonuna ekleyin
vektorler = emb_model.encode([f"passage: {p['metin']}" for p in parcalar], normalize_embeddings=True)

db = chromadb.EphemeralClient()           # bellek içi; kalıcı için PersistentClient(path=...)
try:
    db.delete_collection("atlas")
except Exception:
    pass
koleksiyon = db.create_collection("atlas", metadata={"hnsw:space": "cosine"})
koleksiyon.add(
    ids=[p["id"] for p in parcalar],
    documents=[p["metin"] for p in parcalar],
    metadatas=[p["meta"] for p in parcalar],
    embeddings=vektorler.tolist(),
)
# TODO-BITIR
print("Koleksiyondaki kayıt:", koleksiyon.count())

# %% [markdown]
# ## 4️⃣ Anlamsal arama (retriever)

# %%
# TODO-BASLA: Soruyu embedding'leyip en yakın k parçayı döndüren ara() fonksiyonu
def ara(soru: str, k: int = 4):
    q = emb_model.encode([f"query: {soru}"], normalize_embeddings=True)
    s = koleksiyon.query(query_embeddings=q.tolist(), n_results=k)
    return [{"dok_id": m["dok_id"], "baslik": m["baslik"], "parca": d, "skor": round(1 - dist, 3)}
            for d, m, dist in zip(s["documents"][0], s["metadatas"][0], s["distances"][0])]
# TODO-BITIR

# "ön ödeme" kelimesi dokümanlarda geçmiyor, ama "avans" dokümanı bulunur 👇
for r in ara("Satıcıya ön ödeme yaparken nelere dikkat etmeliyim?"):
    print(f"{r['skor']:.3f}  {r['dok_id']}  {r['baslik']}")

# %% [markdown]
# ## 5️⃣ RAG: bağlam + LLM = kaynaklı cevap  ✍️ *canlı kodlama*

# %%
# TODO-BASLA: Bulunan parçalardan bağlam oluşturup modele kaynak göstermesini söyleyin
def rag(soru: str, k: int = 4) -> str:
    sonuclar = ara(soru, k)
    baglam = "\n\n".join(f"[{r['dok_id']}] {r['baslik']}\n{r['parca']}" for r in sonuclar)
    sistem = ("Sen Atlas Teknoloji'nin kurumsal politika asistanısın. Yalnızca verilen bağlamı kullan. "
              "Her bilginin sonunda kaynağı [DOK-xx] biçiminde göster. Bağlamda cevap yoksa "
              "'Bu bilgi dokümanlarda yok' de.")
    return metin_sor(f"Bağlam:\n{baglam}\n\nSoru: {soru}", sistem=sistem)
# TODO-BITIR

print(rag("Bir tedarikçiye 2.000.000 TL'lik sözleşme için %40 avans verebilir miyiz?"))

# %% [markdown]
# ## 6️⃣ Halüsinasyon testi: dokümanlarda olmayan soru

# %%
print(rag("Şirketin yemek kartı limiti ne kadar?"))

# %% [markdown]
# ### ✅ Özet ve tartışma
# - **Chunk boyutu** çok küçük → bağlam kopar; çok büyük → alakasız metin gelir. Deneyin: 200 / 800.
# - Üretimde: kalıcı vektör DB (pgvector, Qdrant, Azure AI Search…), **hibrit arama** (BM25 + vektör), **re-ranking**.
# - Bu kod `ortak.py` içinde `RagIndeksi` olarak duruyor → M3, M4, M5 tekrar kullanacak.
# - **Eksik:** Sonuçlar herkese aynı sırayla geliyor. Kullanıcının rolü/ilgisi hesaba katılmıyor → **M3: GraphRAG**
