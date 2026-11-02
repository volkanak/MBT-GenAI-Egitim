# %% [markdown]
# # M3 · Graph ile Anlamsallaştırma ve Kişiselleştirme (GraphRAG)
# **Süre:** 20 dk canlı kodlama · **Demo çıktısı:** Kullanıcı profiline göre sıralanan sonuçlar
#
# **Vektör araması ne bilmez?**
# - Kavramlar arasındaki **ilişkileri** ("avans → tedarikçi → risk")
# - **Kim** soruyor? Finans müdürü ile güvenlik uzmanı için "önemli" olan farklıdır.
#
# ```
#   (Ayşe)──ILGILENIR──▶(avans)◀──ILGILI──(DOK-03 Avans Politikası)
#                          │
#                       BAĞLIDIR
#                          ▼
#                     (tedarikçi)◀──ILGILI──(DOK-02 Tedarikçi Prosedürü)
# ```
# **Fikir:** Skor = α · vektör benzerliği + (1-α) · grafta kullanıcıya yakınlık (Kişiselleştirilmiş PageRank)

# %% @KURULUM

# %% [markdown]
# ## 1️⃣ LLM ile dokümandan bilgi (üçlü) çıkarma  ✍️ *canlı kodlama*
# GraphRAG'in ilk adımı: metinden **(varlık, ilişki, varlık)** üçlüleri çıkarmak. Canlıda 1 doküman çalıştırıyoruz; tamamı `data/graf_ucluleri.json` içinde hazır.

# %%
from pydantic import BaseModel, Field

# TODO-BASLA: Uclu ve Ucluler şemalarını tanımlayıp DOK-03'ten üçlü çıkarın
class Uclu(BaseModel):
    kaynak: str = Field(description="Kavram, küçük harf, 1-3 kelime")
    iliski: str = Field(description="BÜYÜK_HARF fiil, örn. GEREKTİRİR, BAĞLIDIR")
    hedef: str = Field(description="Kavram, küçük harf, 1-3 kelime")

class Ucluler(BaseModel):
    ucluler: list[Uclu]

dok = dokumanlari_yukle()[2]  # DOK-03 Avans Politikası
cikti = yapilandirilmis_sor(
    f"Aşağıdaki politika metninden en önemli 6-8 kavram ilişkisini çıkar.\n\n{dok['metin']}", Ucluler)
# TODO-BITIR
for u in cikti.ucluler:
    print(f"({u.kaynak}) -[{u.iliski}]-> ({u.hedef})")

# %% [markdown]
# ## 2️⃣ Bilgi grafını kur ve çiz
# Düğümler: 👤 kullanıcı · 📄 doküman · 🏷️ konu

# %%
import networkx as nx
import matplotlib.pyplot as plt

G = graf_kur()   # ortak.py: dokümanlar + kullanıcılar + konu ilişkileri
print(G.number_of_nodes(), "düğüm,", G.number_of_edges(), "kenar")

renk = {"kullanici": "#e4572e", "dokuman": "#4c78a8", "konu": "#9ecae9"}
plt.figure(figsize=(13, 9))
pos = nx.spring_layout(G, seed=7, k=0.6)
nx.draw_networkx(G, pos, node_color=[renk[G.nodes[n]["tur"]] for n in G],
                 labels={n: G.nodes[n]["etiket"][:22] for n in G}, font_size=7,
                 node_size=[900 if G.nodes[n]["tur"] != "konu" else 400 for n in G], edge_color="#ccc")
plt.axis("off"); plt.show()

# %% [markdown]
# ## 3️⃣ Kişiselleştirilmiş PageRank: grafta "bana yakın" olan ne?  ✍️ *canlı kodlama*
# Rastgele yürüyüş her seferinde **kullanıcının düğümüne geri döner** → kullanıcıya yakın dokümanlar yüksek skor alır.

# %%
kullanicilar = kullanicilari_yukle()

# TODO-BASLA: Her kullanıcı için personalization={kullanici_id: 1} ile PageRank hesaplayıp ilk 4 dokümanı yazdırın
for u in kullanicilar:
    ppr = nx.pagerank(G, personalization={u["id"]: 1.0})
    dok_skor = sorted(((v, n) for n, v in ppr.items() if G.nodes[n]["tur"] == "dokuman"), reverse=True)[:4]
    print(f"\n👤 {u['ad']} ({u['unvan']})")
    for v, n in dok_skor:
        print(f"   {v:.3f}  {G.nodes[n]['etiket']}")
# TODO-BITIR

# %% [markdown]
# ## 4️⃣ Vektör + graf = kişiselleştirilmiş sıralama  ✍️ *canlı kodlama*

# %%
# TODO-BASLA: Geniş aday havuzu al, doküman başına en iyi parçayı tut, final = alfa*vektör + (1-alfa)*graf
def kisisel_ara(soru: str, kullanici_id: str, alfa: float = 0.5, k: int = 6):
    ppr = nx.pagerank(G, personalization={kullanici_id: 1.0})
    dok_ppr = {n: v for n, v in ppr.items() if G.nodes[n]["tur"] == "dokuman"}
    en_buyuk = max(dok_ppr.values())
    adaylar = {}
    for r in rag_indeksi().ara(soru, 20):          # geniş havuz
        adaylar.setdefault(r["dok_id"], r)         # doküman başına en iyi parça
    for r in adaylar.values():
        r["graf"] = round(dok_ppr[r["dok_id"]] / en_buyuk, 3)
        r["final"] = round(alfa * r["skor"] + (1 - alfa) * r["graf"], 3)
    return sorted(adaylar.values(), key=lambda r: r["final"], reverse=True)[:k]
# TODO-BITIR

# %% [markdown]
# ## 5️⃣ Aynı soru, üç farklı kullanıcı

# %%
import pandas as pd

SORU = "Bu çeyrekte dikkat etmem gereken kurallar neler?"
tablo = {}
for u in kullanicilar:
    tablo[f"{u['ad']} · {u['unvan']}"] = [f"{r['baslik'][:34]} ({r['final']})" for r in kisisel_ara(SORU, u["id"])[:4]]
tablo["Sadece vektör (kişiselleştirme yok)"] = [f"{r['baslik'][:34]} ({r['skor']})" for r in rag_indeksi().ara(SORU, 4)]
pd.DataFrame(tablo, index=[1, 2, 3, 4])

# %% [markdown]
# ## 6️⃣ Kişiselleştirilmiş cevap

# %%
def kisisel_cevap(soru: str, kullanici: dict) -> str:
    sonuclar = kisisel_ara(soru, kullanici["id"])[:4]
    sistem = (RAG_SISTEM + f"\nKullanıcı: {kullanici['ad']}, {kullanici['unvan']} ({kullanici['departman']}). "
              "Cevabı bu kişinin rolü ve sorumluluklarına göre önceliklendir, en fazla 5 madde yaz.")
    return metin_sor(f"Bağlam:\n{baglam_olustur(sonuclar)}\n\nSoru: {soru}", sistem=sistem)

for u in kullanicilar[:2]:
    print(f"━━━━ 👤 {u['ad']} ━━━━\n{kisisel_cevap(SORU, u)}\n")

# %% [markdown]
# ### ✅ Özet ve tartışma
# - **alfa** değerini 1.0 yapın → kişiselleştirme kapanır. 0.3 yapın → profil baskın olur. Doğru değer A/B testiyle bulunur.
# - Üretimde: Neo4j / Memgraph / Azure Cosmos DB (Gremlin), Microsoft GraphRAG (topluluk özetleri), LightRAG.
# - Graf; **yetkilendirme** (kim hangi dokümanı görebilir) için de kullanılabilir.
# - Şimdiye kadar **biz** hangi adımın çalışacağına karar verdik → **M4:** model araçları kendisi seçsin (ajan).
