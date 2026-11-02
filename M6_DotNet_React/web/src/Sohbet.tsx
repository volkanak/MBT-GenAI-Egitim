import { useRef, useState } from "react";
import { sohbetAkisi, type Mesaj } from "./api";

export default function Sohbet() {
  const [mesajlar, setMesajlar] = useState<Mesaj[]>([]);
  const [girdi, setGirdi] = useState("");
  const [yaziyor, setYaziyor] = useState(false);
  const iptal = useRef<AbortController | null>(null);

  async function gonder(e: React.FormEvent) {
    e.preventDefault();
    if (!girdi.trim() || yaziyor) return;

    const yeniGecmis: Mesaj[] = [...mesajlar, { rol: "user", icerik: girdi }];
    setMesajlar([...yeniGecmis, { rol: "assistant", icerik: "" }]);
    setGirdi("");
    setYaziyor(true);
    iptal.current = new AbortController();

    try {
      await sohbetAkisi(
        yeniGecmis,
        (parca) =>
          // Son (asistan) mesajın sonuna gelen token'ı ekle
          setMesajlar((m) => [...m.slice(0, -1), { rol: "assistant", icerik: m[m.length - 1].icerik + parca }]),
        iptal.current.signal,
      );
    } catch (err) {
      if ((err as Error).name !== "AbortError")
        setMesajlar((m) => [...m.slice(0, -1), { rol: "assistant", icerik: `⚠️ ${(err as Error).message}` }]);
    } finally {
      setYaziyor(false);
    }
  }

  return (
    <section className="kart sohbet">
      <div className="mesajlar">
        {mesajlar.length === 0 && <p className="ipucu">Örn: "Uzaktan çalışırken nelere dikkat etmeliyim?"</p>}
        {mesajlar.map((m, i) => (
          <div key={i} className={`balon ${m.rol}`}>
            {m.icerik || (yaziyor && i === mesajlar.length - 1 ? <span className="imlec">▍</span> : "")}
          </div>
        ))}
      </div>
      <form onSubmit={gonder} className="girdi">
        <input value={girdi} onChange={(e) => setGirdi(e.target.value)} placeholder="Mesajınızı yazın…" />
        {yaziyor ? (
          <button type="button" onClick={() => iptal.current?.abort()}>Durdur</button>
        ) : (
          <button type="submit">Gönder</button>
        )}
      </form>
    </section>
  );
}
