"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/auth-provider"
import { Loader2 } from "lucide-react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { Transaction } from "@solana/web3.js"
import { confirmTransactionWithPolling } from "@/lib/confirm-transaction"

interface PaymentFormProps {
  planType: "monthly" | "yearly"
  planId: string
}

export function PaymentForm({ planType, planId }: PaymentFormProps) {
  const { user } = useAuth()
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()
  const [tokenType, setTokenType] = useState<"sol">("sol")
  const [loading, setLoading] = useState(false)
  const [prices, setPrices] = useState<Record<string, { usdt: number; usdc: number; sol: number }> | null>(null)

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch("/api/payment/prices")
        const data = await res.json()
        setPrices(data.prices)
      } catch (error) {
        console.error("[v0] Error fetching prices:", error)
      }
    }
    fetchPrices()
  }, [])

  if (!prices) {
    return <div>Loading prices...</div>
  }

  const price = prices[planId]?.[tokenType]

  if (!price) {
    return <div>Plan not found</div>
  }

  const handlePayment = async () => {
    if (!publicKey || !user) {
      alert("Please connect your wallet first")
      return
    }

    setLoading(true)
    try {
      console.log("[v0] Starting payment with plan:", planId, "amount:", price.amount, "token:", tokenType)

      const createRes = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicKey: publicKey.toBase58(),
          plan: planId,
          tokenType,
        }),
      })

      if (!createRes.ok) {
        const error = await createRes.json()
        throw new Error(error.error || "Failed to create transaction")
      }

      const { transaction: txBase64, blockhash } = await createRes.json()
      console.log("[v0] Transaction created, sending to wallet...")

      // Deserialize and sign
      const tx = Transaction.from(Buffer.from(txBase64, "base64"))

      const signature = await sendTransaction(tx, connection)
      console.log("[v0] Transaction signature:", signature)

      await confirmTransactionWithPolling(connection, signature)
      console.log("[v0] Transaction confirmed")

      // Record payment in database
      const payRes = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          planType,
          tokenType,
          tokenAmount: price.amount,
          amountUsd: prices[planId].usdt, // Use USDT as USD reference
          transactionHash: signature,
        }),
      })

      if (payRes.ok) {
        alert("Payment successful!")
      }
    } catch (error: any) {
      console.error("[v0] Payment error:", error)
      alert(`Payment failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Select Payment Token</h3>
        <RadioGroup value={tokenType} onValueChange={setTokenType}>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 border border-card-border rounded-lg cursor-pointer hover:bg-card-bg">
              <RadioGroupItem value="sol" id="sol" />
              <Label htmlFor="sol" className="flex-1 cursor-pointer">
                <div className="font-semibold uppercase">SOL</div>
                <div className="text-sm text-muted-foreground">
                  {price.amount.toFixed(4)} SOL ≈ ${prices[planId].usdt}
                </div>
              </Label>
            </div>
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
          <span className="text-lg font-bold text-primary">${prices[planId].usdt}</span>
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
          `Pay ${price.amount.toFixed(4)} SOL`
        )}
      </Button>
    </Card>
  )
}
