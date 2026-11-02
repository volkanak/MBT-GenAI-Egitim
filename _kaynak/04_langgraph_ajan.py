# %% [markdown]
# # M4 · LangChain ve LangGraph
# **Süre:** 20 dk canlı kodlama · **Demo çıktısı:** Araç kullanan, durumlu tek ajan
#
# | | LangChain | LangGraph |
# |---|---|---|
# | Ne? | Yapı taşları: model, prompt, **araç (tool)**, retriever | **Durum makinesi:** düğüm (node), kenar (edge), durum (state) |
# | Ne zaman? | Doğrusal zincirler | Döngü, karar, hafıza, insan onayı gereken akışlar |
#
# ```
#   START ──▶ [asistan] ──(araç çağrısı var mı?)──evet──▶ [araçlar]
#                ▲                 │                         │
#                │                hayır                      │
#                │                 ▼                         │
#                │                END                        │
#                └───────────────────────────────────────────┘
# ```
# **Durumlu (stateful):** Checkpointer her adımda durumu `thread_id` ile saklar → ajan konuşmayı hatırlar.

# %% @KURULUM

# %% [markdown]
# ## 1️⃣ Model

# %%
llm = sohbet_modeli()
print(llm.invoke("Tek cümlede: ajan (agent) nedir?").text)

# %% [markdown]
# ## 2️⃣ Araçlar (tools)  ✍️ *canlı kodlama*
# Docstring **modelin okuduğu kullanım kılavuzudur**. Ne zaman kullanılacağını net yazın.

# %%
from langchain_core.tools import tool

# TODO-BASLA: politika_ara, onay_yetkilisi_bul ve hesapla araçlarını @tool ile tanımlayın
@tool
def politika_ara(soru: str) -> str:
    """Atlas Teknoloji şirket politikalarında arama yapar. Onay yetkileri, avans, tedarikçi,
    seyahat, bilgi güvenliği, bütçe gibi kurallar için HER ZAMAN önce bunu kullan."""
    return baglam_olustur(rag_indeksi().ara(soru, k=4))

@tool
def onay_yetkilisi_bul(tutar_tl: float, butce_disi: bool = False) -> str:
    """Satın alma tutarına (TL) göre kimin onay vermesi gerektiğini döndürür."""
    return onay_yetkilisi(tutar_tl, butce_disi)

@tool
def hesapla(ifade: str) -> str:
    """Aritmetik hesaplama yapar. Örnek: '2000000 * 0.30'"""
    return str(guvenli_hesapla(ifade))
# TODO-BITIR

araclar = [politika_ara, onay_yetkilisi_bul, hesapla]
llm_araclarla = llm.bind_tools(araclar)

# Model aracı kendisi çalıştırmaz; sadece "şu aracı şu argümanla çağır" der:
print(llm_araclarla.invoke("1.200.000 TL'lik alımı kim onaylar?").tool_calls)

# %% [markdown]
# ## 3️⃣ Grafı kur: düğümler, kenarlar, hafıza  ✍️ *canlı kodlama*

# %%
from langchain_core.messages import SystemMessage
from langgraph.graph import StateGraph, MessagesState, START, END
from langgraph.prebuilt import ToolNode, tools_condition
from langgraph.checkpoint.memory import InMemorySaver

SISTEM = SystemMessage(
    "Sen Atlas Teknoloji'nin satın alma ve politika asistanısın. Kurallar için mutlaka politika_ara aracını kullan, "
    "hesaplamaları hesapla aracıyla yap, onay sorularında onay_yetkilisi_bul kullan. Cevapta kaynak [DOK-xx] göster."
)

# TODO-BASLA: asistan düğümü + ToolNode + koşullu kenar + InMemorySaver ile grafı derleyin
def asistan(state: MessagesState):
    return {"messages": [llm_araclarla.invoke([SISTEM] + state["messages"])]}

g = StateGraph(MessagesState)
g.add_node("asistan", asistan)
g.add_node("tools", ToolNode(araclar))
g.add_edge(START, "asistan")
g.add_conditional_edges("asistan", tools_condition)   # araç çağrısı varsa "tools", yoksa END
g.add_edge("tools", "asistan")
ajan = g.compile(checkpointer=InMemorySaver())
# TODO-BITIR

# %%
from IPython.display import Image, display
try:
    display(Image(ajan.get_graph().draw_mermaid_png()))
except Exception:
    print(ajan.get_graph().draw_mermaid())

# %% [markdown]
# ## 4️⃣ Çalıştır: ajanın adımlarını izleyelim

# %%
def calistir(soru: str, thread_id: str):
    ayar = {"configurable": {"thread_id": thread_id}}
    for adim in ajan.stream({"messages": [("user", soru)]}, ayar, stream_mode="updates"):
        for dugum, guncelleme in adim.items():
            for m in guncelleme["messages"]:
                if getattr(m, "tool_calls", None):
                    for tc in m.tool_calls:
                        print(f"🔧 {tc['name']}({tc['args']})")
                elif m.type == "tool":
                    print(f"   ↳ {m.content[:120].replace(chr(10), ' ')}…")
                else:
                    print(f"\n🤖 {m.text}")

calistir("Delta Yazılım'a 2.000.000 TL'lik sözleşme için %40 avans vermek istiyoruz. "
         "Avans tutarı ne olur, politikaya uygun mu ve sözleşmeyi kim onaylamalı?", thread_id="t1")

# %% [markdown]
# ## 5️⃣ Durumlu: aynı thread hatırlar, yeni thread hatırlamaz

# %%
calistir("Peki avansı politikaya uygun en yüksek orana çekersek tutar ne olur?", thread_id="t1")

# %%
calistir("Peki avansı politikaya uygun en yüksek orana çekersek tutar ne olur?", thread_id="t2")

# %%
durum = ajan.get_state({"configurable": {"thread_id": "t1"}})
print("t1 thread'indeki mesaj sayısı:", len(durum.values["messages"]))

# %% [markdown]
# ### ✅ Özet ve tartışma
# - **Ajan = LLM + araçlar + döngü.** Hangi aracı ne zaman çağıracağına model karar verir.
# - **Checkpointer** üretimde Postgres/Redis olur → kullanıcı ertesi gün kaldığı yerden devam eder.
# - `interrupt()` ile **insan onayı** düğümü eklenebilir (örn. 500.000 TL üstü kararlar).
# - Tek ajan çok fazla araç ve sorumluluk alınca zorlanır → **M5: uzman ajanlardan oluşan ekip**
