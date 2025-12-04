import { type NextRequest, NextResponse } from "next/server"
import { getCache, setCache } from "@/lib/cache"
import { fetchWalletData } from "@/lib/solscan-client"
import { getSupabaseServer } from "@/lib/supabase/server"

const CACHE_TTL = 60
const ADDRESS_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/

function validateAddress(address: string): boolean {
  return ADDRESS_REGEX.test(address)
}

async function validateApiKey(req: NextRequest): Promise<{ valid: boolean; userId?: string; error?: string }> {
  const authHeader = req.headers.get("authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { valid: false, error: "Missing or invalid Authorization header" }
  }

  const apiKey = authHeader.slice(7)

  try {
    const supabase = await getSupabaseServer()
    const keyHash = await hashApiKey(apiKey)

    const { data, error } = await supabase.from("api_keys").select("user_id").eq("key_hash", keyHash).single()

    if (error || !data) {
      return { valid: false, error: "Invalid API key" }
    }

    // Update last_used_at
    await supabase.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("key_hash", keyHash)

    return { valid: true, userId: data.user_id }
  } catch (error) {
    console.error("[v0] API key validation error:", error)
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
  const { address } = await props.params

  // Validate API key
  const authResult = await validateApiKey(request)
  if (!authResult.valid) {
    return NextResponse.json({ error: authResult.error }, { status: 401 })
  }

  if (!address || !validateAddress(address)) {
    return NextResponse.json({ error: "Invalid Solana wallet address format" }, { status: 400 })
  }

  try {
    const rpcUrl = process.env.HELIUS_RPC_URL
    if (!rpcUrl) {
      return NextResponse.json({ error: "RPC endpoint not configured" }, { status: 500 })
    }

    const cacheKey = `wallet:${address}`
    const cached = await getCache(cacheKey)

    if (cached) {
      return NextResponse.json({
        success: true,
        data: {
          ...cached,
          cached: true,
          cacheAge: Math.floor((Date.now() - cached.timestamp) / 1000),
        },
        apiVersion: "1.0.0",
        timestamp: Date.now(),
      })
    }

    const walletData = await fetchWalletData(address, rpcUrl, rpcUrl)
    await setCache(cacheKey, walletData, { ttl: CACHE_TTL })

    return NextResponse.json(
      {
        success: true,
        data: walletData,
        apiVersion: "1.0.0",
        timestamp: Date.now(),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      },
    )
  } catch (error) {
    console.error(`[v0] Error fetching wallet ${address}:`, error)
    return NextResponse.json({ error: "Failed to fetch wallet data" }, { status: 500 })
  }
}
