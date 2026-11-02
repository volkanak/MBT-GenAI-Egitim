"""
Basit bir MCP (Model Context Protocol) sunucusu.

Herhangi bir MCP istemcisi (Claude Desktop, Claude Code, LangGraph ajanı, VS Code…)
bu sunucuya bağlanıp araçlarını kullanabilir. Çalıştırma: python kur_sunucu.py  (stdio)
"""
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("atlas-kur")

# Demo amaçlı sabit kurlar. Gerçekte TCMB / banka API'si çağrılır.
KURLAR = {"USD": 41.20, "EUR": 47.90, "GBP": 55.10}


@mcp.tool()
def kur_getir(doviz: str) -> str:
    """Verilen döviz kodunun (USD, EUR, GBP) güncel TL karşılığını döndürür."""
    kod = doviz.upper().strip()
    if kod not in KURLAR:
        return f"Bilinmeyen döviz: {kod}. Desteklenenler: {', '.join(KURLAR)}"
    return f"1 {kod} = {KURLAR[kod]} TL"


@mcp.tool()
def tl_cevir(tutar: float, doviz: str) -> str:
    """Döviz cinsinden tutarı TL'ye çevirir."""
    kod = doviz.upper().strip()
    if kod not in KURLAR:
        return f"Bilinmeyen döviz: {kod}"
    return f"{tutar:,.2f} {kod} = {tutar * KURLAR[kod]:,.2f} TL"


if __name__ == "__main__":
    mcp.run(transport="stdio")
