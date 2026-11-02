// M6 · .NET + React ile uçtan uca AI: Atlas Karar Asistanı API
// Çalıştırma:  export ANTHROPIC_API_KEY=...  &&  dotnet run   → http://localhost:5080

using System.Text.Json;
using Anthropic;
using Anthropic.Models.Messages;

// ── ADIM 1: Minimal API iskeleti ──────────────────────────────────────────
var builder = WebApplication.CreateBuilder(args);

// ANTHROPIC_API_KEY ortam değişkeninden okunur. Anahtar asla koda yazılmaz.
builder.Services.AddSingleton(_ => new AnthropicClient());
builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
    p.WithOrigins("http://localhost:5173").AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();
app.UseCors();

var model = builder.Configuration["Model"] ?? "claude-opus-5-5";

app.MapGet("/api/saglik", () => Results.Ok(new { durum = "çalışıyor", model }));

// ── ADIM 2 + 3: Sohbet, Server-Sent Events (SSE) ile token token akış ────────────
app.MapPost("/api/sohbet", async (SohbetIstegi istek, AnthropicClient client, HttpContext ctx) =>
{
    ctx.Response.Headers.ContentType = "text/event-stream";
    ctx.Response.Headers.CacheControl = "no-cache";

    // Tarayıcıdan gelen geçmişi Anthropic mesaj tipine çevir
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

    try
    {
        await foreach (var olay in client.Messages.CreateStreaming(parametreler, ctx.RequestAborted))
        {
            if (olay.TryPickContentBlockDelta(out var delta) && delta.Delta.TryPickText(out var metin))
            {
                await ctx.Response.WriteAsync($"data: {JsonSerializer.Serialize(new { metin = metin.Text })}\n\n");
                await ctx.Response.Body.FlushAsync();
            }
        }
    }
    catch (OperationCanceledException) { return; }   // kullanıcı sayfayı kapattı
    catch (Exception ex)
    {
        await ctx.Response.WriteAsync($"data: {JsonSerializer.Serialize(new { hata = ex.Message })}\n\n");
    }
    await ctx.Response.WriteAsync("data: [BITTI]\n\n");
});

// ── ADIM 5: Karar ekranı: M1'deki Karar şeması ile yapılandırılmış çıktı ──────
app.MapPost("/api/karar", async (KararIstegi istek, AnthropicClient client) =>
{
    var yanit = await client.Messages.Create(new MessageCreateParams
    {
        Model = model,
        MaxTokens = 4096,
        System = """
            Sen Atlas Teknoloji'nin satın alma karar destek uzmanısın.
            Kurallar: 50.000-500.000 TL arası Finans Müdürü, 500.000-2.000.000 TL CFO, üzeri Genel Müdür onayı gerekir.
            Tedarikçi avansı sözleşme bedelinin %30'unu aşamaz; teslimat gecikmesi yaşanmış tedarikçiye avans verilmez.
            Emin olmadığın durumlarda 'incele' öner.
            """,
        Messages = [new UserMessageParam { Content = istek.Talep }],
        OutputConfig = new OutputConfig { Format = new JsonOutputFormat { Schema = KararSemasi.Sema } },
    });

    if (yanit.StopReason?.Raw() == "refusal")
        return Results.Problem("Model bu isteği reddetti.");

    var json = yanit.Content.Select(b => b.Value).OfType<TextBlock>().First().Text;
    return Results.Content(json, "application/json");
});

app.Run();

// ── Tipler (top-level ifadelerden sonra gelmeli) ─────────────────────────────
record SohbetMesaji(string Rol, string Icerik);
record SohbetIstegi(List<SohbetMesaji> Mesajlar);
record KararIstegi(string Talep);

static class KararSemasi
{
    // ortak.py'deki Pydantic Karar sınıfının JSON şeması karşılığı
    public static readonly Dictionary<string, JsonElement> Sema = new()
    {
        ["type"] = JsonSerializer.SerializeToElement("object"),
        ["properties"] = JsonSerializer.SerializeToElement(new
        {
            karar = new { type = "string", @enum = new[] { "onayla", "reddet", "incele" } },
            gerekce = new { type = "string", description = "Kararın 2-3 cümlelik gerekçesi" },
            riskler = new { type = "array", items = new { type = "string" } },
            kosullar = new { type = "array", items = new { type = "string" } },
            guven = new { type = "number", description = "0 ile 1 arasında güven skoru" },
        }),
        ["required"] = JsonSerializer.SerializeToElement(new[] { "karar", "gerekce", "riskler", "kosullar", "guven" }),
        ["additionalProperties"] = JsonSerializer.SerializeToElement(false),
    };
}
