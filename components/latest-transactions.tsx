"use client"

export function LatestTransactions() {
  // Mock latest transactions - would be fetched from Helius/Solscan
  const transactions = [
    {
      sig: "5xA9qQ2k...",
      time: "2 seconds ago",
      type: "Swap",
      amount: "100 SOL → 24,500 USDC",
      status: "success",
      from: "JUP...",
    },
    {
      sig: "3kL2mR7p...",
      time: "15 seconds ago",
      type: "Transfer",
      amount: "50 SOL",
      status: "success",
      from: "Phantom",
    },
    {
      sig: "9xN4cT1w...",
      time: "1 minute ago",
      type: "Stake",
      amount: "1,000 SOL",
      status: "success",
      from: "Marinade",
    },
    {
      sig: "7bM5jQ9x...",
      time: "2 minutes ago",
      type: "NFT Sale",
      amount: "2.5 SOL",
      status: "success",
      from: "Magic Eden",
    },
    {
      sig: "2kP8rS3v...",
      time: "3 minutes ago",
      type: "Swap",
      amount: "500 USDC → 2.1 SOL",
      status: "success",
      from: "Orca",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Latest Transactions</h2>
        <p className="text-gray-400">Most recent on-chain activity</p>
      </div>

      <div
        className="overflow-x-auto rounded-lg border border-slate-700"
        style={{ backgroundColor: "rgb(20, 15, 12)" }}
      >
        <table className="w-full text-sm md:text-base">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="px-4 md:px-6 py-3 md:py-4 text-left text-orange-500 font-semibold">Signature</th>
              <th className="px-4 md:px-6 py-3 md:py-4 text-left text-orange-500 font-semibold">Type</th>
              <th className="px-4 md:px-6 py-3 md:py-4 text-left text-orange-500 font-semibold">Amount</th>
              <th className="px-4 md:px-6 py-3 md:py-4 text-left text-orange-500 font-semibold">Time</th>
              <th className="px-4 md:px-6 py-3 md:py-4 text-center text-orange-500 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, idx) => (
              <tr key={idx} className="border-b border-slate-800 last:border-0 hover:bg-slate-900/50 transition">
                <td className="px-4 md:px-6 py-3 md:py-4">
                  <span className="font-mono text-xs md:text-sm text-orange-400 hover:text-orange-300 cursor-pointer">
                    {tx.sig}
                  </span>
                </td>
                <td className="px-4 md:px-6 py-3 md:py-4">
                  <span className="px-2 py-1 bg-slate-800 text-white text-xs font-semibold rounded">{tx.type}</span>
                </td>
                <td className="px-4 md:px-6 py-3 md:py-4 text-white font-mono text-xs md:text-sm">{tx.amount}</td>
                <td className="px-4 md:px-6 py-3 md:py-4 text-gray-400 text-xs md:text-sm">{tx.time}</td>
                <td className="px-4 md:px-6 py-3 md:py-4 text-center">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded">
                    ✓ {tx.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
