# M7 · Üretime Hazırlık: Eval, Güvenlik, Maliyet

**Süre:** 10 dk sunum · **Demo çıktısı:** Kontrol listesi · Opsiyonel 2 dk demo: `M7_Uretim/M7_eval_guvenlik.ipynb`

> Demo'dan üretime geçişte projelerin çoğu model yüzünden değil, **ölçüm, güvenlik ve maliyet** eksikleri yüzünden takılır.

## 1 · Değerlendirme (Eval)

- [ ] 30-100 soruluk **altın soru seti** (gerçek kullanıcı sorularından) hazırlandı
- [ ] Her değişiklikte (prompt, model, chunk boyutu) eval otomatik çalışıyor (CI)
- [ ] RAG için ayrı metrikler: **getirme doğruluğu** (doğru doküman geldi mi?) ve **cevap sadakati** (bağlama sadık mı?)
- [ ] LLM-as-judge kararları örnekleme ile insan tarafından kontrol ediliyor
- [ ] Ajanlar için: doğru araç seçimi, adım sayısı, görev tamamlama oranı ölçülüyor

## 2 · Güvenlik

- [ ] **Prompt injection:** Doküman/araç çıktıları talimat olarak değil, veri olarak işleniyor
- [ ] Araç yetkileri en az yetki prensibine göre sınırlı (okuma ≠ yazma ≠ ödeme)
- [ ] Kritik aksiyonlarda (ödeme, onay, e-posta gönderimi) **insan onayı** zorunlu
- [ ] **KVKK:** Kişisel veriler maskeleniyor, veri yurt dışı aktarımı hukuk onaylı
- [ ] RAG'de **doküman bazlı yetkilendirme**: Kullanıcı göremediği dokümandan cevap alamıyor
- [ ] API anahtarları Key Vault'ta; loglarda kişisel veri ve anahtar yok
- [ ] Çıktı doğrulama: şema kontrolü + iş kuralı kontrolü (örn. avans ≤ %30)

## 3 · Maliyet ve performans

- [ ] İstek başına token ve maliyet loglanıyor; kullanıcı/departman bazında bütçe ve alarm var
- [ ] **Prompt caching:** Sabit sistem prompt'u ve dokümanlar önbellekte
- [ ] Basit işler küçük/ucuz modele, zor işler büyük modele yönlendiriliyor (model routing)
- [ ] Toplu işler Batch API ile (%50 indirim)
- [ ] Streaming ile algılanan gecikme düşürüldü; zaman aşımı ve yeniden deneme (retry) politikası var
- [ ] Multi-agent akışlarda adım sınırı var (sonsuz döngü koruması)

## 4 · Gözlemlenebilirlik ve işletim

- [ ] Her ajan adımı izlenebilir (LangSmith, OpenTelemetry, Langfuse)
- [ ] Kullanıcı geri bildirimi (👍/👎) toplanıp eval setine ekleniyor
- [ ] Model sürümü sabitlenmiş; yeni model önce eval'den geçiyor
- [ ] Hata ve ret (refusal) durumları için kullanıcıya anlamlı mesaj ve yedek akış var
- [ ] Sorumluluk: AI önerisi ile insan kararı ayrı ayrı kayıt altında (denetim izi)

## 5 · Organizasyon

- [ ] Kullanım politikası yayınlandı (hangi veriler hangi AI araçlarına girilebilir)
- [ ] İş birimi sahibi + teknik sahip + risk/uyum sorumlusu belirlendi
- [ ] Başarı metriği iş diliyle tanımlandı (örn. onay süresi 3 günden 1 güne)
