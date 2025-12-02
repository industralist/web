"use client"

import type { Transaction, Transfer } from "@/lib/types"
import { ExternalLink } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface TransactionTableProps {
  transactions: (Transaction | Transfer)[]
  page: number
  itemsPerPage: number
  onPageChange: (page: number) => void
}

export function TransactionTable({ transactions, page, itemsPerPage, onPageChange }: TransactionTableProps) {
  const totalPages = Math.ceil(transactions.length / itemsPerPage)
  const startIdx = (page - 1) * itemsPerPage
  const endIdx = startIdx + itemsPerPage
  const currentTransactions = transactions.slice(startIdx, endIdx)

  const formatTime = (timestamp: number) => {
    try {
      return formatDistanceToNow(new Date(timestamp * 1000), { addSuffix: true })
    } catch {
      return "Unknown"
    }
  }

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`
  }

  if (transactions.length === 0) {
    return <p className="text-gray-400 text-center py-8">No transactions found</p>
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-3 px-4 text-gray-400">Signature</th>
              <th className="text-left py-3 px-4 text-gray-400">Time</th>
              <th className="text-left py-3 px-4 text-gray-400">Type</th>
              <th className="text-right py-3 px-4 text-gray-400">Amount</th>
              <th className="text-center py-3 px-4 text-gray-400">Status</th>
              <th className="text-center py-3 px-4 text-gray-400">Link</th>
            </tr>
          </thead>
          <tbody>
            {currentTransactions.map((tx, idx) => (
              <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                <td className="py-3 px-4 text-white font-mono text-xs">
                  {truncateAddress((tx as Transaction).signature || "")}
                </td>
                <td className="py-3 px-4 text-gray-400 text-xs">{formatTime((tx as Transaction).timestamp || 0)}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 rounded text-xs font-medium bg-blue-900/30 text-blue-400">
                    {(tx as Transaction).type || "transfer"}
                  </span>
                </td>
                <td className="py-3 px-4 text-right text-white font-medium">
                  {typeof (tx as Transaction).amount === "number"
                    ? (tx as Transaction).amount.toFixed(6)
                    : (tx as Transfer).amount}{" "}
                  SOL
                </td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      (tx as Transaction).status === "success"
                        ? "bg-green-900/30 text-green-400"
                        : "bg-yellow-900/30 text-yellow-400"
                    }`}
                  >
                    {(tx as Transaction).status || "pending"}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <a
                    href={`https://solscan.io/tx/${(tx as Transaction).signature || ""}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-500 hover:text-orange-400 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 mx-auto" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-700">
        <span className="text-sm text-gray-400">
          Showing {startIdx + 1} to {Math.min(endIdx, transactions.length)} of {transactions.length}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-2 rounded border border-slate-700 text-sm text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = Math.max(1, page - 2) + i
            if (pageNum > totalPages) return null
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`px-3 py-2 rounded text-sm transition-colors ${
                  pageNum === page
                    ? "bg-orange-500 text-white"
                    : "border border-slate-700 text-gray-400 hover:text-white"
                }`}
              >
                {pageNum}
              </button>
            )
          })}
          <button
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-3 py-2 rounded border border-slate-700 text-sm text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
