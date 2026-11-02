# M6 · .NET Core + React ile Uçtan Uca AI

**Süre:** 25 dk canlı kodlama · **Demo çıktısı:** Streaming yapan sohbet ve karar ekranı

```
 React (Vite, :5173)                .NET Minimal API (:5080)                 Claude API
 ┌──────────────────┐  POST /api/sohbet  ┌──────────────────────┐  stream  ┌──────────┐
 │ Sohbet.tsx       │ ─────────────────▶ │ CreateStreaming()    │ ───────▶ │          │
 │  ReadableStream  │ ◀── SSE: data: ─── │  → text/event-stream │ ◀─────── │  Model   │
 ├──────────────────┤  POST /api/karar   ├──────────────────────┤          │          │
 │ KararEkrani.tsx  │ ─────────────────▶ │ OutputConfig(JSON    │ ───────▶ │          │
 │  rozet + güven   │ ◀──── Karar JSON ─ │  şema = M1 Karar)    │ ◀─────── │          │
 └──────────────────┘                    └──────────────────────┘          └──────────┘
```

> **Takılırsanız:** Hazır kodun tamamı `M6_DotNet_React/api` ve `M6_DotNet_React/web` klasörlerinde. Her adımdan sonra o klasördeki koda geçip devam edebilirsiniz.
>
> **Ön koşul:** .NET 10 SDK, Node 20+, `ANTHROPIC_API_KEY` ortam değişkeni.

## ADIM 1 · Minimal API iskeleti (3 dk)

```bash
dotnet new web -n Atlas.Api -o api
cd api
dotnet add package Anthropic
export ANTHROPIC_API_KEY="sk-ant-..."     # Windows PowerShell: $env:ANTHROPIC_API_KEY="..."
```

```csharp
using System.Text.Json;
using Anthropic;
using Anthropic.Models.Messages;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton(_ => new AnthropicClient());   // ANTHROPIC_API_KEY'i okur
var app = builder.Build();

var model = builder.Configuration["Model"] ?? "claude-opus-5-5";
app.MapGet("/api/saglik", () => Results.Ok(new { durum = "çalışıyor", model }));

app.Run();
```

**Vurgu:** Anahtar asla koda/repoya yazılmaz. Üretimde Azure Key Vault / AWS Secrets Manager.

## ADIM 2 · Mesaj geçmişini modele çevir (4 dk)

```csharp
app.MapPost("/api/sohbet", async (SohbetIstegi istek, AnthropicClient client, HttpContext ctx) =>
{
    List<MessageParam> mesajlar = [];
    foreach (var m in istek.Mesajlar)
    {
        if (m.Rol == "user") mesajlar.Add(new UserMessageParam { Content = m.Icerik });
        else mesajlar.Add(new AssistantMessageParam { Content = m.Icerik });
    }

    var parametreler = new MessageCreateParams
    {
        Model = model,
        MaxTokens = 4096,
        System = "Sen Atlas Teknoloji'nin kurumsal asistanısın. Kısa, net ve Türkçe cevap ver.",
        Messages = mesajlar,
    };
    // ADIM 3'te buraya streaming gelecek
});

// Dosyanın EN ALTINA (app.Run()'dan sonra):
record SohbetMesaji(string Rol, string Icerik);
record SohbetIstegi(List<SohbetMesaji> Mesajlar);
```

**Vurgu:** LLM API'leri **durumsuzdur**. Hafıza = her istekte geçmişi yeniden göndermek (M4'teki checkpointer'ın yaptığı da bu).

## ADIM 3 · Server-Sent Events ile streaming (6 dk)

```csharp
    ctx.Response.Headers.ContentType = "text/event-stream";
    ctx.Response.Headers.CacheControl = "no-cache";

    await foreach (var olay in client.Messages.CreateStreaming(parametreler, ctx.RequestAborted))
    {
        if (olay.TryPickContentBlockDelta(out var delta) && delta.Delta.TryPickText(out var metin))
        {
            await ctx.Response.WriteAsync($"data: {JsonSerializer.Serialize(new { metin = metin.Text })}\n\n");
            await ctx.Response.Body.FlushAsync();
        }
    }
    await ctx.Response.WriteAsync("data: [BITTI]\n\n");
```

Test:

```bash
dotnet run
curl -N -X POST http://localhost:5080/api/sohbet -H "Content-Type: application/json" \
  -d '{"mesajlar":[{"rol":"user","icerik":"Hibrit çalışmayı 3 maddede anlat"}]}'
```

**Vurgu:** `ctx.RequestAborted` → kullanıcı sekmeyi kapatınca model çağrısı da iptal olur, boşa token harcanmaz.

## ADIM 4 · React: akışı token token göster (7 dk)

```bash
npm create vite@latest web -- --template react-ts
cd web && npm install
```

`vite.config.ts`: `/api` isteklerini .NET'e yönlendir:

```ts
server: { port: 5173, proxy: { "/api": "http://localhost:5080" } },
```

`src/api.ts`: SSE okuyucu:

```ts
export async function sohbetAkisi(mesajlar: Mesaj[], onParca: (metin: string) => void, signal?: AbortSignal) {
  const yanit = await fetch("/api/sohbet", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mesajlar }), signal,
  });
  const okuyucu = yanit.body!.getReader();
  const cozucu = new TextDecoder();
  let tampon = "";
  while (true) {
    const { done, value } = await okuyucu.read();
    if (done) break;
    tampon += cozucu.decode(value, { stream: true });
    const olaylar = tampon.split("\n\n");
    tampon = olaylar.pop() ?? "";
    for (const olay of olaylar) {
      const veri = olay.replace(/^data: /, "").trim();
      if (!veri || veri === "[BITTI]") continue;
      onParca(JSON.parse(veri).metin);
    }
  }
}
```

`src/Sohbet.tsx`: gelen her parçayı son mesaja ekle:

```tsx
await sohbetAkisi(yeniGecmis, (parca) =>
  setMesajlar((m) => [...m.slice(0, -1), { rol: "assistant", icerik: m[m.length - 1].icerik + parca }]),
  iptal.current.signal);
```

**Vurgu:** Neden `EventSource` değil de `fetch`? `EventSource` sadece GET destekler; biz POST ile geçmiş gönderiyoruz.

## ADIM 5 · Karar ekranı: yapılandırılmış çıktı (5 dk)

```csharp
app.MapPost("/api/karar", async (KararIstegi istek, AnthropicClient client) =>
{
    var yanit = await client.Messages.Create(new MessageCreateParams
    {
        Model = model,
        MaxTokens = 4096,
        System = "Sen Atlas Teknoloji'nin satın alma karar destek uzmanısın. ...",
        Messages = [new UserMessageParam { Content = istek.Talep }],
        OutputConfig = new OutputConfig { Format = new JsonOutputFormat { Schema = KararSemasi.Sema } },
    });
    var json = yanit.Content.Select(b => b.Value).OfType<TextBlock>().First().Text;
    return Results.Content(json, "application/json");
});
```

`KararSemasi.Sema`: M1'deki Pydantic `Karar` sınıfının JSON Schema karşılığı (`karar`, `gerekce`, `riskler`, `kosullar`, `guven`). React tarafında `KararEkrani.tsx` bu JSON'u rozet + güven çubuğu + risk listesi olarak çizer ve **yönetici onay butonları** (human-in-the-loop) ekler.

**Vurgu:** Şema garantisi sayesinde frontend `JSON.parse` hatası veya eksik alan endişesi taşımaz.

## Mimari notu: Python ajanları nasıl bağlanır?

```
React ──▶ .NET API (kimlik doğrulama, yetki, loglama, rate limit)
              │
              ├──▶ Claude API  (basit sohbet / karar)
              └──▶ Python FastAPI (M4-M5 LangGraph ajanları, RAG, GraphRAG)
```

Kurumsal yapılarda .NET genellikle **API Gateway / iş kuralları** katmanıdır; ajan orkestrasyonu Python servisinde kalır. Alternatif: Ajanları doğrudan .NET'te `Microsoft.Extensions.AI` + Semantic Kernel ile yazmak.
