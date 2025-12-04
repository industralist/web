import { NextResponse } from "next/server"
import { PublicKey } from "@solana/web3.js"

type Body = {
  plan: "Pro" | "Pro+"
  userPublicKey?: string
}

// In-memory map for example purposes (replace with DB)
const intentStore = new Map<string, { plan: string; amount: string; user?: string }>()

export async function POST(req: Request) {
  try {
    const body: Body = await req.json()

    if (!body.plan) {
      return NextResponse.json({ error: "Missing plan" }, { status: 400 })
    }

    // USDT amounts (300 or 500 USDT)
    const amountUSDT = body.plan === "Pro" ? "300" : "500"

    // USDT mint address
    const usdtMint = "EPjFWaLb3oCRY59QuU9CLYy37qjodnKwDvE5tqKDqaP"
    const recipient = new PublicKey(process.env.NEXT_PUBLIC_SOLANA_PAYMENT_DESTINATION!)

    // Create unique reference for this payment
    const reference = new PublicKey(
      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    )
      .toBase58()
      .substring(0, 44)

    // persist the intent server-side so webhook can verify later
    intentStore.set(reference, {
      plan: body.plan,
      amount: amountUSDT,
      user: body.userPublicKey,
    })

    return NextResponse.json({
      reference,
      amount: amountUSDT,
      recipient: recipient.toBase58(),
      tokenMint: usdtMint,
    })
  } catch (err) {
    console.error("create intent error", err)
    return NextResponse.json({ error: "internal" }, { status: 500 })
  }
}
