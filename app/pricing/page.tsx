"use client"

import { Check } from "lucide-react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Connection, PublicKey, clusterApiUrl, Transaction } from "@solana/web3.js"
import { getAssociatedTokenAddress, createTransferInstruction } from "@solana/spl-token"
import { toast } from "sonner"
import { useState } from "react"
import {
  simulateTransaction,
  validatePaymentParams,
  parseTransactionError,
  createSOLTransferInstruction,
  solToLamports,
} from "@/lib/transaction-utils"

export default function PricingPage() {
  const { connected, publicKey, sendTransaction, connect } = useWallet()
  const [isProcessing, setIsProcessing] = useState(false)
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly")
  const [paymentMethod, setPaymentMethod] = useState<"SOL" | "USDT">("USDT")

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

      // Calculate amount based on billing period
      let usdtAmount = plan === "Pro" ? 300 : 500
      let solAmount = plan === "Pro" ? 0.5 : 1.0 // Example SOL prices

      if (billingPeriod === "yearly") {
        usdtAmount = usdtAmount * 10 // 10x discount
        solAmount = solAmount * 10
      }

      // Validate payment parameters
      const validation = validatePaymentParams(
        paymentMethod === "USDT" ? usdtAmount : solAmount,
        merchantAddress.toBase58(),
        plan,
        billingPeriod,
        paymentMethod,
      )

      if (!validation.valid) {
        toast.error(validation.error)
        return
      }

      let transferInstruction
      let transactionAmount: bigint

      if (paymentMethod === "USDT") {
        // USDT transfer with 6 decimals
        transactionAmount = BigInt(usdtAmount * 1_000_000)
        const usdtMint = new PublicKey(USDT_MINT)

        // Get associated token accounts
        const senderTokenAccount = await getAssociatedTokenAddress(usdtMint, publicKey)
        const recipientTokenAccount = await getAssociatedTokenAddress(usdtMint, merchantAddress)

        // Verify sender has token account
        const senderAccountInfo = await connection.getAccountInfo(senderTokenAccount)
        if (!senderAccountInfo) {
          toast.error("You don't have a USDT token account. Please create one first.")
          setIsProcessing(false)
          return
        }

        transferInstruction = createTransferInstruction(
          senderTokenAccount,
          recipientTokenAccount,
          publicKey,
          transactionAmount,
        )
      } else {
        // SOL transfer
        transactionAmount = solToLamports(solAmount)
        transferInstruction = await createSOLTransferInstruction(publicKey, merchantAddress, transactionAmount)
      }

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

      toast.success(`${plan} plan activated for ${billingPeriod}! Transaction: ${signature.slice(0, 20)}...`)

      // Store subscription info
      localStorage.setItem("user_plan", plan)
      localStorage.setItem("billing_period", billingPeriod)
      localStorage.setItem("plan_signature", signature)
      localStorage.setItem("subscription_start", new Date().toISOString())
    } catch (err: any) {
      const errorMessage = parseTransactionError(err)
      console.error("Payment error:", err)
      toast.error(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const getPrice = (basePriceUSDT: number, basePriceSOL: number) => {
    if (paymentMethod === "USDT") {
      return billingPeriod === "yearly" ? basePriceUSDT * 10 : basePriceUSDT
    }
    return billingPeriod === "yearly" ? basePriceSOL * 10 : basePriceSOL
  }

  const plans = [
    {
      title: "Free",
      priceUSDT: 0,
      priceSOL: 0,
      description: "Limited access, Solana network only",
      features: ["Limited requests per day", "Solana network access only", "Community support"],
      buttonText: "Get Started",
      onClick: () => console.log("Free plan selected"),
    },
    {
      title: "Pro",
      priceUSDT: 300,
      priceSOL: 0.5,
      description: "3,000 daily requests",
      features: ["3,000 API requests per day", "Blockchain network access", "Priority support", "Advanced analytics"],
      buttonText: connected ? (isProcessing ? "Processing..." : "Subscribe Pro") : "Connect Wallet",
      onClick: () => handleSubscribe("Pro"),
      popular: true,
    },
    {
      title: "Pro+",
      priceUSDT: 500,
      priceSOL: 1.0,
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

        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-16">
          {/* Billing Period Toggle */}
          <div className="flex items-center gap-4">
            <span className="text-gray-300">Billing Period:</span>
            <div className="flex gap-2 bg-white/10 p-1 rounded-lg">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`px-4 py-2 rounded font-medium transition-all ${
                  billingPeriod === "monthly"
                    ? "bg-linear-to-r from-orange-500 to-red-500 text-white"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod("yearly")}
                className={`px-4 py-2 rounded font-medium transition-all ${
                  billingPeriod === "yearly"
                    ? "bg-linear-to-r from-orange-500 to-red-500 text-white"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                Yearly (Save 10x)
              </button>
            </div>
          </div>

          {/* Payment Method Toggle */}
          <div className="flex items-center gap-4">
            <span className="text-gray-300">Pay with:</span>
            <div className="flex gap-2 bg-white/10 p-1 rounded-lg">
              <button
                onClick={() => setPaymentMethod("USDT")}
                className={`px-4 py-2 rounded font-medium transition-all ${
                  paymentMethod === "USDT"
                    ? "bg-linear-to-r from-orange-500 to-red-500 text-white"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                USDT
              </button>
              <button
                onClick={() => setPaymentMethod("SOL")}
                className={`px-4 py-2 rounded font-medium transition-all ${
                  paymentMethod === "SOL"
                    ? "bg-linear-to-r from-orange-500 to-red-500 text-white"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                SOL
              </button>
            </div>
          </div>
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
                {plan.title !== "Free" && (
                  <>
                    <span className="text-5xl font-extrabold">
                      {paymentMethod === "USDT"
                        ? getPrice(plan.priceUSDT, plan.priceSOL)
                        : getPrice(plan.priceUSDT, plan.priceSOL)}
                    </span>
                    <span className="text-gray-400 text-lg ml-2">{paymentMethod}</span>
                    <span className="text-gray-400 text-lg">{billingPeriod === "yearly" ? "/year" : "/month"}</span>
                  </>
                )}
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
