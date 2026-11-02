# %% [markdown]
# # M5 · Agentic AI, Multi-Agent ve MCP
# **Süre:** 25 dk (12 dk demo · 6 dk MCP · 7 dk tartışma) · **Demo çıktısı:** Supervisor yönetimli 3 ajanlı ekip
#
# ```
#                      ┌──────────────┐
#          talep ────▶ │  SUPERVISOR  │ ── sıradaki kim? (yapılandırılmış çıktı)
#                      └──────┬───────┘
#            ┌────────────────┼─────────────────┐
#            ▼                ▼                 ▼
#   ┌────────────────┐ ┌──────────────┐ ┌────────────────┐
#   │  ARAŞTIRMACI   │ │   ANALİST    │ │  KARAR YAZICI  │──▶ Karar (M1 şeması) ──▶ END
#   │ politika_ara   │ │ hesapla      │ └────────────────┘
#   │ (RAG, M2)      │ │ onay_yetkilisi│
#   └────────────────┘ │ kur (MCP) 🔌 │
#                      └──────────────┘
# ```
# **MCP (Model Context Protocol):** Araçları/verileri, herhangi bir AI uygulamasının bağlanabileceği **standart bir sunucu** olarak sunmak. "AI için USB-C".

# %% @KURULUM

# %% [markdown]
# ## 1️⃣ MCP sunucusu
# `M5_MultiAgent_MCP/kur_sunucu.py`: 30 satırlık bir sunucu, iki araç sunuyor.

# %%
SUNUCU = f"{KOK}/M5_MultiAgent_MCP/kur_sunucu.py"
print(open(SUNUCU, encoding="utf-8").read())

# %% [markdown]
# ## 2️⃣ MCP istemcisi: sunucuya bağlan, araçları LangChain aracına dönüştür  ✍️ *canlı kodlama*

# %%
import sys
from langchain_mcp_adapters.client import MultiServerMCPClient

# TODO-BASLA: stdio üzerinden kur sunucusuna bağlanıp araçları alın
mcp_istemci = MultiServerMCPClient({
    "kur": {"command": sys.executable, "args": [SUNUCU], "transport": "stdio"},
})
mcp_araclari = await mcp_istemci.get_tools()
# TODO-BITIR
print([t.name for t in mcp_araclari])
tl_cevir = next(t for t in mcp_araclari if t.name == "tl_cevir")
print(await tl_cevir.ainvoke({"tutar": 15000, "doviz": "EUR"}))

# %% [markdown]
# ## 3️⃣ Uzman ajanlar
# Her ajanın **dar bir görevi** ve **sadece ihtiyacı olan araçları** var.

# %%
from langchain_core.tools import tool
from langchain.agents import create_agent

@tool
def politika_ara(soru: str) -> str:
    """Atlas Teknoloji şirket politikalarında arama yapar."""
    return baglam_olustur(rag_indeksi().ara(soru, k=4))

@tool
def onay_yetkilisi_bul(tutar_tl: float, butce_disi: bool = False) -> str:
    """Satın alma tutarına (TL) göre onay yetkilisini döndürür."""
    return onay_yetkilisi(tutar_tl, butce_disi)

@tool
def hesapla(ifade: str) -> str:
    """Aritmetik hesaplama yapar. Örnek: '2000000 * 0.30'"""
    return str(guvenli_hesapla(ifade))

llm = sohbet_modeli()

# TODO-BASLA: create_agent ile arastirmaci ve analist ajanlarını oluşturun
arastirmaci = create_agent(
    llm, [politika_ara],
    system_prompt="Sen politika araştırmacısısın. Talebe uygulanabilecek TÜM şirket kurallarını politika_ara ile bul. "
                  "Her kuralı kaynağıyla [DOK-xx] maddeler halinde özetle. Karar verme, sadece kuralları raporla.")
analist = create_agent(
    llm, [hesapla, onay_yetkilisi_bul, *mcp_araclari],
    system_prompt="Sen finansal analistsin. Dövizli tutarları tl_cevir ile TL'ye çevir, toplam tutarı, avans tutarını, "
                  "bütçe farkını hesapla ve onay yetkilisini bul. Rakamları tablo halinde ver. Karar verme.")
# TODO-BITIR

# %% [markdown]
# ## 4️⃣ Supervisor ve ekip grafı  ✍️ *canlı kodlama*

# %%
import operator
from typing import Annotated, Literal, TypedDict
from pydantic import BaseModel
from langgraph.graph import StateGraph, START, END
from langgraph.types import Command

class EkipDurumu(TypedDict):
    talep: str
    notlar: Annotated[list[str], operator.add]   # her ajan kendi notunu ekler
    adim: int
    karar: dict | None

class Yonlendirme(BaseModel):
    sonraki: Literal["arastirmaci", "analist", "karar_yazici"]
    gerekce: str

def notlar_metni(s: EkipDurumu) -> str:
    return "\n\n".join(s["notlar"]) or "(henüz not yok)"

# TODO-BASLA: supervisor düğümü: sıradaki ajanı seçer (en fazla 4 adım)
def supervisor(s: EkipDurumu):
    if s["adim"] >= 4:
        return Command(goto="karar_yazici")
    y = yapilandirilmis_sor(
        f"Talep:\n{s['talep']}\n\nEkip notları:\n{notlar_metni(s)}\n\n"
        "Sıradaki adımı seç. Kurallar araştırılmadıysa 'arastirmaci', rakamlar hesaplanmadıysa 'analist', "
        "ikisi de tamamsa 'karar_yazici'.", Yonlendirme,
        sistem="Sen bir karar destek ekibinin yöneticisisin (supervisor). İşi en az adımla bitir.")
    print(f"🧭 Supervisor → {y.sonraki}: {y.gerekce}")
    return Command(goto=y.sonraki, update={"adim": s["adim"] + 1})
# TODO-BITIR

def calisan(ad: str, ajan, emoji: str):
    async def dugum(s: EkipDurumu):
        girdi = f"Talep:\n{s['talep']}\n\nEkibin şimdiye kadarki notları:\n{notlar_metni(s)}"
        sonuc = await ajan.ainvoke({"messages": [{"role": "user", "content": girdi}]})
        cikti = sonuc["messages"][-1].text
        print(f"\n{emoji} {ad.upper()}\n{cikti}\n")
        return Command(goto="supervisor", update={"notlar": [f"[{ad}]\n{cikti}"]})
    return dugum

def karar_yazici(s: EkipDurumu):
    k = yapilandirilmis_sor(
        f"Talep:\n{s['talep']}\n\nEkip notları:\n{notlar_metni(s)}\n\nNotlara dayanarak nihai öneriyi ver.",
        Karar, sistem="Sen kıdemli karar destek uzmanısın. Politika ihlallerini mutlaka risk olarak yaz, "
                      "ihlal düzeltilebiliyorsa koşul olarak belirt.")
    return Command(goto=END, update={"karar": k.model_dump()})

ekip = StateGraph(EkipDurumu)
ekip.add_node("supervisor", supervisor, destinations=("arastirmaci", "analist", "karar_yazici"))
ekip.add_node("arastirmaci", calisan("araştırmacı", arastirmaci, "📚"), destinations=("supervisor",))
ekip.add_node("analist", calisan("analist", analist, "🧮"), destinations=("supervisor",))
ekip.add_node("karar_yazici", karar_yazici)
ekip.add_edge(START, "supervisor")
ekip = ekip.compile()

from IPython.display import Image, display
try:
    display(Image(ekip.get_graph().draw_mermaid_png()))
except Exception:
    print(ekip.get_graph().draw_mermaid())

# %% [markdown]
# ## 5️⃣ Ekibi çalıştır: M1'deki senaryo, bu sefer politikaları bilen bir ekiple

# %%
SENARYO = """Tedarikçi: Delta Yazılım A.Ş.
Talep: 2.000.000 TL tutarında yıllık CRM lisans sözleşmesi.
Ek olarak 15.000 EUR tutarında uygulama eğitimi hizmeti teklif ediliyor.
Tedarikçi sözleşme bedelinin %40'ı oranında peşin avans istiyor.
Tedarikçi değerlendirme puanı: 74/100. Geçen yıl 1 kez teslimat gecikmesi yaşandı.
Bütçede bu kalem için 1.800.000 TL ayrılmış."""

sonuc = await ekip.ainvoke({"talep": SENARYO, "notlar": [], "adim": 0, "karar": None})

# %%
k = Karar(**sonuc["karar"])
print({"onayla": "✅ ONAYLA", "reddet": "⛔ REDDET", "incele": "🔎 İNCELE"}[k.karar], f"(güven {k.guven:.0%})")
print("\nGerekçe:", k.gerekce)
print("\nRiskler:", *[f"\n • {r}" for r in k.riskler])
print("\nKoşullar:", *[f"\n • {r}" for r in k.kosullar])

# %% [markdown]
# ## 💬 Tartışma (7 dk)
# 1. **M1'deki karar ile karşılaştırın.** Hangi politika ihlallerini ekip yakaladı? (%30 avans sınırı, gecikme geçmişi → avans yok, 2M+ → Genel Müdür, bütçe aşımı)
# 2. **Ne zaman multi-agent?** Görevler gerçekten farklı uzmanlık/araç gerektiriyorsa. Aksi halde tek ajan daha ucuz, hızlı ve hata ayıklaması kolay.
# 3. **Maliyet ve gecikme:** Kaç LLM çağrısı yapıldı? Her ajan = ek token + ek saniye.
# 4. **Hata yayılımı:** Araştırmacı yanlış kural getirirse ne olur? → Eval + kaynak doğrulama (M7)
# 5. **MCP'nin değeri:** `kur_sunucu.py` hiç değişmeden Claude Desktop, VS Code veya .NET uygulamasından da kullanılabilir.
# 6. **İnsan onayı nereye konmalı?** Karar yazıcıdan sonra mı, analistten sonra mı?
