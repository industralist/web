import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase/server"

async function validateApiKey(req: NextRequest): Promise<{ valid: boolean; userId?: string; error?: string }> {
  const authHeader = req.headers.get("authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { valid: false, error: "Missing Authorization header" }
  }

  const apiKey = authHeader.slice(7)

  try {
    const supabase = await getSupabaseServer()
    const keyHash = await hashApiKey(apiKey)

    const { data, error } = await supabase.from("api_keys").select("user_id").eq("key_hash", keyHash).single()

    if (error || !data) {
      return { valid: false, error: "Invalid API key" }
    }

    return { valid: true, userId: data.user_id }
  } catch (error) {
    return { valid: false, error: "Authentication failed" }
  }
}

async function hashApiKey(apiKey: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(apiKey)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

export async function GET(request: NextRequest, props: { params: Promise<{ address: string }> }) {
  const authResult = await validateApiKey(request)
  if (!authResult.valid) {
    return NextResponse.json({ error: authResult.error }, { status: 401 })
  }

  const { address } = await props.params
  const searchParams = request.nextUrl.searchParams
  const limit = Number.parseInt(searchParams.get("limit") || "50")
  const offset = Number.parseInt(searchParams.get("offset") || "0")

  try {
    const rpcUrl = process.env.HELIUS_RPC_URL
    if (!rpcUrl) {
      return NextResponse.json({ error: "RPC not configured" }, { status: 500 })
    }

    // Fetch transactions using Helius RPC
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getSignaturesForAddress",
        params: [address, { limit: Math.min(limit, 100), before: offset > 0 ? `offset_${offset}` : undefined }],
      }),
    })

    const data = await response.json()
    const transactions = data.result || []

    return NextResponse.json({
      success: true,
      data: {
        address,
        count: transactions.length,
        limit,
        offset,
        transactions: transactions.map((tx: any) => ({
          signature: tx.signature,
          blockTime: tx.blockTime,
          confirmationStatus: tx.confirmationStatus,
          err: tx.err,
        })),
      },
      apiVersion: "1.0.0",
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error("[v0] Error fetching transactions:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}
