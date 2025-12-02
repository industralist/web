// Shared type contracts between frontend and backend
// This ensures strict type safety and prevents runtime errors

export interface WalletError {
  code: "INVALID_ADDRESS" | "RATE_LIMIT" | "API_DOWN" | "NETWORK_ERROR" | "UNKNOWN"
  message: string
  retryAfter?: number
  status: number
}

export interface TokenAccount {
  address: string
  mint: string
  owner: string
  amount: string
  decimals: number
  uiAmount: number
  tokenName?: string
  tokenSymbol?: string
}

export interface TokenInfo {
  mint: string
  symbol: string
  name: string
  decimals: number
  logo?: string
  price?: number
  priceChange24h?: number
}

export interface Transaction {
  signature: string
  timestamp: number
  type: "send" | "receive" | "swap" | "stake" | "unknown"
  from: string
  to: string
  amount: number
  fee: number
  status: "success" | "failed" | "pending"
}

export interface Transfer {
  signature: string
  timestamp: number
  from: string
  to: string
  mint: string
  amount: string
  decimals: number
  tokenSymbol?: string
  tokenName?: string
}

export interface WalletData {
  address: string
  balance: number
  balanceChange24h?: number
  balanceChangePercent24h?: number
  tokenCount: number
  transactionCount: number
  lastTransaction?: number
  tokens: TokenInfo[]
  tokenAccounts: TokenAccount[]
  transactions: Transaction[]
  transfers: Transfer[]
  account?: any
  domain?: string
  nativeStake?: number
  timestamp: number
  cached: boolean
  cacheAge?: number
  defiActivities?: any[]
  nftActivities?: any[]
  balanceChanges?: Transaction[]
  analytics?: {
    totalTransactions: number
    totalTransfers: number
    uniquePrograms: number
  }
  portfolio?: {
    solBalance: number
    tokenBalance: number
    totalValue: number
    holdings: TokenAccount[]
  }
  stakeAccounts?: any[]
  accountMetadata?: {
    isOnCurve: boolean
    stake: number
    tags: string[]
    fundedBy: string
  }
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: WalletError
  apiVersion: string
  timestamp: number
}

export interface WalletAnalytics {
  totalTransactions: number
  totalVolume: number
  uniqueTokens: number
  largestHolding: TokenInfo & { amount: number; percentage: number }
  activityScore: number
  riskLevel: "low" | "medium" | "high"
}
