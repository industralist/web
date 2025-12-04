"use client"

import { motion } from "framer-motion"
import { ArrowRight, Zap, TrendingUp, Lock, BarChart3 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { RotatingGlobe } from "@/components/rotating-globe"
import { useCallback } from "react"
import { useAuth } from "@/components/auth-provider"

export default function LandingPage() {
  const { loginWithWallet } = useAuth()

  const handleConnectWallet = useCallback(async () => {
    const element = document.querySelector("[data-wallet-button]") as HTMLElement
    element?.click()
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
        <RotatingGlobe />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-bold text-balance leading-tight">
                  Track Tokens in{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-500 to-red-500">
                    Real-Time
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground text-balance">
                  Monitor emerging tokens, track wallet movements, and get instant notifications. The complete
                  blockchain intelligence platform for traders and investors.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground group"
                  onClick={handleConnectWallet}
                >
                  Connect Wallet <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/pricing">View Pricing</Link>
                </Button>
              </div>

              <div className="flex gap-8 pt-4 text-sm">
                <div>
                  <p className="font-semibold text-foreground">500+</p>
                  <p className="text-muted-foreground">Active Users</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">10M+</p>
                  <p className="text-muted-foreground">Requests Daily</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">99.9%</p>
                  <p className="text-muted-foreground">Uptime SLA</p>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative h-96 hidden md:block"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 rounded-2xl blur-3xl"></div>
              <div className="relative h-full rounded-2xl border border-card-border bg-card-bg p-6 flex flex-col items-center justify-center glass">
                <TrendingUp className="w-20 h-20 text-primary/60 mb-4" />
                <p className="text-center text-muted-foreground text-sm">Real-time token tracking dashboard</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32 bg-gradient-to-b from-card-bg/50 to-background border-y border-card-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-muted-foreground">Everything you need for blockchain intelligence</p>
          </div>

          {/* Four Main Features with Expanded Details */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {[
              {
                icon: BarChart3,
                title: "Real-Time Token Tracking",
                desc: "Monitor token performance with up-to-the-second updates powered by fast Solana RPC connections. Track price movements, volume changes, and market cap fluctuations across multiple tokens simultaneously.",
              },
              {
                icon: Zap,
                title: "Instant Notifications",
                desc: "Get alerts when price changes cross your thresholds or major movements are detected. Never miss important market events with our intelligent notification system that learns your preferences.",
              },
              {
                icon: Lock,
                title: "Secure & Reliable",
                desc: "Built with redundancy, fast endpoints, and industry-level security practices for trusted analytics. Your data is encrypted and backed up with 99.9% uptime SLA guaranteed.",
              },
              {
                icon: TrendingUp,
                title: "Historical Insights",
                desc: "Visualize token behavior over time with clean charts and trend indicators. Access detailed historical data to identify patterns and make informed investment decisions.",
              },
            ].map((feature, i) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="group p-8 rounded-lg border border-card-border bg-card hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 card-brown-hover"
                >
                  <Icon className="w-10 h-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-2xl mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground text-base leading-relaxed">{feature.desc}</p>
                </motion.div>
              )
            })}
          </div>

          {/* Additional Feature Highlights */}
          <div className="bg-card border border-card-border rounded-lg p-12">
            <h3 className="text-2xl font-bold mb-8 text-center">Why Choose Pifflepath?</h3>
            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">10M+</div>
                <p className="text-muted-foreground">API Requests Daily</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">500+</div>
                <p className="text-muted-foreground">Active Traders Using Pifflepath</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
                <p className="text-muted-foreground">Platform Uptime Guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground mb-8">Start free, scale as you grow</p>
          </div>

          {/* Quick Pricing Preview */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
            {[
              { name: "Free", price: "$0", requests: "100 requests/day", color: "from-gray-500" },
              { name: "Pro", price: "$300", requests: "3,000 requests/day", color: "from-primary", popular: true },
              { name: "Pro+", price: "$500", requests: "10,000 requests/day", color: "from-orange-500" },
            ].map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`p-6 rounded-lg border transition-all ${
                  plan.popular
                    ? "border-primary/50 bg-gradient-to-b from-primary/10 to-transparent scale-105"
                    : "border-card-border bg-card"
                }`}
              >
                {plan.popular && (
                  <div className="mb-3">
                    <span className="text-xs bg-gradient-to-r from-primary to-orange-600 text-white px-3 py-1 rounded-full font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className="font-semibold text-lg mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold mb-2">{plan.price}</div>
                <p className="text-sm text-muted-foreground mb-4">/month</p>
                <p className="text-sm font-medium">{plan.requests}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Button size="lg" asChild>
              <Link href="/pricing">View Full Pricing & Details</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-r from-primary/10 via-card-bg to-secondary/10 border-y border-card-border">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="text-4xl md:text-5xl font-bold">Ready to Get Started?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect your wallet and start tracking tokens in real-time today.
            </p>
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground group"
              onClick={handleConnectWallet}
            >
              Connect Wallet Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
