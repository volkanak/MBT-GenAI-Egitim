import { useState } from "react";
import Sohbet from "./Sohbet";
import KararEkrani from "./KararEkrani";

export default function App() {
  const [sekme, setSekme] = useState<"sohbet" | "karar">("sohbet");
  return (
    <main>
      <header>
        <h1>Atlas Karar Asistanı</h1>
        <nav>
          <button className={sekme === "sohbet" ? "aktif" : ""} onClick={() => setSekme("sohbet")}>💬 Sohbet</button>
          <button className={sekme === "karar" ? "aktif" : ""} onClick={() => setSekme("karar")}>⚖️ Karar ekranı</button>
        </nav>
      </header>
      {sekme === "sohbet" ? <Sohbet /> : <KararEkrani />}
    </main>
  );
}
