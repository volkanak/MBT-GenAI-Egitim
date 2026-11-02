// ADIM 4: .NET API'den gelen SSE akışını okumak
export type Mesaj = { rol: "user" | "assistant"; icerik: string };

export type Karar = {
  karar: "onayla" | "reddet" | "incele";
  gerekce: string;
  riskler: string[];
  kosullar: string[];
  guven: number;
};

/** /api/sohbet'e POST atar, gelen her token parçası için onParca'yı çağırır. */
export async function sohbetAkisi(mesajlar: Mesaj[], onParca: (metin: string) => void, signal?: AbortSignal) {
  const yanit = await fetch("/api/sohbet", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mesajlar }),
    signal,
  });
  if (!yanit.ok || !yanit.body) throw new Error(`API hatası: ${yanit.status}`);

  const okuyucu = yanit.body.getReader();
  const cozucu = new TextDecoder();
  let tampon = "";

  while (true) {
    const { done, value } = await okuyucu.read();
    if (done) break;
    tampon += cozucu.decode(value, { stream: true });

    // SSE olayları boş satırla ayrılır: "data: {...}\n\n"
    const olaylar = tampon.split("\n\n");
    tampon = olaylar.pop() ?? "";
    for (const olay of olaylar) {
      const veri = olay.replace(/^data: /, "").trim();
      if (!veri || veri === "[BITTI]") continue;
      const json = JSON.parse(veri);
      if (json.hata) throw new Error(json.hata);
      onParca(json.metin);
    }
  }
}

export async function kararAl(talep: string): Promise<Karar> {
  const yanit = await fetch("/api/karar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ talep }),
  });
  if (!yanit.ok) throw new Error(`API hatası: ${yanit.status}`);
  return yanit.json();
}
