"use client"

import { ExternalLink, Eye, ArrowUpRight, ArrowDownLeft } from "lucide-react"
import { useWallet } from "@/lib/use-wallet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface TransactionListProps {
  walletAddress: string
}

export function TransactionList({ walletAddress }: TransactionListProps) {
  const { data: wallet, isLoading, error } = useWallet(walletAddress)

  if (isLoading) {
    return (
      <div
        className="rounded-lg p-4 md:p-6 border border-slate-700 flex items-center justify-center min-h-96"
        style={{ backgroundColor: "rgb(20, 15, 12)" }}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (error || !wallet?.transactions || wallet.transactions.length === 0) {
    return (
      <div className="rounded-lg p-4 md:p-6 border border-slate-700" style={{ backgroundColor: "rgb(20, 15, 12)" }}>
        <h3 className="text-lg font-semibold text-white mb-2">Recent Transactions</h3>
        <p className="text-sm text-gray-400">
          {error ? "Failed to load transactions" : "No transactions found for this wallet"}
        </p>
      </div>
    )
  }

  const transactions = wallet.transactions.slice(0, 20)

  return (
    <div className="rounded-lg border border-slate-700 overflow-hidden" style={{ backgroundColor: "rgb(20, 15, 12)" }}>
      <div className="p-4 md:p-6 border-b border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-1">Recent Transactions</h3>
        <p className="text-sm text-gray-400">Last {transactions.length} transactions</p>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-700 hover:bg-transparent">
              <TableHead className="px-4 py-3 text-orange-500 font-semibold text-left">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Signature
                </div>
              </TableHead>
              <TableHead className="px-4 py-3 text-orange-500 font-semibold text-left">Time</TableHead>
              <TableHead className="px-4 py-3 text-orange-500 font-semibold text-left">Instructions</TableHead>
              <TableHead className="px-4 py-3 text-orange-500 font-semibold text-left">By</TableHead>
              <TableHead className="px-4 py-3 text-orange-500 font-semibold text-right">Value (SOL)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow
                key={tx.signature}
                className="border-b border-slate-800 hover:bg-slate-900/50 transition-colors last:border-0"
              >
                {/* Signature Column */}
                <TableCell className="px-4 py-3">
                  <a
                    href={`https://solscan.io/tx/${tx.signature}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs md:text-sm text-orange-400 hover:text-orange-300 transition flex items-center gap-2 group"
                  >
                    {tx.signature.slice(0, 8)}...{tx.signature.slice(-8)}
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition" />
                  </a>
                </TableCell>

                {/* Time Column */}
                <TableCell className="px-4 py-3 text-gray-400 text-xs md:text-sm whitespace-nowrap">
                  {formatTimeAgo(tx.timestamp * 1000)}
                </TableCell>

                {/* Instructions Column */}
                <TableCell className="px-4 py-3">
                  <span className="inline-block px-2 py-1 bg-slate-800 text-white text-xs font-semibold rounded capitalize">
                    {tx.type}
                  </span>
                </TableCell>

                {/* By Column */}
                <TableCell className="px-4 py-3">
                  <a
                    href={`https://solscan.io/account/${tx.from}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs md:text-sm text-cyan-400 hover:text-cyan-300 transition"
                  >
                    {tx.from.slice(0, 4)}...{tx.from.slice(-4)}
                  </a>
                </TableCell>

                {/* Value Column */}
                <TableCell className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span
                      className={`font-mono text-xs md:text-sm font-semibold ${tx.type === "send" ? "text-red-400" : "text-green-400"}`}
                    >
                      {tx.type === "send" ? "-" : "+"}
                      {tx.amount.toFixed(6)}
                    </span>
                    {tx.type === "send" ? (
                      <ArrowUpRight className="w-4 h-4 text-red-400" />
                    ) : (
                      <ArrowDownLeft className="w-4 h-4 text-green-400" />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="p-4 border-t border-slate-700 text-center">
        <a
          href={`https://solscan.io/account/${walletAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-orange-500 hover:text-orange-400 font-semibold text-sm transition inline-flex items-center gap-2"
        >
          View All Transactions on Solscan
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
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
