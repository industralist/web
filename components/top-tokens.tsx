"use client"

import { useEffect, useState } from "react"

export function TopTokens() {
  const [tokens, setTokens] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTokens = async () => {
      try {
        const response = await fetch("/api/trending-tokens")
        const result = await response.json()

        if (result.data && Array.isArray(result.data)) {
          setTokens(result.data)
        } else {
          console.error("[v0] Invalid trending tokens response:", result)
          setTokens([])
        }
      } catch (error) {
        console.error("[v0] Error loading trending tokens:", error)
        setTokens([])
      } finally {
        setLoading(false)
      }
    }

    loadTokens()
    // Refresh tokens every 2 minutes
    const interval = setInterval(loadTokens, 120000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Top Tokens</h2>
        <p className="text-gray-400">Blockchain ecosystem trending tokens</p>
      </div>

      <div
        className="overflow-x-auto rounded-lg border border-slate-700"
        style={{ backgroundColor: "rgb(20, 15, 12)" }}
      >
        <table className="w-full text-sm md:text-base">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="px-4 md:px-6 py-3 md:py-4 text-left text-orange-500 font-semibold">Token</th>
              <th className="px-4 md:px-6 py-3 md:py-4 text-left text-orange-500 font-semibold">Price</th>
              <th className="px-4 md:px-6 py-3 md:py-4 text-left text-orange-500 font-semibold">Market Cap</th>
              <th className="px-4 md:px-6 py-3 md:py-4 text-right text-orange-500 font-semibold">24h Change</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 md:px-6 py-8 text-center text-gray-400">
                  Loading trending tokens...
                </td>
              </tr>
            ) : tokens.length > 0 ? (
              tokens.map((token, idx) => (
                <tr key={idx} className="border-b border-slate-800 last:border-0 hover:bg-slate-900/50 transition">
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <div>
                      <p className="font-semibold text-white">{token.symbol || "N/A"}</p>
                      <p className="text-xs md:text-sm text-gray-400">{token.name || ""}</p>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-white font-mono">${token.price || "0.00"}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-gray-300">{token.marketCap || "N/A"}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-right">
                    <span className={`font-semibold ${token.positive ? "text-green-500" : "text-red-500"}`}>
                      {token.positive ? "+" : ""}
                      {token.change24h || "0.00"}%
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 md:px-6 py-8 text-center text-gray-400">
                  Unable to load trending tokens. Please try again.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
