"use client"

import { useState } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { PublicKey, Transaction } from "@solana/web3.js"
import { getAssociatedTokenAddress, createTransferInstruction } from "@solana/spl-token"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/components/auth-provider"
import { motion } from "framer-motion"

type BillingPeriod = "monthly" | "yearly"

interface Plan {
  name: string
  monthlyPrice: number
  yearlyPrice: number
  requests: number
  features: string[]
  popular?: boolean
}

const USDT_MINT = "EPjFWaLb3oCRY59QuU9CLYy37qjodnKwDvE5tqKDqaP"
const USDC_MINT = "EPjFWaLb3oCRY59QuU9CLYy37qjodnKwDvE5tqKDqaP"

export default function PricingPage() {
  const { connected, publicKey, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const { user } = useAuth()
  const [processing, setProcessing] = useState(false)
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly")
  const [selectedToken, setSelectedToken] = useState<"usdt" | "usdc">("usdt")

  const plans: Plan[] = [
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

  const handlePayment = async (plan: Plan) => {
    if (!connected || !publicKey || !user) {
      toast.error("Please connect your wallet first")
      return
    }

    setProcessing(true)
    try {
      const price = billingPeriod === "monthly" ? plan.monthlyPrice : plan.yearlyPrice

      if (price === 0) {
        toast.error("Free plan selected")
        setProcessing(false)
        return
      }

      const tokenMint = selectedToken === "usdt" ? USDT_MINT : USDC_MINT
      const mint = new PublicKey(tokenMint)
      const decimals = 6

      const senderToken = await getAssociatedTokenAddress(mint, publicKey)
      const recipientToken = await getAssociatedTokenAddress(
        mint,
        new PublicKey(process.env.NEXT_PUBLIC_SOLANA_PAYMENT_DESTINATION!),
      )

      const transaction = new Transaction().add(
        createTransferInstruction(
          senderToken,
          recipientToken,
          publicKey,
          BigInt(Math.floor(price * Math.pow(10, decimals))),
        ),
      )

      const { blockhash } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = publicKey

      toast.loading("Processing payment...")
      const signature = await sendTransaction(transaction, connection)

      await connection.confirmTransaction(signature, "confirmed")

      // Record payment
      const response = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          planType: billingPeriod,
          tokenType: selectedToken,
          tokenAmount: price,
          amountUsd: price,
          transactionHash: signature,
        }),
      })

      if (response.ok) {
        toast.success(`Successfully upgraded to ${plan.name}!`)
      } else {
        toast.error("Payment recorded but subscription update failed")
      }
    } catch (error) {
      console.error("Payment error:", error)
      toast.error("Payment failed. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  const displayedPlans = plans.map((plan) => ({
    ...plan,
    price: billingPeriod === "monthly" ? plan.monthlyPrice : plan.yearlyPrice,
  }))

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
            Choose the perfect plan for your needs. Upgrade or downgrade anytime.
          </p>
        </div>

        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-4 p-1 bg-card border border-card-border rounded-lg">
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
        </div>

        {/* Token Selection - USDT/USDC only */}
        <div className="flex justify-center gap-3 mb-12 flex-wrap">
          {(["usdt", "usdc"] as const).map((token) => (
            <Button
              key={token}
              onClick={() => setSelectedToken(token)}
              variant={selectedToken === token ? "default" : "outline"}
              className={selectedToken === token ? "bg-gradient-to-r from-primary to-orange-600" : ""}
            >
              {token.toUpperCase()}
            </Button>
          ))}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
          {displayedPlans.map((plan, index) => (
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
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <p className="text-muted-foreground text-sm">per {billingPeriod === "monthly" ? "month" : "year"}</p>
                </div>

                <div className="mb-6 p-3 bg-card rounded-lg">
                  <p className="text-sm font-semibold">{plan.requests.toLocaleString()} requests/day</p>
                </div>

                <div className="mb-8 space-y-3 flex-1">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => handlePayment(plan)}
                  disabled={processing || (plan.price === 0 && !connected)}
                  className={plan.popular ? "bg-gradient-to-r from-primary to-orange-600 w-full" : "w-full"}
                >
                  {plan.price === 0
                    ? "Get Started"
                    : connected
                      ? `Pay with ${selectedToken.toUpperCase()}`
                      : "Connect Wallet"}
                </Button>
              </Card>
            </motion.div>
          ))}
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
                We accept USDT and USDC on the Solana network for secure, fast transactions.
              </p>
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold mb-2">How much can I save with yearly billing?</h3>
              <p className="text-muted-foreground text-sm">
                With yearly billing, you get great value. Pro is $3,200/year and Pro+ is $5,400/year.
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
