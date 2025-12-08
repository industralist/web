"use client"

import { Check } from "lucide-react"
import { usePlanUpgrade } from "@/hooks/use-plan-upgrade"

export default function SubscriptionCard({
  currentPlan,
}: {
  currentPlan: string
}) {
  const { upgradePlan, loading, successPlan, connected } = usePlanUpgrade()

  return (
    <div className="p-8 rounded-2xl border border-white/10 bg-white/3 hover:bg-white/5 transition-all flex flex-col">
      <h2 className="text-3xl font-extrabold mb-4 text-white">Subscription</h2>

      <p className="text-gray-400 text-sm mb-8">
        You are currently subscribed to the{" "}
        <span className="text-white font-semibold">{successPlan ?? currentPlan}</span> plan.
      </p>

      <h3 className="text-xl font-bold text-white mb-4">Upgrade Plan</h3>

      <div className="space-y-4">
        {/* Pro Plan */}
        <div className="border border-white/10 rounded-2xl p-6 bg-white/2 hover:bg-white/4 transition-all">
          <h4 className="text-lg font-semibold mb-2">Pro – 2 USDT</h4>
          <ul className="space-y-3 mb-6">
            {["3,000 API requests per day", "Blockchain network access", "Priority support", "Advanced analytics"].map(
              (feat, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-orange-500 mt-0.5" />
                  <span className="text-gray-300 text-sm">{feat}</span>
                </li>
              ),
            )}
          </ul>

          <button
            disabled={!connected || loading}
            onClick={() => upgradePlan("Pro")}
            className={`w-full py-3 px-6 rounded-lg font-medium transition-all ${
              connected
                ? "bg-linear-to-r from-orange-500 to-red-500 text-white hover:opacity-90 cursor-pointer"
                : "bg-gray-800 text-gray-500 cursor-not-allowed"
            }`}
          >
            {loading ? "Processing..." : "Upgrade to Pro"}
          </button>
        </div>

        {/* Pro+ Plan */}
        <div className="border border-orange-500/40 rounded-2xl p-6 bg-linear-to-b from-orange-500/10 to-transparent transition-all relative">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-linear-to-r from-orange-500 to-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
            Most Popular
          </span>

          <h4 className="text-lg font-semibold mb-2">Pro+ – 5 USDT</h4>

          <ul className="space-y-3 mb-6">
            {[
              "10,000 API requests per day",
              "All Pro plan features",
              "Crypto transaction tracing",
              "Priority support",
              "Full blockchain network access",
            ].map((feat, i) => (
              <li key={i} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-orange-500 mt-0.5" />
                <span className="text-gray-300 text-sm">{feat}</span>
              </li>
            ))}
          </ul>

          <button
            disabled={!connected || loading}
            onClick={() => upgradePlan("Pro+")}
            className={`w-full py-3 px-6 rounded-lg font-medium transition-all ${
              connected
                ? "bg-linear-to-r from-orange-500 to-red-500 text-white hover:opacity-90 cursor-pointer"
                : "bg-gray-800 text-gray-500 cursor-not-allowed"
            }`}
          >
            {loading ? "Processing..." : "Upgrade to Pro+"}
          </button>
        </div>
      </div>
    </div>
  )
}
