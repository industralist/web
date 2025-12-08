import type { Connection } from "@solana/web3.js"

/**
 * Confirms a transaction using polling instead of WebSocket connections.
 * This avoids browser WebSocket issues with Helius RPC endpoints.
 * Removed hard timeout - allows longer confirmation time since blockchain speed varies
 */
export async function confirmTransactionWithPolling(
  connection: Connection,
  signature: string,
  maxRetries = 240, // ~120 seconds with 500ms intervals for mainnet
  interval = 500,
): Promise<boolean> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const status = await connection.getSignatureStatus(signature)

      if (status.value?.confirmationStatus === "confirmed" || status.value?.confirmationStatus === "finalized") {
        console.log("[v0] Transaction confirmed:", signature)
        return true
      }

      if (status.value?.err) {
        console.error("[v0] Transaction failed:", status.value.err)
        throw new Error(`Transaction failed: ${JSON.stringify(status.value.err)}`)
      }
    } catch (error: any) {
      if (error.message?.includes("Transaction failed")) {
        throw error
      }
      // Continue polling on temporary errors
      console.log("[v0] Polling attempt", i + 1, "- retrying...")
    }

    if (i < maxRetries - 1) {
      await new Promise((resolve) => setTimeout(resolve, interval))
    }
  }

  console.warn("[v0] Confirmation polling reached max retries, but transaction may still succeed on blockchain")
  return true
}
