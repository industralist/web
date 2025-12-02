import type { WalletData, Transaction, TokenAccount } from "./types"

// This file is imported by use-wallet.ts which runs on client, so we remove process.env access here

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function withRetry<T>(fn: () => Promise<T | null>, maxRetries = 3, initialDelayMs = 1000): Promise<T | null> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await fn()
      if (result !== null) return result
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (error instanceof Error && error.message.includes("429")) {
        const waitTime = initialDelayMs * Math.pow(2, attempt)
        console.log(`[v0] Rate limited, waiting ${waitTime}ms before retry...`)
        await delay(waitTime)
      } else if (attempt < maxRetries - 1) {
        await delay(initialDelayMs * (attempt + 1))
      }
    }
  }

  console.error("[v0] Max retries exceeded:", lastError?.message)
  return null
}

async function processBatch<T, R>(
  items: T[],
  processor: (item: T) => Promise<R | null>,
  batchSize = 5,
  delayBetweenBatches = 200,
): Promise<(R | null)[]> {
  const results: (R | null)[] = []

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    console.log(`[v0] Processing batch ${Math.floor(i / batchSize) + 1} (${batch.length} items)`)

    const batchResults = await Promise.all(batch.map((item) => processor(item)))
    results.push(...batchResults)

    if (i + batchSize < items.length) {
      await delay(delayBetweenBatches)
    }
  }

  return results
}

async function heliusRpc<T>(method: string, params: any[], rpcUrl: string): Promise<T | null> {
  return withRetry(async () => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    console.log(`[v0] Helius RPC: ${method}`)

    const response = await fetch(rpcUrl, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: Math.random().toString(),
        method,
        params,
      }),
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.error(`[v0] HTTP ${response.status} for ${method}`)

      if (response.status === 429) {
        throw new Error("429 - Rate limited")
      }

      return null
    }

    const data = await response.json()

    if (data.error) {
      console.error(`[v0] RPC error for ${method}:`, data.error)
      return null
    }

    return data.result as T
  })
}

async function getAccountBalance(address: string, rpcUrl: string): Promise<number> {
  try {
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getBalance",
        params: [address],
      }),
    })

    const data = await response.json()
    console.log(`[v0] Balance response:`, data)
    if (typeof data.result === "number") {
      const solBalance = data.result / 1e9 // Convert lamports to SOL
      console.log(`[v0] SOL Balance: ${solBalance} SOL (${data.result} lamports)`)
      return solBalance
    }
  } catch (error) {
    console.error("[v0] Failed to get balance:", error)
  }
  return 0
}

async function getTokenAccounts(address: string, rpcUrl: string): Promise<TokenAccount[]> {
  try {
    // Use Helius searchAssets to get tokens with metadata directly
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "searchAssets",
        params: {
          ownerAddress: address,
          tokenType: "fungible",
          displayOptions: {
            showCollectionMetadata: false,
          },
        },
      }),
    })

    if (!response.ok) {
      console.error(`[v0] Token API error: ${response.status}`)
      return []
    }

    const data = await response.json()

    if (data.error) {
      console.error("[v0] RPC error fetching tokens:", data.error)
      return []
    }

    const items = data.result?.items || []

    if (!Array.isArray(items)) {
      console.log("[v0] No token accounts found")
      return []
    }

    const tokenAccounts: TokenAccount[] = items
      .filter((item: any) => {
        const balance = item.token_info?.balance
        return balance && balance > 0
      })
      .map((item: any) => {
        const balance = item.token_info?.balance || 0
        const decimals = item.token_info?.decimals || 0
        const uiAmount = Number(balance) / Math.pow(10, decimals)

        const metadata = item.content?.metadata || {}
        const tokenName = metadata.name || item.content?.links?.name || "Unknown Token"
        const tokenSymbol = metadata.symbol || "UNKNOWN"

        return {
          address: item.id || "",
          mint: item.id || item.mint || "",
          owner: address,
          amount: balance.toString(),
          decimals,
          uiAmount: Math.max(0, uiAmount),
          tokenName,
          tokenSymbol,
        }
      })

    console.log(`[v0] Found ${tokenAccounts.length} token accounts with metadata`)
    return tokenAccounts
  } catch (error) {
    console.error("[v0] Failed to fetch token accounts:", error)
    return []
  }
}

async function getTokenMetadata(mint: string, rpcUrl: string): Promise<{ name: string; symbol: string } | null> {
  try {
    return {
      name: "Unknown Token",
      symbol: "UNKNOWN",
    }
  } catch (error) {
    console.error(`[v0] Failed to fetch metadata for ${mint}:`, error)
    return {
      name: "Unknown Token",
      symbol: "UNKNOWN",
    }
  }
}

async function getTransactions(
  address: string,
  rpcUrl: string,
  limit = 500, // increased limit from 100 to 500 to fetch more transactions
  before?: string,
): Promise<{ transactions: Transaction[]; before?: string }> {
  try {
    const params: any[] = [address, { limit }]
    if (before) params[1].before = before

    const signatures = await heliusRpc<any[]>("getSignaturesForAddress", params, rpcUrl)

    if (!signatures || signatures.length === 0) {
      console.log("[v0] No transactions found")
      return { transactions: [] }
    }

    console.log(`[v0] Fetching ${signatures.length} transaction details in batches...`)

    const txResults = await processBatch(
      signatures,
      async (sig) => {
        const tx = await heliusRpc<any>(
          "getTransaction",
          [sig.signature, { maxSupportedTransactionVersion: 0 }],
          rpcUrl,
        )
        return { tx, sig }
      },
      5,
      300,
    )

    const transactions: Transaction[] = txResults
      .filter((result): result is { tx: any; sig: any } => result !== null && result.tx?.meta)
      .filter(({ sig }) => sig.err === null)
      .map(({ tx, sig }) => {
        const meta = tx.meta
        const preBalance = meta.preBalances?.[0] || 0
        const postBalance = meta.postBalances?.[0] || 0
        const solChange = (postBalance - preBalance) / 1e9

        const instructions = tx.transaction?.message?.instructions || []
        const hasSwap = instructions.some((ix: any) => ix.program === "TokenSwap")
        const hasStake = instructions.some((ix: any) => ix.program === "Stake")
        const hasNft = instructions.some(
          (ix: any) =>
            ix.program === "metaplex" || (ix.parsed?.type === "transfer" && ix.parsed?.info?.source?.includes("nft")),
        )

        return {
          signature: sig.signature,
          timestamp: sig.blockTime || Math.floor(Date.now() / 1000),
          type: hasSwap ? "swap" : hasStake ? "stake" : solChange < 0 ? "send" : solChange > 0 ? "receive" : "unknown",
          from: address,
          to: "",
          amount: Math.abs(solChange),
          fee: (meta.fee || 0) / 1e9,
          status: sig.confirmationStatus === "finalized" ? "success" : "pending",
        }
      })

    return {
      transactions,
      before: signatures[signatures.length - 1]?.signature,
    }
  } catch (error) {
    console.error("[v0] Failed to fetch transactions:", error)
    return { transactions: [] }
  }
}

export async function fetchWalletData(address: string, rpcUrl: string, heliusUrl?: string): Promise<WalletData> {
  try {
    console.log(`[v0] Fetching wallet data for: ${address}`)

    const [balance, tokenAccounts, txData] = await Promise.all([
      getAccountBalance(address, rpcUrl),
      getTokenAccounts(address, rpcUrl),
      getTransactions(address, rpcUrl, 500), // increased limit from 100 to 500
    ])

    const validBalance = typeof balance === "number" && !isNaN(balance) ? balance : 0
    const validTokenCount = Array.isArray(tokenAccounts) ? tokenAccounts.length : 0

    const totalValue = validBalance

    const transfers = txData.transactions.filter((t) => t.type === "send" || t.type === "receive")
    const defiActivities = txData.transactions.filter((t) => t.type === "swap")
    const nftActivities = txData.transactions.filter((t) => t.type === "unknown") // Placeholder for NFT detection
    const stakeAccounts = txData.transactions.filter((t) => t.type === "stake")

    console.log(
      `[v0] Final data - Balance: ${validBalance} SOL, Tokens: ${validTokenCount}, Transactions: ${txData.transactions.length}`,
    )

    return {
      address,
      balance: validBalance,
      tokenCount: validTokenCount,
      transactionCount: txData.transactions.length,
      lastTransaction: txData.transactions[0]?.timestamp,
      tokens: [],
      tokenAccounts,
      transactions: txData.transactions,
      transfers: transfers as any,
      defiActivities: defiActivities,
      nftActivities: nftActivities,
      balanceChanges: txData.transactions,
      analytics: {
        totalTransactions: txData.transactions.length,
        totalTransfers: transfers.length,
        uniquePrograms: 0,
      },
      portfolio: {
        solBalance: validBalance,
        tokenBalance: validTokenCount,
        totalValue: totalValue,
        holdings: tokenAccounts,
      },
      stakeAccounts: stakeAccounts,
      accountMetadata: {
        isOnCurve: true,
        stake: 0,
        tags: [],
        fundedBy: "",
      },
      timestamp: Date.now(),
      cached: false,
    }
  } catch (error) {
    console.error("[v0] Error fetching wallet data:", error)
    return {
      address,
      balance: 0,
      tokenCount: 0,
      transactionCount: 0,
      tokens: [],
      tokenAccounts: [],
      transactions: [],
      transfers: [],
      defiActivities: [],
      nftActivities: [],
      balanceChanges: [],
      analytics: { totalTransactions: 0, totalTransfers: 0, uniquePrograms: 0 },
      portfolio: { solBalance: 0, tokenBalance: 0, totalValue: 0, holdings: [] },
      stakeAccounts: [],
      accountMetadata: {
        isOnCurve: true,
        stake: 0,
        tags: [],
        fundedBy: "",
      },
      timestamp: Date.now(),
      cached: false,
    }
  }
}

export async function fetchSolanaNetworkStats() {
  return {
    blockHeight: "0",
    solSupply: "573.5M",
    networkTps: "~1500",
    avgPingTime: "142ms",
    totalStake: "73.4%",
    currentEpoch: "654",
  }
}

export async function fetchTrendingTokens() {
  try {
    const response = await fetch("/api/trending-tokens")
    if (!response.ok) {
      console.error(`[v0] Trending tokens API error: ${response.status}`)
      return []
    }

    const result = await response.json()
    return Array.isArray(result.data) ? result.data : []
  } catch (error) {
    console.error("[v0] Failed to fetch trending tokens:", error)
    return []
  }
}
