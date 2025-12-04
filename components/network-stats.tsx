"use client"

import { TrendingUp, Activity, Zap, Users } from "lucide-react"

export function NetworkStats() {
  const stats = [
    {
      label: "Circulating Supply",
      value: "553.9M",
      subtext: "SOL",
      icon: TrendingUp,
      color: "from-green-500/20 to-emerald-500/20",
      borderColor: "border-green-500/30",
    },
    {
      label: "Active Stake",
      value: "416.5M",
      subtext: "SOL (72.31%)",
      icon: Users,
      color: "from-blue-500/20 to-cyan-500/20",
      borderColor: "border-blue-500/30",
    },
    {
      label: "Network Transactions",
      value: "462.8B+",
      subtext: "Total on-chain",
      icon: Activity,
      color: "from-orange-500/20 to-red-500/20",
      borderColor: "border-orange-500/30",
    },
    {
      label: "Transactions Per Second",
      value: "2,972",
      subtext: "Current TPS",
      icon: Zap,
      color: "from-purple-500/20 to-pink-500/20",
      borderColor: "border-purple-500/30",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, idx) => {
        const Icon = stat.icon
        return (
          <div
            key={idx}
            className={`rounded-lg p-5 border backdrop-blur-sm bg-gradient-to-br ${stat.color} ${stat.borderColor} hover:border-opacity-100 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg`}
            style={{
              animation: `fadeInUp 0.5s ease-out ${idx * 100}ms both`,
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <Icon className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.subtext}</p>
          </div>
        )
      })}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
