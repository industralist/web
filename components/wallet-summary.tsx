"use client"

import { Wallet, Coins, Activity, DollarSign } from "lucide-react"
import { useWallet } from "@/lib/use-wallet"

interface WalletSummaryProps {
  walletAddress: string
}

export function WalletSummary({ walletAddress }: WalletSummaryProps) {
  const { data: wallet, isLoading } = useWallet(walletAddress)

  if (isLoading || !wallet) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-slate-800/50 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  const balance = wallet.portfolio?.solBalance ?? wallet.balance ?? 0
  const displayBalance = Math.max(0, Number.parseFloat(balance.toString()))
  const solPrice = 200 // Current SOL price, can be updated dynamically
  const totalValue = displayBalance * solPrice

  const stats = [
    {
      icon: Wallet,
      label: "SOL Balance",
      value: `${displayBalance.toFixed(4)} SOL`,
      subtext:
        displayBalance > 0
          ? `${displayBalance > 0.0001 ? "≈" : ""} $${Math.max(0, displayBalance * solPrice).toFixed(2)}`
          : "No balance",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Coins,
      label: "Tokens",
      value: wallet.tokenCount ?? 0,
      subtext: "in portfolio",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: DollarSign,
      label: "Portfolio Value",
      value: `$${totalValue.toFixed(2)}`,
      subtext: "SOL balance value",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: Activity,
      label: "Last Activity",
      value: wallet.lastTransaction ? new Date(wallet.lastTransaction * 1000).toLocaleDateString() : "Never",
      subtext: "on blockchain network",
      color: "from-green-500 to-emerald-500",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon
        return (
          <div
            key={idx}
            className="group relative overflow-hidden rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 backdrop-blur-sm hover:border-slate-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-slate-950/50 animate-scale-in"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
            />

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <Icon className="w-6 h-6 text-slate-400 group-hover:text-slate-300 transition-colors" />
              </div>

              <p className="text-sm text-slate-400 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
              {stat.subtext && <p className="text-xs text-slate-500">{stat.subtext}</p>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
