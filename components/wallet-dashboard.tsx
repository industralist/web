"use client"

import { useState } from "react"
import { useWallet } from "@/lib/use-wallet"
import { WalletDataSkeleton } from "./wallet-data-loader"
import { WalletErrorDisplay } from "./wallet-error"
import { TransactionTable } from "./transaction-table"
import { TrendingUp, TrendingDown } from "lucide-react"

interface WalletDashboardProps {
  walletAddress: string
}

type TabType = "transactions" | "transfers" | "defi" | "nft" | "balanceChanges" | "analytics" | "portfolio" | "stakes"

export function WalletDashboard({ walletAddress }: WalletDashboardProps) {
  const { data: wallet, error, isLoading, mutate } = useWallet(walletAddress)
  const [activeTab, setActiveTab] = useState<TabType>("transactions")
  const [page, setPage] = useState(1)
  const itemsPerPage = 10

  if (isLoading) return <WalletDataSkeleton />
  if (error) return <WalletErrorDisplay error={error} onRetry={() => mutate()} />
  if (!wallet) return null

  const isPositive = (wallet.balanceChange24h ?? 0) >= 0

  const renderTabContent = () => {
    const startIdx = (page - 1) * itemsPerPage
    const endIdx = startIdx + itemsPerPage

    switch (activeTab) {
      case "transactions":
        return (
          <TransactionTable
            transactions={wallet.transactions}
            page={page}
            itemsPerPage={itemsPerPage}
            onPageChange={setPage}
          />
        )
      case "transfers":
        return (
          <TransactionTable
            transactions={wallet.transfers || []}
            page={page}
            itemsPerPage={itemsPerPage}
            onPageChange={setPage}
          />
        )
      case "portfolio":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Portfolio Holdings</h3>
            {wallet.tokenAccounts && wallet.tokenAccounts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-gray-400">Token</th>
                      <th className="text-right py-3 px-4 text-gray-400">Balance</th>
                      <th className="text-right py-3 px-4 text-gray-400">Decimals</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wallet.tokenAccounts.slice(startIdx, endIdx).map((token, idx) => (
                      <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/50">
                        <td className="py-3 px-4 text-white font-mono text-xs">{token.mint}</td>
                        <td className="py-3 px-4 text-right text-white">{token.uiAmount.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right text-gray-400">{token.decimals}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400">No tokens found</p>
            )}
          </div>
        )
      case "analytics":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-slate-700 bg-slate-800/50">
              <p className="text-gray-400 text-sm mb-2">Total Transactions</p>
              <p className="text-2xl font-bold text-white">{wallet.analytics?.totalTransactions || 0}</p>
            </div>
            <div className="p-4 rounded-lg border border-slate-700 bg-slate-800/50">
              <p className="text-gray-400 text-sm mb-2">Total Transfers</p>
              <p className="text-2xl font-bold text-white">{wallet.analytics?.totalTransfers || 0}</p>
            </div>
            <div className="p-4 rounded-lg border border-slate-700 bg-slate-800/50">
              <p className="text-gray-400 text-sm mb-2">Unique Programs</p>
              <p className="text-2xl font-bold text-white">{wallet.analytics?.uniquePrograms || 0}</p>
            </div>
          </div>
        )
      default:
        return <p className="text-gray-400">Tab content coming soon</p>
    }
  }

  const tabs: Array<{ id: TabType; label: string }> = [
    { id: "transactions", label: "Transactions" },
    { id: "transfers", label: "Transfers" },
    { id: "defi", label: "Defi Activities" },
    { id: "nft", label: "NFT Activities" },
    { id: "balanceChanges", label: "Balance Changes" },
    { id: "analytics", label: "Analytics" },
    { id: "portfolio", label: "Portfolio" },
    { id: "stakes", label: "Stake Accounts" },
  ]

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div
          className="rounded-lg p-6 md:p-8 border border-orange-500/30"
          style={{ backgroundColor: "rgb(20, 15, 12)" }}
        >
          <p className="text-gray-400 text-xs md:text-sm mb-2">Total SOL Balance</p>
          <h2 className="text-4xl font-bold text-white mb-4">{wallet.balance.toFixed(2)} SOL</h2>
          <div className={`flex items-center gap-2 ${isPositive ? "text-green-500" : "text-red-500"}`}>
            {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            <span className="font-semibold">
              {isPositive ? "+" : ""}
              {wallet.balanceChange24h?.toFixed(2) || "0.00"} SOL
            </span>
          </div>
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

      {/* Tabs Section */}
      <div className="border-b border-slate-700">
        <div className="flex gap-2 overflow-x-auto pb-0 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                setPage(1)
              }}
              className={`px-4 py-3 whitespace-nowrap font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? "border-orange-500 text-orange-500"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="border border-slate-700 rounded-lg p-6" style={{ backgroundColor: "rgb(20, 15, 12)" }}>
        {renderTabContent()}
      </div>
    </div>
  )
}
