import type { Connection } from "@solana/web3.js"

/**
 * Confirms a transaction using polling instead of WebSocket connections.
 * This avoids browser WebSocket issues with Helius RPC endpoints.
 * Created new polling-based confirmation utility
 */
export async function confirmTransactionWithPolling(
  connection: Connection,
  signature: string,
  maxRetries = 120, // ~60 seconds with 500ms intervals
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

  throw new Error("Transaction confirmation timeout - transaction may still succeed")
}
