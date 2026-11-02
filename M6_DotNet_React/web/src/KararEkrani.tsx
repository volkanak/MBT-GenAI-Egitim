import { useState } from "react";
import { kararAl, type Karar } from "./api";

const ORNEK = `Tedarikçi: Delta Yazılım A.Ş.
Talep: 2.000.000 TL tutarında yıllık CRM lisans sözleşmesi.
Tedarikçi sözleşme bedelinin %40'ı oranında peşin avans istiyor.
Tedarikçi değerlendirme puanı: 74/100. Geçen yıl 1 kez teslimat gecikmesi yaşandı.
Bütçede bu kalem için 1.800.000 TL ayrılmış.`;

const ROZET = {
  onayla: { metin: "ONAYLA", sinif: "yesil" },
  reddet: { metin: "REDDET", sinif: "kirmizi" },
  incele: { metin: "İNCELE", sinif: "sari" },
} as const;

export default function KararEkrani() {
  const [talep, setTalep] = useState(ORNEK);
  const [karar, setKarar] = useState<Karar | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");
  const [onay, setOnay] = useState<"" | "onaylandi" | "reddedildi">("");

  async function degerlendir() {
    setYukleniyor(true);
    setHata("");
    setKarar(null);
    setOnay("");
    try {
      setKarar(await kararAl(talep));
    } catch (e) {
      setHata((e as Error).message);
    } finally {
      setYukleniyor(false);
    }
  }

  return (
    <section className="kart karar">
      <label>Talep</label>
      <textarea rows={7} value={talep} onChange={(e) => setTalep(e.target.value)} />
      <button onClick={degerlendir} disabled={yukleniyor}>
        {yukleniyor ? "Değerlendiriliyor…" : "AI ile değerlendir"}
      </button>
      {hata && <p className="hata">⚠️ {hata}</p>}

      {karar && (
        <div className="sonuc">
          <div className="ust">
            <span className={`rozet ${ROZET[karar.karar].sinif}`}>{ROZET[karar.karar].metin}</span>
            <div className="guven">
              <span>Güven {Math.round(karar.guven * 100)}%</span>
              <div className="cubuk"><div style={{ width: `${karar.guven * 100}%` }} /></div>
            </div>
          </div>
          <p>{karar.gerekce}</p>
          <h4>Riskler</h4>
          <ul>{karar.riskler.map((r) => <li key={r}>{r}</li>)}</ul>
          {karar.kosullar.length > 0 && (
            <>
              <h4>Koşullar</h4>
              <ul>{karar.kosullar.map((k) => <li key={k}>{k}</li>)}</ul>
            </>
          )}
          {/* Human-in-the-loop: AI önerir, insan karar verir */}
          <div className="insan">
            {onay ? (
              <strong>Yönetici kararı: {onay === "onaylandi" ? "✅ Onaylandı" : "⛔ Reddedildi"}</strong>
            ) : (
              <>
                <span>👤 Yönetici kararı:</span>
                <button onClick={() => setOnay("onaylandi")}>Onayla</button>
                <button className="ikincil" onClick={() => setOnay("reddedildi")}>Reddet</button>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
