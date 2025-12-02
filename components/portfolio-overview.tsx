"use client"

import { TrendingUp, TrendingDown } from "lucide-react"
import { useWallet } from "@/lib/use-wallet"
import { WalletDataSkeleton } from "./wallet-data-loader"
import { WalletErrorDisplay } from "./wallet-error"

interface PortfolioOverviewProps {
  walletAddress: string
}

export function PortfolioOverview({ walletAddress }: PortfolioOverviewProps) {
  const { data: wallet, error, isLoading, mutate } = useWallet(walletAddress)

  if (isLoading) {
    return <WalletDataSkeleton />
  }

  if (error) {
    return <WalletErrorDisplay error={error} onRetry={() => mutate()} />
  }

  if (!wallet) {
    return null
  }

  const balance = wallet.balance ?? 0
  const balanceChange = wallet.balanceChange24h ?? 0
  const balanceChangePercent = wallet.balanceChangePercent24h ?? 0
  const isPositive = balanceChange >= 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div
          className="rounded-lg p-6 md:p-8 border border-orange-500/30"
          style={{ backgroundColor: "rgb(20, 15, 12)" }}
        >
          <p className="text-gray-400 text-xs md:text-sm mb-2">Total SOL Balance</p>
          <h2 className="text-4xl font-bold text-white mb-4">{balance.toFixed(2)} SOL</h2>
          <div className={`flex items-center gap-2 ${isPositive ? "text-green-500" : "text-red-500"}`}>
            {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            <span className="font-semibold">
              {isPositive ? "+" : ""}
              {balanceChange.toFixed(2)} SOL ({balanceChangePercent.toFixed(2)}%)
            </span>
          </div>
          <p className="text-gray-500 text-xs md:text-sm mt-2">24h change</p>
          {wallet.cached && <p className="text-gray-600 text-xs mt-2">Cached {wallet.cacheAge}s ago</p>}
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {[
            { label: "Tokens", value: wallet.tokenCount },
            { label: "Transactions", value: wallet.transactionCount },
            {
              label: "Last Activity",
              value: wallet.lastTransaction ? new Date(wallet.lastTransaction * 1000).toLocaleDateString() : "Never",
            },
            { label: "Network", value: "Solana" },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="rounded-lg p-3 md:p-4 border border-slate-700 hover:border-orange-500/30 transition-colors"
              style={{ backgroundColor: "rgb(20, 15, 12)" }}
            >
              <p className="text-gray-400 text-xs mb-1">{stat.label}</p>
              <p className="text-white font-semibold text-sm md:text-base truncate">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
