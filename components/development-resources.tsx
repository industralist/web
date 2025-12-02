"use client"

import { BookOpen, Code2, GraduationCap, Github } from "lucide-react"

export function DevelopmentResources() {
  const resources = [
    {
      title: "Solana Documentation",
      description: "Complete guide to building on Solana",
      icon: BookOpen,
      color: "from-blue-500/20 to-blue-600/20",
      borderColor: "border-blue-500/30",
    },
    {
      title: "Quick Start Guide",
      description: "Get up and running in 5 minutes or less",
      icon: Code2,
      color: "from-green-500/20 to-emerald-500/20",
      borderColor: "border-green-500/30",
    },
    {
      title: "Developer Bootcamp",
      description: "11 hours of video lessons on Solana development",
      icon: GraduationCap,
      color: "from-purple-500/20 to-pink-500/20",
      borderColor: "border-purple-500/30",
    },
    {
      title: "GitHub Repository",
      description: "Open source examples and starter templates",
      icon: Github,
      color: "from-gray-500/20 to-slate-600/20",
      borderColor: "border-gray-500/30",
    },
  ]

  return (
    <div className="mt-12 pt-8 border-t border-slate-700/50">
      <h3 className="text-2xl font-bold text-white mb-6">Kickstart Your Development Journey on Solana</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {resources.map((resource, idx) => {
          const Icon = resource.icon
          return (
            <div
              key={idx}
              className={`rounded-lg p-5 border backdrop-blur-sm bg-gradient-to-br ${resource.color} ${resource.borderColor} hover:border-opacity-100 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group`}
              style={{
                animation: `fadeInUp 0.5s ease-out ${(idx + 100) * 100}ms both`,
              }}
            >
              <Icon className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors mb-3" />
              <p className="font-semibold text-white mb-2">{resource.title}</p>
              <p className="text-xs text-gray-500">{resource.description}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
