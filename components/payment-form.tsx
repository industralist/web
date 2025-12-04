"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/auth-provider"
import { Loader2 } from "lucide-react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js"

interface PaymentFormProps {
  planType: "monthly" | "yearly"
}

export function PaymentForm({ planType }: PaymentFormProps) {
  const { user } = useAuth()
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()
  const [tokenType, setTokenType] = useState<"sol" | "usdt" | "usdc">("sol")
  const [loading, setLoading] = useState(false)

  const pricing: Record<"monthly" | "yearly", Record<"sol" | "usdt" | "usdc", { usd: number; amount: number }>> = {
    monthly: {
      sol: { usd: 49, amount: 0.25 },
      usdt: { usd: 49, amount: 49 },
      usdc: { usd: 49, amount: 49 },
    },
    yearly: {
      sol: { usd: 490, amount: 2.5 },
      usdt: { usd: 490, amount: 490 },
      usdc: { usd: 490, amount: 490 },
    },
  }

  const price = pricing[planType][tokenType]

  const handlePayment = async () => {
    if (!publicKey || !user) return

    setLoading(true)
    try {
      // Create transaction for payment
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(process.env.NEXT_PUBLIC_SOLANA_PAYMENT_DESTINATION!),
          lamports: Math.floor(price.amount * 1e9),
        }),
      )

      const signature = await sendTransaction(transaction, connection)
      await connection.confirmTransaction(signature, "confirmed")

      // Record payment in database
      const response = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          planType,
          tokenType,
          tokenAmount: price.amount,
          amountUsd: price.usd,
          transactionHash: signature,
        }),
      })

      if (response.ok) {
        alert("Payment successful!")
      }
    } catch (error) {
      console.error("Payment failed:", error)
      alert("Payment failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Select Payment Token</h3>
        <RadioGroup value={tokenType} onValueChange={(v: any) => setTokenType(v)}>
          <div className="space-y-3">
            {(["sol", "usdt", "usdc"] as const).map((token) => (
              <div
                key={token}
                className="flex items-center space-x-3 p-3 border border-card-border rounded-lg cursor-pointer hover:bg-card-bg"
              >
                <RadioGroupItem value={token} id={token} />
                <Label htmlFor={token} className="flex-1 cursor-pointer">
                  <div className="font-semibold uppercase">{token}</div>
                  <div className="text-sm text-muted-foreground">
                    {price.amount} {token.toUpperCase()} ≈ ${price.usd}
                  </div>
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </div>

      <div className="bg-card-bg p-4 rounded-lg">
        <div className="flex justify-between mb-2">
          <span className="text-muted-foreground">Plan</span>
          <span className="font-semibold">{planType === "yearly" ? "Yearly (Save 20%)" : "Monthly"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total</span>
          <span className="text-lg font-bold text-primary">${price.usd}</span>
        </div>
      </div>

      <Button
        onClick={handlePayment}
        disabled={loading || !publicKey}
        className="w-full bg-gradient-to-r from-primary to-orange-600"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Processing...
          </>
        ) : (
          `Pay ${price.amount} ${tokenType.toUpperCase()}`
        )}
      </Button>
    </Card>
  )
}
