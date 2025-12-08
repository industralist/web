export interface SolPriceData {
  solPriceUsd: number
  network: "devnet" | "mainnet"
  timestamp: number
}

/**
 * Detect network from Helius RPC URL
 * Returns "mainnet" if URL contains "mainnet-beta" or similar, otherwise "devnet"
 */
export function detectNetworkFromRpc(rpcUrl: string): "devnet" | "mainnet" {
  if (!rpcUrl) return "devnet"

  // Check if URL contains mainnet indicators
  if (
    rpcUrl.includes("mainnet") ||
    rpcUrl.includes("main-beta") ||
    rpcUrl.includes("rpc.helius.xyz") // Default Helius is mainnet
  ) {
    return "mainnet"
  }

  return "devnet"
}

/**
 * Fetch current SOL price in USD using Jupiter API
 * Falls back to CoinGecko if Jupiter fails
 */
export async function getSolPriceUsd(): Promise<number> {
  try {
    console.log("[v0] Fetching SOL price from Jupiter API...")
    const response = await fetch("https://price.jup.ag/v4/price?ids=SOL", {
      headers: { accept: "application/json" },
    })

    if (!response.ok) {
      console.warn("[v0] Jupiter API failed, trying CoinGecko...")
      return await getSolPriceFromCoinGecko()
    }

    const data = await response.json()
    const price = data.data?.SOL?.price

    if (!price) {
      console.warn("[v0] Invalid Jupiter response, trying CoinGecko...")
      return await getSolPriceFromCoinGecko()
    }

    console.log("[v0] SOL price fetched from Jupiter:", price)
    return price
  } catch (error) {
    console.warn("[v0] Error fetching from Jupiter:", error)
    return await getSolPriceFromCoinGecko()
  }
}

/**
 * Fallback: Fetch SOL price from CoinGecko API
 */
async function getSolPriceFromCoinGecko(): Promise<number> {
  try {
    console.log("[v0] Fetching SOL price from CoinGecko...")
    const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd", {
      headers: { accept: "application/json" },
    })

    if (!response.ok) {
      console.warn("[v0] CoinGecko failed, using fallback price")
      return 150 // Conservative fallback
    }

    const data = await response.json()
    const price = data.solana?.usd

    if (!price) {
      console.warn("[v0] Invalid CoinGecko response, using fallback price")
      return 150
    }

    console.log("[v0] SOL price fetched from CoinGecko:", price)
    return price
  } catch (error) {
    console.warn("[v0] Error fetching from CoinGecko:", error)
    return 150 // Fallback to $150
  }
}

/**
 * Convert USD amount to SOL based on current price
 * Adds 10% buffer for gas fees and price volatility
 */
export async function convertUsdToSol(usdAmount: number): Promise<number> {
  const solPrice = await getSolPriceUsd()
  const solAmount = usdAmount / solPrice
  const withBuffer = solAmount * 1.1 // Add 10% buffer for gas fees

  console.log(
    `[v0] Converted $${usdAmount} to ${solAmount.toFixed(4)} SOL (with 10% buffer: ${withBuffer.toFixed(4)} SOL) at $${solPrice}/SOL`,
  )

  return withBuffer
}

/**
 * Get dynamic plan prices based on SOL price and environment variables
 */
export async function getDynamicPlanPrices(): Promise<Record<string, { usdt: number; usdc: number; sol: number }>> {
  const solPrice = await getSolPriceUsd()

  const proMonthlyUsd = Number.parseFloat(process.env.NEXT_PUBLIC_PRO_PRICE_MONTHLY || "2")
  const proYearlyUsd = Number.parseFloat(process.env.NEXT_PUBLIC_PRO_PRICE_YEARLY || "20")
  const proPlusMonthlyUsd = Number.parseFloat(process.env.NEXT_PUBLIC_PROPLUS_PRICE_MONTHLY || "5")
  const proPlusYearlyUsd = Number.parseFloat(process.env.NEXT_PUBLIC_PROPLUS_PRICE_YEARLY || "50")

  // Convert USD to SOL and add buffer for monthly plans (yearly kept as-is since pre-calculated)
  const proSolPriceMonthly = (proMonthlyUsd / solPrice) * 1.1
  const proSolPriceYearly = (proYearlyUsd / solPrice) * 1.1
  const proPlusSolPriceMonthly = (proPlusMonthlyUsd / solPrice) * 1.1
  const proPlusSolPriceYearly = (proPlusYearlyUsd / solPrice) * 1.1

  console.log("[v0] Dynamic plan prices calculated:", {
    solPrice,
    proMonthlyUsd,
    proSolPriceMonthly,
    proYearlyUsd,
    proSolPriceYearly,
    proPlusMonthlyUsd,
    proPlusSolPriceMonthly,
    proPlusYearlyUsd,
    proPlusSolPriceYearly,
  })

  return {
    "Pro-Monthly": {
      usdt: proMonthlyUsd,
      usdc: 0,
      sol: proSolPriceMonthly,
    },
    "Pro-Yearly": {
      usdt: proYearlyUsd,
      usdc: 0,
      sol: proSolPriceYearly,
    },
    "Pro+-Monthly": {
      usdt: proPlusMonthlyUsd,
      usdc: 0,
      sol: proPlusSolPriceMonthly,
    },
    "Pro+-Yearly": {
      usdt: proPlusYearlyUsd,
      usdc: 0,
      sol: proPlusSolPriceYearly,
    },
  }
}
