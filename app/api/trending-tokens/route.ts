import { NextResponse } from "next/server"

const SOL_MINT = "So11111111111111111111111111111111111111112"
const USDC_MINT = "EPjFWaLb3odccxmLVGGJMKc1EvYkUyt2j9tzLCUHhP8i"
const USDT_MINT = "Es9vMFrzaCERmJfrF4H2FYsw74MzoxvG6JSiepjs7g"

export async function GET() {
  try {
    const response = await fetch(`https://coins.llama.fi/prices/current/solana,usd-coin,tether?chain=solana`, {
      next: { revalidate: 60 },
    })

    if (response.ok) {
      const data = await response.json()

      const tokens = [
        {
          symbol: "SOL",
          name: "Solana",
          price: (data.coins?.["solana"]?.price ?? 0).toFixed(2),
          marketCap: "$103.2B",
          change24h: "0.00",
          positive: false,
        },
        {
          symbol: "USDC",
          name: "USD Coin",
          price: (data.coins?.["usd-coin"]?.price ?? 1).toFixed(2),
          marketCap: "$32.5B",
          change24h: "0.00",
          positive: false,
        },
        {
          symbol: "USDT",
          name: "Tether",
          price: (data.coins?.["tether"]?.price ?? 1).toFixed(2),
          marketCap: "$18.2B",
          change24h: "0.00",
          positive: false,
        },
      ]

      return NextResponse.json(
        { success: true, data: tokens },
        {
          headers: {
            "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
          },
        },
      )
    }

    throw new Error("DefiLlama API failed")
  } catch (error) {
    console.error("[v0] Error fetching trending tokens:", error)

    return NextResponse.json(
      {
        success: false,
        data: [
          {
            symbol: "SOL",
            name: "Solana",
            price: "150.00",
            marketCap: "$103.2B",
            change24h: "0.00",
            positive: false,
          },
          {
            symbol: "USDC",
            name: "USD Coin",
            price: "1.00",
            marketCap: "$32.5B",
            change24h: "0.00",
            positive: false,
          },
          {
            symbol: "USDT",
            name: "Tether",
            price: "1.00",
            marketCap: "$18.2B",
            change24h: "0.00",
            positive: false,
          },
        ],
      },
      { status: 200 }, // Return 200 so client doesn't treat as error
    )
  }
}
