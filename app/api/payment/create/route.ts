import { NextResponse } from "next/server"
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { getDynamicPlanPrices, detectNetworkFromRpc } from "@/lib/sol-price"

export async function POST(req: Request) {
  try {
    console.log("[v0] Payment create endpoint called")

    const { publicKey, plan } = await req.json()
    console.log("[v0] Request body:", { publicKey, plan })

    if (!publicKey || !plan) {
      console.error("[v0] Missing required fields")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const USER = new PublicKey(publicKey)
    console.log("[v0] User public key:", USER.toBase58())

    if (!process.env.NEXT_PUBLIC_SOLANA_PAYMENT_DESTINATION) {
      console.error("[v0] Missing NEXT_PUBLIC_SOLANA_PAYMENT_DESTINATION")
      return NextResponse.json({ error: "Payment destination not configured" }, { status: 500 })
    }

    if (!process.env.HELIUS_RPC_URL) {
      console.error("[v0] Missing HELIUS_RPC_URL")
      return NextResponse.json({ error: "RPC URL not configured" }, { status: 500 })
    }

    const MERCHANT = new PublicKey(process.env.NEXT_PUBLIC_SOLANA_PAYMENT_DESTINATION!)
    const connection = new Connection(process.env.HELIUS_RPC_URL!, "confirmed")

    const network = detectNetworkFromRpc(process.env.HELIUS_RPC_URL!)
    console.log("[v0] Detected network:", network)

    const PLAN_PRICES = await getDynamicPlanPrices()
    console.log("[v0] Dynamic plan prices:", PLAN_PRICES)

    const solPrice = PLAN_PRICES[plan].sol
    console.log("[v0] Plan:", plan, "SOL Price:", solPrice)

    // Convert SOL to lamports (1 SOL = 1 billion lamports)
    const lamports = Math.floor(solPrice * LAMPORTS_PER_SOL)
    console.log("[v0] Amount in lamports:", lamports)

    console.log("[v0] Creating SOL transfer transaction...")

    const tx = new Transaction()

    // Add SOL transfer instruction
    tx.add(
      SystemProgram.transfer({
        fromPubkey: USER,
        toPubkey: MERCHANT,
        lamports,
      }),
    )

    const { blockhash } = await connection.getLatestBlockhash()
    console.log("[v0] Latest blockhash:", blockhash)

    tx.recentBlockhash = blockhash
    tx.feePayer = USER

    console.log("[v0] Transaction created successfully")

    const serialized = tx.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    })

    console.log("[v0] Transaction serialized, size:", serialized.length, "bytes")

    return NextResponse.json({
      transaction: Buffer.from(serialized).toString("base64"),
      blockhash,
    })
  } catch (error: any) {
    console.error("[v0] PAYMENT CREATE ERROR:", error.message)
    console.error("[v0] Error stack:", error.stack)
    return NextResponse.json({ error: error.message || "Transaction creation failed" }, { status: 500 })
  }
}
