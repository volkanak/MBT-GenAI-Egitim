// Otomatik üretildi: _kaynak/build.py. Elle düzenlemeyin.
window.EGITIM = {
 "ayarlar": {
  "github_repo": "volkanak/MBT-GenAI-Egitim",
  "dal": "main",
  "egitim_adi": "Üretken Yapay Zeka ile Karar Destek Sistemleri",
  "sirket": "Atlas Teknoloji (kurgusal senaryo)"
 },
 "moduller": [
  {
   "id": "m0",
   "kod": "00",
   "baslik": "Kurulum ve Ortam Kontrolü",
   "zaman": "Eğitim öncesi",
   "sure": 0,
   "format": "Hazırlık",
   "demo": "Çalışan ortam",
   "klasor": "00_Kurulum",
   "akis": [
    [
     "T-15 dk",
     "Notebook'u Colab'da çalıştır, embedding modelini indir"
    ],
    [
     "T-10 dk",
     "M2-M5 notebook'larını ayrı sekmelerde aç ve kurulum hücrelerini çalıştır"
    ],
    [
     "T-5 dk",
     ".NET API ve React dev sunucusunu başlat"
    ]
   ],
   "notlar": [
    "Colab Secrets'a ANTHROPIC_API_KEY ekleyin ve 'Notebook access'i açın.",
    "Her Colab notebook'u ayrı bir runtime'dır; kurulum hücresi her birinde bir kez çalışır.",
    "İnternet kesintisine karşı çözüm notebook'larını bir kez çalıştırıp çıktılarıyla kaydedin."
   ],
   "hucreler": [
    {
     "tur": "md",
     "kaynak": "# 00 · Kurulum ve Ortam Kontrolü\n**Eğitimden 15 dakika önce** çalıştırın. Bu notebook:\n1. Paketleri kurar (Colab'da ~2-3 dk)\n2. API anahtarını kontrol eder\n3. Embedding modelini indirir (~120 MB)\n4. MCP sunucusunu test eder\n\n> **API anahtarı:** Colab'da sol menüdeki 🔑 *Secrets* bölümüne `ANTHROPIC_API_KEY` adıyla ekleyin ve \"Notebook access\" anahtarını açın."
    },
    {
     "tur": "kod",
     "dil": "python",
     "kurulum": true,
     "parcalar": [
      {
       "canli": false,
       "kod": "# ⚙️ Ortam hazırlığı: Colab'da ve yerel Jupyter'da çalışır\nimport os, sys, subprocess\nREPO_URL = \"https://github.com/volkanak/MBT-GenAI-Egitim.git\"   # ← kendi GitHub reponuz\nKOK = next((os.path.abspath(p) for p in [\".\", \"..\", \"/content/MBT-GenAI-Egitim\"]\n            if os.path.exists(os.path.join(p, \"ortak.py\"))), None)\nif KOK is None:  # Colab: repoyu klonla\n    subprocess.run([\"git\", \"clone\", \"-q\", REPO_URL, \"/content/MBT-GenAI-Egitim\"], check=True)\n    KOK = \"/content/MBT-GenAI-Egitim\"\ntry:\n    import langgraph, chromadb, langchain_anthropic, sentence_transformers, langchain_mcp_adapters  # noqa\nexcept ImportError:\n    print(\"Paketler kuruluyor (1-3 dk)…\")\n    subprocess.run([sys.executable, \"-m\", \"pip\", \"install\", \"-q\", \"-r\", f\"{KOK}/requirements.txt\"], check=True)\nsys.path.insert(0, KOK); os.chdir(KOK)\nfrom ortak import *\napi_anahtari_yukle()\nprint(\"Hazır ✔  Model:\", MODEL)"
      }
     ]
    },
    {
     "tur": "kod",
     "dil": "python",
     "kurulum": false,
     "parcalar": [
      {
       "canli": false,
       "kod": "import importlib.metadata as md\nfor paket in [\"anthropic\", \"langchain\", \"langchain-anthropic\", \"langgraph\", \"langchain-mcp-adapters\", \"chromadb\", \"sentence-transformers\"]:\n    try:\n        print(f\"{paket:25s} {md.version(paket)}\")\n    except md.PackageNotFoundError:\n        print(f\"{paket:25s} ❌ YOK\")"
      }
     ]
    },
    {
     "tur": "md",
     "kaynak": "## API bağlantı testi"
    },
    {
     "tur": "kod",
     "dil": "python",
     "kurulum": false,
     "parcalar": [
      {
       "canli": false,
       "kod": "print(metin_sor(\"Sadece 'Bağlantı başarılı' yaz.\", max_tokens=200))"
      }
     ]
    },
    {
     "tur": "md",
     "kaynak": "## Embedding modeli ve RAG indeksi (ilk sefer modeli indirir)"
    },
    {
     "tur": "kod",
     "dil": "python",
     "kurulum": false,
     "parcalar": [
      {
       "canli": false,
       "kod": "idx = rag_indeksi()\nprint(\"Parça sayısı:\", idx.parca_sayisi)\nfor r in idx.ara(\"tedarikçiye ön ödeme\", k=2):\n    print(r[\"skor\"], r[\"baslik\"])"
      }
     ]
    },
    {
     "tur": "md",
     "kaynak": "## MCP sunucusu testi (M5)"
    },
    {
     "tur": "kod",
     "dil": "python",
     "kurulum": false,
     "parcalar": [
      {
       "canli": false,
       "kod": "import subprocess, sys\np = subprocess.run([sys.executable, \"-c\", \"import mcp.server.fastmcp; print('MCP hazır ✔')\"], capture_output=True, text=True)\nprint(p.stdout or p.stderr)"
      }
     ]
    }
   ],
   "notebooklar": [
    {
     "etiket": "Notebook",
     "yol": "00_Kurulum/00_kurulum.ipynb",
     "colab": "https://colab.research.google.com/github/volkanak/MBT-GenAI-Egitim/blob/main/00_Kurulum/00_kurulum.ipynb"
    }
   ]
  },
  {
   "id": "m1",
   "kod": "M1",
   "baslik": "Açılış, GenAI temelleri ve AI destekli karar verme",
   "zaman": "0:00–0:15",
   "sure": 15,
   "format": "Sunum + mini demo",
   "demo": "Yapılandırılmış çıktı veren karar prompt'u",
   "klasor": "M1_GenAI_Karar",
   "akis": [
    [
     "0-10",
     "Sunum: token, context, halüsinasyon, karar destek döngüsü"
    ],
    [
     "10-12",
     "İlk çağrı + serbest metin karar"
    ],
    [
     "12-15",
     "Pydantic şema ile yapılandırılmış karar"
    ]
   ],
   "notlar": [
    "Serbest metin cevabı ekranda bırakıp 'bunu koda nasıl bağlarız?' sorusunu sorun.",
    "Modelin politikaları bilmediğini vurgulayın: M5'teki sonuçla karşılaştıracağız."
   ],
   "hucreler": [
    {
     "tur": "md",
     "kaynak": "# M1 · GenAI Temelleri ve AI Destekli Karar Verme\n**Süre:** 15 dk (10 dk sunum + 5 dk demo) · **Demo çıktısı:** Yapılandırılmış çıktı veren karar prompt'u\n\n### Bu modülde\n- LLM nasıl çalışır: **token**, **context window**, olasılıksal üretim\n- Halüsinasyon neden olur, nasıl sınırlanır?\n- Serbest metin ve **yapılandırılmış çıktı (JSON şema)** farkı\n- LLM bir **karar verici değil, karar destekçisidir** (human-in-the-loop)"
    },
    {
     "tur": "md",
     "kaynak": "## 📊 Sunum notları\n| Kavram | Kısa açıklama |\n|---|---|\n| **Token** | Modelin okuduğu/ürettiği metin parçası. Türkçede 1 kelime ≈ 1,5-2,5 token. Maliyet token ile ölçülür. |\n| **Context window** | Modelin tek seferde \"görebildiği\" metin miktarı (prompt + doküman + geçmiş + cevap). |\n| **Sistem prompt'u** | Modelin rolü, kuralları ve çıktı biçimi. |\n| **Halüsinasyon** | Modelin bilmediği bir şeyi akıcı ve emin bir dille uydurması. Çare: bağlam vermek (RAG), şema, doğrulama. |\n| **Yapılandırılmış çıktı** | Modelin cevabını önceden tanımlı bir JSON şemasına uydurması → kod tarafından güvenle işlenebilir. |\n\n**AI destekli karar verme döngüsü:** Veri → Bağlam → Öneri (yapılandırılmış) → İnsan onayı → Kayıt/izleme"
    },
    {
     "tur": "kod",
     "dil": "python",
     "kurulum": true,
     "parcalar": [
      {
       "canli": false,
       "kod": "# ⚙️ Ortam hazırlığı: Colab'da ve yerel Jupyter'da çalışır\nimport os, sys, subprocess\nREPO_URL = \"https://github.com/volkanak/MBT-GenAI-Egitim.git\"   # ← kendi GitHub reponuz\nKOK = next((os.path.abspath(p) for p in [\".\", \"..\", \"/content/MBT-GenAI-Egitim\"]\n            if os.path.exists(os.path.join(p, \"ortak.py\"))), None)\nif KOK is None:  # Colab: repoyu klonla\n    subprocess.run([\"git\", \"clone\", \"-q\", REPO_URL, \"/content/MBT-GenAI-Egitim\"], check=True)\n    KOK = \"/content/MBT-GenAI-Egitim\"\ntry:\n    import langgraph, chromadb, langchain_anthropic, sentence_transformers, langchain_mcp_adapters  # noqa\nexcept ImportError:\n    print(\"Paketler kuruluyor (1-3 dk)…\")\n    subprocess.run([sys.executable, \"-m\", \"pip\", \"install\", \"-q\", \"-r\", f\"{KOK}/requirements.txt\"], check=True)\nsys.path.insert(0, KOK); os.chdir(KOK)\nfrom ortak import *\napi_anahtari_yukle()\nprint(\"Hazır ✔  Model:\", MODEL)"
      }
     ]
    },
    {
     "tur": "md",
     "kaynak": "## 1️⃣ İlk çağrı ve token kullanımı"
    },
    {
     "tur": "kod",
     "dil": "python",
     "kurulum": false,
     "parcalar": [
      {
       "canli": false,
       "kod": "c = istemci()\nyanit = c.messages.create(\n    model=MODEL,\n    max_tokens=1024,\n    messages=[{\"role\": \"user\", \"content\": \"Üretken yapay zekayı bir yöneticiye 3 cümlede anlat.\"}],\n)\nprint(\"\".join(b.text for b in yanit.content if b.type == \"text\"))\nprint(\"\\nGirdi token:\", yanit.usage.input_tokens, \"| Çıktı token:\", yanit.usage.output_tokens)"
      }
     ]
    },
    {
     "tur": "md",
     "kaynak": "## 2️⃣ Karar senaryosu: önce serbest metin\nModel şirket politikalarını **bilmiyor**. Bunu not edin; M2'de RAG ve M5'te ajan ekibiyle düzelteceğiz."
    },
    {
     "tur": "kod",
     "dil": "python",
     "kurulum": false,
     "parcalar": [
      {
       "canli": false,
       "kod": "SENARYO = \"\"\"Tedarikçi: Delta Yazılım A.Ş.\nTalep: 2.000.000 TL tutarında yıllık CRM lisans sözleşmesi.\nTedarikçi sözleşme bedelinin %40'ı oranında peşin avans istiyor.\nTedarikçi değerlendirme puanı: 74/100.\nGeçen yıl 1 kez teslimat gecikmesi yaşandı.\nBütçede bu kalem için 1.800.000 TL ayrılmış.\"\"\"\n\nserbest = c.messages.create(\n    model=MODEL,\n    max_tokens=2048,\n    messages=[{\"role\": \"user\", \"content\": f\"Bu talep onaylanmalı mı?\\n\\n{SENARYO}\"}],\n)\nprint(\"\".join(b.text for b in serbest.content if b.type == \"text\"))"
      }
     ]
    },
    {
     "tur": "md",
     "kaynak": "❓ **Soru:** Bu cevabı bir onay sistemine nasıl bağlarsınız? Hangi alan \"karar\", hangisi \"risk\"?\n\n## 3️⃣ Yapılandırılmış çıktı: Pydantic şeması  ✍️ *canlı kodlama*"
    },
    {
     "tur": "kod",
     "dil": "python",
     "kurulum": false,
     "parcalar": [
      {
       "canli": false,
       "kod": "from typing import Literal\nfrom pydantic import BaseModel, Field\n"
      },
      {
       "canli": true,
       "ipucu": "Karar şemasını tanımlayın: karar (onayla/reddet/incele), gerekce, riskler, kosullar, guven",
       "kod": "class Karar(BaseModel):\n    karar: Literal[\"onayla\", \"reddet\", \"incele\"] = Field(description=\"Önerilen karar\")\n    gerekce: str = Field(description=\"Kararın 2-3 cümlelik gerekçesi\")\n    riskler: list[str] = Field(description=\"Tespit edilen başlıca riskler\")\n    kosullar: list[str] = Field(description=\"Onay için sağlanması gereken koşullar (yoksa boş liste)\")\n    guven: float = Field(description=\"0 ile 1 arasında güven skoru\")"
      }
     ]
    },
    {
     "tur": "kod",
     "dil": "python",
     "kurulum": false,
     "parcalar": [
      {
       "canli": false,
       "kod": "KARAR_SISTEM = \"\"\"Sen Atlas Teknoloji'nin satın alma karar destek uzmanısın.\nTalepleri finansal risk, tedarikçi riski ve bütçe uyumu açısından değerlendir.\nEmin olmadığın veya bilgi eksik olan durumlarda 'incele' öner ve güveni düşük tut.\"\"\"\n"
      },
      {
       "canli": true,
       "ipucu": "messages.parse ile output_format=Karar kullanarak yapılandırılmış karar alın",
       "kod": "r = c.messages.parse(\n    model=MODEL,\n    max_tokens=4096,\n    system=KARAR_SISTEM,\n    messages=[{\"role\": \"user\", \"content\": SENARYO}],\n    output_format=Karar,\n)\nkarar = r.parsed_output"
      },
      {
       "canli": false,
       "kod": "print(karar.model_dump_json(indent=2))"
      }
     ]
    },
    {
     "tur": "md",
     "kaynak": "## 4️⃣ Karar destek: insan onayı kuralı\nModel ne kadar iyi olursa olsun **son karar insanda**. Düşük güvenli öneriler otomatik olarak insana yönlendirilir."
    },
    {
     "tur": "kod",
     "dil": "python",
     "kurulum": false,
     "parcalar": [
      {
       "canli": false,
       "kod": "ROZET = {\"onayla\": \"✅ ONAYLA\", \"reddet\": \"⛔ REDDET\", \"incele\": \"🔎 İNCELE\"}\n\ndef karar_karti(k: Karar, esik: float = 0.75):\n    print(f\"{ROZET[k.karar]}   (güven: {k.guven:.0%})\")\n    print(\"Gerekçe :\", k.gerekce)\n    print(\"Riskler :\", *[f\"\\n  • {x}\" for x in k.riskler])\n    if k.kosullar:\n        print(\"Koşullar:\", *[f\"\\n  • {x}\" for x in k.kosullar])\n    if k.guven < esik or k.karar != \"onayla\":\n        print(\"\\n👤 İnsan onayına yönlendirildi (Finans Müdürü)\")\n\nkarar_karti(karar)"
      }
     ]
    },
    {
     "tur": "md",
     "kaynak": "### ✅ Özet\n- Aynı soru → serbest metin **okunur**, yapılandırılmış çıktı **işlenir**.\n- `Karar` şeması `ortak.py` içinde de var: **M5**'te ajan ekibi, **M6**'da .NET + React ekranı aynı alanları kullanacak.\n- Model politikaları bilmeden karar verdi → **M2: RAG** ile şirket dokümanlarını bağlam olarak vereceğiz."
    }
   ],
   "notebooklar": [
    {
     "etiket": "Başlangıç (katılımcı)",
     "yol": "M1_GenAI_Karar/M1_baslangic.ipynb",
     "colab": "https://colab.research.google.com/github/volkanak/MBT-GenAI-Egitim/blob/main/M1_GenAI_Karar/M1_baslangic.ipynb"
    },
    {
     "etiket": "Çözüm (eğitmen)",
     "yol": "M1_GenAI_Karar/M1_cozum.ipynb",
     "colab": "https://colab.research.google.com/github/volkanak/MBT-GenAI-Egitim/blob/main/M1_GenAI_Karar/M1_cozum.ipynb"
    }
   ]
  },
  {
   "id": "m2",
   "kod": "M2",
   "baslik": "Embedding ve vektör veritabanları",
   "zaman": "0:15–0:35",
   "sure": 20,
   "format": "Canlı kodlama",
   "demo": "Dokümanları indeksleyen RAG hattı",
   "klasor": "M2_Embedding_RAG",
   "akis": [
    [
     "0-3",
     "Embedding ısı haritası"
    ],
    [
     "3-8",
     "Yükleme ve parçalama"
    ],
    [
     "8-14",
     "Embedding + Chroma"
    ],
    [
     "14-18",
     "RAG cevabı + halüsinasyon testi"
    ],
    [
     "18-20",
     "Soru-cevap"
    ]
   ],
   "notlar": [
    "'ön ödeme' sorusunun 'avans' dokümanını bulması anlamsal aramanın en iyi kanıtıdır.",
    "Zaman kalırsa chunk_size'ı 150 yapıp sonucun bozulduğunu gösterin."
   ],
   "hucreler": [
    {
     "tur": "md",
     "kaynak": "# M2 · Embedding ve Vektör Veritabanları\n**Süre:** 20 dk canlı kodlama · **Demo çıktısı:** Dokümanları indeksleyen RAG hattı\n\n| Dakika | Adım |\n|---|---|\n| 0-3 | Embedding nedir? Benzerlik ısı haritası |\n| 3-8 | Dokümanları yükleme ve parçalama (chunking) |\n| 8-14 | Embedding + Chroma'ya indeksleme |\n| 14-18 | Retriever + LLM = RAG, kaynak gösteren cevap |\n| 18-20 | Soru-cevap |\n\n```\nDokümanlar → Parçala → Embedding → Vektör DB\n                                         ↓  (benzerlik araması)\n                   Soru → Embedding → En yakın k parça → LLM + bağlam → Kaynaklı cevap\n```"
    },
    {
     "tur": "kod",
     "dil": "python",
     "kurulum": true,
     "parcalar": [
      {
       "canli": false,
       "kod": "# ⚙️ Ortam hazırlığı: Colab'da ve yerel Jupyter'da çalışır\nimport os, sys, subprocess\nREPO_URL = \"https://github.com/volkanak/MBT-GenAI-Egitim.git\"   # ← kendi GitHub reponuz\nKOK = next((os.path.abspath(p) for p in [\".\", \"..\", \"/content/MBT-GenAI-Egitim\"]\n            if os.path.exists(os.path.join(p, \"ortak.py\"))), None)\nif KOK is None:  # Colab: repoyu klonla\n    subprocess.run([\"git\", \"clone\", \"-q\", REPO_URL, \"/content/MBT-GenAI-Egitim\"], check=True)\n    KOK = \"/content/MBT-GenAI-Egitim\"\ntry:\n    import langgraph, chromadb, langchain_anthropic, sentence_transformers, langchain_mcp_adapters  # noqa\nexcept ImportError:\n    print(\"Paketler kuruluyor (1-3 dk)…\")\n    subprocess.run([sys.executable, \"-m\", \"pip\", \"install\", \"-q\", \"-r\", f\"{KOK}/requirements.txt\"], check=True)\nsys.path.insert(0, KOK); os.chdir(KOK)\nfrom ortak import *\napi_anahtari_yukle()\nprint(\"Hazır ✔  Model:\", MODEL)"
      }
     ]
    },
    {
     "tur": "md",
     "kaynak": "## 1️⃣ Embedding: anlamı sayıya çevirmek\nAynı anlama gelen cümleler, **farklı kelimelerle** yazılsa da vektör uzayında birbirine yakındır."
    },
    {
     "tur": "kod",
     "dil": "python",
     "kurulum": false,
     "parcalar": [
      {
       "canli": false,
       "kod": "from sentence_transformers import SentenceTransformer\nimport matplotlib.pyplot as plt\nimport numpy as np\n\nemb_model = SentenceTransformer(EMBEDDING_MODELI)\n\ncumleler = [\n    \"Tedarikçiye avans ödemesi için teminat gerekir\",\n    \"Satıcıya ön ödeme yaparken banka garantisi istenir\",\n    \"Çalışanlar Salı ve Perşembe ofise gelir\",\n    \"Kediler süt içmeyi sever\",\n]\nV = emb_model.encode([f\"query: {c}\" for c in cumleler], normalize_embeddings=True)\nprint(\"Vektör boyutu:\", V.shape)\n\nbenzerlik = V @ V.T  # normalize vektörlerde iç çarpım = kosinüs benzerliği\nplt.imshow(benzerlik, cmap=\"Blues\", vmin=0.6, vmax=1)\nplt.xticks(range(4), [c[:18] + \"…\" for c in cumleler], rotation=30, ha=\"right\")\nplt.yticks(range(4), [c[:18] + \"…\" for c in cumleler])\nfor i in range(4):\n    for j in range(4):\n        plt.text(j, i, f\"{benzerlik[i, j]:.2f}\", ha=\"center\", va=\"center\")\nplt.title(\"Kosinüs benzerliği\"); plt.colorbar(); plt.show()"
      }
     ]
    },
    {
     "tur": "md",
     "kaynak": "## 2️⃣ Dokümanları yükle ve parçala"
    },
    {
     "tur": "kod",
     "dil": "python",
     "kurulum": false,
     "parcalar": [
      {
       "canli": false,
       "kod": "import pandas as pd\n\ndokumanlar = dokumanlari_yukle()\npd.DataFrame(dokumanlar)[[\"id\", \"baslik\", \"departman\", \"konular\"]]"
      }
     ]
    },
    {
     "tur": "kod",
     "dil": "python",
     "kurulum": false,
     "parcalar": [
      {
       "canli": false,
       "kod": "from langchain_text_splitters import RecursiveCharacterTextSplitter\n"
      },
      {
       "canli": true,
       "ipucu": "400 karakterlik, 60 karakter örtüşmeli bir bölücü ile dokümanları parçalayın",
       "kod": "bolucu = RecursiveCharacterTextSplitter(chunk_size=400, chunk_overlap=60)\nparcalar = []\nfor d in dokumanlar:\n    for i, metin in enumerate(bolucu.split_text(d[\"metin\"])):\n        parcalar.append({\"id\": f\"{d['id']}#{i}\", \"metin\": metin,\n                         \"meta\": {\"dok_id\": d[\"id\"], \"baslik\": d[\"baslik\"], \"departman\": d[\"departman\"]}})"
      },
      {
       "canli": false,
       "kod": "print(len(dokumanlar), \"doküman →\", len(parcalar), \"parça\")\nprint(parcalar[0])"
      }
     ]
    },
    {
     "tur": "md",
     "kaynak": "## 3️⃣ Embedding'le ve vektör veritabanına yaz (Chroma)  ✍️ *canlı kodlama*\n> e5 modelleri dokümanlar için `passage:`, sorular için `query:` ön ekini bekler."
    },
    {
     "tur": "kod",
     "dil": "python",
     "kurulum": false,
     "parcalar": [
      {
       "canli": false,
       "kod": "import chromadb\n"
      },
      {
       "canli": true,
       "ipucu": "Parçaları embedding'leyin ve kosinüs metrikli bir Chroma koleksiyonuna ekleyin",
       "kod": "vektorler = emb_model.encode([f\"passage: {p['metin']}\" for p in parcalar], normalize_embeddings=True)\n\ndb = chromadb.EphemeralClient()           # bellek içi; kalıcı için PersistentClient(path=...)\ntry:\n    db.delete_collection(\"atlas\")\nexcept Exception:\n    pass\nkoleksiyon = db.create_collection(\"atlas\", metadata={\"hnsw:space\": \"cosine\"})\nkoleksiyon.add(\n    ids=[p[\"id\"] for p in parcalar],\n    documents=[p[\"metin\"] for p in parcalar],\n    metadatas=[p[\"meta\"] for p in parcalar],\n    embeddings=vektorler.tolist(),\n)"
      },
      {
       "canli": false,
       "kod": "print(\"Koleksiyondaki kayıt:\", koleksiyon.count())"
      }
     ]
    },
    {
     "tur": "md",
     "kaynak": "## 4️⃣ Anlamsal arama (retriever)"
    },
    {
     "tur": "kod",
     "dil": "python",
     "kurulum": false,
     "parcalar": [
      {
       "canli": true,
       "ipucu": "Soruyu embedding'leyip en yakın k parçayı döndüren ara() fonksiyonu",
       "kod": "def ara(soru: str, k: int = 4):\n    q = emb_model.encode([f\"query: {soru}\"], normalize_embeddings=True)\n    s = koleksiyon.query(query_embeddings=q.tolist(), n_results=k)\n    return [{\"dok_id\": m[\"dok_id\"], \"baslik\": m[\"baslik\"], \"parca\": d, \"skor\": round(1 - dist, 3)}\n            for d, m, dist in zip(s[\"documents\"][0], s[\"metadatas\"][0], s[\"distances\"][0])]"
      },
      {
       "canli": false,
       "kod": "\n# \"ön ödeme\" kelimesi dokümanlarda geçmiyor, ama \"avans\" dokümanı bulunur 👇\nfor r in ara(\"Satıcıya ön ödeme yaparken nelere dikkat etmeliyim?\"):\n    print(f\"{r['skor']:.3f}  {r['dok_id']}  {r['baslik']}\")"
      }
     ]
    },
    {
     "tur": "md",
     "kaynak": "## 5️⃣ RAG: bağlam + LLM = kaynaklı cevap  ✍️ *canlı kodlama*"
    },
    {
     "tur": "kod",
     "dil": "python",
     "kurulum": false,
     "parcalar": [
      {
       "canli": true,
       "ipucu": "Bulunan parçalardan bağlam oluşturup modele kaynak göstermesini söyleyin",
       "kod": "def rag(soru: str, k: int = 4) -> str:\n    sonuclar = ara(soru, k)\n    baglam = \"\\n\\n\".join(f\"[{r['dok_id']}] {r['baslik']}\\n{r['parca']}\" for r in sonuclar)\n    sistem = (\"Sen Atlas Teknoloji'nin kurumsal politika asistanısın. Yalnızca verilen bağlamı kullan. \"\n              \"Her bilginin sonunda kaynağı [DOK-xx] biçiminde göster. Bağlamda cevap yoksa \"\n              \"'Bu bilgi dokümanlarda yok' de.\")\n    return metin_sor(f\"Bağlam:\\n{baglam}\\n\\nSoru: {soru}\", sistem=sistem)"
      },
      {
       "canli": false,
       "kod": "\nprint(rag(\"Bir tedarikçiye 2.000.000 TL'lik sözleşme için %40 avans verebilir miyiz?\"))"
      }
     ]
    },
    {
     "tur": "md",
     "kaynak": "## 6️⃣ Halüsinasyon testi: dokümanlarda olmayan soru"
    },
    {
     "tur": "kod",
     "dil": "python",
     "kurulum": false,
     "parcalar": [
      {
       "canli": false,
       "kod": "print(rag(\"Şirketin yemek kartı limiti ne kadar?\"))"
      }
     ]
    },
    {
     "tur": "md",
     "kaynak": "### ✅ Özet ve tartışma\n- **Chunk boyutu** çok küçük → bağlam kopar; çok büyük → alakasız metin gelir. Deneyin: 200 / 800.\n- Üretimde: kalıcı vektör DB (pgvector, Qdrant, Azure AI Search…), **hibrit arama** (BM25 + vektör), **re-ranking**.\n- Bu kod `ortak.py` içinde `RagIndeksi` olarak duruyor → M3, M4, M5 tekrar kullanacak.\n- **Eksik:** Sonuçlar herkese aynı sırayla geliyor. Kullanıcının rolü/ilgisi hesaba katılmıyor → **M3: GraphRAG**"
    }
   ],
   "notebooklar": [
    {
     "etiket": "Başlangıç (katılımcı)",
     "yol": "M2_Embedding_RAG/M2_baslangic.ipynb",
     "colab": "https://colab.research.google.com/github/volkanak/MBT-GenAI-Egitim/blob/main/M2_Embedding_RAG/M2_baslangic.ipynb"
    },
    {
     "etiket": "Çözüm (eğitmen)",
     "yol": "M2_Embedding_RAG/M2_cozum.ipynb",
     "colab": "https://colab.research.google.com/github/volkanak/MBT-GenAI-Egitim/blob/main/M2_Embedding_RAG/M2_cozum.ipynb"
    }
   ]
  },
  {
   "id": "m3",
   "kod": "M3",
   "baslik": "Graph ile anlamsallaştırma ve kişiselleştirme (GraphRAG)",
   "zaman": "0:35–0:55",
   "sure": 20,
   "format": "Canlı kodlama",
   "demo": "Kullanıcı profiline göre sıralanan sonuçlar",
   "klasor": "M3_GraphRAG",
   "akis": [
    [
     "0-3",
     "Vektör aramanın sınırları"
    ],
    [
     "3-7",
     "LLM ile üçlü çıkarma"
    ],
    [
     "7-10",
     "Graf çizimi"
    ],
    [
     "10-16",
     "Kişiselleştirilmiş PageRank + birleşik skor"
    ],
    [
     "16-20",
     "3 kullanıcı karşılaştırması"
    ]
   ],
   "notlar": [
    "Karşılaştırma tablosu modülün 'aha' anıdır; yeterince zaman bırakın.",
    "alfa=1.0 ile kişiselleştirmenin kapandığını canlı gösterin."
   ],
   "hucreler": [
    {
     "tur": "md",
     "kaynak": "# M3 · Graph ile Anlamsallaştırma ve Kişiselleştirme (GraphRAG)\n**Süre:** 20 dk canlı kodlama · **Demo çıktısı:** Kullanıcı profiline göre sıralanan sonuçlar\n\n**Vektör araması ne bilmez?**\n- Kavramlar arasındaki **ilişkileri** (\"avans → tedarikçi → risk\")\n- **Kim** soruyor? Finans müdürü ile güvenlik uzmanı için \"önemli\" olan farklıdır.\n\n```\n  (Ayşe)──ILGILENIR──▶(avans)◀──ILGILI──(DOK-03 Avans Politikası)\n                         │\n                      BAĞLIDIR\n                         ▼\n                    (tedarikçi)◀──ILGILI──(DOK-02 Tedarikçi Prosedürü)\n```\n**Fikir:** Skor = α · vektör benzerliği + (1-α) · grafta kullanıcıya yakınlık (Kişiselleştirilmiş PageRank)"
    },
    {
     "tur": "kod",
     "dil": "python",
     "kurulum": true,
     "parcalar": [
      {
       "canli": false,
       "kod": "# ⚙️ Ortam hazırlığı: Colab'da ve yerel Jupyter'da çalışır\nimport os, sys, subprocess\nREPO_URL = \"https://github.com/volkanak/MBT-GenAI-Egitim.git\"   # ← kendi GitHub reponuz\nKOK = next((os.path.abspath(p) for p in [\".\", \"..\", \"/content/MBT-GenAI-Egitim\"]\n            if os.path.exists(os.path.join(p, \"ortak.py\"))), None)\nif KOK is None:  # Colab: repoyu klonla\n    subprocess.run([\"git\", \"clone\", \"-q\", REPO_URL, \"/content/MBT-GenAI-Egitim\"], check=True)\n    KOK = \"/content/MBT-GenAI-Egitim\"\ntry:\n    import langgraph, chromadb, langchain_anthropic, sentence_transformers, langchain_mcp_adapters  # noqa\nexcept ImportError:\n    print(\"Paketler kuruluyor (1-3 dk)…\")\n    subprocess.run([sys.executable, \"-m\", \"pip\", \"install\", \"-q\", \"-r\", f\"{KOK}/requirements.txt\"], check=True)\nsys.path.insert(0, KOK); os.chdir(KOK)\nfrom ortak import *\napi_anahtari_yukle()\nprint(\"Hazır ✔  Model:\", MODEL)"
      }
     ]
    },
    {
     "tur": "md",
     "kaynak": "## 1️⃣ LLM ile dokümandan bilgi (üçlü) çıkarma  ✍️ *canlı kodlama*\nGraphRAG'in ilk adımı: metinden **(varlık, ilişki, varlık)** üçlüleri çıkarmak. Canlıda 1 doküman çalıştırıyoruz; tamamı `data/graf_ucluleri.json` içinde hazır."
    },
    {
     "tur": "kod",
     "dil": "python",
     "kurulum": false,
     "parcalar": [
      {
       "canli": false,
       "kod": "from pydantic import BaseModel, Field\n"
      },
      {
       "canli": true,
       "ipucu": "Uclu ve Ucluler şemalarını tanımlayıp DOK-03'ten üçlü çıkarın",
       "kod": "class Uclu(BaseModel):\n    kaynak: str = Field(description=\"Kavram, küçük harf, 1-3 kelime\")\n    iliski: str = Field(description=\"BÜYÜK_HARF fiil, örn. GEREKTİRİR, BAĞLIDIR\")\n    hedef: str = Field(description=\"Kavram, küçük harf, 1-3 kelime\")\n\nclass Ucluler(BaseModel):\n    ucluler: list[Uclu]\n\ndok = dokumanlari_yukle()[2]  # DOK-03 Avans Politikası\ncikti = yapilandirilmis_sor(\n    f\"Aşağıdaki politika metninden en önemli 6-8 kavram ilişkisini çıkar.\\n\\n{dok['metin']}\", Ucluler)"
      },
      {
       "canli": false,
       "kod": "for u in cikti.ucluler:\n    print(f\"({u.kaynak}) -[{u.iliski}]-> ({u.hedef})\")"
      }
     ]
    },
    {
     "tur": "md",
     "kaynak": "## 2️⃣ Bilgi grafını kur ve çiz\nDüğümler: 👤 kullanıcı · 📄 doküman · 🏷️ konu"
    },
    {
     "tur": "kod",
     "dil": "python",
     "kurulum": false,
     "parcalar": [
      {
       "canli": false,
       "kod": "import networkx as nx\nimport matplotlib.pyplot as plt\n\nG = graf_kur()   # ortak.py: dokümanlar + kullanıcılar + konu ilişkileri\nprint(G.number_of_nodes(), \"düğüm,\", G.number_of_edges(), \"kenar\")\n\nrenk = {\"kullanici\": \"#e4572e\", \"dokuman\": \"#4c78a8\", \"konu\": \"#9ecae9\"}\nplt.figure(figsize=(13, 9))\npos = nx.spring_layout(G, seed=7, k=0.6)\nnx.draw_networkx(G, pos, node_color=[renk[G.nodes[n][\"tur\"]] for n in G],\n                 labels={n: G.nodes[n][\"etiket\"][:22] for n in G}, font_size=7,\n                 node_size=[900 if G.nodes[n][\"tur\"] != \"konu\" else 400 for n in G], edge_color=\"#ccc\")\nplt.axis(\"off\"); plt.show()"
      }
     ]
    },
    {
     "tur": "md",
     "kaynak": "## 3️⃣ Kişiselleştirilmiş PageRank: grafta \"bana yakın\" olan ne?  ✍️ *canlı kodlama*\nRastgele yürüyüş her seferinde **kullanıcının düğümüne geri döner** → kullanıcıya yakın dokümanlar yüksek skor alır."
    },
    {
     "tur": "kod",
     "dil": "python",
     "kurulum": false,
     "parcalar": [
      {
       "canli": false,
       "kod": "kullanicilar = kullanicilari_yukle()\n"
      },
      {
       "canli": true,
       "ipucu": "Her kullanıcı için personalization={kullanici_id: 1} ile PageRank hesaplayıp ilk 4 dokümanı yazdırın",
       "kod": "for u in kullanicilar:\n    ppr = nx.pagerank(G, personalization={u[\"id\"]: 1.0})\n    dok_skor = sorted(((v, n) for n, v in ppr.items() if G.nodes[n][\"tur\"] == \"dokuman\"), reverse=True)[:4]\n    print(f\"\\n👤 {u['ad']} ({u['unvan']})\")\n    for v, n in dok_skor:\n        print(f\"   {v:.3f}  {G.nodes[n]['etiket']}\")"
      }
     ]
    },
    {
     "tur": "md",
     "kaynak": "## 4️⃣ Vektör + graf = kişiselleştirilmiş sıralama  ✍️ *canlı kodlama*"
    },
    {
     "tur": "kod",
     "dil": "python",
     "kurulum": false,
     "parcalar": [
      {
       "canli": true,
       "ipucu": "Geniş aday havuzu al, doküman başına en iyi parçayı tut, final = alfa*vektör + (1-alfa)*graf",
       "kod": "def kisisel_ara(soru: str, kullanici_id: str, alfa: float = 0.5, k: int = 6):\n    ppr = nx.pagerank(G, personalization={kullanici_id: 1.0})\n    dok_ppr = {n: v for n, v in ppr.items() if G.nodes[n][\"tur\"] == \"dokuman\"}\n    en_buyuk = max(dok_ppr.values())\n    adaylar = {}\n    for r in rag_indeksi().ara(soru, 20):          # geniş havuz\n        adaylar.setdefault(r[\"dok_id\"], r)         # doküman başına en iyi parça\n    for r in adaylar.values():\n        r[\"graf\"] = round(dok_ppr[r[\"dok_id\"]] / en_buyuk, 3)\n        r[\"final\"] = round(alfa * r[\"skor\"] + (1 - alfa) * r[\"graf\"], 3)\n    return sorted(adaylar.values(), key=lambda r: r[\"final\"], reverse=True)[:k]"
      }
     ]
    },
    {
     "tur": "md",
     "kaynak": "## 5️⃣ Aynı soru, üç farklı kullanıcı"
    },
    {
     "tur": "kod",
     "dil": "python",
     "kurulum": false,
     "parcalar": [
      {
       "canli": false,
       "kod": "import pandas as pd\n\nSORU = \"Bu çeyrekte dikkat etmem gereken kurallar neler?\"\ntablo = {}\nfor u in kullanicilar:\n    tablo[f\"{u['ad']} · {u['unvan']}\"] = [f\"{r['baslik'][:34]} ({r['final']})\" for r in kisisel_ara(SORU, u[\"id\"])[:4]]\ntablo[\"Sadece vektör (kişiselleştirme yok)\"] = [f\"{r['baslik'][:34]} ({r['skor']})\" for r in rag_indeksi().ara(SORU, 4)]\npd.DataFrame(tablo, index=[1, 2, 3, 4])"
      }
     ]
    },
    {
     "tur": "md",
     "kaynak": "## 6️⃣ Kişiselleştirilmiş cevap"
    },
    {
     "tur": "kod",
     "dil": "python",
     "kurulum": false,
     "parcalar": [
      {
       "canli": false,
       "kod": "def kisisel_cevap(soru: str, kullanici: dict) -> str:\n    sonuclar = kisisel_ara(soru, kullanici[\"id\"])[:4]\n    sistem = (RAG_SISTEM + f\"\\nKullanıcı: {kullanici['ad']}, {kullanici['unvan']} ({kullanici['departman']}). \"\n              \"Cevabı bu kişinin rolü ve sorumluluklarına göre önceliklendir, en fazla 5 madde yaz.\")\n    return metin_sor(f\"Bağlam:\\n{baglam_olustur(sonuclar)}\\n\\nSoru: {soru}\", sistem=sistem)\n\nfor u in kullanicilar[:2]:\n    print(f\"━━━━ 👤 {u['ad']} ━━━━\\n{kisisel_cevap(SORU, u)}\\n\")"
      }
     ]
    },
    {
     "tur": "md",
     "kaynak": "### ✅ Özet ve tartışma\n- **alfa** değerini 1.0 yapın → kişiselleştirme kapanır. 0.3 yapın → profil baskın olur. Doğru değer A/B testiyle bulunur.\n- Üretimde: Neo4j / Memgraph / Azure Cosmos DB (Gremlin), Microsoft GraphRAG (topluluk özetleri), LightRAG.\n- Graf; **yetkilendirme** (kim hangi dokümanı görebilir) için de kullanılabilir.\n- Şimdiye kadar **biz** hangi adımın çalışacağına karar verdik → **M4:** model araçları kendisi seçsin (ajan)."
    }
   ],
   "notebooklar": [
    {
     "etiket": "Başlangıç (katılımcı)",
     "yol": "M3_GraphRAG/M3_baslangic.ipynb",
     "colab": "https://colab.research.google.com/github/volkanak/MBT-GenAI-Egitim/blob/main/M3_GraphRAG/M3_baslangic.ipynb"
    },
    {
     "etiket": "Çözüm (eğitmen)",
     "yol": "M3_GraphRAG/M3_cozum.ipynb",
     "colab": "https://colab.research.google.com/github/volkanak/MBT-GenAI-Egitim/blob/main/M3_GraphRAG/M3_cozum.ipynb"
    }
   ]
  },
  {
   "id": "ara",
   "kod": "☕",
   "baslik": "Ara",
   "zaman": "0:55–1:05",
   "sure": 10,
   "format": "—",
   "demo": "—",
   "klasor": null,
   "akis": [
    [
     "Eğitmen",
     "M4 notebook'unda kurulum hücresini çalıştır, .NET API'yi başlat"
    ]
   ],
   "notlar": [],
   "hucreler": [],
   "notebooklar": []
  },
  {
   "id": "m4",
   "kod": "M4",
   "baslik": "LangChain ve LangGraph",
   "zaman": "1:05–1:25",
   "sure": 20,
   "format": "Canlı kodlama",
   "demo": "Araç kullanan, durumlu tek ajan",
   "klasor": "M4_LangChain_LangGraph",
   "akis": [
    [
     "0-3",
     "LangChain vs LangGraph"
    ],
    [
     "3-8",
     "@tool ile araçlar"
    ],
    [
     "8-13",
     "Grafı kurma"
    ],
    [
     "13-18",
     "Çalıştırma, adımları izleme, thread hafızası"
    ],
    [
     "18-20",
     "Soru-cevap"
    ]
   ],
   "notlar": [
    "Docstring'i değiştirip modelin araç seçiminin değiştiğini göstermek etkilidir.",
    "t1 / t2 thread karşılaştırması 'durumlu' kavramını somutlaştırır."
   ],
   "hucreler": [
    {
     "tur": "md",
     "kaynak": "# M4 · LangChain ve LangGraph\n**Süre:** 20 dk canlı kodlama · **Demo çıktısı:** Araç kullanan, durumlu tek ajan\n\n| | LangChain | LangGraph |\n|---|---|---|\n| Ne? | Yapı taşları: model, prompt, **araç (tool)**, retriever | **Durum makinesi:** düğüm (node), kenar (edge), durum (state) |\n| Ne zaman? | Doğrusal zincirler | Döngü, karar, hafıza, insan onayı gereken akışlar |\n\n```\n  START ──▶ [asistan] ──(araç çağrısı var mı?)──evet──▶ [araçlar]\n               ▲                 │                         │\n               │                hayır                      │\n               │                 ▼                         │\n               │                END                        │\n               └───────────────────────────────────────────┘\n```\n**Durumlu (stateful):** Checkpointer her adımda durumu `thread_id` ile saklar → ajan konuşmayı hatırlar."
    },
    {
     "tur": "kod",
     "dil": "python",
     "kurulum": true,
     "parcalar": [
      {
       "canli": false,
       "kod": "# ⚙️ Ortam hazırlığı: Colab'da ve yerel Jupyter'da çalışır\nimport os, sys, subprocess\nREPO_URL = \"https://github.com/volkanak/MBT-GenAI-Egitim.git\"   # ← kendi GitHub reponuz\nKOK = next((os.path.abspath(p) for p in [\".\", \"..\", \"/content/MBT-GenAI-Egitim\"]\n            if os.path.exists(os.path.join(p, \"ortak.py\"))), None)\nif KOK is None:  # Colab: repoyu klonla\n    subprocess.run([\"git\", \"clone\", \"-q\", REPO_URL, \"/content/MBT-GenAI-Egitim\"], check=True)\n    KOK = \"/content/MBT-GenAI-Egitim\"\ntry:\n    import langgraph, chromadb, langchain_anthropic, sentence_transformers, langchain_mcp_adapters  # noqa\nexcept ImportError:\n    print(\"Paketler kuruluyor (1-3 dk)…\")\n    subprocess.run([sys.executable, \"-m\", \"pip\", \"install\", \"-q\", \"-r\", f\"{KOK}/requirements.txt\"], check=True)\nsys.path.insert(0, KOK); os.chdir(KOK)\nfrom ortak import *\napi_anahtari_yukle()\nprint(\"Hazır ✔  Model:\", MODEL)"
      }
     ]
    },
    {
     "tur": "md",
     "kaynak": "## 1️⃣ Model"
    },
    {
     "tur": "kod",
     "dil": "python",
     "kurulum": false,
     "parcalar": [
      {
       "canli": false,
       "kod": "llm = sohbet_modeli()\nprint(llm.invoke(\"Tek cümlede: ajan (agent) nedir?\").text)"
      }
     ]
    },
    {
     "tur": "md",
     "kaynak": "## 2️⃣ Araçlar (tools)  ✍️ *canlı kodlama*\nDocstring **modelin okuduğu kullanım kılavuzudur**. Ne zaman kullanılacağını net yazın."
    },
    {
     "tur": "kod",
     "dil": "python",
     "kurulum": false,
     "parcalar": [
      {
       "canli": false,
       "kod": "from langchain_core.tools import tool\n"
      },
      {
       "canli": true,
       "ipucu": "politika_ara, onay_yetkilisi_bul ve hesapla araçlarını @tool ile tanımlayın",
       "kod": "@tool\ndef politika_ara(soru: str) -> str:\n    \"\"\"Atlas Teknoloji şirket politikalarında arama yapar. Onay yetkileri, avans, tedarikçi,\n    seyahat, bilgi güvenliği, bütçe gibi kurallar için HER ZAMAN önce bunu kullan.\"\"\"\n    return baglam_olustur(rag_indeksi().ara(soru, k=4))\n\n@tool\ndef onay_yetkilisi_bul(tutar_tl: float, butce_disi: bool = False) -> str:\n    \"\"\"Satın alma tutarına (TL) göre kimin onay vermesi gerektiğini döndürür.\"\"\"\n    return onay_yetkilisi(tutar_tl, butce_disi)\n\n@tool\ndef hesapla(ifade: str) -> str:\n    \"\"\"Aritmetik hesaplama yapar. Örnek: '2000000 * 0.30'\"\"\"\n    return str(guvenli_hesapla(ifade))"
      },
      {
       "canli": false,
       "kod": "\naraclar = [politika_ara, onay_yetkilisi_bul, hesapla]\nllm_araclarla = llm.bind_tools(araclar)\n\n# Model aracı kendisi çalıştırmaz; sadece \"şu aracı şu argümanla çağır\" der:\nprint(llm_araclarla.invoke(\"1.200.000 TL'lik alımı kim onaylar?\").tool_calls)"
      }
     ]
    },
    {
     "tur": "md",
     "kaynak": "## 3️⃣ Grafı kur: düğümler, kenarlar, hafıza  ✍️ *canlı kodlama*"
    },
    {
     "tur": "kod",
     "dil": "python",
     "kurulum": false,
     "parcalar": [
      {
       "canli": false,
       "kod": "from langchain_core.messages import SystemMessage\nfrom langgraph.graph import StateGraph, MessagesState, START, END\nfrom langgraph.prebuilt import ToolNode, tools_condition\nfrom langgraph.checkpoint.memory import InMemorySaver\n\nSISTEM = SystemMessage(\n    \"Sen Atlas Teknoloji'nin satın alma ve politika asistanısın. Kurallar için mutlaka politika_ara aracını kullan, \"\n    \"hesaplamaları hesapla aracıyla yap, onay sorularında onay_yetkilisi_bul kullan. Cevapta kaynak [DOK-xx] göster.\"\n)\n"
      },
      {
       "canli": true,
       "ipucu": "asistan düğümü + ToolNode + koşullu kenar + InMemorySaver ile grafı derleyin",
       "kod": "def asistan(state: MessagesState):\n    return {\"messages\": [llm_araclarla.invoke([SISTEM] + state[\"messages\"])]}\n\ng = StateGraph(MessagesState)\ng.add_node(\"asistan\", asistan)\ng.add_node(\"tools\", ToolNode(araclar))\ng.add_edge(START, \"asistan\")\ng.add_conditional_edges(\"asistan\", tools_condition)   # araç çağrısı varsa \"tools\", yoksa END\ng.add_edge(\"tools\", \"asistan\")\najan = g.compile(checkpointer=InMemorySaver())"
      }
     ]
    },
    {
     "tur": "kod",
     "dil": "python",
     "kurulum": false,
     "parcalar": [
      {
       "canli": false,
       "kod": "from IPython.display import Image, display\ntry:\n    display(Image(ajan.get_graph().draw_mermaid_png()))\nexcept Exception:\n    print(ajan.get_graph().draw_mermaid())"
      }
     ]
    },
    {
     "tur": "md",
     "kaynak": "## 4️⃣ Çalıştır: ajanın adımlarını izleyelim"
    },
    {
     "tur": "kod",
     "dil": "python",
     "kurulum": false,
     "parcalar": [
      {
       "canli": false,
       "kod": "def calistir(soru: str, thread_id: str):\n    ayar = {\"configurable\": {\"thread_id\": thread_id}}\n    for adim in ajan.stream({\"messages\": [(\"user\", soru)]}, ayar, stream_mode=\"updates\"):\n        for dugum, guncelleme in adim.items():\n            for m in guncelleme[\"messages\"]:\n                if getattr(m, \"tool_calls\", None):\n                    for tc in m.tool_calls:\n                        print(f\"🔧 {tc['name']}({tc['args']})\")\n                elif m.type == \"tool\":\n                    print(f\"   ↳ {m.content[:120].replace(chr(10), ' ')}…\")\n                else:\n                    print(f\"\\n🤖 {m.text}\")\n\ncalistir(\"Delta Yazılım'a 2.000.000 TL'lik sözleşme için %40 avans vermek istiyoruz. \"\n         \"Avans tutarı ne olur, politikaya uygun mu ve sözleşmeyi kim onaylamalı?\", thread_id=\"t1\")"
      }
     ]
    },
    {
     "tur": "md",
     "kaynak": "## 5️⃣ Durumlu: aynı thread hatırlar, yeni thread hatırlamaz"
    },
    {
     "tur": "kod",
     "dil": "python",
     "kurulum": false,
     "parcalar": [
      {
       "canli": false,
       "kod": "calistir(\"Peki avansı politikaya uygun en yüksek orana çekersek tutar ne olur?\", thread_id=\"t1\")"
      }
     ]
    },
    {
     "tur": "kod",
     "dil": "python",
     "kurulum": false,
     "parcalar": [
      {
       "canli": false,
       "kod": "calistir(\"Peki avansı politikaya uygun en yüksek orana çekersek tutar ne olur?\", thread_id=\"t2\")"
      }
     ]
    },
    {
     "tur": "kod",
     "dil": "python",
     "kurulum": false,
     "parcalar": [
      {
       "canli": false,
       "kod": "durum = ajan.get_state({\"configurable\": {\"thread_id\": \"t1\"}})\nprint(\"t1 thread'indeki mesaj sayısı:\", len(durum.values[\"messages\"]))"
      }
     ]
    },
    {
     "tur": "md",
     "kaynak": "### ✅ Özet ve tartışma\n- **Ajan = LLM + araçlar + döngü.** Hangi aracı ne zaman çağıracağına model karar verir.\n- **Checkpointer** üretimde Postgres/Redis olur → kullanıcı ertesi gün kaldığı yerden devam eder.\n- `interrupt()` ile **insan onayı** düğümü eklenebilir (örn. 500.000 TL üstü kararlar).\n- Tek ajan çok fazla araç ve sorumluluk alınca zorlanır → **M5: uzman ajanlardan oluşan ekip**"
    }
   ],
   "notebooklar": [
    {
     "etiket": "Başlangıç (katılımcı)",
     "yol": "M4_LangChain_LangGraph/M4_baslangic.ipynb",
     "colab": "https://colab.research.google.com/github/volkanak/MBT-GenAI-Egitim/blob/main/M4_LangChain_LangGraph/M4_baslangic.ipynb"
    },
    {
     "etiket": "Çözüm (eğitmen)",
     "yol": "M4_LangChain_LangGraph/M4_cozum.ipynb",
     "colab": "https://colab.research.google.com/github/volkanak/MBT-GenAI-Egitim/blob/main/M4_LangChain_LangGraph/M4_cozum.ipynb"
    }
   ]
  },
  {
   "id": "m5",
   "kod": "M5",
   "baslik": "Agentic AI, multi-agent ve MCP (Ek)",
   "zaman": "1:25–1:50",
   "sure": 25,
   "format": "Demo + tartışma",
   "demo": "Supervisor yönetimli 3 ajanlı ekip",
   "klasor": "M5_MultiAgent_MCP",
   "akis": [
    [
     "0-6",
     "MCP sunucusu ve istemcisi"
    ],
    [
     "6-12",
     "Uzman ajanlar + supervisor grafı"
    ],
    [
     "12-18",
     "Ekibi çalıştır, M1 kararıyla karşılaştır"
    ],
    [
     "18-25",
     "Tartışma"
    ]
   ],
   "notlar": [
    "Ekip çalışması 1-2 dakika sürebilir; bu sırada supervisor çıktılarını yorumlayın.",
    "M1'deki kararı yan sekmede açık tutun: politika ihlallerinin yakalanması güçlü bir kapanıştır."
   ],
   "hucreler": [
    {
     "tur": "md",
     "kaynak": "# M5 · Agentic AI, Multi-Agent ve MCP\n**Süre:** 25 dk (12 dk demo · 6 dk MCP · 7 dk tartışma) · **Demo çıktısı:** Supervisor yönetimli 3 ajanlı ekip\n\n```\n                     ┌──────────────┐\n         talep ────▶ │  SUPERVISOR  │ ── sıradaki kim? (yapılandırılmış çıktı)\n                     └──────┬───────┘\n           ┌────────────────┼─────────────────┐\n           ▼                ▼                 ▼\n  ┌────────────────┐ ┌──────────────┐ ┌────────────────┐\n  │  ARAŞTIRMACI   │ │   ANALİST    │ │  KARAR YAZICI  │──▶ Karar (M1 şeması) ──▶ END\n  │ politika_ara   │ │ hesapla      │ └────────────────┘\n  │ (RAG, M2)      │ │ onay_yetkilisi│\n  └────────────────┘ │ kur (MCP) 🔌 │\n                     └──────────────┘\n```\n**MCP (Model Context Protocol):** Araçları/verileri, herhangi bir AI uygulamasının bağlanabileceği **standart bir sunucu** olarak sunmak. \"AI için USB-C\"."
    },
    {
     "tur": "kod",
     "dil": "python",
     "kurulum": true,
     "parcalar": [
      {
       "canli": false,
       "kod": "# ⚙️ Ortam hazırlığı: Colab'da ve yerel Jupyter'da çalışır\nimport os, sys, subprocess\nREPO_URL = \"https://github.com/volkanak/MBT-GenAI-Egitim.git\"   # ← kendi GitHub reponuz\nKOK = next((os.path.abspath(p) for p in [\".\", \"..\", \"/content/MBT-GenAI-Egitim\"]\n            if os.path.exists(os.path.join(p, \"ortak.py\"))), None)\nif KOK is None:  # Colab: repoyu klonla\n    subprocess.run([\"git\", \"clone\", \"-q\", REPO_URL, \"/content/MBT-GenAI-Egitim\"], check=True)\n    KOK = \"/content/MBT-GenAI-Egitim\"\ntry:\n    import langgraph, chromadb, langchain_anthropic, sentence_transformers, langchain_mcp_adapters  # noqa\nexcept ImportError:\n    print(\"Paketler kuruluyor (1-3 dk)…\")\n    subprocess.run([sys.executable, \"-m\", \"pip\", \"install\", \"-q\", \"-r\", f\"{KOK}/requirements.txt\"], check=True)\nsys.path.insert(0, KOK); os.chdir(KOK)\nfrom ortak import *\napi_anahtari_yukle()\nprint(\"Hazır ✔  Model:\", MODEL)"
      }
     ]
    },
    {
     "tur": "md",
     "kaynak": "## 1️⃣ MCP sunucusu\n`M5_MultiAgent_MCP/kur_sunucu.py`: 30 satırlık bir sunucu, iki araç sunuyor."
    },
    {
     "tur": "kod",
     "dil": "python",
     "kurulum": false,
     "parcalar": [
      {
       "canli": false,
       "kod": "SUNUCU = f\"{KOK}/M5_MultiAgent_MCP/kur_sunucu.py\"\nprint(open(SUNUCU, encoding=\"utf-8\").read())"
      }
     ]
    },
    {
     "tur": "md",
     "kaynak": "## 2️⃣ MCP istemcisi: sunucuya bağlan, araçları LangChain aracına dönüştür  ✍️ *canlı kodlama*"
    },
    {
     "tur": "kod",
     "dil": "python",
     "kurulum": false,
     "parcalar": [
      {
       "canli": false,
       "kod": "import sys\nfrom langchain_mcp_adapters.client import MultiServerMCPClient\n"
      },
      {
       "canli": true,
       "ipucu": "stdio üzerinden kur sunucusuna bağlanıp araçları alın",
       "kod": "mcp_istemci = MultiServerMCPClient({\n    \"kur\": {\"command\": sys.executable, \"args\": [SUNUCU], \"transport\": \"stdio\"},\n})\nmcp_araclari = await mcp_istemci.get_tools()"
      },
      {
       "canli": false,
       "kod": "print([t.name for t in mcp_araclari])\ntl_cevir = next(t for t in mcp_araclari if t.name == \"tl_cevir\")\nprint(await tl_cevir.ainvoke({\"tutar\": 15000, \"doviz\": \"EUR\"}))"
      }
     ]
    },
    {
     "tur": "md",
     "kaynak": "## 3️⃣ Uzman ajanlar\nHer ajanın **dar bir görevi** ve **sadece ihtiyacı olan araçları** var."
    },
    {
     "tur": "kod",
     "dil": "python",
     "kurulum": false,
     "parcalar": [
      {
       "canli": false,
       "kod": "from langchain_core.tools import tool\nfrom langchain.agents import create_agent\n\n@tool\ndef politika_ara(soru: str) -> str:\n    \"\"\"Atlas Teknoloji şirket politikalarında arama yapar.\"\"\"\n    return baglam_olustur(rag_indeksi().ara(soru, k=4))\n\n@tool\ndef onay_yetkilisi_bul(tutar_tl: float, butce_disi: bool = False) -> str:\n    \"\"\"Satın alma tutarına (TL) göre onay yetkilisini döndürür.\"\"\"\n    return onay_yetkilisi(tutar_tl, butce_disi)\n\n@tool\ndef hesapla(ifade: str) -> str:\n    \"\"\"Aritmetik hesaplama yapar. Örnek: '2000000 * 0.30'\"\"\"\n    return str(guvenli_hesapla(ifade))\n\nllm = sohbet_modeli()\n"
      },
      {
       "canli": true,
       "ipucu": "create_agent ile arastirmaci ve analist ajanlarını oluşturun",
       "kod": "arastirmaci = create_agent(\n    llm, [politika_ara],\n    system_prompt=\"Sen politika araştırmacısısın. Talebe uygulanabilecek TÜM şirket kurallarını politika_ara ile bul. \"\n                  \"Her kuralı kaynağıyla [DOK-xx] maddeler halinde özetle. Karar verme, sadece kuralları raporla.\")\nanalist = create_agent(\n    llm, [hesapla, onay_yetkilisi_bul, *mcp_araclari],\n    system_prompt=\"Sen finansal analistsin. Dövizli tutarları tl_cevir ile TL'ye çevir, toplam tutarı, avans tutarını, \"\n                  \"bütçe farkını hesapla ve onay yetkilisini bul. Rakamları tablo halinde ver. Karar verme.\")"
      }
     ]
    },
    {
     "tur": "md",
     "kaynak": "## 4️⃣ Supervisor ve ekip grafı  ✍️ *canlı kodlama*"
    },
    {
     "tur": "kod",
     "dil": "python",
     "kurulum": false,
     "parcalar": [
      {
       "canli": false,
       "kod": "import operator\nfrom typing import Annotated, Literal, TypedDict\nfrom pydantic import BaseModel\nfrom langgraph.graph import StateGraph, START, END\nfrom langgraph.types import Command\n\nclass EkipDurumu(TypedDict):\n    talep: str\n    notlar: Annotated[list[str], operator.add]   # her ajan kendi notunu ekler\n    adim: int\n    karar: dict | None\n\nclass Yonlendirme(BaseModel):\n    sonraki: Literal[\"arastirmaci\", \"analist\", \"karar_yazici\"]\n    gerekce: str\n\ndef notlar_metni(s: EkipDurumu) -> str:\n    return \"\\n\\n\".join(s[\"notlar\"]) or \"(henüz not yok)\"\n"
      },
      {
       "canli": true,
       "ipucu": "supervisor düğümü: sıradaki ajanı seçer (en fazla 4 adım)",
       "kod": "def supervisor(s: EkipDurumu):\n    if s[\"adim\"] >= 4:\n        return Command(goto=\"karar_yazici\")\n    y = yapilandirilmis_sor(\n        f\"Talep:\\n{s['talep']}\\n\\nEkip notları:\\n{notlar_metni(s)}\\n\\n\"\n        \"Sıradaki adımı seç. Kurallar araştırılmadıysa 'arastirmaci', rakamlar hesaplanmadıysa 'analist', \"\n        \"ikisi de tamamsa 'karar_yazici'.\", Yonlendirme,\n        sistem=\"Sen bir karar destek ekibinin yöneticisisin (supervisor). İşi en az adımla bitir.\")\n    print(f\"🧭 Supervisor → {y.sonraki}: {y.gerekce}\")\n    return Command(goto=y.sonraki, update={\"adim\": s[\"adim\"] + 1})"
      },
      {
       "canli": false,
       "kod": "\ndef calisan(ad: str, ajan, emoji: str):\n    async def dugum(s: EkipDurumu):\n        girdi = f\"Talep:\\n{s['talep']}\\n\\nEkibin şimdiye kadarki notları:\\n{notlar_metni(s)}\"\n        sonuc = await ajan.ainvoke({\"messages\": [{\"role\": \"user\", \"content\": girdi}]})\n        cikti = sonuc[\"messages\"][-1].text\n        print(f\"\\n{emoji} {ad.upper()}\\n{cikti}\\n\")\n        return Command(goto=\"supervisor\", update={\"notlar\": [f\"[{ad}]\\n{cikti}\"]})\n    return dugum\n\ndef karar_yazici(s: EkipDurumu):\n    k = yapilandirilmis_sor(\n        f\"Talep:\\n{s['talep']}\\n\\nEkip notları:\\n{notlar_metni(s)}\\n\\nNotlara dayanarak nihai öneriyi ver.\",\n        Karar, sistem=\"Sen kıdemli karar destek uzmanısın. Politika ihlallerini mutlaka risk olarak yaz, \"\n                      \"ihlal düzeltilebiliyorsa koşul olarak belirt.\")\n    return Command(goto=END, update={\"karar\": k.model_dump()})\n\nekip = StateGraph(EkipDurumu)\nekip.add_node(\"supervisor\", supervisor, destinations=(\"arastirmaci\", \"analist\", \"karar_yazici\"))\nekip.add_node(\"arastirmaci\", calisan(\"araştırmacı\", arastirmaci, \"📚\"), destinations=(\"supervisor\",))\nekip.add_node(\"analist\", calisan(\"analist\", analist, \"🧮\"), destinations=(\"supervisor\",))\nekip.add_node(\"karar_yazici\", karar_yazici)\nekip.add_edge(START, \"supervisor\")\nekip = ekip.compile()\n\nfrom IPython.display import Image, display\ntry:\n    display(Image(ekip.get_graph().draw_mermaid_png()))\nexcept Exception:\n    print(ekip.get_graph().draw_mermaid())"
      }
     ]
    },
    {
     "tur": "md",
     "kaynak": "## 5️⃣ Ekibi çalıştır: M1'deki senaryo, bu sefer politikaları bilen bir ekiple"
    },
    {
     "tur": "kod",
     "dil": "python",
     "kurulum": false,
     "parcalar": [
      {
       "canli": false,
       "kod": "SENARYO = \"\"\"Tedarikçi: Delta Yazılım A.Ş.\nTalep: 2.000.000 TL tutarında yıllık CRM lisans sözleşmesi.\nEk olarak 15.000 EUR tutarında uygulama eğitimi hizmeti teklif ediliyor.\nTedarikçi sözleşme bedelinin %40'ı oranında peşin avans istiyor.\nTedarikçi değerlendirme puanı: 74/100. Geçen yıl 1 kez teslimat gecikmesi yaşandı.\nBütçede bu kalem için 1.800.000 TL ayrılmış.\"\"\"\n\nsonuc = await ekip.ainvoke({\"talep\": SENARYO, \"notlar\": [], \"adim\": 0, \"karar\": None})"
      }
     ]
    },
    {
     "tur": "kod",
     "dil": "python",
     "kurulum": false,
     "parcalar": [
      {
       "canli": false,
       "kod": "k = Karar(**sonuc[\"karar\"])\nprint({\"onayla\": \"✅ ONAYLA\", \"reddet\": \"⛔ REDDET\", \"incele\": \"🔎 İNCELE\"}[k.karar], f\"(güven {k.guven:.0%})\")\nprint(\"\\nGerekçe:\", k.gerekce)\nprint(\"\\nRiskler:\", *[f\"\\n • {r}\" for r in k.riskler])\nprint(\"\\nKoşullar:\", *[f\"\\n • {r}\" for r in k.kosullar])"
      }
     ]
    },
    {
     "tur": "md",
     "kaynak": "## 💬 Tartışma (7 dk)\n1. **M1'deki karar ile karşılaştırın.** Hangi politika ihlallerini ekip yakaladı? (%30 avans sınırı, gecikme geçmişi → avans yok, 2M+ → Genel Müdür, bütçe aşımı)\n2. **Ne zaman multi-agent?** Görevler gerçekten farklı uzmanlık/araç gerektiriyorsa. Aksi halde tek ajan daha ucuz, hızlı ve hata ayıklaması kolay.\n3. **Maliyet ve gecikme:** Kaç LLM çağrısı yapıldı? Her ajan = ek token + ek saniye.\n4. **Hata yayılımı:** Araştırmacı yanlış kural getirirse ne olur? → Eval + kaynak doğrulama (M7)\n5. **MCP'nin değeri:** `kur_sunucu.py` hiç değişmeden Claude Desktop, VS Code veya .NET uygulamasından da kullanılabilir.\n6. **İnsan onayı nereye konmalı?** Karar yazıcıdan sonra mı, analistten sonra mı?"
    }
   ],
   "notebooklar": [
    {
     "etiket": "Başlangıç (katılımcı)",
     "yol": "M5_MultiAgent_MCP/M5_baslangic.ipynb",
     "colab": "https://colab.research.google.com/github/volkanak/MBT-GenAI-Egitim/blob/main/M5_MultiAgent_MCP/M5_baslangic.ipynb"
    },
    {
     "etiket": "Çözüm (eğitmen)",
     "yol": "M5_MultiAgent_MCP/M5_cozum.ipynb",
     "colab": "https://colab.research.google.com/github/volkanak/MBT-GenAI-Egitim/blob/main/M5_MultiAgent_MCP/M5_cozum.ipynb"
    }
   ]
  },
  {
   "id": "m6",
   "kod": "M6",
   "baslik": ".NET Core + React ile uçtan uca AI",
   "zaman": "1:50–2:15",
   "sure": 25,
   "format": "Canlı kodlama",
   "demo": "Streaming yapan sohbet ve karar ekranı",
   "klasor": "M6_DotNet_React",
   "akis": [
    [
     "0-3",
     "Adım 1: Minimal API"
    ],
    [
     "3-7",
     "Adım 2: Mesaj geçmişi"
    ],
    [
     "7-13",
     "Adım 3: SSE streaming"
    ],
    [
     "13-20",
     "Adım 4: React akış"
    ],
    [
     "20-25",
     "Adım 5: Karar ekranı"
    ]
   ],
   "notlar": [
    "En riskli modül: Her adımda takılırsanız api/ ve web/ klasöründeki hazır koda geçin.",
    "curl -N ile streaming'i tarayıcıdan önce terminalde göstermek mekanizmayı netleştirir."
   ],
   "hucreler": [
    {
     "tur": "md",
     "kaynak": "# M6 · .NET Core + React ile Uçtan Uca AI\n\n**Süre:** 25 dk canlı kodlama · **Demo çıktısı:** Streaming yapan sohbet ve karar ekranı"
    },
    {
     "tur": "kod",
     "dil": "text",
     "parcalar": [
      {
       "canli": false,
       "kod": " React (Vite, :5173)                .NET Minimal API (:5080)                 Claude API\n ┌──────────────────┐  POST /api/sohbet  ┌──────────────────────┐  stream  ┌──────────┐\n │ Sohbet.tsx       │ ─────────────────▶ │ CreateStreaming()    │ ───────▶ │          │\n │  ReadableStream  │ ◀── SSE: data: ─── │  → text/event-stream │ ◀─────── │  Model   │\n ├──────────────────┤  POST /api/karar   ├──────────────────────┤          │          │\n │ KararEkrani.tsx  │ ─────────────────▶ │ OutputConfig(JSON    │ ───────▶ │          │\n │  rozet + güven   │ ◀──── Karar JSON ─ │  şema = M1 Karar)    │ ◀─────── │          │\n └──────────────────┘                    └──────────────────────┘          └──────────┘"
      }
     ]
    },
    {
     "tur": "md",
     "kaynak": "> **Takılırsanız:** Hazır kodun tamamı `M6_DotNet_React/api` ve `M6_DotNet_React/web` klasörlerinde. Her adımdan sonra o klasördeki koda geçip devam edebilirsiniz.\n>\n> **Ön koşul:** .NET 10 SDK, Node 20+, `ANTHROPIC_API_KEY` ortam değişkeni."
    },
    {
     "tur": "md",
     "kaynak": "## ADIM 1 · Minimal API iskeleti (3 dk)"
    },
    {
     "tur": "kod",
     "dil": "bash",
     "parcalar": [
      {
       "canli": false,
       "kod": "dotnet new web -n Atlas.Api -o api\ncd api\ndotnet add package Anthropic\nexport ANTHROPIC_API_KEY=\"sk-ant-...\"     # Windows PowerShell: $env:ANTHROPIC_API_KEY=\"...\""
      }
     ]
    },
    {
     "tur": "kod",
     "dil": "csharp",
     "parcalar": [
      {
       "canli": false,
       "kod": "using System.Text.Json;\nusing Anthropic;\nusing Anthropic.Models.Messages;\n\nvar builder = WebApplication.CreateBuilder(args);\nbuilder.Services.AddSingleton(_ => new AnthropicClient());   // ANTHROPIC_API_KEY'i okur\nvar app = builder.Build();\n\nvar model = builder.Configuration[\"Model\"] ?? \"claude-opus-5-5\";\napp.MapGet(\"/api/saglik\", () => Results.Ok(new { durum = \"çalışıyor\", model }));\n\napp.Run();"
      }
     ]
    },
    {
     "tur": "md",
     "kaynak": "**Vurgu:** Anahtar asla koda/repoya yazılmaz. Üretimde Azure Key Vault / AWS Secrets Manager."
    },
    {
     "tur": "md",
     "kaynak": "## ADIM 2 · Mesaj geçmişini modele çevir (4 dk)"
    },
    {
     "tur": "kod",
     "dil": "csharp",
     "parcalar": [
      {
       "canli": false,
       "kod": "app.MapPost(\"/api/sohbet\", async (SohbetIstegi istek, AnthropicClient client, HttpContext ctx) =>\n{\n    List<MessageParam> mesajlar = [];\n    foreach (var m in istek.Mesajlar)\n    {\n        if (m.Rol == \"user\") mesajlar.Add(new UserMessageParam { Content = m.Icerik });\n        else mesajlar.Add(new AssistantMessageParam { Content = m.Icerik });\n    }\n\n    var parametreler = new MessageCreateParams\n    {\n        Model = model,\n        MaxTokens = 4096,\n        System = \"Sen Atlas Teknoloji'nin kurumsal asistanısın. Kısa, net ve Türkçe cevap ver.\",\n        Messages = mesajlar,\n    };\n    // ADIM 3'te buraya streaming gelecek\n});\n\n// Dosyanın EN ALTINA (app.Run()'dan sonra):\nrecord SohbetMesaji(string Rol, string Icerik);\nrecord SohbetIstegi(List<SohbetMesaji> Mesajlar);"
      }
     ]
    },
    {
     "tur": "md",
     "kaynak": "**Vurgu:** LLM API'leri **durumsuzdur**. Hafıza = her istekte geçmişi yeniden göndermek (M4'teki checkpointer'ın yaptığı da bu)."
    },
    {
     "tur": "md",
     "kaynak": "## ADIM 3 · Server-Sent Events ile streaming (6 dk)"
    },
    {
     "tur": "kod",
     "dil": "csharp",
     "parcalar": [
      {
       "canli": false,
       "kod": "    ctx.Response.Headers.ContentType = \"text/event-stream\";\n    ctx.Response.Headers.CacheControl = \"no-cache\";\n\n    await foreach (var olay in client.Messages.CreateStreaming(parametreler, ctx.RequestAborted))\n    {\n        if (olay.TryPickContentBlockDelta(out var delta) && delta.Delta.TryPickText(out var metin))\n        {\n            await ctx.Response.WriteAsync($\"data: {JsonSerializer.Serialize(new { metin = metin.Text })}\\n\\n\");\n            await ctx.Response.Body.FlushAsync();\n        }\n    }\n    await ctx.Response.WriteAsync(\"data: [BITTI]\\n\\n\");"
      }
     ]
    },
    {
     "tur": "md",
     "kaynak": "Test:"
    },
    {
     "tur": "kod",
     "dil": "bash",
     "parcalar": [
      {
       "canli": false,
       "kod": "dotnet run\ncurl -N -X POST http://localhost:5080/api/sohbet -H \"Content-Type: application/json\" \\\n  -d '{\"mesajlar\":[{\"rol\":\"user\",\"icerik\":\"Hibrit çalışmayı 3 maddede anlat\"}]}'"
      }
     ]
    },
    {
     "tur": "md",
     "kaynak": "**Vurgu:** `ctx.RequestAborted` → kullanıcı sekmeyi kapatınca model çağrısı da iptal olur, boşa token harcanmaz."
    },
    {
     "tur": "md",
     "kaynak": "## ADIM 4 · React: akışı token token göster (7 dk)"
    },
    {
     "tur": "kod",
     "dil": "bash",
     "parcalar": [
      {
       "canli": false,
       "kod": "npm create vite@latest web -- --template react-ts\ncd web && npm install"
      }
     ]
    },
    {
     "tur": "md",
     "kaynak": "`vite.config.ts`: `/api` isteklerini .NET'e yönlendir:"
    },
    {
     "tur": "kod",
     "dil": "ts",
     "parcalar": [
      {
       "canli": false,
       "kod": "server: { port: 5173, proxy: { \"/api\": \"http://localhost:5080\" } },"
      }
     ]
    },
    {
     "tur": "md",
     "kaynak": "`src/api.ts`: SSE okuyucu:"
    },
    {
     "tur": "kod",
     "dil": "ts",
     "parcalar": [
      {
       "canli": false,
       "kod": "export async function sohbetAkisi(mesajlar: Mesaj[], onParca: (metin: string) => void, signal?: AbortSignal) {\n  const yanit = await fetch(\"/api/sohbet\", {\n    method: \"POST\", headers: { \"Content-Type\": \"application/json\" },\n    body: JSON.stringify({ mesajlar }), signal,\n  });\n  const okuyucu = yanit.body!.getReader();\n  const cozucu = new TextDecoder();\n  let tampon = \"\";\n  while (true) {\n    const { done, value } = await okuyucu.read();\n    if (done) break;\n    tampon += cozucu.decode(value, { stream: true });\n    const olaylar = tampon.split(\"\\n\\n\");\n    tampon = olaylar.pop() ?? \"\";\n    for (const olay of olaylar) {\n      const veri = olay.replace(/^data: /, \"\").trim();\n      if (!veri || veri === \"[BITTI]\") continue;\n      onParca(JSON.parse(veri).metin);\n    }\n  }\n}"
      }
     ]
    },
    {
     "tur": "md",
     "kaynak": "`src/Sohbet.tsx`: gelen her parçayı son mesaja ekle:"
    },
    {
     "tur": "kod",
     "dil": "tsx",
     "parcalar": [
      {
       "canli": false,
       "kod": "await sohbetAkisi(yeniGecmis, (parca) =>\n  setMesajlar((m) => [...m.slice(0, -1), { rol: \"assistant\", icerik: m[m.length - 1].icerik + parca }]),\n  iptal.current.signal);"
      }
     ]
    },
    {
     "tur": "md",
     "kaynak": "**Vurgu:** Neden `EventSource` değil de `fetch`? `EventSource` sadece GET destekler; biz POST ile geçmiş gönderiyoruz."
    },
    {
     "tur": "md",
     "kaynak": "## ADIM 5 · Karar ekranı: yapılandırılmış çıktı (5 dk)"
    },
    {
     "tur": "kod",
     "dil": "csharp",
     "parcalar": [
      {
       "canli": false,
       "kod": "app.MapPost(\"/api/karar\", async (KararIstegi istek, AnthropicClient client) =>\n{\n    var yanit = await client.Messages.Create(new MessageCreateParams\n    {\n        Model = model,\n        MaxTokens = 4096,\n        System = \"Sen Atlas Teknoloji'nin satın alma karar destek uzmanısın. ...\",\n        Messages = [new UserMessageParam { Content = istek.Talep }],\n        OutputConfig = new OutputConfig { Format = new JsonOutputFormat { Schema = KararSemasi.Sema } },\n    });\n    var json = yanit.Content.Select(b => b.Value).OfType<TextBlock>().First().Text;\n    return Results.Content(json, \"application/json\");\n});"
      }
     ]
    },
    {
     "tur": "md",
     "kaynak": "`KararSemasi.Sema`: M1'deki Pydantic `Karar` sınıfının JSON Schema karşılığı (`karar`, `gerekce`, `riskler`, `kosullar`, `guven`). React tarafında `KararEkrani.tsx` bu JSON'u rozet + güven çubuğu + risk listesi olarak çizer ve **yönetici onay butonları** (human-in-the-loop) ekler.\n\n**Vurgu:** Şema garantisi sayesinde frontend `JSON.parse` hatası veya eksik alan endişesi taşımaz."
    },
    {
     "tur": "md",
     "kaynak": "## Mimari notu: Python ajanları nasıl bağlanır?"
    },
    {
     "tur": "kod",
     "dil": "text",
     "parcalar": [
      {
       "canli": false,
       "kod": "React ──▶ .NET API (kimlik doğrulama, yetki, loglama, rate limit)\n              │\n              ├──▶ Claude API  (basit sohbet / karar)\n              └──▶ Python FastAPI (M4-M5 LangGraph ajanları, RAG, GraphRAG)"
      }
     ]
    },
    {
     "tur": "md",
     "kaynak": "Kurumsal yapılarda .NET genellikle **API Gateway / iş kuralları** katmanıdır; ajan orkestrasyonu Python servisinde kalır. Alternatif: Ajanları doğrudan .NET'te `Microsoft.Extensions.AI` + Semantic Kernel ile yazmak."
    }
   ],
   "notebooklar": []
  },
  {
   "id": "m7",
   "kod": "M7",
   "baslik": "Üretime hazırlık: eval, güvenlik, maliyet",
   "zaman": "2:15–2:25",
   "sure": 10,
   "format": "Sunum",
   "demo": "Kontrol listesi",
   "klasor": "M7_Uretim",
   "akis": [
    [
     "0-8",
     "Kontrol listesi"
    ],
    [
     "8-10",
     "Opsiyonel: eval + prompt injection demo"
    ]
   ],
   "notlar": [
    "Katılımcılara kendi projeleri için listeyi işaretletin."
   ],
   "hucreler": [
    {
     "tur": "md",
     "kaynak": "# M7 · Üretime Hazırlık: Eval, Güvenlik, Maliyet\n\n**Süre:** 10 dk sunum · **Demo çıktısı:** Kontrol listesi · Opsiyonel 2 dk demo: `M7_Uretim/M7_eval_guvenlik.ipynb`\n\n> Demo'dan üretime geçişte projelerin çoğu model yüzünden değil, **ölçüm, güvenlik ve maliyet** eksikleri yüzünden takılır."
    },
    {
     "tur": "md",
     "kaynak": "## 1 · Değerlendirme (Eval)\n\n- [ ] 30-100 soruluk **altın soru seti** (gerçek kullanıcı sorularından) hazırlandı\n- [ ] Her değişiklikte (prompt, model, chunk boyutu) eval otomatik çalışıyor (CI)\n- [ ] RAG için ayrı metrikler: **getirme doğruluğu** (doğru doküman geldi mi?) ve **cevap sadakati** (bağlama sadık mı?)\n- [ ] LLM-as-judge kararları örnekleme ile insan tarafından kontrol ediliyor\n- [ ] Ajanlar için: doğru araç seçimi, adım sayısı, görev tamamlama oranı ölçülüyor"
    },
    {
     "tur": "md",
     "kaynak": "## 2 · Güvenlik\n\n- [ ] **Prompt injection:** Doküman/araç çıktıları talimat olarak değil, veri olarak işleniyor\n- [ ] Araç yetkileri en az yetki prensibine göre sınırlı (okuma ≠ yazma ≠ ödeme)\n- [ ] Kritik aksiyonlarda (ödeme, onay, e-posta gönderimi) **insan onayı** zorunlu\n- [ ] **KVKK:** Kişisel veriler maskeleniyor, veri yurt dışı aktarımı hukuk onaylı\n- [ ] RAG'de **doküman bazlı yetkilendirme**: Kullanıcı göremediği dokümandan cevap alamıyor\n- [ ] API anahtarları Key Vault'ta; loglarda kişisel veri ve anahtar yok\n- [ ] Çıktı doğrulama: şema kontrolü + iş kuralı kontrolü (örn. avans ≤ %30)"
    },
    {
     "tur": "md",
     "kaynak": "## 3 · Maliyet ve performans\n\n- [ ] İstek başına token ve maliyet loglanıyor; kullanıcı/departman bazında bütçe ve alarm var\n- [ ] **Prompt caching:** Sabit sistem prompt'u ve dokümanlar önbellekte\n- [ ] Basit işler küçük/ucuz modele, zor işler büyük modele yönlendiriliyor (model routing)\n- [ ] Toplu işler Batch API ile (%50 indirim)\n- [ ] Streaming ile algılanan gecikme düşürüldü; zaman aşımı ve yeniden deneme (retry) politikası var\n- [ ] Multi-agent akışlarda adım sınırı var (sonsuz döngü koruması)"
    },
    {
     "tur": "md",
     "kaynak": "## 4 · Gözlemlenebilirlik ve işletim\n\n- [ ] Her ajan adımı izlenebilir (LangSmith, OpenTelemetry, Langfuse)\n- [ ] Kullanıcı geri bildirimi (👍/👎) toplanıp eval setine ekleniyor\n- [ ] Model sürümü sabitlenmiş; yeni model önce eval'den geçiyor\n- [ ] Hata ve ret (refusal) durumları için kullanıcıya anlamlı mesaj ve yedek akış var\n- [ ] Sorumluluk: AI önerisi ile insan kararı ayrı ayrı kayıt altında (denetim izi)"
    },
    {
     "tur": "md",
     "kaynak": "## 5 · Organizasyon\n\n- [ ] Kullanım politikası yayınlandı (hangi veriler hangi AI araçlarına girilebilir)\n- [ ] İş birimi sahibi + teknik sahip + risk/uyum sorumlusu belirlendi\n- [ ] Başarı metriği iş diliyle tanımlandı (örn. onay süresi 3 günden 1 güne)"
    }
   ],
   "notebooklar": [
    {
     "etiket": "Notebook",
     "yol": "M7_Uretim/M7_eval_guvenlik.ipynb",
     "colab": "https://colab.research.google.com/github/volkanak/MBT-GenAI-Egitim/blob/main/M7_Uretim/M7_eval_guvenlik.ipynb"
    }
   ]
  },
  {
   "id": "m8",
   "kod": "🎤",
   "baslik": "Kapanış ve soru-cevap",
   "zaman": "2:25–2:30",
   "sure": 5,
   "format": "Tartışma",
   "demo": "Sonraki adımlar",
   "klasor": "M8_Kapanis",
   "akis": [
    [
     "0-5",
     "Özet tablo, sonraki adımlar, soru-cevap"
    ]
   ],
   "notlar": [],
   "hucreler": [
    {
     "tur": "md",
     "kaynak": "# Kapanış ve Soru-Cevap\n\n**Süre:** 5 dk · **Çıktı:** Sonraki adımlar"
    },
    {
     "tur": "md",
     "kaynak": "## Bugün ne inşa ettik?\n\n| Modül | Ne öğrendik | Ne ürettik |\n|---|---|---|\n| M1 | Token, context, yapılandırılmış çıktı | `Karar` şeması |\n| M2 | Embedding, vektör DB, RAG | Kaynak gösteren politika asistanı |\n| M3 | Bilgi grafı, kişiselleştirilmiş PageRank | Role göre sıralanan sonuçlar |\n| M4 | LangChain araçları, LangGraph durum makinesi | Hafızalı, araç kullanan ajan |\n| M5 | Supervisor, multi-agent, MCP | 3 ajanlı karar ekibi + MCP sunucusu |\n| M6 | .NET SSE streaming, React | Uçtan uca sohbet ve karar ekranı |\n| M7 | Eval, güvenlik, maliyet | Üretim kontrol listesi |"
    },
    {
     "tur": "md",
     "kaynak": "## Sonraki adımlar\n\n1. **Bu hafta:** Kendi ekibinizden 1 karar sürecini seçin (onay, sınıflandırma, triage). 20 örnek toplayın.\n2. **2 hafta:** M1 + M2 ile prototip. Altın soru setiyle ölçün.\n3. **1 ay:** Gerekirse ajan/araç ekleyin (M4). .NET arayüzü ile pilot kullanıcılara açın (M6).\n4. **Sürekli:** M7 kontrol listesini proje kapısı (gate) olarak kullanın."
    },
    {
     "tur": "md",
     "kaynak": "## Kaynaklar\n\n- LangGraph dokümantasyonu: https://langchain-ai.github.io/langgraph/\n- Model Context Protocol: https://modelcontextprotocol.io\n- Anthropic API dokümantasyonu: https://platform.claude.com/docs\n- Microsoft GraphRAG: https://microsoft.github.io/graphrag/"
    }
   ],
   "notebooklar": []
  }
 ]
};
