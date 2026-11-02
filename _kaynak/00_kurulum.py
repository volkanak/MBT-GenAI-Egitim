# %% [markdown]
# # 00 · Kurulum ve Ortam Kontrolü
# **Eğitimden 15 dakika önce** çalıştırın. Bu notebook:
# 1. Paketleri kurar (Colab'da ~2-3 dk)
# 2. API anahtarını kontrol eder
# 3. Embedding modelini indirir (~120 MB)
# 4. MCP sunucusunu test eder
#
# > **API anahtarı:** Colab'da sol menüdeki 🔑 *Secrets* bölümüne `ANTHROPIC_API_KEY` adıyla ekleyin ve "Notebook access" anahtarını açın.

# %% @KURULUM

# %%
import importlib.metadata as md
for paket in ["anthropic", "langchain", "langchain-anthropic", "langgraph", "langchain-mcp-adapters", "chromadb", "sentence-transformers"]:
    try:
        print(f"{paket:25s} {md.version(paket)}")
    except md.PackageNotFoundError:
        print(f"{paket:25s} ❌ YOK")

# %% [markdown]
# ## API bağlantı testi

# %%
print(metin_sor("Sadece 'Bağlantı başarılı' yaz.", max_tokens=200))

# %% [markdown]
# ## Embedding modeli ve RAG indeksi (ilk sefer modeli indirir)

# %%
idx = rag_indeksi()
print("Parça sayısı:", idx.parca_sayisi)
for r in idx.ara("tedarikçiye ön ödeme", k=2):
    print(r["skor"], r["baslik"])

# %% [markdown]
# ## MCP sunucusu testi (M5)

# %%
import subprocess, sys
p = subprocess.run([sys.executable, "-c", "import mcp.server.fastmcp; print('MCP hazır ✔')"], capture_output=True, text=True)
print(p.stdout or p.stderr)
