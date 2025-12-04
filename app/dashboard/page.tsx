"use client"

import { useAuth } from "@/components/auth-provider"
import { useWallet } from "@solana/wallet-adapter-react"
import { Card } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard-header"
import { Wallet, TrendingUp, Key, CreditCard } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const { publicKey } = useWallet()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!user) return null

  const truncatedAddress = `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-6)}`

  return (
    <>
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <h2 className="text-2xl font-bold mb-2">Welcome Back!</h2>
              <p className="text-muted-foreground mb-4">Wallet: {truncatedAddress}</p>
              <p className="text-sm text-muted-foreground">
                Manage your API keys, upgrade your plan, and track your usage.
              </p>
            </Card>

            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Connected Wallet</p>
                    <p className="font-semibold">{truncatedAddress}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/dashboard/subscriptions">
              <Card className="p-4 cursor-pointer hover:border-primary/50 transition-colors">
                <CreditCard className="w-8 h-8 text-primary mb-2" />
                <h3 className="font-semibold">Subscription</h3>
                <p className="text-sm text-muted-foreground">Manage your plan</p>
              </Card>
            </Link>

            <Link href="/dashboard/api-keys">
              <Card className="p-4 cursor-pointer hover:border-primary/50 transition-colors">
                <Key className="w-8 h-8 text-primary mb-2" />
                <h3 className="font-semibold">API Keys</h3>
                <p className="text-sm text-muted-foreground">Create and manage keys</p>
              </Card>
            </Link>

            <Link href="/dashboard/usage">
              <Card className="p-4 cursor-pointer hover:border-primary/50 transition-colors">
                <TrendingUp className="w-8 h-8 text-primary mb-2" />
                <h3 className="font-semibold">Usage</h3>
                <p className="text-sm text-muted-foreground">View your stats</p>
              </Card>
            </Link>
          </div>

          {/* Info Cards */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Getting Started</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>✓ Start by creating an API key in the API Keys section</p>
              <p>✓ Use your key to authenticate requests to our API</p>
              <p>✓ Upgrade your plan to increase rate limits</p>
              <p>✓ Monitor your usage in real-time</p>
            </div>
          </Card>
        </div>
      </main>
    </>
  )
}
