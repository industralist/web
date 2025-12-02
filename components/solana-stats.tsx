"use client"

import { useEffect, useState } from "react"
import { fetchSolanaNetworkStats } from "@/lib/solscan-client"

export function SolanaStats() {
  const [stats, setStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const networkStats = await fetchSolanaNetworkStats()
        setStats([
          { label: "SOL Supply", value: `${networkStats.solSupply}M`, subtext: "Circulating" },
          { label: "Current Epoch", value: networkStats.currentEpoch, subtext: "Network cycle" },
          { label: "Block Height", value: networkStats.blockHeight.toLocaleString(), subtext: "Latest slot" },
          { label: "Network TPS", value: networkStats.networkTps, subtext: "Transactions/sec" },
          { label: "Total Stake", value: networkStats.totalStake, subtext: "Network staked" },
          { label: "Avg Ping Time", value: networkStats.avgPingTime, subtext: "Network response" },
        ])
      } catch (error) {
        console.error("[v0] Error loading network stats:", error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
    // Refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Network Statistics</h2>
        <p className="text-gray-400">Real-time Solana blockchain metrics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="rounded-lg p-4 md:p-6 border border-slate-700 hover:border-orange-500/50 transition-colors"
            style={{ backgroundColor: "rgb(20, 15, 12)" }}
          >
            <p className="text-xs md:text-sm text-orange-500 font-semibold uppercase tracking-wider mb-2">
              {stat.label}
            </p>
            <p className="text-2xl md:text-3xl font-bold text-white mb-1">{loading ? "..." : stat.value}</p>
            <p className="text-xs md:text-sm text-gray-500">{stat.subtext}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
