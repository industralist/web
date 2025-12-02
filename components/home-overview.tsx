"use client"

import { BarChart3, Activity, Clock, Info } from "lucide-react"

export function HomeOverview() {
  const sections = [
    {
      icon: BarChart3,
      title: "Network Statistics",
      description: "Real-time Solana blockchain metrics and performance indicators",
      items: ["Block Height", "Slot Time", "Epoch Progress", "Network Load"],
    },
    {
      icon: Activity,
      title: "Latest Transactions",
      description: "Monitor recent activity and transaction patterns on the network",
      items: ["Signature Explorer", "Status Tracking", "Fee Analysis", "Smart Contracts"],
    },
    {
      icon: Clock,
      title: "Historical Data",
      description: "Analyze trends and historical performance metrics",
      items: ["24h Charts", "Price History", "Volume Trends", "Archive Access"],
    },
    {
      icon: Info,
      title: "Token Dashboard",
      description: "Comprehensive token information and market data",
      items: ["Top Tokens", "Price Changes", "Market Cap", "Trading Pairs"],
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {sections.map((section, idx) => {
        const Icon = section.icon
        return (
          <div
            key={idx}
            className="group rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-800/30 to-slate-900/30 p-5 hover:border-orange-500/30 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-orange-500/10 animate-bounce-in"
            style={{ animationDelay: `${idx * 75}ms` }}
          >
            <div className="flex items-start gap-4">
              <Icon className="w-6 h-6 text-orange-500/60 group-hover:text-orange-400 transition-colors flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-white text-sm md:text-base group-hover:text-orange-400 transition-colors">
                  {section.title}
                </h3>
                <p className="text-xs md:text-sm text-gray-500 mt-1">{section.description}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {section.items.map((item, i) => (
                    <span
                      key={i}
                      className="text-xs bg-slate-700/40 text-gray-400 px-2 py-1 rounded border border-slate-600/30 group-hover:border-orange-500/20 transition-colors"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
