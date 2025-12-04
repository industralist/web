"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useWallet } from "@/lib/use-wallet"

interface ActivityChartProps {
  walletAddress: string
}

export function ActivityChart({ walletAddress }: ActivityChartProps) {
  const { data: walletData, isLoading } = useWallet(walletAddress)

  // Generate activity data from transactions
  const getActivityData = () => {
    if (!walletData?.transactions || walletData.transactions.length === 0) {
      return Array.from({ length: 7 }, (_, i) => ({
        time: `Day ${i + 1}`,
        transactions: 0,
      }))
    }

    // Group transactions by day (last 7 days)
    const now = Date.now()
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000
    const dailyActivity: { [key: string]: number } = {}

    // Initialize all 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000)
      const dayKey = date.toLocaleDateString()
      dailyActivity[dayKey] = 0
    }

    // Count transactions per day
    walletData.transactions.forEach((tx) => {
      const txDate = new Date(tx.timestamp * 1000)
      const dayKey = txDate.toLocaleDateString()
      if (dailyActivity[dayKey] !== undefined) {
        dailyActivity[dayKey]++
      }
    })

    // Convert to chart format
    return Object.entries(dailyActivity).map((entry, idx) => ({
      time: `Day ${idx + 1}`,
      transactions: entry[1],
    }))
  }

  const chartData = getActivityData()

  return (
    <div className="rounded-lg p-4 md:p-6 border border-slate-700" style={{ backgroundColor: "rgb(20, 15, 12)" }}>
      <h3 className="text-lg font-semibold text-white mb-2">Activity Over Time</h3>
      <p className="text-sm text-gray-400 mb-6">Last 7 days transaction activity</p>
      {isLoading ? (
        <div className="h-[300px] flex items-center justify-center text-gray-400">Loading activity data...</div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" />
            <YAxis stroke="rgba(255,255,255,0.5)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(0,0,0,0.8)",
                border: "1px solid rgba(255,165,0,0.3)",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#fff" }}
            />
            <Line
              type="monotone"
              dataKey="transactions"
              stroke="#ff6b35"
              strokeWidth={2}
              dot={{ fill: "#ff6b35", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
