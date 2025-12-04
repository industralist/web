"use client"

import { Globe, Zap, TrendingUp, Users } from "lucide-react"

export function NetworkOverview() {
  const stats = [
    {
      icon: Globe,
      label: "SOL Supply",
      value: "573.9M",
      subtext: "total circulating",
      color: "from-cyan-500 to-blue-500",
    },
    {
      icon: Zap,
      label: "TPS",
      value: "~2,897",
      subtext: "transactions per second",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: TrendingUp,
      label: "Active Stake",
      value: "416.5M",
      subtext: "SOL staked",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: Users,
      label: "Current Epoch",
      value: "878",
      subtext: "active validators",
      color: "from-purple-500 to-pink-500",
    },
  ]

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Piflepath</span>
          <span className="text-sm md:text-base bg-orange-500 text-black px-3 py-1 rounded-full font-semibold">
            Blockchain Tracker
          </span>
        </h1>
        <p className="text-gray-400">Real-time blockchain insights and wallet analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <div
              key={idx}
              className={`group relative overflow-hidden rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-800/40 to-slate-900/40 p-4 backdrop-blur-sm hover:border-orange-500/30 transition-all duration-300 animate-scale-in`}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
              />

              <div className="relative z-10 flex items-start justify-between mb-3">
                <Icon className="w-5 h-5 text-orange-500/70 group-hover:text-orange-400 transition-colors" />
              </div>

              <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
              <p className="text-xl md:text-2xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-xs text-gray-600">{stat.subtext}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
