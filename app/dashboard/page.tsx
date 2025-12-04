"use client"

import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { useEffect, useState } from "react"
import { Wallet, Copy, LogOut } from "lucide-react"
import ApiKeyManager from "@/components/apiKeyManager"
import SubscriptionCard from "@/components/subscriptionCard"
import { toast } from "sonner"

export default function DashboardPage() {
  const wallet = useWallet()
  const walletModal = useWalletModal()
  const [currentPlan, setCurrentPlan] = useState("Free")
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly")
  const [subscriptionStart, setSubscriptionStart] = useState<Date | null>(null)

  useEffect(() => {
    const plan = localStorage.getItem("user_plan") || "Free"
    const period = localStorage.getItem("billing_period") || "monthly"
    const startDate = localStorage.getItem("subscription_start")

    setCurrentPlan(plan)
    setBillingPeriod(period as "monthly" | "yearly")
    if (startDate) setSubscriptionStart(new Date(startDate))

    const listener = () => {
      const updatedPlan = localStorage.getItem("user_plan") || "Free"
      setCurrentPlan(updatedPlan)
    }

    window.addEventListener("storage", listener)
    return () => window.removeEventListener("storage", listener)
  }, [])

  const getSubscriptionExpiry = () => {
    if (!subscriptionStart) return null
    const expiry = new Date(subscriptionStart)
    if (billingPeriod === "yearly") {
      expiry.setFullYear(expiry.getFullYear() + 1)
    } else {
      expiry.setMonth(expiry.getMonth() + 1)
    }
    return expiry
  }

  const handleWalletConnect = () => {
    if (!wallet.connected) {
      walletModal.setVisible(true)
    } else {
      wallet.disconnect()
    }
  }

  const copyAddress = () => {
    if (wallet.publicKey) {
      navigator.clipboard.writeText(wallet.publicKey.toBase58())
      toast.success("Wallet address copied!")
    }
  }

  if (!wallet.connected) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center max-w-md p-10 border border-white/10 bg-white/3 rounded-2xl">
          <Wallet className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h1 className="text-3xl font-extrabold mb-4">Connect Your Wallet</h1>

          <p className="text-gray-400 mb-8">Access your dashboard, manage API keys, and upgrade your plan.</p>

          <button
            onClick={handleWalletConnect}
            className="w-full py-3 rounded-lg cursor-pointer font-medium bg-linear-to-r from-orange-500 to-red-500 hover:opacity-90"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    )
  }

  const expiryDate = getSubscriptionExpiry()

  return (
    <div className="min-h-screen bg-black text-white">
      <section className="container mx-auto px-4 py-20">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-extrabold mb-2">Dashboard</h1>
            <p className="text-gray-400">Manage your account, API keys, and subscription.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-gray-400">Wallet</p>
              <p className="text-sm font-mono">{wallet.publicKey?.toBase58().slice(0, 8)}...</p>
            </div>
            <button
              onClick={copyAddress}
              className="p-2 hover:bg-white/10 rounded-lg transition-all"
              title="Copy wallet address"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={handleWalletConnect}
              className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
              title="Disconnect wallet"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {currentPlan !== "Free" && (
          <div className="mb-8 p-6 rounded-lg border border-orange-500/40 bg-linear-to-r from-orange-500/10 to-transparent">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-400">Current Plan</p>
                <p className="text-2xl font-bold text-orange-400">{currentPlan}</p>
                <p className="text-sm text-gray-400 mt-2">
                  Billing: {billingPeriod === "yearly" ? "Yearly" : "Monthly"}
                </p>
              </div>
              {expiryDate && (
                <div className="text-right">
                  <p className="text-sm text-gray-400">Expires</p>
                  <p className="text-lg font-semibold">{expiryDate.toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-6xl">
          <SubscriptionCard currentPlan={currentPlan} />
          <ApiKeyManager />
        </div>
      </section>
    </div>
  )
}
