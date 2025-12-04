"use client"

import { X, Copy, ExternalLink, Clock, User, Hash, CheckCircle, ChevronDown } from "lucide-react"
import type { Transaction } from "@/lib/types"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface TransactionDetailModalProps {
  transaction: Transaction
  onClose: () => void
}

export function TransactionDetailModal({ transaction, onClose }: TransactionDetailModalProps) {
  const [copied, setCopied] = useState("")
  const [expandedSections, setExpandedSections] = useState({
    accounts: true,
    instructions: false,
  })

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(""), 2000)
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000)
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "UTC",
    })
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border border-slate-700/50 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-8 border-b border-slate-700/30 bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-sm">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              Transaction Inspector
            </h2>
            <p className="text-xs text-gray-500 mt-1">Complete transaction details and analysis</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Overview Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Signature */}
              <div className="md:col-span-2 space-y-2">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-orange-400" />
                  <label className="text-sm font-semibold text-slate-300">Transaction Signature</label>
                </div>
                <div
                  onClick={() => copyToClipboard(transaction.signature, "sig")}
                  className="flex items-center gap-3 bg-slate-800/70 p-4 rounded-lg border border-slate-700/50 hover:border-orange-500/50 transition-all cursor-pointer group"
                >
                  <code className="flex-1 font-mono text-xs text-orange-400 break-all">{transaction.signature}</code>
                  <Copy className="w-4 h-4 text-slate-400 group-hover:text-orange-400 transition-colors flex-shrink-0" />
                </div>
              </div>

              {/* Timestamp */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <label className="text-sm font-semibold text-slate-300">Timestamp</label>
                </div>
                <p className="text-white font-mono text-sm">{formatDate(transaction.timestamp)}</p>
                <p className="text-xs text-gray-500">{new Date(transaction.timestamp * 1000).toUTCString()}</p>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <label className="text-sm font-semibold text-slate-300">Status</label>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="font-medium text-green-400">Finalized</span>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-800/30 border border-slate-700/30 rounded-lg p-4">
            {/* Amount */}
            <div>
              <p className="text-gray-500 text-xs mb-1">Amount</p>
              <p
                className={`text-xl font-bold font-mono ${transaction.type === "send" ? "text-red-400" : "text-green-400"}`}
              >
                {transaction.type === "send" ? "-" : "+"}
                {transaction.amount.toFixed(9)} SOL
              </p>
            </div>

            {/* Fee */}
            <div>
              <p className="text-gray-500 text-xs mb-1">Transaction Fee</p>
              <p className="text-white font-mono text-lg">{transaction.fee?.toFixed(9) || "0.000005"} SOL</p>
            </div>

            {/* Type */}
            <div>
              <p className="text-gray-500 text-xs mb-1">Type</p>
              <div className="inline-block px-3 py-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-lg capitalize text-orange-400 text-sm font-semibold">
                {transaction.type}
              </div>
            </div>
          </div>

          {/* From/To Section */}
          <div className="space-y-4">
            {/* From Address */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-cyan-400" />
                <label className="text-sm font-semibold text-slate-300">From Address</label>
              </div>
              <div
                onClick={() => copyToClipboard(transaction.from, "from")}
                className="flex items-center gap-2 bg-slate-800/70 p-3 rounded-lg border border-slate-700/50 hover:border-cyan-500/50 transition-all cursor-pointer group"
              >
                <code className="flex-1 font-mono text-xs text-cyan-400 break-all">{transaction.from}</code>
                <Copy className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
              </div>
            </div>

            {/* To Address (if available) */}
            {transaction.to && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-400" />
                  <label className="text-sm font-semibold text-slate-300">To Address</label>
                </div>
                <div
                  onClick={() => copyToClipboard(transaction.to, "to")}
                  className="flex items-center gap-2 bg-slate-800/70 p-3 rounded-lg border border-slate-700/50 hover:border-purple-500/50 transition-all cursor-pointer group"
                >
                  <code className="flex-1 font-mono text-xs text-purple-400 break-all">{transaction.to}</code>
                  <Copy className="w-4 h-4 text-slate-400 group-hover:text-purple-400 transition-colors flex-shrink-0" />
                </div>
              </div>
            )}
          </div>

          {/* Account Inputs Section */}
          <div className="border border-slate-700/30 rounded-lg overflow-hidden bg-slate-800/20">
            <button
              onClick={() => toggleSection("accounts")}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
            >
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Account Inputs</h3>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${expandedSections.accounts ? "rotate-180" : ""}`}
              />
            </button>
            {expandedSections.accounts && (
              <div className="border-t border-slate-700/30 p-4 space-y-2">
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-gray-400 text-xs font-semibold uppercase">
                    <div>Address</div>
                    <div>Change (SOL)</div>
                    <div>Post Balance (SOL)</div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-3 bg-slate-800/40 rounded-lg border border-slate-700/30">
                    <code className="font-mono text-xs text-cyan-400 break-all">{transaction.from}</code>
                    <span className={`font-mono ${transaction.type === "send" ? "text-red-400" : "text-green-400"}`}>
                      {transaction.type === "send" ? "-" : "+"}
                      {transaction.amount.toFixed(9)}
                    </span>
                    <span className="text-slate-300">-</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Note: Full balance details available on Solscan</p>
                </div>
              </div>
            )}
          </div>

          {/* Summary Box */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 space-y-3">
            <h4 className="text-sm font-semibold text-slate-300">Transaction Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500 text-xs">Execution</p>
                <p className="text-white font-mono">Successful</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Total Change</p>
                <p
                  className={`font-mono font-semibold ${transaction.type === "send" ? "text-red-400" : "text-green-400"}`}
                >
                  {transaction.type === "send" ? "-" : "+"}
                  {(transaction.amount + (transaction.fee || 0)).toFixed(9)} SOL
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Finality</p>
                <p className="text-white">Finalized</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Network</p>
                <p className="text-white">Mainnet</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-700/50 grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              onClick={() => copyToClipboard(transaction.signature, "all")}
              className="w-full bg-slate-700/50 hover:bg-slate-700 text-white font-semibold rounded-lg py-2 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy Signature
            </Button>
            <Button
              onClick={() => window.open(`https://solscan.io/tx/${transaction.signature}`, "_blank")}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-lg py-2 transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              View on Solscan
              <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
