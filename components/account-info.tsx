"use client"

import { ExternalLink } from "lucide-react"
import type { WalletData } from "@/lib/types"

interface AccountInfoProps {
  wallet: WalletData
  address: string
}

export function AccountInfo({ wallet, address }: AccountInfoProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 8)}...${addr.slice(-8)}`
  }

  const balance = wallet.portfolio?.solBalance ?? wallet.balance ?? 0
  const displayBalance = Math.max(0, Number.parseFloat(balance.toString()))
  const solPrice = 200
  const totalValue = displayBalance * solPrice

  return (
    <div className="rounded-xl border border-slate-700/50 overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50">
        <h2 className="text-2xl font-bold text-white mb-2">Account</h2>
        <div className="flex items-center gap-3">
          <code className="text-sm md:text-base font-mono text-cyan-400 break-all">{address}</code>
          <button
            onClick={() => copyToClipboard(address)}
            className="text-slate-400 hover:text-white transition-colors p-1"
            title="Copy address"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-0 md:gap-px border-t border-slate-700/50">
        {/* Overview Section - Left Column */}
        <div className="p-6 border-r border-b md:border-b-0 border-slate-700/50">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">Overview</h3>
          <div className="space-y-4">
            <div>
              <p className="text-slate-500 text-xs mb-1">Total Value</p>
              <p className="text-2xl font-bold text-white">${totalValue.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-1">SOL Balance</p>
              <p className="text-xl font-bold text-white">{displayBalance.toFixed(4)} SOL</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-1">Token Accounts</p>
              <p className="text-lg font-bold text-white">{wallet.tokenCount || 0}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-1">Last Activity</p>
              <p className="text-white font-semibold">
                {wallet.lastTransaction ? new Date(wallet.lastTransaction * 1000).toLocaleDateString() : "Never"}
              </p>
            </div>
          </div>
        </div>

        {/* More Info Section - Right Column */}
        <div className="p-6">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">More Info</h3>
          <div className="space-y-4">
            {/* isOnCurve */}
            <div>
              <p className="text-slate-500 text-xs mb-2">isOnCurve</p>
              <span className="inline-flex items-center px-3 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded border border-green-500/50">
                {wallet.accountMetadata?.isOnCurve ? "TRUE" : "FALSE"}
              </span>
            </div>

            {/* Stake */}
            <div>
              <p className="text-slate-500 text-xs mb-2">Stake</p>
              <p className="text-white font-semibold">{wallet.accountMetadata?.stake || "0"} SOL</p>
            </div>

            {/* Tags */}
            {wallet.accountMetadata?.tags && wallet.accountMetadata.tags.length > 0 && (
              <div>
                <p className="text-slate-500 text-xs mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {wallet.accountMetadata.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-slate-700/50 text-slate-300 text-xs font-semibold rounded border border-slate-600/50 hover:border-orange-500/30 transition-colors cursor-default"
                    >
                      {tag.startsWith("#") ? (
                        <span className="text-orange-400">#</span>
                      ) : (
                        <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Funded by */}
            {wallet.accountMetadata?.fundedBy && (
              <div>
                <p className="text-slate-500 text-xs mb-2">Funded by</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono text-cyan-400 break-all">
                    {formatAddress(wallet.accountMetadata.fundedBy)}
                  </code>
                  <a
                    href={`https://solscan.io/account/${wallet.accountMetadata.fundedBy}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-orange-400 transition-colors flex-shrink-0"
                    title="View on Solscan"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
