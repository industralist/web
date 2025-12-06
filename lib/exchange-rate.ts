interface ExchangeRateResponse {
  solana: {
    usd: number
  }
}

let cachedRate: number | null = null
let lastFetch = 0
const CACHE_DURATION = 60000 // 1 minute cache

/**
 * Get current SOL/USD exchange rate from CoinGecko
 */
export async function getSolUsdRate(): Promise<number> {
  const now = Date.now()

  // Return cached rate if still valid
  if (cachedRate && now - lastFetch < CACHE_DURATION) {
    console.log("[v0] Using cached SOL/USD rate:", cachedRate)
    return cachedRate
  }

  try {
    console.log("[v0] Fetching fresh SOL/USD exchange rate...")
    const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd")

    if (!response.ok) {
      throw new Error(`Failed to fetch exchange rate: ${response.status}`)
    }

    const data: ExchangeRateResponse = await response.json()
    const rate = data.solana.usd
    console.log("[v0] Received exchange rate data:", data)

    if (!rate || rate <= 0) {
      throw new Error("Invalid exchange rate received")
    }

    cachedRate = rate
    lastFetch = now
    console.log("[v0] Updated SOL/USD rate:", rate)
    return rate
  } catch (error) {
    console.error("[v0] Failed to fetch SOL/USD rate:", error)

    // Fallback to cached rate or default
    if (cachedRate) {
      console.warn("[v0] Using cached exchange rate due to API failure:", cachedRate)
      return cachedRate
    }

    // Last resort fallback rate
    console.warn("[v0] Using fallback exchange rate: 180")
    return 180 // Fallback rate
  }
}

/**
 * Convert USD amount to SOL
 */
export async function convertUsdToSol(usdAmount: number): Promise<number> {
  console.log("[v0] Converting $", usdAmount, "USD to SOL")
  const rate = await getSolUsdRate()
  const solAmount = usdAmount / rate
  console.log("[v0] Conversion result:", usdAmount, "USD =", solAmount, "SOL at rate", rate)
  return solAmount
}
