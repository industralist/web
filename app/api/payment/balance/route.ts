import { NextResponse } from "next/server"
import { Connection, PublicKey } from "@solana/web3.js"
import { getAssociatedTokenAddress } from "@solana/spl-token"
import { detectNetworkFromRpc } from "@/lib/sol-price"

export async function POST(req: Request) {
  try {
    console.log("[v0] Balance check endpoint called")

    const { publicKey, tokenType = "usdt" } = await req.json()
    console.log("[v0] Balance check - publicKey:", publicKey, "tokenType:", tokenType)

    if (!publicKey) {
      console.error("[v0] Missing public key")
      return NextResponse.json({ error: "Missing public key" }, { status: 400 })
    }

    if (tokenType !== "usdt") {
      console.error("[v0] Only USDT is supported")
      return NextResponse.json({ error: "Only USDT is supported" }, { status: 400 })
    }

    if (!process.env.HELIUS_RPC_URL) {
      console.error("[v0] Missing HELIUS_RPC_URL env var")
      return NextResponse.json({ error: "RPC not configured" }, { status: 500 })
    }

    if (!process.env.NEXT_PUBLIC_USDT_MINT) {
      console.error("[v0] Missing NEXT_PUBLIC_USDT_MINT")
      return NextResponse.json({ error: "USDT mint not configured" }, { status: 500 })
    }

    const detectedNetwork = detectNetworkFromRpc(process.env.HELIUS_RPC_URL)
    console.log("[v0] Detected network for balance check:", detectedNetwork)

    const connection = new Connection(process.env.HELIUS_RPC_URL, "confirmed")
    const userPublicKey = new PublicKey(publicKey)

    const tokenMint = new PublicKey(process.env.NEXT_PUBLIC_USDT_MINT)
    console.log("[v0] Token mint:", tokenMint.toBase58())

    const userTokenATA = await getAssociatedTokenAddress(tokenMint, userPublicKey)
    console.log("[v0] User token ATA:", userTokenATA.toBase58())

    const accountInfo = await connection.getAccountInfo(userTokenATA)

    if (!accountInfo) {
      console.log("[v0] USDT account does not exist - balance is 0")
      return NextResponse.json({
        balance: 0,
        hasAccount: false,
        message: "No USDT account found. You need to create one or transfer tokens first.",
      })
    }

    // Parse the token account data
    const data = accountInfo.data
    // Token amount is at bytes 64-72 (little-endian u64)
    const balanceBuffer = data.slice(64, 72)
    const balanceBigInt = BigInt(balanceBuffer.readBigUInt64LE(0))

    // Convert from raw amount (6 decimals for USDT) to UI amount
    const balance = Number(balanceBigInt) / 1_000_000
    console.log("[v0] Raw balance:", balanceBigInt.toString(), "UI balance:", balance)

    return NextResponse.json({
      balance,
      hasAccount: true,
      message: `You have ${balance.toFixed(2)} USDT`,
    })
  } catch (error: any) {
    console.error("[v0] Balance check error:", error.message)
    console.error("[v0] Error stack:", error.stack)
    return NextResponse.json({ error: "Unable to check balance: " + error.message }, { status: 500 })
  }
}
