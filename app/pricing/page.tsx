"use client"

import { Check } from "lucide-react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Connection, PublicKey, clusterApiUrl, Transaction } from "@solana/web3.js"
import { getAssociatedTokenAddress, createTransferInstruction } from "@solana/spl-token"
import { toast } from "sonner"
import { useState } from "react"
import { simulateTransaction, validatePaymentParams, parseTransactionError } from "@/lib/transaction-utils"

export default function PricingPage() {
  const { connected, publicKey, sendTransaction, connect } = useWallet()
  const [isProcessing, setIsProcessing] = useState(false)

  // USDT token address (mainnet)
  const USDT_MINT = "EPjFWaLb3oCRY59QuU9CLYy37qjodnKwDvE5tqKDqaP"
  const merchantAddress = new PublicKey("BNtr6PvLY2zVBCH9gyEGwNMBBeiRXaK6YfWfWW5yhgxQ")
  const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed")

  const handleSubscribe = async (plan: "Pro" | "Pro+") => {
    try {
      if (!connected) {
        await connect()
        return
      }

      if (!publicKey) {
        toast.error("Wallet not selected. Please select a wallet.")
        return
      }

      setIsProcessing(true)

      // Validate payment parameters
      const usdtAmount = plan === "Pro" ? 300 : 500
      const validation = validatePaymentParams(usdtAmount, merchantAddress.toBase58(), plan)

      if (!validation.valid) {
        toast.error(validation.error)
        return
      }

      // Token amount with USDT 6 decimals
      const tokenAmount = BigInt(usdtAmount * 1_000_000)
      const usdtMint = new PublicKey(USDT_MINT)

      // Get associated token accounts
      const senderTokenAccount = await getAssociatedTokenAddress(usdtMint, publicKey)
      const recipientTokenAccount = await getAssociatedTokenAddress(usdtMint, merchantAddress)

      // Create transfer instruction
      const transferInstruction = createTransferInstruction(
        senderTokenAccount,
        recipientTokenAccount,
        publicKey,
        tokenAmount,
      )

      // Build transaction
      const transaction = new Transaction().add(transferInstruction)
      const latestBlockhash = await connection.getLatestBlockhash()
      transaction.recentBlockhash = latestBlockhash.blockhash
      transaction.feePayer = publicKey

      // Simulate transaction first
      const simulation = await simulateTransaction(connection, transaction, publicKey)

      if (!simulation.success) {
        toast.error(simulation.error || "Transaction simulation failed")
        setIsProcessing(false)
        return
      }

      // Send transaction
      toast.loading("Processing payment...")
      const signature = await sendTransaction(transaction, connection)

      // Confirm transaction
      await connection.confirmTransaction(signature, "confirmed")

      toast.success(`${plan} plan activated! Transaction: ${signature.slice(0, 20)}...`)
      console.log(`Payment successful! Signature: ${signature}`)

      // Store subscription info
      localStorage.setItem("user_plan", plan)
      localStorage.setItem("plan_signature", signature)
    } catch (err: any) {
      const errorMessage = parseTransactionError(err)
      console.error("Payment error:", err)
      toast.error(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const plans = [
    {
      title: "Free",
      price: "0",
      period: "",
      description: "Limited access, Solana network only",
      features: ["Limited requests per day", "Solana network access only"],
      buttonText: "Get Started",
      onClick: () => console.log("Free plan selected"),
    },
    {
      title: "Pro",
      price: "300 USDT",
      period: "/month",
      description: "3,000 daily requests",
      features: ["3,000 API requests per day", "Blockchain network access", "Priority support", "Advanced analytics"],
      buttonText: connected ? (isProcessing ? "Processing..." : "Subscribe Pro") : "Connect Wallet",
      onClick: () => handleSubscribe("Pro"),
      popular: true,
    },
    {
      title: "Pro+",
      price: "500 USDT",
      period: "/month",
      description: "10,000 daily requests, includes all Pro features plus crypto transaction tracing",
      features: [
        "10,000 API requests per day",
        "Pro plan features included",
        "Crypto transaction tracing",
        "Priority support",
        "Full Blockchain network access",
      ],
      buttonText: connected ? (isProcessing ? "Processing..." : "Subscribe Pro+") : "Connect Wallet",
      onClick: () => handleSubscribe("Pro+"),
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      <section className="py-20 container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            Pricing Built for{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-500 to-red-500">Every User</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Flexible plans designed for analysts, investigators, and security teams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`p-8 rounded-2xl border ${
                plan.popular
                  ? "border-orange-500/40 bg-linear-to-b from-orange-500/10 to-transparent"
                  : "border-white/10 bg-white/2 hover:bg-white/4"
              } transition-all flex flex-col relative`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-linear-to-r from-orange-500 to-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <h3 className="font-semibold text-2xl mb-2">{plan.title}</h3>
              <div className="mb-3">
                {plan.price && <span className="text-5xl font-extrabold">{plan.price}</span>}
                {plan.period && <span className="text-gray-400 text-lg">{plan.period}</span>}
              </div>
              <p className="text-gray-400 text-sm mb-8">{plan.description}</p>
              <div className="space-y-4 mb-8 grow">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              <button
                className={`w-full py-3 px-6 rounded-lg font-medium transition-all ${
                  plan.popular
                    ? connected && !isProcessing
                      ? "bg-linear-to-r from-orange-500 to-red-500 text-white hover:opacity-90 cursor-pointer"
                      : "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : connected && !isProcessing
                      ? "border border-white/20 text-white hover:bg-white/5 cursor-pointer"
                      : "border border-gray-600 text-gray-400 cursor-not-allowed"
                }`}
                onClick={plan.onClick}
                disabled={plan.title !== "Free" && (!connected || isProcessing)}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
