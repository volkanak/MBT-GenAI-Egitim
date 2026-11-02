# %% [markdown]
# # M1 · GenAI Temelleri ve AI Destekli Karar Verme
# **Süre:** 15 dk (10 dk sunum + 5 dk demo) · **Demo çıktısı:** Yapılandırılmış çıktı veren karar prompt'u
#
# ### Bu modülde
# - LLM nasıl çalışır: **token**, **context window**, olasılıksal üretim
# - Halüsinasyon neden olur, nasıl sınırlanır?
# - Serbest metin ve **yapılandırılmış çıktı (JSON şema)** farkı
# - LLM bir **karar verici değil, karar destekçisidir** (human-in-the-loop)

# %% [markdown]
# ## 📊 Sunum notları
# | Kavram | Kısa açıklama |
# |---|---|
# | **Token** | Modelin okuduğu/ürettiği metin parçası. Türkçede 1 kelime ≈ 1,5-2,5 token. Maliyet token ile ölçülür. |
# | **Context window** | Modelin tek seferde "görebildiği" metin miktarı (prompt + doküman + geçmiş + cevap). |
# | **Sistem prompt'u** | Modelin rolü, kuralları ve çıktı biçimi. |
# | **Halüsinasyon** | Modelin bilmediği bir şeyi akıcı ve emin bir dille uydurması. Çare: bağlam vermek (RAG), şema, doğrulama. |
# | **Yapılandırılmış çıktı** | Modelin cevabını önceden tanımlı bir JSON şemasına uydurması → kod tarafından güvenle işlenebilir. |
#
# **AI destekli karar verme döngüsü:** Veri → Bağlam → Öneri (yapılandırılmış) → İnsan onayı → Kayıt/izleme

# %% @KURULUM

# %% [markdown]
# ## 1️⃣ İlk çağrı ve token kullanımı

# %%
c = istemci()
yanit = c.messages.create(
    model=MODEL,
    max_tokens=1024,
    messages=[{"role": "user", "content": "Üretken yapay zekayı bir yöneticiye 3 cümlede anlat."}],
)
print("".join(b.text for b in yanit.content if b.type == "text"))
print("\nGirdi token:", yanit.usage.input_tokens, "| Çıktı token:", yanit.usage.output_tokens)

# %% [markdown]
# ## 2️⃣ Karar senaryosu: önce serbest metin
# Model şirket politikalarını **bilmiyor**. Bunu not edin; M2'de RAG ve M5'te ajan ekibiyle düzelteceğiz.

# %%
SENARYO = """Tedarikçi: Delta Yazılım A.Ş.
Talep: 2.000.000 TL tutarında yıllık CRM lisans sözleşmesi.
Tedarikçi sözleşme bedelinin %40'ı oranında peşin avans istiyor.
Tedarikçi değerlendirme puanı: 74/100.
Geçen yıl 1 kez teslimat gecikmesi yaşandı.
Bütçede bu kalem için 1.800.000 TL ayrılmış."""

serbest = c.messages.create(
    model=MODEL,
    max_tokens=2048,
    messages=[{"role": "user", "content": f"Bu talep onaylanmalı mı?\n\n{SENARYO}"}],
)
print("".join(b.text for b in serbest.content if b.type == "text"))

# %% [markdown]
# ❓ **Soru:** Bu cevabı bir onay sistemine nasıl bağlarsınız? Hangi alan "karar", hangisi "risk"?
#
# ## 3️⃣ Yapılandırılmış çıktı: Pydantic şeması  ✍️ *canlı kodlama*

# %%
from typing import Literal
from pydantic import BaseModel, Field

# TODO-BASLA: Karar şemasını tanımlayın: karar (onayla/reddet/incele), gerekce, riskler, kosullar, guven
class Karar(BaseModel):
    karar: Literal["onayla", "reddet", "incele"] = Field(description="Önerilen karar")
    gerekce: str = Field(description="Kararın 2-3 cümlelik gerekçesi")
    riskler: list[str] = Field(description="Tespit edilen başlıca riskler")
    kosullar: list[str] = Field(description="Onay için sağlanması gereken koşullar (yoksa boş liste)")
    guven: float = Field(description="0 ile 1 arasında güven skoru")
# TODO-BITIR

# %%
KARAR_SISTEM = """Sen Atlas Teknoloji'nin satın alma karar destek uzmanısın.
Talepleri finansal risk, tedarikçi riski ve bütçe uyumu açısından değerlendir.
Emin olmadığın veya bilgi eksik olan durumlarda 'incele' öner ve güveni düşük tut."""

# TODO-BASLA: messages.parse ile output_format=Karar kullanarak yapılandırılmış karar alın
r = c.messages.parse(
    model=MODEL,
    max_tokens=4096,
    system=KARAR_SISTEM,
    messages=[{"role": "user", "content": SENARYO}],
    output_format=Karar,
)
karar = r.parsed_output
# TODO-BITIR
print(karar.model_dump_json(indent=2))

# %% [markdown]
# ## 4️⃣ Karar destek: insan onayı kuralı
# Model ne kadar iyi olursa olsun **son karar insanda**. Düşük güvenli öneriler otomatik olarak insana yönlendirilir.

# %%
ROZET = {"onayla": "✅ ONAYLA", "reddet": "⛔ REDDET", "incele": "🔎 İNCELE"}

def karar_karti(k: Karar, esik: float = 0.75):
    print(f"{ROZET[k.karar]}   (güven: {k.guven:.0%})")
    print("Gerekçe :", k.gerekce)
    print("Riskler :", *[f"\n  • {x}" for x in k.riskler])
    if k.kosullar:
        print("Koşullar:", *[f"\n  • {x}" for x in k.kosullar])
    if k.guven < esik or k.karar != "onayla":
        print("\n👤 İnsan onayına yönlendirildi (Finans Müdürü)")

karar_karti(karar)

# %% [markdown]
# ### ✅ Özet
# - Aynı soru → serbest metin **okunur**, yapılandırılmış çıktı **işlenir**.
# - `Karar` şeması `ortak.py` içinde de var: **M5**'te ajan ekibi, **M6**'da .NET + React ekranı aynı alanları kullanacak.
# - Model politikaları bilmeden karar verdi → **M2: RAG** ile şirket dokümanlarını bağlam olarak vereceğiz.
