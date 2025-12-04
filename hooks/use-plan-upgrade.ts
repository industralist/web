"use client"

import { useState, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Connection, PublicKey, Transaction, clusterApiUrl } from "@solana/web3.js"
import { createTransferInstruction, getAssociatedTokenAddress } from "@solana/spl-token"
import { toast } from "sonner"
import { solToLamports, parseTransactionError } from "@/lib/transaction-utils"

export function usePlanUpgrade() {
  const { connected, publicKey, sendTransaction, connect } = useWallet()
  const [loading, setLoading] = useState(false)
  const [successPlan, setSuccessPlan] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed")

  const merchantAddress = new PublicKey(
    process.env.NEXT_PUBLIC_SOLANA_PAYMENT_DESTINATION || "BNtr6PvLY2zVBCH9gyEGwNMBBeiRXaK6YfWfWW5yhgxQ",
  )

  // USDT token mint
  const USDT_MINT = "EPjFWaLb3oCRY59QuU9CLYy37qjodnKwDvE5tqKDqaP"

  const upgradePlan = useCallback(
    async (
      plan: "Pro" | "Pro+",
      billingPeriod: "monthly" | "yearly" = "monthly",
      paymentMethod: "USDT" | "SOL" = "USDT",
    ) => {
      try {
        setError(null)

        if (!connected) {
          await connect()
          return
        }

        if (!publicKey) {
          setError("Wallet not selected. Please select a wallet.")
          return
        }

        setLoading(true)
        setSuccessPlan(null)

        // Calculate amounts based on plan and billing period
        let usdtAmount = plan === "Pro" ? 300 : 500
        let solAmount = plan === "Pro" ? 0.5 : 1.0

        if (billingPeriod === "yearly") {
          usdtAmount = usdtAmount * 10
          solAmount = solAmount * 10
        }

        let transferInstruction

        if (paymentMethod === "USDT") {
          // USDT transfer with 6 decimals
          const tokenAmount = BigInt(usdtAmount * 1_000_000)
          const usdtMint = new PublicKey(USDT_MINT)

          // Get associated token accounts
          const senderTokenAccount = await getAssociatedTokenAddress(usdtMint, publicKey)
          const recipientTokenAccount = await getAssociatedTokenAddress(usdtMint, merchantAddress)

          // Verify sender has token account
          const senderAccountInfo = await connection.getAccountInfo(senderTokenAccount)
          if (!senderAccountInfo) {
            setError("You don't have a USDT token account. Please create one first.")
            setLoading(false)
            return
          }

          transferInstruction = createTransferInstruction(
            senderTokenAccount,
            recipientTokenAccount,
            publicKey,
            tokenAmount,
          )
        } else {
          // SOL transfer
          const { SystemProgram } = await import("@solana/web3.js")
          const lamports = Number(solToLamports(solAmount))

          transferInstruction = SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: merchantAddress,
            lamports,
          })
        }

        const tx = new Transaction().add(transferInstruction)

        // Get latest blockhash to avoid stale transaction
        const latestBlockhash = await connection.getLatestBlockhash()
        tx.recentBlockhash = latestBlockhash.blockhash
        tx.feePayer = publicKey

        const signature = await sendTransaction(tx, connection)
        await connection.confirmTransaction(signature, "confirmed")

        // Persist plan info
        localStorage.setItem("user_plan", plan)
        localStorage.setItem("billing_period", billingPeriod)
        localStorage.setItem("payment_method", paymentMethod)
        localStorage.setItem("plan_signature", signature)
        localStorage.setItem("subscription_start", new Date().toISOString())

        setSuccessPlan(plan)
        toast.success(`${plan} plan activated for ${billingPeriod}!`)
      } catch (err: any) {
        const errorMessage = parseTransactionError(err)
        console.error("Payment upgrade error:", err)
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setLoading(false)
      }
    },
    [connected, connect, publicKey, sendTransaction],
  )

  return {
    upgradePlan,
    loading,
    successPlan,
    error,
    connected,
  }
}
