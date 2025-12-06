"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle, Loader2, ExternalLink } from "lucide-react"

interface TransactionVerificationProps {
  transactionHash: string
  userId: string
  onVerified?: () => void
}

export function TransactionVerification({ transactionHash, userId, onVerified }: TransactionVerificationProps) {
  const [status, setStatus] = useState<"checking" | "verified" | "failed" | "timeout">("checking")
  const [payment, setPayment] = useState<any>(null)
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 12 // 1 minute with 5-second intervals

  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (retryCount > maxRetries) {
        setStatus("timeout")
        return
      }

      try {
        const response = await fetch(`/api/payments/verify?hash=${transactionHash}&userId=${userId}`)
        const data = await response.json()

        console.log("[v0] Payment verification status:", data)

        if (data.status === "confirmed") {
          setPayment(data.payment)
          setStatus("verified")
          onVerified?.()
        } else if (data.status === "pending") {
          // Retry after 5 seconds
          setRetryCount((prev) => prev + 1)
          setTimeout(checkPaymentStatus, 5000)
        } else if (data.status === "failed") {
          setStatus("failed")
        }
      } catch (error) {
        console.error("[v0] Verification error:", error)
        setRetryCount((prev) => prev + 1)
        if (retryCount < maxRetries) {
          setTimeout(checkPaymentStatus, 5000)
        } else {
          setStatus("timeout")
        }
      }
    }

    checkPaymentStatus()
  }, [transactionHash, userId, retryCount, maxRetries, onVerified])

  const handleRetry = () => {
    setRetryCount(0)
    setStatus("checking")
  }

  const explorerUrl = `https://solscan.io/tx/${transactionHash}?cluster=devnet`

  return (
    <Card className="p-6 border-primary/20 bg-card-bg">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-0.5">
          {status === "checking" && <Loader2 className="w-6 h-6 text-primary animate-spin" />}
          {status === "verified" && <CheckCircle className="w-6 h-6 text-green-500" />}
          {status === "failed" && <AlertCircle className="w-6 h-6 text-destructive" />}
          {status === "timeout" && <AlertCircle className="w-6 h-6 text-yellow-500" />}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold capitalize mb-1">
            {status === "checking" && "Verifying Transaction..."}
            {status === "verified" && "Payment Verified"}
            {status === "failed" && "Payment Failed"}
            {status === "timeout" && "Verification Timeout"}
          </h3>

          <p className="text-sm text-muted-foreground mb-3">
            {status === "checking" && "Your transaction is being recorded in our system."}
            {status === "verified" && "Your subscription has been successfully activated!"}
            {status === "failed" && "There was an issue verifying your payment."}
            {status === "timeout" &&
              "Verification is taking longer than expected. Your transaction may still be processing."}
          </p>

          <div className="text-xs font-mono text-muted-foreground break-all mb-4 p-2 bg-background rounded">
            {transactionHash}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" asChild>
              <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Solscan
              </a>
            </Button>

            {(status === "failed" || status === "timeout") && (
              <Button size="sm" onClick={handleRetry} variant="outline">
                Retry Verification
              </Button>
            )}
          </div>

          {status === "verified" && payment && (
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded text-sm">
              <p className="font-semibold text-green-600">Plan: {payment.subscription?.plan_type}</p>
              <p className="text-green-600/80">Amount: ${payment.amount_usd} USD</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
