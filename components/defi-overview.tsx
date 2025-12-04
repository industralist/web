"use client"

export function DefiOverview() {
  // Mock DeFi protocols - would be fetched from Helius/Solscan
  const protocols = [
    { name: "Jupiter", type: "DEX", volume24h: "$1.24B", tvl: "$42.3M", users: "125K" },
    { name: "Raydium", type: "AMM", volume24h: "$856M", tvl: "$28.9M", users: "89K" },
    { name: "Magic Eden", type: "NFT", volume24h: "$312M", tvl: "$18.5M", users: "234K" },
    { name: "Marinade", type: "Staking", volume24h: "$234M", tvl: "$3.2B", users: "12K" },
    { name: "Orca", type: "DEX", volume24h: "$187M", tvl: "$156M", users: "45K" },
    { name: "Phantom", type: "Wallet", volume24h: "$1.1B", tvl: "N/A", users: "5.2M" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Top DeFi Protocols</h2>
        <p className="text-gray-400">Most active protocols by 24h volume</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {protocols.map((protocol, idx) => (
          <div
            key={idx}
            className="rounded-lg p-4 md:p-6 border border-slate-700 hover:border-orange-500/50 transition-colors"
            style={{ backgroundColor: "rgb(20, 15, 12)" }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg md:text-xl font-bold text-white">{protocol.name}</h3>
                <span className="text-xs text-orange-500 font-semibold uppercase">{protocol.type}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">24h Volume</p>
                <p className="font-mono font-semibold text-white text-sm">{protocol.volume24h}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">TVL</p>
                <p className="font-mono font-semibold text-white text-sm">{protocol.tvl}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Active Users</p>
                <p className="font-mono font-semibold text-white text-sm">{protocol.users}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
