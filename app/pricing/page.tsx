"use client";

import { Check } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <section className="py-20 container mx-auto px-4">
        {/* Header */}
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

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Plan */}
          <div className="p-8 rounded-2xl border border-white/10 bg-white/2 hover:bg-white/4 transition-all flex flex-col">
            <h3 className="font-semibold text-2xl mb-2">Free</h3>

            <div className="mb-3">
              {/* <span className="text-5xl font-extrabold">0</span>     */}
            </div>

            <p className="text-gray-400 text-sm mb-8">
              Limited access, Solana network only
            </p>

            {/* Features */}
            <div className="space-y-4 mb-8 grow">
              {["Limited requests per day", "Solana network access only"].map(
                (item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">{item}</span>
                  </div>
                )
              )}
            </div>

            <button className="w-full py-3 px-6 rounded-lg border cursor-pointer border-white/20 text-white hover:bg-white/5 transition-all font-medium">
              Get Started
            </button>
          </div>

          {/* Pro Plan */}
          <div className="p-8 rounded-2xl border border-orange-500/40 bg-linear-to-b from-orange-500/10 to-transparent relative flex flex-col">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-linear-to-r from-orange-500 to-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Most Popular
              </span>
            </div>

            <h3 className="font-semibold text-2xl mb-2">Pro</h3>

            <div className="mb-3">
              <span className="text-5xl font-extrabold">300 USDT</span>
              <span className="text-gray-400 text-lg">/month</span>
            </div>

            <p className="text-gray-400 text-sm mb-2">3,200 USDT/year</p>
            <p className="text-gray-400 text-sm mb-8">
              3,000 daily requests, Solana network access
            </p>

            <div className="space-y-4 mb-8 grow">
              {[
                "3,000 API requests per day",
                "Solana network access",
                "Priority support",
                "Advanced analytics",
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm">{item}</span>
                </div>
              ))}
            </div>

            <button className="w-full py-3 px-6 cursor-pointer rounded-lg bg-linear-to-r from-orange-500 to-red-500 text-white hover:opacity-90 transition-all font-medium">
              Subscribe with SOL
            </button>
          </div>

          {/* Pro+ Plan */}
          <div className="p-8 rounded-2xl border border-white/10 bg-white/2 hover:bg-white/4 transition-all flex flex-col">
            <h3 className="font-semibold text-2xl mb-2">Pro+</h3>

            <div className="mb-3">
              <span className="text-5xl font-extrabold">500 USDT</span>
              <span className="text-gray-400 text-lg">/month</span>
            </div>

            <p className="text-gray-400 text-sm mb-2">5,200 USDT/year</p>
            <p className="text-gray-400 text-sm mb-8">
              10,000 daily requests, includes all Pro features plus crypto
              transaction tracing
            </p>

            <div className="space-y-4 mb-8 grow">
              {[
                "10,000 API requests per day",
                "Pro plan features included",
                "Crypto transaction tracing",
                "Priority support",
                "Full Solana network access",
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm">{item}</span>
                </div>
              ))}
            </div>

            <button className="w-full py-3 px-6 rounded-lg cursor-pointer bg-linear-to-r from-orange-500 to-red-500 text-white hover:opacity-90 transition-all font-medium">
              Subscribe with SOL
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
