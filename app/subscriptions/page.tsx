"use client"

import { useAuth } from "@/components/auth-provider"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, CreditCard, RefreshCw } from "lucide-react"

interface Subscription {
  id: string
  plan_type: string
  status: string
  price_usd: number
  billing_cycle: string
  next_billing_date: string
}

interface Payment {
  id: string
  amount_usd: number
  token_type: string
  transaction_hash: string
  payment_date: string
  status: string
}

export default function SubscriptionsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchSubscription()
      fetchPayments()
    }
  }, [user])

  useEffect(() => {
    const handleSubscriptionUpdate = (event: Event) => {
      const customEvent = event as CustomEvent
      if (customEvent.detail) {
        setSubscription(customEvent.detail)
        // Also refresh payments when subscription updates
        fetchPayments()
      }
    }

    window.addEventListener("subscriptionUpdated", handleSubscriptionUpdate)
    return () => window.removeEventListener("subscriptionUpdated", handleSubscriptionUpdate)
  }, [])

  const fetchSubscription = async () => {
    try {
      const targetId = user?.walletAddress || user?.id || ""
      const res = await fetch(`/api/auth/subscription?userId=${targetId}`, {
        headers: {
          "x-user-id": user?.id || "",
          "x-wallet-address": user?.walletAddress || "",
        },
      })
      const data = await res.json()
      if (data.subscription && data.subscription.plan_type && data.subscription.plan_type !== "free") {
        setSubscription(data.subscription)
        localStorage.setItem("user_subscription", JSON.stringify(data.subscription))
      } else {
        const stored = localStorage.getItem("user_subscription")
        if (stored) {
          const parsed = JSON.parse(stored)
          if (parsed && parsed.plan_type && parsed.plan_type !== "free") {
            setSubscription(parsed)
            return
          }
        }
        setSubscription(data.subscription)
      }
    } catch (error) {
      console.error("Error fetching subscription:", error)
      const stored = localStorage.getItem("user_subscription")
      if (stored) setSubscription(JSON.parse(stored))
    }
  }

  const fetchPayments = async () => {
    if (!user) return
    try {
      const res = await fetch(`/api/payments/history?userId=${user.id}`)
      const data = await res.json()
      if (data.payments) {
        setPayments(data.payments)
      }
    } catch (error) {
      console.error("Error fetching payments:", error)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchSubscription()
    await fetchPayments()
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

  return (
    <main className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Subscriptions</h1>
          <p className="text-muted-foreground">Manage your subscription and billing information.</p>
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

      {/* Current Plan */}
      <Card className="p-6 border-primary/50 bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold capitalize">{subscription?.plan_type || "Free"} Plan</h2>
            <p className="text-muted-foreground mt-1">
              {subscription?.status === "active" ? "Active subscription" : "Inactive"}
            </p>
          </div>
          <CreditCard className="w-8 h-8 text-primary" />
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Price</p>
            <p className="text-2xl font-bold">${subscription?.price_usd || 0}</p>
            <p className="text-xs text-muted-foreground">{subscription?.billing_cycle || "monthly"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Status</p>
            <p className="text-lg font-semibold capitalize">{subscription?.status}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Next Billing Date</p>
            <p className="text-lg font-semibold">
              {subscription?.next_billing_date
                ? new Date(subscription.next_billing_date).toLocaleDateString()
                : new Date(Date.now() + 30 * 86400000).toLocaleDateString()}
            </p>
          </div>
        </div>

        {subscription?.plan_type?.toLowerCase().includes("pro+") ? (
          <Button disabled className="w-full md:w-auto bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed">
            Highest Tier Active
          </Button>
        ) : (
          <Button asChild className="w-full md:w-auto">
            <a href="/pricing">Upgrade Plan</a>
          </Button>
        )}
      </Card>

      {/* Plan Features */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Your Plan Benefits</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3">API Limits</h4>
            <ul className="space-y-2 text-sm">
              {subscription?.plan_type === "free" && (
                <>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span>100 requests/day</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span>Basic rate limiting</span>
                  </li>
                </>
              )}
              {subscription?.plan_type === "monthly" && (
                <>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span>3,000 requests/day</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span>Priority rate limiting</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span>Custom webhooks</span>
                  </li>
                </>
              )}
              {subscription?.plan_type === "yearly" && (
                <>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span>10,000 requests/day</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span>Highest priority</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span>Custom integrations</span>
                  </li>
                </>
              )}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Support & Features</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>Advanced analytics</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>API key management</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>Real-time notifications</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Billing History */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Billing History</h3>
        {payments.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No billing history yet</p>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div key={payment.id} className="flex justify-between items-center p-4 border border-border rounded-lg">
                <div>
                  <p className="font-semibold">${payment.amount_usd}</p>
                  <p className="text-sm text-muted-foreground">{new Date(payment.payment_date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm capitalize">{payment.token_type}</p>
                  <p className={`text-xs ${payment.status === "completed" ? "text-green-500" : "text-yellow-500"}`}>
                    {payment.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </main>
  )
}
