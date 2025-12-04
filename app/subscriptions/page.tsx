"use client"

import { useAuth } from "@/components/auth-provider"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, CreditCard } from "lucide-react"

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

  const fetchPayments = async () => {
    // This would need a new API endpoint to fetch payments
    // For now, we'll show mock data
    setPayments([])
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
      <div>
        <h1 className="text-4xl font-bold mb-2">Subscriptions</h1>
        <p className="text-muted-foreground">Manage your subscription and billing information.</p>
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
              {subscription?.next_billing_date ? new Date(subscription.next_billing_date).toLocaleDateString() : "N/A"}
            </p>
          </div>
        </div>

        <Button asChild className="w-full md:w-auto">
          <a href="/pricing">Upgrade Plan</a>
        </Button>
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
