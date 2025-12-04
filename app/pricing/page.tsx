"use client"

import { useState } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js"
import { getAssociatedTokenAddress, createTransferInstruction } from "@solana/spl-token"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/components/auth-provider"

type TokenType = "sol" | "usdt" | "usdc"
type BillingPeriod = "monthly" | "yearly"

interface Plan {
  name: string
  period: BillingPeriod
  price: {
    usd: number
    sol: number
    usdt: number
    usdc: number
  }
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
  const [selectedToken, setSelectedToken] = useState<TokenType>("sol")

  const plans: Plan[] = [
    {
      name: "Free",
      period: "monthly",
      price: { usd: 0, sol: 0, usdt: 0, usdc: 0 },
      requests: 100,
      features: ["Limited requests per day", "Solana network only", "Community support", "Basic analytics"],
    },
    {
      name: "Pro",
      period: "monthly",
      price: { usd: 49, sol: 0.25, usdt: 49, usdc: 49 },
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
      name: "Pro",
      period: "yearly",
      price: { usd: 490, sol: 2.5, usdt: 490, usdc: 490 },
      requests: 3000,
      features: [
        "3,000 requests per day",
        "Multi-network support",
        "Priority support",
        "Advanced analytics",
        "API key management",
        "Custom webhooks",
        "Save 20%",
      ],
    },
    {
      name: "Pro+",
      period: "monthly",
      price: { usd: 99, sol: 0.5, usdt: 99, usdc: 99 },
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
    {
      name: "Pro+",
      period: "yearly",
      price: { usd: 990, sol: 5, usdt: 990, usdc: 990 },
      requests: 10000,
      features: [
        "10,000 requests per day",
        "All Pro features",
        "Crypto transaction tracing",
        "Advanced security",
        "Dedicated support",
        "Custom integrations",
        "Save 20%",
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
      const amount = plan.price[selectedToken]
      if (amount === 0) {
        toast.error("Free plan selected")
        setProcessing(false)
        return
      }

      let transaction: Transaction

      if (selectedToken === "sol") {
        transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: new PublicKey(process.env.NEXT_PUBLIC_SOLANA_PAYMENT_DESTINATION!),
            lamports: Math.floor(amount * 1e9),
          }),
        )
      } else {
        const tokenMint = selectedToken === "usdt" ? USDT_MINT : USDC_MINT
        const mint = new PublicKey(tokenMint)
        const decimals = 6

        const senderToken = await getAssociatedTokenAddress(mint, publicKey)
        const recipientToken = await getAssociatedTokenAddress(
          mint,
          new PublicKey(process.env.NEXT_PUBLIC_SOLANA_PAYMENT_DESTINATION!),
        )

        transaction = new Transaction().add(
          createTransferInstruction(
            senderToken,
            recipientToken,
            publicKey,
            BigInt(Math.floor(amount * Math.pow(10, decimals))),
          ),
        )
      }

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
          planType: plan.period,
          tokenType: selectedToken,
          tokenAmount: amount,
          amountUsd: plan.price.usd,
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

  return (
    <div className="min-h-screen bg-background">
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, Transparent{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-600">Pricing</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose the plan that fits your needs. Upgrade or downgrade anytime.
          </p>
        </div>

        {/* Token Selection */}
        <div className="flex justify-center gap-3 mb-12 flex-wrap">
          {(["sol", "usdt", "usdc"] as const).map((token) => (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`p-6 flex flex-col relative ${
                plan.popular ? "border-primary/50 bg-gradient-to-b from-primary/10 to-transparent" : ""
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
                <p className="text-muted-foreground text-sm capitalize">{plan.period}ly billing</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold">${plan.price.usd}</span>
                <p className="text-muted-foreground text-sm">per {plan.period}</p>
                {selectedToken !== "sol" && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {plan.price[selectedToken]} {selectedToken.toUpperCase()}
                  </p>
                )}
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
                disabled={processing || (plan.price.usd === 0 && !connected)}
                className={plan.popular ? "bg-gradient-to-r from-primary to-orange-600 w-full" : "w-full"}
              >
                {plan.price.usd === 0 ? "Get Started" : connected ? "Subscribe" : "Connect Wallet"}
              </Button>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-2xl mx-auto">
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
                We accept SOL, USDT, and USDC on the Solana network. Payments are processed directly to your wallet.
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
