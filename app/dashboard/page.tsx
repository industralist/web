"use client"

import { useAuth } from "@/components/auth-provider"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, Key, CreditCard, ArrowRight, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface Subscription {
  plan_type: string
  status: string
  price_usd: number
  next_billing_date: string
}

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [stats, setStats] = useState({ requests: 0, apiKeys: 0 })
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchSubscription()
      fetchStats()
    }
  }, [user])

  useEffect(() => {
    const handleSubscriptionUpdate = (event: Event) => {
      const customEvent = event as CustomEvent
      if (customEvent.detail) {
        setSubscription(customEvent.detail)
      }
    }

    window.addEventListener("subscriptionUpdated", handleSubscriptionUpdate)
    return () => window.removeEventListener("subscriptionUpdated", handleSubscriptionUpdate)
  }, [])

  const fetchSubscription = async () => {
    try {
      const res = await fetch("/api/auth/subscription", {
        headers: { "x-user-id": user?.id || "" },
      })
      const data = await res.json()
      setSubscription(data.subscription)
    } catch (error) {
      console.error("Error fetching subscription:", error)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/api-keys/list", {
        headers: { "x-user-id": user?.id || "" },
      })
      const data = await res.json()
      setStats({ requests: Math.floor(Math.random() * 50000), apiKeys: data.keys?.length || 0 })
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchSubscription()
    await fetchStats()
    setIsRefreshing(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!user) return null

  const truncatedAddress = `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-6)}`

  const usageData = [
    { day: "Mon", requests: 4000 },
    { day: "Tue", requests: 3000 },
    { day: "Wed", requests: 2000 },
    { day: "Thu", requests: 2780 },
    { day: "Fri", requests: 1890 },
    { day: "Sat", requests: 2390 },
    { day: "Sun", requests: 3490 },
  ]

  return (
    <main className="container mx-auto px-4 py-8 space-y-8">
      {/* Welcome Section */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your account overview.</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="gap-2 bg-transparent"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Profile & Subscription Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Wallet Card */}
        <Card className="p-6 bg-gradient-to-br from-card to-card-bg border-card-border">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Connected Wallet</p>
          <p className="font-mono text-sm font-semibold mb-4">{truncatedAddress}</p>
          <p className="text-xs text-muted-foreground">Full: {user.walletAddress}</p>
        </Card>

        {/* Plan Card */}
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary/30 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-primary" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Current Plan</p>
          <p className="font-semibold text-lg capitalize mb-2">{subscription?.plan_type || "Free"}</p>
          <Button size="sm" asChild variant="outline">
            <Link href="/pricing">Upgrade Plan</Link>
          </Button>
        </Card>

        {/* API Keys Card */}
        <Card className="p-6 bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/30">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-secondary/30 flex items-center justify-center">
              <Key className="w-6 h-6 text-secondary" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">API Keys</p>
          <p className="font-semibold text-lg mb-2">{stats.apiKeys} Active</p>
          <Button size="sm" asChild variant="outline">
            <Link href="/api-keys">Manage Keys</Link>
          </Button>
        </Card>
      </div>

      {/* Usage Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Weekly Usage</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={usageData}>
            <defs>
              <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="day" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip contentStyle={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)" }} />
            <Area type="monotone" dataKey="requests" stroke="var(--primary)" fill="url(#colorRequests)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button asChild className="w-full justify-between bg-transparent" variant="outline">
              <Link href="/explorer">
                Search Wallets <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild className="w-full justify-between bg-transparent" variant="outline">
              <Link href="/api-keys">
                Create API Key <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild className="w-full justify-between bg-transparent" variant="outline">
              <Link href="/subscriptions">
                View Plans <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Plan Benefits</h3>
          <div className="space-y-2 text-sm">
            {subscription?.plan_type === "free" && (
              <>
                <p className="text-muted-foreground">✓ 100 requests/day</p>
                <p className="text-muted-foreground">✓ Basic analytics</p>
                <p className="text-muted-foreground">✓ Community support</p>
              </>
            )}
            {subscription?.plan_type === "monthly" && (
              <>
                <p className="text-muted-foreground">✓ 3,000 requests/day</p>
                <p className="text-muted-foreground">✓ Advanced analytics</p>
                <p className="text-muted-foreground">✓ Priority support</p>
              </>
            )}
            {subscription?.plan_type === "yearly" && (
              <>
                <p className="text-muted-foreground">✓ 10,000 requests/day</p>
                <p className="text-muted-foreground">✓ All Pro features</p>
                <p className="text-muted-foreground">✓ Dedicated support</p>
              </>
            )}
          </div>
        </Card>
      </div>
    </main>
  )
}
