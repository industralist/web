"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useWallet } from "@solana/wallet-adapter-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle } from "lucide-react"
import { PaymentForm } from "./payment-form"

interface Subscription {
  id: string
  plan_type: string
  billing_cycle: string
  next_billing_date: string
  status: string
}

export function SubscriptionManager() {
  const { user } = useAuth()
  const { publicKey } = useWallet()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPayment, setShowPayment] = useState<"monthly" | "yearly" | null>(null)

  useEffect(() => {
    if (user) {
      fetchSubscription()
    }
  }, [user])

  const fetchSubscription = async () => {
    try {
      // Fetch subscription from database
      // This would typically call an API endpoint
      setLoading(false)
    } catch (error) {
      console.error("Failed to fetch subscription:", error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Subscription Plan</h2>
        <p className="text-muted-foreground">Manage your subscription and billing</p>
      </div>

      {subscription && subscription.status === "active" && (
        <Card className="p-6 border-primary/30 bg-primary/5">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-lg capitalize">{subscription.plan_type} Plan</h3>
              <p className="text-sm text-muted-foreground">Billed {subscription.billing_cycle}ly</p>
              <p className="text-sm text-muted-foreground mt-1">
                Next billing: {new Date(subscription.next_billing_date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>
      )}

      {!showPayment ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Monthly Plan</h3>
            <div className="text-3xl font-bold mb-2">
              $49<span className="text-lg">/mo</span>
            </div>
            <p className="text-muted-foreground text-sm mb-6">Perfect for regular users</p>
            <Button
              onClick={() => setShowPayment("monthly")}
              disabled={!publicKey}
              className="w-full bg-gradient-to-r from-primary to-orange-600"
            >
              Upgrade to Monthly
            </Button>
          </Card>

          <Card className="p-6 border-primary/50 bg-gradient-to-b from-primary/10 to-transparent">
            <h3 className="text-lg font-semibold mb-4">Yearly Plan</h3>
            <div className="text-3xl font-bold mb-2">
              $490<span className="text-lg">/yr</span>
            </div>
            <p className="text-muted-foreground text-sm mb-1">Save 20% compared to monthly</p>
            <p className="text-sm text-primary font-semibold mb-6">Best Value</p>
            <Button
              onClick={() => setShowPayment("yearly")}
              disabled={!publicKey}
              className="w-full bg-gradient-to-r from-primary to-orange-600"
            >
              Upgrade to Yearly
            </Button>
          </Card>
        </div>
      ) : (
        <div className="space-y-4">
          <Button variant="outline" onClick={() => setShowPayment(null)}>
            Back
          </Button>
          <PaymentForm planType={showPayment} />
        </div>
      )}
    </div>
  )
}
