import { NextResponse } from "next/server"
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { createTransferInstruction, getAssociatedTokenAddress } from "@solana/spl-token"
import { getDynamicPlanPrices, detectNetworkFromRpc } from "@/lib/sol-price"

export async function POST(req: Request) {
  try {
    console.log("[v0] Payment create endpoint called")

    const { publicKey, plan, tokenType = "usdt" } = await req.json()
    console.log("[v0] Request body:", { publicKey, plan, tokenType })

    if (!publicKey || !plan) {
      console.error("[v0] Missing required fields")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (tokenType !== "sol" && tokenType !== "usdt") {
      console.error("[v0] Invalid token type:", tokenType)
      return NextResponse.json({ error: "Only SOL and USDT are supported" }, { status: 400 })
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

    const priceData = PLAN_PRICES[plan]
    if (!priceData) {
      console.error("[v0] Plan not found:", plan)
      return NextResponse.json({ error: "Plan not found" }, { status: 400 })
    }

    if (tokenType === "sol") {
      const solPrice = priceData.sol
      console.log("[v0] Plan:", plan, "SOL Price:", solPrice)

      // Convert SOL to lamports (1 SOL = 1 billion lamports)
      const lamports = Math.floor(solPrice * LAMPORTS_PER_SOL)
      console.log("[v0] Amount in lamports:", lamports)

      try {
        const userBalance = await connection.getBalance(USER)
        const merchantBalance = await connection.getBalance(MERCHANT)

        console.log("[v0] User balance:", userBalance, "lamports", "(", userBalance / LAMPORTS_PER_SOL, "SOL)")
        console.log(
          "[v0] Merchant balance:",
          merchantBalance,
          "lamports",
          "(",
          merchantBalance / LAMPORTS_PER_SOL,
          "SOL)",
        )

        // Check if user has enough balance (add 10000 lamports for fees)
        if (userBalance < lamports + 10000) {
          console.error("[v0] Insufficient user balance:", userBalance, "< required:", lamports + 10000)
          return NextResponse.json(
            {
              error: `Insufficient SOL balance. You need ${((lamports + 10000) / LAMPORTS_PER_SOL).toFixed(4)} SOL but have ${(userBalance / LAMPORTS_PER_SOL).toFixed(4)} SOL`,
              required: lamports + 10000,
              available: userBalance,
            },
            { status: 400 },
          )
        }

        // Warn if merchant account has very low balance (might indicate misconfiguration)
        if (merchantBalance < 1_000_000) {
          // Less than 0.001 SOL
          console.warn("[v0] Merchant account has low balance:", merchantBalance / LAMPORTS_PER_SOL, "SOL")
        }
      } catch (balanceError: any) {
        console.error("[v0] Balance check error:", balanceError.message)
        // Don't fail the transaction, just log the warning
      }

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
    }

    if (tokenType === "usdt") {
      if (!process.env.NEXT_PUBLIC_USDT_MINT) {
        console.error("[v0] Missing NEXT_PUBLIC_USDT_MINT")
        return NextResponse.json({ error: "USDT mint not configured" }, { status: 500 })
      }

      const usdtAmount = priceData.usdt
      console.log("[v0] Plan:", plan, "USDT Price:", usdtAmount)

      // Convert USDT to raw amount (6 decimals)
      const tokenAmount = BigInt(Math.floor(usdtAmount * 1_000_000))
      console.log("[v0] Token amount in raw units:", tokenAmount.toString())

      try {
        const usdtMint = new PublicKey(process.env.NEXT_PUBLIC_USDT_MINT)
        const userTokenATA = await getAssociatedTokenAddress(usdtMint, USER)
        const merchantTokenATA = await getAssociatedTokenAddress(usdtMint, MERCHANT)

        console.log("[v0] User USDT ATA:", userTokenATA.toBase58())
        console.log("[v0] Merchant USDT ATA:", merchantTokenATA.toBase58())

        // Check user USDT balance
        const userTokenAccountInfo = await connection.getAccountInfo(userTokenATA)
        if (!userTokenAccountInfo) {
          console.error("[v0] User does not have USDT account")
          return NextResponse.json(
            { error: "You need a USDT account. Please create one or transfer tokens first." },
            { status: 400 },
          )
        }

        // Parse user token balance
        const balanceBuffer = userTokenAccountInfo.data.slice(64, 72)
        const balanceBigInt = BigInt(balanceBuffer.readBigUInt64LE(0))
        console.log("[v0] User USDT balance:", balanceBigInt.toString())

        if (balanceBigInt < tokenAmount) {
          console.error(
            "[v0] Insufficient USDT balance:",
            balanceBigInt.toString(),
            "< required:",
            tokenAmount.toString(),
          )
          return NextResponse.json(
            {
              error: `Insufficient USDT balance. You need ${usdtAmount.toFixed(2)} USDT but have ${(Number(balanceBigInt) / 1_000_000).toFixed(2)} USDT`,
              required: tokenAmount.toString(),
              available: balanceBigInt.toString(),
            },
            { status: 400 },
          )
        }
      } catch (balanceError: any) {
        console.error("[v0] USDT balance check error:", balanceError.message)
        return NextResponse.json({ error: "Failed to check USDT balance: " + balanceError.message }, { status: 500 })
      }

      console.log("[v0] Creating USDT transfer transaction...")

      try {
        const usdtMint = new PublicKey(process.env.NEXT_PUBLIC_USDT_MINT)
        const userTokenATA = await getAssociatedTokenAddress(usdtMint, USER)
        const merchantTokenATA = await getAssociatedTokenAddress(usdtMint, MERCHANT)

        const tx = new Transaction()

        // Create transfer instruction for USDT
        const transferInstruction = createTransferInstruction(userTokenATA, merchantTokenATA, USER, tokenAmount)
        tx.add(transferInstruction)

        const { blockhash } = await connection.getLatestBlockhash()
        console.log("[v0] Latest blockhash:", blockhash)

        tx.recentBlockhash = blockhash
        tx.feePayer = USER

        console.log("[v0] USDT Transaction created successfully")

        const serialized = tx.serialize({
          requireAllSignatures: false,
          verifySignatures: false,
        })

        console.log("[v0] Transaction serialized, size:", serialized.length, "bytes")

        return NextResponse.json({
          transaction: Buffer.from(serialized).toString("base64"),
          blockhash,
        })
      } catch (txError: any) {
        console.error("[v0] USDT transaction creation error:", txError.message)
        return NextResponse.json({ error: "Failed to create transaction: " + txError.message }, { status: 500 })
      }
    }
  } catch (error: any) {
    console.error("[v0] PAYMENT CREATE ERROR:", error.message)
    console.error("[v0] Error stack:", error.stack)
    return NextResponse.json({ error: error.message || "Transaction creation failed" }, { status: 500 })
  }
}
