"use client"

import { useState } from "react"
import { ExternalLink, Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { useWallet } from "@/lib/use-wallet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import type { Transaction, Transfer } from "@/lib/types"

interface TransactionExplorerProps {
  walletAddress: string
  onTransactionClick?: (transaction: Transaction | Transfer) => void
}

type TabType = "transactions" | "transfers" | "defi" | "nft" | "balanceChanges" | "analytics" | "portfolio" | "stakes"

const ITEMS_PER_PAGE = 10

export function TransactionExplorer({ walletAddress, onTransactionClick }: TransactionExplorerProps) {
  const { data: wallet, isLoading, error } = useWallet(walletAddress)
  const [activeTab, setActiveTab] = useState<TabType>("transactions")
  const [currentPage, setCurrentPage] = useState(1)

  const tabs: { id: TabType; label: string; count?: number }[] = [
    { id: "transactions", label: "Transactions", count: wallet?.transactionCount },
    { id: "transfers", label: "Transfers", count: wallet?.transfers.length },
    { id: "defi", label: "Defi Activities", count: wallet?.defiActivities?.length || 0 },
    { id: "nft", label: "NFT Activities", count: wallet?.nftActivities?.length || 0 },
    { id: "balanceChanges", label: "Balance Changes", count: wallet?.balanceChanges?.length },
    { id: "analytics", label: "Analytics" },
    { id: "portfolio", label: "Portfolio" },
    { id: "stakes", label: "Stake Accounts", count: wallet?.stakeAccounts?.length || 0 },
  ]

  const getTabData = (): (Transaction | Transfer)[] => {
    switch (activeTab) {
      case "transfers":
        return wallet?.transfers || []
      case "defi":
        return (wallet?.defiActivities as Transaction[]) || []
      case "nft":
        return (wallet?.nftActivities as Transaction[]) || []
      case "balanceChanges":
        return wallet?.balanceChanges || []
      case "stakes":
        return (wallet?.stakeAccounts as Transaction[]) || []
      case "transactions":
      default:
        return wallet?.transactions || []
    }
  }

  const tabData = getTabData()

  const totalItems = tabData.length
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedData = tabData.slice(startIndex, endIndex)

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    setCurrentPage(1)
  }

  const getSignature = (item: Transaction | Transfer): string => {
    return (item as any).signature || ""
  }

  const getTimestamp = (item: Transaction | Transfer): number => {
    return (item as any).timestamp || 0
  }

  const isTransaction = (item: Transaction | Transfer): item is Transaction => {
    return "type" in item && (item as any).type !== undefined
  }

  if (isLoading) {
    return (
      <div className="rounded-xl p-6 border border-slate-700/50 flex items-center justify-center min-h-96 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (error || !wallet) {
    return (
      <div className="rounded-xl p-6 border border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-white mb-2">Transaction Explorer</h3>
        <p className="text-sm text-gray-400">{error ? "Failed to load transactions" : "No data available"}</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-700/50 overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm animate-fade-in">
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50">
        <h3 className="text-xl font-bold text-white mb-4">Transaction Explorer</h3>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/20"
                  : "bg-slate-800/50 text-gray-400 hover:bg-slate-700/50 border border-slate-700/50"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-2 text-xs opacity-75">({tab.count})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === "analytics" ? (
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="rounded-lg p-4 bg-slate-800/50 border border-slate-700/50 hover:border-orange-500/30 transition-colors">
              <p className="text-gray-400 text-sm mb-1">Total Transactions</p>
              <p className="text-2xl font-bold text-white">{wallet?.analytics?.totalTransactions || 0}</p>
            </div>
            <div className="rounded-lg p-4 bg-slate-800/50 border border-slate-700/50 hover:border-orange-500/30 transition-colors">
              <p className="text-gray-400 text-sm mb-1">Total Transfers</p>
              <p className="text-2xl font-bold text-white">{wallet?.analytics?.totalTransfers || 0}</p>
            </div>
            <div className="rounded-lg p-4 bg-slate-800/50 border border-slate-700/50 hover:border-orange-500/30 transition-colors">
              <p className="text-gray-400 text-sm mb-1">Unique Programs</p>
              <p className="text-2xl font-bold text-white">{wallet?.analytics?.uniquePrograms || 0}</p>
            </div>
          </div>
        </div>
      ) : activeTab === "portfolio" ? (
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg p-4 bg-slate-800/50 border border-slate-700/50 hover:border-orange-500/30 transition-colors">
              <p className="text-gray-400 text-sm mb-1">SOL Balance</p>
              <p className="text-2xl font-bold text-white">{(wallet?.portfolio?.solBalance ?? 0).toFixed(4)} SOL</p>
            </div>
            <div className="rounded-lg p-4 bg-slate-800/50 border border-slate-700/50 hover:border-orange-500/30 transition-colors">
              <p className="text-gray-400 text-sm mb-1">Token Balance</p>
              <p className="text-2xl font-bold text-white">
                {wallet?.portfolio?.tokenBalance ?? wallet?.tokenCount ?? 0}
              </p>
            </div>
            <div className="rounded-lg p-4 bg-slate-800/50 border border-slate-700/50 hover:border-orange-500/30 transition-colors md:col-span-2">
              <p className="text-gray-400 text-sm mb-1">Total Value</p>
              <p className="text-2xl font-bold text-white">${wallet?.portfolio?.totalValue?.toFixed(2) || "0.00"}</p>
              <p className="text-xs text-gray-500 mt-1">Based on SOL balance (token prices unavailable)</p>
            </div>
          </div>

          {wallet?.accountMetadata && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-700/50">
              <div className="rounded-lg p-4 bg-slate-800/50 border border-slate-700/50">
                <p className="text-gray-400 text-sm mb-1">isOnCurve</p>
                <span className="inline-block px-2 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded border border-green-500/50">
                  {wallet.accountMetadata.isOnCurve ? "TRUE" : "FALSE"}
                </span>
              </div>
              <div className="rounded-lg p-4 bg-slate-800/50 border border-slate-700/50">
                <p className="text-gray-400 text-sm mb-1">Stake</p>
                <p className="text-lg font-bold text-white">{wallet.accountMetadata.stake} SOL</p>
              </div>
              {wallet.accountMetadata.tags && wallet.accountMetadata.tags.length > 0 && (
                <div className="rounded-lg p-4 bg-slate-800/50 border border-slate-700/50 md:col-span-2">
                  <p className="text-gray-400 text-sm mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {wallet.accountMetadata.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-block px-2 py-1 bg-slate-700/50 text-slate-300 text-xs font-semibold rounded border border-slate-600/50"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {wallet.accountMetadata.fundedBy && (
                <div className="rounded-lg p-4 bg-slate-800/50 border border-slate-700/50 md:col-span-2">
                  <p className="text-gray-400 text-sm mb-1">Funded by</p>
                  <p className="font-mono text-xs text-cyan-400 break-all">{wallet.accountMetadata.fundedBy}</p>
                </div>
              )}
            </div>
          )}

          <div className="mt-6">
            <h4 className="text-white font-semibold mb-3">Holdings</h4>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {wallet?.portfolio?.holdings && wallet.portfolio.holdings.length > 0 ? (
                wallet.portfolio.holdings.map((holding, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-orange-500/30 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-medium truncate">
                        {holding.tokenSymbol && holding.tokenSymbol !== "UNKNOWN"
                          ? holding.tokenSymbol
                          : holding.tokenName || "Unknown Token"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {holding.tokenName && holding.tokenName !== "UNKNOWN"
                          ? holding.tokenName
                          : `Mint: ${holding.mint.slice(0, 8)}...${holding.mint.slice(-8)}`}
                      </p>
                    </div>
                    <p className="text-white font-mono text-right ml-2">{holding.uiAmount?.toFixed(2) || "0.00"}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-400">
                  <p className="text-sm">No token holdings found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-700/50 hover:bg-transparent">
                  <TableHead className="px-4 py-3 text-orange-400 font-semibold text-left">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Signature
                    </div>
                  </TableHead>
                  <TableHead className="px-4 py-3 text-orange-400 font-semibold text-left">Time</TableHead>
                  <TableHead className="px-4 py-3 text-orange-400 font-semibold text-left">Type</TableHead>
                  <TableHead className="px-4 py-3 text-orange-400 font-semibold text-left">Details</TableHead>
                  <TableHead className="px-4 py-3 text-orange-400 font-semibold text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((item, idx) => (
                    <TableRow
                      key={`${getSignature(item)}-${idx}`}
                      className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors last:border-0 cursor-pointer group"
                      onClick={() => onTransactionClick?.(item)}
                    >
                      <TableCell className="px-4 py-3">
                        <span className="font-mono text-xs md:text-sm text-orange-400 group-hover:text-orange-300 transition flex items-center gap-2">
                          {getSignature(item).slice(0, 8)}...{getSignature(item).slice(-8)}
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition" />
                        </span>
                      </TableCell>

                      <TableCell className="px-4 py-3 text-gray-400 text-xs md:text-sm whitespace-nowrap">
                        {formatTimeAgo(getTimestamp(item) * 1000)}
                      </TableCell>

                      <TableCell className="px-4 py-3">
                        <span className="inline-block px-2 py-1 bg-slate-800/50 text-white text-xs font-semibold rounded capitalize border border-slate-700/50">
                          {isTransaction(item) ? item.type : "transfer"}
                        </span>
                      </TableCell>

                      <TableCell className="px-4 py-3">
                        <span className="font-mono text-xs md:text-sm text-cyan-400 group-hover:text-cyan-300 transition">
                          {isTransaction(item)
                            ? `${item.from.slice(0, 4)}...${item.from.slice(-4)}`
                            : `${(item as Transfer).from.slice(0, 4)}...${(item as Transfer).from.slice(-4)}`}
                        </span>
                      </TableCell>

                      <TableCell className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-mono text-xs md:text-sm font-semibold text-blue-400">
                            {isTransaction(item)
                              ? `${item.amount.toFixed(6)}`
                              : `${Number.parseFloat(item.amount).toFixed(6)}`}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="px-4 py-6 text-center text-gray-400">
                      No {activeTab} found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-700/50 flex items-center justify-between flex-wrap gap-4">
              <div className="text-sm text-gray-400">
                Showing {paginatedData.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, totalItems)} of{" "}
                {totalItems} items
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i
                    if (page > totalPages) return null
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-2 py-1 rounded text-sm transition-all ${
                          page === currentPage
                            ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                            : "text-gray-400 hover:bg-slate-700/50"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                </div>

                <Button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  variant="ghost"
                  size="m"
                  className="text-gray-400 hover:text-white disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function formatTimeAgo(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return `${seconds}s ago`
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString()
}
