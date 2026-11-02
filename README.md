# Üretken Yapay Zeka ile Karar Destek Sistemleri: Eğitim Paketi

2,5 saatlik uygulamalı eğitim. Tüm modüller tek bir kurgusal senaryo üzerinden ilerler: **Atlas Teknoloji'nin satın alma Karar Asistanı**. Her modül bir öncekinin çıktısını kullanır.

| Zaman | Modül | Klasör | Ortam |
|---|---|---|---|
| Önce | Kurulum | [00_Kurulum](00_Kurulum/) | Colab |
| 0:00–0:15 | M1 · GenAI temelleri, yapılandırılmış karar | [M1_GenAI_Karar](M1_GenAI_Karar/) | Colab |
| 0:15–0:35 | M2 · Embedding, vektör DB, RAG | [M2_Embedding_RAG](M2_Embedding_RAG/) | Colab |
| 0:35–0:55 | M3 · GraphRAG ve kişiselleştirme | [M3_GraphRAG](M3_GraphRAG/) | Colab |
| 0:55–1:05 | Ara | | |
| 1:05–1:25 | M4 · LangChain ve LangGraph | [M4_LangChain_LangGraph](M4_LangChain_LangGraph/) | Colab |
| 1:25–1:50 | M5 · Multi-agent ve MCP | [M5_MultiAgent_MCP](M5_MultiAgent_MCP/) | Colab |
| 1:50–2:15 | M6 · .NET + React uçtan uca | [M6_DotNet_React](M6_DotNet_React/) | Yerel (VS Code) |
| 2:15–2:25 | M7 · Üretime hazırlık | [M7_Uretim](M7_Uretim/) | Sunum |
| 2:25–2:30 | Kapanış | [M8_Kapanis](M8_Kapanis/) | |

## Eğitmen için hızlı başlangıç

1. **GitHub'a yükleyin:** Bu klasörü bir GitHub reposu olarak yayınlayın (Colab notebook'ları veriyi ve `ortak.py`'yi oradan klonlar).
2. **Repo adını girin:** `_kaynak/ayarlar.json` içindeki `github_repo` alanını `kullanici/repo` yapın ve `python3 _kaynak/build.py` çalıştırın. Bu adım notebook'lardaki klon adresini ve Colab bağlantılarını günceller.
3. **API anahtarı:** Colab'da 🔑 Secrets → `ANTHROPIC_API_KEY`. M6 için terminalde `export ANTHROPIC_API_KEY=...`
4. **Platformu açın:** `platform/index.html` dosyasını tarayıcıda açın. Gündem, modül akışları, eğitmen notları, süre sayacı ve hücre hücre **sunum modu** buradadır.
5. **Prova:** Her `*_cozum.ipynb` notebook'unu bir kez baştan sona çalıştırıp çıktılarıyla kaydedin (internet sorununa karşı yedek).

## Notebook sürümleri

- `*_baslangic.ipynb`: **Katılımcılar** için. Canlı kodlama bölümleri `# ✍️ TODO` olarak boş.
- `*_cozum.ipynb`: **Eğitmen** için. Tam ve çalışır kod.

## İçeriği değiştirmek

Notebook'ları elle düzenlemeyin. Tek kaynak `_kaynak/` klasörüdür:

```
_kaynak/0X_*.py   →  # %% hücreleri; canlı kısımlar # TODO-BASLA: ipucu ... # TODO-BITIR arasında
_kaynak/0X_*.md   →  M6 adımları, M7 kontrol listesi, kapanış
python3 _kaynak/build.py   →  notebook'lar + README'ler + platform/icerik.js yeniden üretilir
```

## M6'yı çalıştırma

```bash
# Terminal 1: API (.NET 10 SDK gerekir)
cd M6_DotNet_React/api && export ANTHROPIC_API_KEY=... && dotnet run      # http://localhost:5080

# Terminal 2: Arayüz (Node 20+)
cd M6_DotNet_React/web && npm install && npm run dev                      # http://localhost:5173
```

## Model ve maliyet

Varsayılan model `claude-opus-5-5`. Değiştirmek için ortam değişkeni `EGITIM_MODEL` (Python) veya `appsettings.json` → `Model` (.NET) kullanın. `ortak.py` içindeki yapılandırılmış çıktı çağrıları, model bir isteği güvenlik nedeniyle reddederse sunucu tarafında yedek modele geçişi (beta) açar. Hesabınız bu özelliği desteklemiyorsa otomatik olarak kapanır.
