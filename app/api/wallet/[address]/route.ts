// Validates address, checks cache (memory + Redis), fetches from API, stores in cache

import { type NextRequest, NextResponse } from "next/server"
import type { ApiResponse, WalletError } from "@/lib/types"
import { getCache, setCache } from "@/lib/cache"
import { fetchWalletData } from "@/lib/solscan-client"

const CACHE_TTL = 60 // 60 seconds for frequent changes
const ADDRESS_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/

function validateAddress(address: string): boolean {
  return ADDRESS_REGEX.test(address)
}

function createErrorResponse(
  code: WalletError["code"],
  message: string,
  status: number,
): NextResponse<ApiResponse<null>> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        status,
      },
      apiVersion: "1.0.0",
      timestamp: Date.now(),
    },
    { status },
  )
}

export async function GET(request: NextRequest, props: { params: Promise<{ address: string }> }) {
  const { address } = await props.params

  // Validate address format
  if (!address || !validateAddress(address)) {
    return createErrorResponse("INVALID_ADDRESS", "Invalid Solana wallet address format", 400)
  }

  try {
    const rpcUrl = process.env.HELIUS_RPC_URL
    if (!rpcUrl) {
      console.error("[v0] HELIUS_RPC_URL environment variable not configured")
      return createErrorResponse("API_DOWN", "RPC endpoint not configured", 500)
    }

    // Try to get from cache first (memory + Redis)
    const cacheKey = `wallet:${address}`
    const cached = await getCache(cacheKey)

    if (cached) {
      console.log(`[v0] Cache hit for wallet ${address}`)
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

    // Fetch from external API (with retry logic in solscan-client)
    console.log(`[v0] Cache miss for wallet ${address}, fetching from API`)
    const walletData = await fetchWalletData(address, rpcUrl, rpcUrl)

    // Cache the response in both memory and Redis
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

    if (error instanceof Error) {
      if (error.message.includes("429")) {
        return createErrorResponse("RATE_LIMIT", "API rate limit exceeded. Please retry in 30 seconds.", 429)
      }
      if (error.message.includes("timeout")) {
        return createErrorResponse("NETWORK_ERROR", "Request timeout. Please try again.", 504)
      }
    }

    return createErrorResponse("API_DOWN", "Failed to fetch wallet data. Please try again later.", 500)
  }
}
