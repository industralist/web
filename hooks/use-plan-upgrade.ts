"use client"

import { useState, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Connection, PublicKey, Transaction, clusterApiUrl } from "@solana/web3.js"
import { createTransferInstruction, getAssociatedTokenAddress } from "@solana/spl-token"

export function usePlanUpgrade() {
  const { connected, publicKey, sendTransaction, connect } = useWallet()
  const [loading, setLoading] = useState(false)
  const [successPlan, setSuccessPlan] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed")

  const merchantAddress = new PublicKey(`${process.env.NEXT_PUBLIC_SOLANA_PAYMENT_DESTINATION}`)

  // USDT token mint
  const USDT_MINT = "EPjFWaLb3oCRY59QuU9CLYy37qjodnKwDvE5tqKDqaP"

  const upgradePlan = useCallback(
    async (plan: "Pro" | "Pro+") => {
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

        // USDT amounts (300 or 500 with 6 decimals)
        const usdtAmount = plan === "Pro" ? 300 : 500
        const tokenAmount = usdtAmount * 1_000_000

        const usdtMint = new PublicKey(USDT_MINT)

        // Get associated token accounts
        const senderTokenAccount = await getAssociatedTokenAddress(usdtMint, publicKey)
        const recipientTokenAccount = await getAssociatedTokenAddress(usdtMint, merchantAddress)

        // Create transfer instruction
        const transferInstruction = createTransferInstruction(
          senderTokenAccount,
          recipientTokenAccount,
          publicKey,
          BigInt(tokenAmount),
        )

        const tx = new Transaction().add(transferInstruction)

        // Get latest blockhash to avoid stale transaction
        const latestBlockhash = await connection.getLatestBlockhash()
        tx.recentBlockhash = latestBlockhash.blockhash
        tx.feePayer = publicKey

        const signature = await sendTransaction(tx, connection)
        await connection.confirmTransaction(signature, "confirmed")

        // Persist plan
        localStorage.setItem("user_plan", plan)
        localStorage.setItem("plan_signature", signature)
        setSuccessPlan(plan)
      } catch (err: any) {
        const errorMessage = err.message || "Payment failed. Please try again."
        console.error("Payment upgrade error:", err)
        setError(errorMessage)
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
