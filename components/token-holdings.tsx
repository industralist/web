"use client"

import { useWallet } from "@/lib/use-wallet"
import { WalletErrorDisplay } from "./wallet-error"

interface TokenHoldingsProps {
  walletAddress: string
}

export function TokenHoldings({ walletAddress }: TokenHoldingsProps) {
  const { data: wallet, error, isLoading, mutate } = useWallet(walletAddress)

  if (isLoading) {
    return (
      <div
        className="rounded-lg p-4 md:p-6 border border-slate-700 animate-pulse"
        style={{ backgroundColor: "rgb(20, 15, 12)" }}
      >
        <div className="h-6 bg-slate-700 rounded w-32 mb-4" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-slate-700 rounded w-full" />
              <div className="h-2 bg-slate-700 rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return <WalletErrorDisplay error={error} onRetry={() => mutate()} />
  }

  if (!wallet?.tokenAccounts || wallet.tokenAccounts.length === 0) {
    return (
      <div className="rounded-lg p-4 md:p-6 border border-slate-700" style={{ backgroundColor: "rgb(20, 15, 12)" }}>
        <h3 className="text-lg font-semibold text-white mb-2">Top Holdings</h3>
        <p className="text-sm text-gray-400">No tokens found in this wallet</p>
      </div>
    )
  }

  const topTokens = wallet.tokenAccounts.slice(0, 4)
  const totalValue = topTokens.reduce((sum, t) => sum + (t.uiAmount || 0), 0)

  return (
    <div className="rounded-lg p-4 md:p-6 border border-slate-700" style={{ backgroundColor: "rgb(20, 15, 12)" }}>
      <h3 className="text-lg font-semibold text-white mb-2">Top Holdings</h3>
      <p className="text-sm text-gray-400 mb-6">Portfolio distribution</p>
      <div className="space-y-4">
        {topTokens.map((token, idx) => {
          const percentage = totalValue > 0 ? ((token.uiAmount || 0) / totalValue) * 100 : 0
          return (
            <div key={idx} className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-white text-sm">{token.tokenSymbol || "UNKNOWN"}</p>
                  <p className="text-xs text-gray-500">{token.tokenName || token.mint}</p>
                </div>
                <p className="text-sm text-white font-mono">{(token.uiAmount ?? 0).toFixed(2)}</p>
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 text-right">{percentage.toFixed(1)}%</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
