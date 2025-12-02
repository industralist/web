"use client";

import { Check } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Connection,
  PublicKey,
  clusterApiUrl,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";
import { toast } from "sonner";

export default function PricingPage() {
  const { connected, publicKey, sendTransaction, connect } = useWallet();
  const merchantAddress = new PublicKey(
    "BNtr6PvLY2zVBCH9gyEGwNMBBeiRXaK6YfWfWW5yhgxQ"
  );
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const handleSubscribe = async (plan: "Pro" | "Pro+") => {
    try {
      if (!connected) {
        await connect();
        return;
      }

      if (!publicKey) {
        alert("Wallet not selected. Please select a wallet.");
        return;
      }

      const price = plan === "Pro" ? 0.1 : 0.2;
      const lamports = price * 1_000_000_000;

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: merchantAddress,
          lamports,
        })
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");

      console.log(`Payment successful! Transaction: ${signature}`);
    } catch (err: any) {
      console.error(err);
      console.log(err.message || "Payment failed.");
    }
  };

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
      description: "3,000 daily requests, Solana network access",
      features: [
        "3,000 API requests per day",
        "Solana network access",
        "Priority support",
        "Advanced analytics",
      ],
      buttonText: connected ? "Subscribe with SOL" : "Connect Wallet",
      onClick: () => handleSubscribe("Pro"),
      popular: true,
    },
    {
      title: "Pro+",
      price: "500 USDT",
      period: "/month",
      description:
        "10,000 daily requests, includes all Pro features plus crypto transaction tracing",
      features: [
        "10,000 API requests per day",
        "Pro plan features included",
        "Crypto transaction tracing",
        "Priority support",
        "Full Solana network access",
      ],
      buttonText: connected ? "Subscribe with SOL" : "Connect Wallet",
      onClick: () => handleSubscribe("Pro+"),
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <section className="py-20 container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            Pricing Built for{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-500 to-red-500">
              Every User
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Flexible plans designed for analysts, investigators, and security
            teams. Powered by Solana.
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
              } transition-all flex flex-col relative`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-linear-to-r from-orange-500 to-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <h3 className="font-semibold text-2xl mb-2">{plan.title}</h3>
              <div className="mb-3">
                {plan.price && (
                  <span className="text-5xl font-extrabold">{plan.price}</span>
                )}
                {plan.period && (
                  <span className="text-gray-400 text-lg">{plan.period}</span>
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
                className={`w-full py-3 px-6 rounded-lg font-medium ${
                  plan.popular
                    ? connected
                      ? "bg-linear-to-r from-orange-500 to-red-500 text-white hover:opacity-90 cursor-pointer"
                      : "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : connected
                    ? "border border-white/20 text-white hover:bg-white/5 cursor-pointer"
                    : "border border-gray-600 text-gray-400 cursor-not-allowed"
                }`}
                onClick={plan.onClick}
                disabled={plan.title !== "Free" && !connected}>
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
