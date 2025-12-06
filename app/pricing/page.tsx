"use client"

import { useState, useEffect } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/components/auth-provider"
import { motion } from "framer-motion"
import { Transaction } from "@solana/web3.js"
import { confirmTransactionWithPolling } from "@/lib/confirm-transaction"
import { TransactionVerification } from "@/components/transaction-verification"

type BillingPeriod = "monthly" | "yearly"
type CurrencyType = "usdt" | "sol"

interface Plan {
  name: string
  monthlyPrice: number
  yearlyPrice: number
  requests: number
  features: string[]
  popular?: boolean
}

interface PaymentStatus {
  transactionHash?: string
  status?: "pending" | "confirmed" | "failed"
  message?: string
}

const PLANS: Plan[] = [
  {
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    requests: 100,
    features: ["Limited requests per day", "Solana network only", "Community support", "Basic analytics"],
  },
  {
    name: "Pro",
    monthlyPrice: 300,
    yearlyPrice: 3200,
    requests: 3000,
    features: [
      "3,000 requests per day",
      "Multi-network support",
      "Priority support",
      "Advanced analytics",
      "API key management",
      "Custom webhooks",
    ],
    popular: true,
  },
  {
    name: "Pro+",
    monthlyPrice: 500,
    yearlyPrice: 5400,
    requests: 10000,
    features: [
      "10,000 requests per day",
      "All Pro features",
      "Crypto transaction tracing",
      "Advanced security",
      "Dedicated support",
      "Custom integrations",
    ],
  },
]

export default function PricingPage() {
  const { connected, publicKey, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const { user } = useAuth()
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly")
  const [currencyType, setCurrencyType] = useState<CurrencyType>("usdt")
  const [solPrices, setSolPrices] = useState<Record<string, number>>({})
  const [loadingPrices, setLoadingPrices] = useState(false)
  const [loadingPlans, setLoadingPlans] = useState<Set<string>>(new Set())
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null)

  useEffect(() => {
    const loadSolPrices = async () => {
      setLoadingPrices(true)
      try {
        const { convertUsdToSol } = await import("@/lib/exchange-rate")
        const prices: Record<string, number> = {}

        for (const plan of PLANS) {
          const monthlyPrice = billingPeriod === "monthly" ? plan.monthlyPrice : plan.yearlyPrice
          if (monthlyPrice > 0) {
            const solPrice = await convertUsdToSol(monthlyPrice)
            prices[plan.name] = solPrice
          }
        }

        setSolPrices(prices)
      } catch (error) {
        console.error("[v0] Failed to load SOL prices:", error)
      } finally {
        setLoadingPrices(false)
      }
    }

    loadSolPrices()
  }, [billingPeriod])

  const handlePayment = async (plan: Plan) => {
    if (!connected || !publicKey || !user) {
      toast.error("Please connect your wallet first")
      return
    }

    const usdPrice = billingPeriod === "monthly" ? plan.monthlyPrice : plan.yearlyPrice

    if (usdPrice === 0) {
      toast.success("Free plan - no payment required")
      return
    }

    const planKey = `${plan.name}-${billingPeriod}`
    setLoadingPlans((prev) => new Set([...prev, planKey]))
    setPaymentStatus({ status: "pending", message: "Opening wallet..." })
    const toastId = toast.loading("Opening wallet...")

    try {
      console.log("[v0] Creating payment for plan:", plan.name, "price:", usdPrice, "currency:", currencyType)

      const createResponse = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicKey: publicKey.toBase58(),
          plan: plan.name,
          currencyType,
        }),
      })

      if (!createResponse.ok) {
        const errorData = await createResponse.json()
        console.error("[v0] Create payment failed:", errorData)
        toast.dismiss(toastId)
        toast.error(errorData.error || "Failed to create payment transaction")
        setPaymentStatus({ status: "failed", message: errorData.error })
        setLoadingPlans((prev) => {
          const next = new Set(prev)
          next.delete(planKey)
          return next
        })
        return
      }

      const { transaction: txBase64 } = await createResponse.json()
      console.log("[v0] Transaction created successfully")

      const txBuffer = Buffer.from(txBase64, "base64")
      const tx = Transaction.from(txBuffer)
      console.log("[v0] Transaction deserialized, sending to wallet...")

      toast.dismiss(toastId)
      toast.loading("Confirm in your wallet...")
      setPaymentStatus({ status: "pending", message: "Awaiting wallet confirmation..." })

      let signature: string

      try {
        signature = await Promise.race([
          sendTransaction(tx, connection),
          new Promise<string>((_, reject) => {
            setTimeout(() => reject(new Error("Wallet did not respond within 30 seconds")), 30000)
          }),
        ])

        console.log("[v0] Transaction sent with signature:", signature)
        setPaymentStatus({ transactionHash: signature, status: "pending", message: "Confirming on blockchain..." })
      } catch (walletError: any) {
        console.error("[v0] Wallet error details:", {
          message: walletError.message,
          name: walletError.name,
          code: walletError.code,
        })
        toast.dismiss(toastId)

        if (
          walletError.message?.includes("user rejected") ||
          walletError.message?.includes("cancelled") ||
          walletError.name === "WalletSignTransactionError"
        ) {
          toast.error("Payment cancelled")
          setPaymentStatus({ status: "failed", message: "Payment cancelled by user" })
        } else if (walletError.message?.includes("did not respond") || walletError.message?.includes("timeout")) {
          toast.error("Wallet did not respond. Please make sure your wallet is open and try again.")
          setPaymentStatus({ status: "failed", message: "Wallet timeout" })
        } else {
          toast.error("Wallet error: " + (walletError.message || "Unknown error"))
          setPaymentStatus({ status: "failed", message: walletError.message })
        }
        setLoadingPlans((prev) => {
          const next = new Set(prev)
          next.delete(planKey)
          return next
        })
        return
      }

      console.log("[v0] Transaction signature:", signature)
      toast.dismiss(toastId)
      toast.loading("Confirming on blockchain...")

      try {
        const confirmResult = await Promise.race([
          confirmTransactionWithPolling(connection, signature),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Confirmation timeout")), 60000)),
        ])

        console.log("[v0] Transaction confirmed on blockchain")
        setPaymentStatus({ transactionHash: signature, status: "pending", message: "Recording payment..." })

        const tokenAmount = currencyType === "sol" ? solPrices[plan.name] || 0 : usdPrice

        const dbResponse = await fetch("/api/payments/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            planType: billingPeriod,
            tokenType: currencyType,
            tokenAmount: tokenAmount,
            amountUsd: usdPrice,
            transactionHash: signature,
          }),
        })

        if (!dbResponse.ok) {
          const errorData = await dbResponse.json()
          console.error("[v0] Payment recording failed:", errorData)
          toast.dismiss(toastId)
          toast.warning("Transaction confirmed! Syncing subscription...")
          setPaymentStatus({
            transactionHash: signature,
            status: "confirmed",
            message: "Payment recorded. Subscription updated!",
          })

          setTimeout(() => {
            window.dispatchEvent(new CustomEvent("triggerSubscriptionRefresh"))
            window.location.href = "/dashboard"
          }, 2000)
          return
        }

        const { subscription } = await dbResponse.json()
        console.log("[v0] Payment recorded successfully, subscription updated")

        toast.dismiss(toastId)
        toast.success(`Successfully upgraded to ${plan.name}!`)
        setPaymentStatus({
          transactionHash: signature,
          status: "confirmed",
          message: "Payment successful! Redirecting...",
        })

        window.dispatchEvent(new CustomEvent("triggerSubscriptionRefresh"))

        setTimeout(() => {
          window.location.href = "/dashboard"
        }, 1500)
      } catch (confirmError: any) {
        console.error("[v0] Confirmation error:", confirmError)
        toast.dismiss(toastId)
        toast.warning("Transaction sent! Confirming on blockchain...")
        setPaymentStatus({
          transactionHash: signature,
          status: "pending",
          message: "Transaction sent. Confirming...",
        })
      }
    } catch (error: any) {
      console.error("[v0] Payment error:", error)
      toast.dismiss(toastId)
      toast.error(error.message || "Payment failed")
      setPaymentStatus({ status: "failed", message: error.message })
    } finally {
      setLoadingPlans((prev) => {
        const next = new Set(prev)
        next.delete(planKey)
        return next
      })
    }
  }

  const handleVerified = () => {
    window.dispatchEvent(new CustomEvent("triggerSubscriptionRefresh"))
    setTimeout(() => {
      window.location.href = "/dashboard"
    }, 1000)
  }

  const displayedPlans = PLANS.map((plan) => {
    const usdPrice = billingPeriod === "monthly" ? plan.monthlyPrice : plan.yearlyPrice
    const solPrice = solPrices[plan.name] || 0
    return {
      ...plan,
      price: currencyType === "sol" ? solPrice : usdPrice,
      currencyDisplay: currencyType === "sol" ? "SOL" : "USDT",
    }
  })

  return (
    <div className="min-h-screen bg-background">
      <section className="container mx-auto px-4 py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Simple, Transparent{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-600">Pricing</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose the perfect plan for your needs. Upgrade or downgrade anytime. Pay securely with USDT or SOL on
            Solana.
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-center gap-8 mb-12">
          {/* Billing Period Toggle */}
          <div className="inline-flex items-center gap-4 p-1 bg-card border border-card-border rounded-lg justify-self-center">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-6 py-2 rounded transition-all font-medium ${
                billingPeriod === "monthly"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`px-6 py-2 rounded transition-all font-medium ${
                billingPeriod === "yearly"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Yearly <span className="text-xs ml-1 opacity-75">(Save 10%)</span>
            </button>
          </div>

          {/* Currency Type Toggle */}
          <div className="inline-flex items-center gap-4 p-1 bg-card border border-card-border rounded-lg">
            <button
              onClick={() => setCurrencyType("usdt")}
              className={`px-6 py-2 rounded transition-all font-medium ${
                currencyType === "usdt"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              USDT (Default)
            </button>
            <button
              onClick={() => setCurrencyType("sol")}
              className={`px-6 py-2 rounded transition-all font-medium ${
                currencyType === "sol"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              SOL
            </button>
          </div>
        </div>

        {/* Loading State for SOL Prices */}
        {loadingPrices && currencyType === "sol" && (
          <div className="text-center mb-6 text-sm text-muted-foreground">Loading SOL prices...</div>
        )}

        {/* Payment Status Indicator */}
        {paymentStatus && (
          <div className="max-w-2xl mx-auto mb-8">
            {paymentStatus.transactionHash && user ? (
              <TransactionVerification
                transactionHash={paymentStatus.transactionHash}
                userId={user.id}
                onVerified={handleVerified}
              />
            ) : (
              <div className="p-4 bg-card border border-card-border rounded-lg">
                <div className="flex items-start gap-3">
                  {paymentStatus.status === "pending" && (
                    <Loader2 className="w-5 h-5 text-primary animate-spin flex-shrink-0 mt-0.5" />
                  )}
                  {paymentStatus.status === "confirmed" && (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  )}
                  {paymentStatus.status === "failed" && (
                    <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-semibold text-sm capitalize">{paymentStatus.status} Payment</p>
                    <p className="text-sm text-muted-foreground">{paymentStatus.message}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
          {displayedPlans.map((plan, index) => {
            const planKey = `${plan.name}-${billingPeriod}`
            const isLoading = loadingPlans.has(planKey)
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`p-6 flex flex-col relative ${
                    plan.popular ? "border-primary/50 bg-gradient-to-b from-primary/10 to-transparent md:scale-105" : ""
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-primary to-orange-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                    <p className="text-muted-foreground text-sm capitalize">{billingPeriod}ly billing</p>
                  </div>

                  <div className="mb-6">
                    {currencyType === "sol" && loadingPrices ? (
                      <div className="animate-pulse">
                        <span className="text-4xl font-bold">--</span>
                      </div>
                    ) : (
                      <>
                        <span className="text-4xl font-bold">
                          {currencyType === "sol" ? plan.price.toFixed(4) : plan.price}
                        </span>
                        <span className="ml-2 text-xl font-semibold">{plan.currencyDisplay}</span>
                      </>
                    )}
                    <p className="text-muted-foreground text-sm">
                      per {billingPeriod === "monthly" ? "month" : "year"}
                    </p>
                  </div>

                  <div className="mb-6 p-3 bg-card rounded-lg">
                    <p className="text-sm font-semibold">{plan.requests.toLocaleString()} requests/day</p>
                  </div>

                  <div className="mb-8 space-y-4 flex-1">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => handlePayment(plan)}
                    disabled={isLoading || (currencyType === "sol" && loadingPrices)}
                    className={plan.popular ? "bg-gradient-to-r from-primary to-orange-600 w-full" : "w-full"}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </div>
                    ) : plan.price === 0 ? (
                      "Get Started"
                    ) : connected ? (
                      `Pay with ${plan.currencyDisplay}`
                    ) : (
                      "Connect Wallet"
                    )}
                  </Button>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Can I upgrade or downgrade anytime?</h3>
              <p className="text-muted-foreground text-sm">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-muted-foreground text-sm">
                We accept USDT and SOL on the Solana network for secure, fast transactions.
              </p>
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold mb-2">How much can I save with yearly billing?</h3>
              <p className="text-muted-foreground text-sm">
                With yearly billing, you get great value. Pro is $3,200/year and Pro+ is $5,400/year.
              </p>
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold mb-2">How are SOL prices calculated?</h3>
              <p className="text-muted-foreground text-sm">
                SOL prices are dynamically calculated using the current SOL/USD exchange rate from CoinGecko, fetched in
                real-time with 1-minute caching.
              </p>
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Is there a refund policy?</h3>
              <p className="text-muted-foreground text-sm">
                We offer a 7-day money-back guarantee. Contact support if you have any issues.
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
