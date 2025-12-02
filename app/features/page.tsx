"use client";

import { BarChart3, Zap, Shield, LineChart } from "lucide-react";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <section className="py-20 container mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
          Powerful Features for Tracking{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
            Solana
          </span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Piflepath provides real-time insights, token metrics, and analytics —
          built for speed, simplicity, and accuracy.
        </p>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Feature 1 */}
          <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-4">
              <BarChart3 className="text-white" />
            </div>
            <h3 className="font-semibold text-xl mb-2">
              Real-Time Token Tracking
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Monitor token performance with up-to-the-second updates powered by
              fast Solana RPC connections.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-4">
              <Zap className="text-white" />
            </div>
            <h3 className="font-semibold text-xl mb-2">
              Instant Notifications
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Get alerts when price changes cross your thresholds or major
              movements are detected.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-4">
              <Shield className="text-white" />
            </div>
            <h3 className="font-semibold text-xl mb-2">Secure & Reliable</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Built with redundancy, fast endpoints, and industry-level security
              practices for trusted analytics.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
            <div className="w-12 h-12 rounded-lg bg-linear-to-br from-orange-500 to-red-500 flex items-center justify-center mb-4">
              <LineChart className="text-white" />
            </div>
            <h3 className="font-semibold text-xl mb-2">Historical Insights</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Visualize token behavior over time with clean charts and trend
              indicators.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
