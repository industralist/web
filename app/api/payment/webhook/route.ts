import { NextResponse } from "next/server"

const intentStore = new Map<string, { plan: string; amount: string; user?: string }>()

async function verifyHMAC(payload: string, secret: string, signatureHeader?: string) {
  if (!signatureHeader) return false

  try {
    const encoder = new TextEncoder()
    const keyData = encoder.encode(secret)
    const key = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"])

    const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload))
    const hexSignature = Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")

    return hexSignature === signatureHeader
  } catch (err) {
    console.error("HMAC verification error:", err)
    return false
  }
}

export async function POST(req: Request) {
  const secret = process.env.HELIUS_WEBHOOK_SECRET
  const raw = await req.text()

  if (!secret) {
    console.error("Webhook secret not configured")
    return NextResponse.json({}, { status: 500 })
  }

  const signatureHeader = req.headers.get("x-helius-signature") || req.headers.get("x-signature")
  if (!(await verifyHMAC(raw, secret, signatureHeader ?? undefined))) {
    console.warn("Webhook HMAC verification failed")
    return NextResponse.json({}, { status: 401 })
  }

  const body = JSON.parse(raw)

  try {
    for (const event of body) {
      const tx = event.transaction || event
      const signature = event.signature || event.txHash || tx.signatures?.[0]

      // For SPL token transfers, check the token transfer instructions
      const references = event.references || []

      for (const ref of references) {
        const saved = intentStore.get(ref)
        if (!saved) continue

        // Verify recipient and amount for USDT transfer
        const recipientMatches = event.recipient === process.env.NEXT_PUBLIC_SOLANA_PAYMENT_DESTINATION
        const amountMatches =
          String(event.amount) === saved.amount || String(event.amount) === String(Number.parseFloat(saved.amount))

        // Check if this is a token transfer to the correct mint (USDT)
        const isUSDTTransfer = event.tokenMint === "EPjFWaLb3oCRY59QuU9CLYy37qjodnKwDvE5tqKDqaP"

        if (recipientMatches && amountMatches && isUSDTTransfer) {
          console.log(`Payment verified for ref ${ref} plan ${saved.plan} signature ${signature}`)

          // In production, update DB to mark user as upgraded
          intentStore.delete(ref)
        } else {
          console.warn("Payment doesn't match expected values for ref", ref)
        }
      }
    }
  } catch (err) {
    console.error("Webhook processing failed", err)
    return NextResponse.json({}, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
