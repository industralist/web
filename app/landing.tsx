"use client"

import { motion } from "framer-motion"
import { ArrowRight, Zap, TrendingUp, Lock, BarChart3, Shield, Gauge, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useCallback, useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import DashboardLayout from "@/components/dashboard-layout"

const WalletSearch = dynamic(
  () => import("@/components/wallet-search").then((mod) => ({ default: mod.WalletSearch })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-64 bg-card rounded-lg animate-pulse flex items-center justify-center text-muted-foreground">
        Loading explorer...
      </div>
    ),
  },
)

export default function LandingPage() {
  const { user, loginWithWallet } = useAuth()
  const { connected, publicKey } = useWallet()
  const { setVisible } = useWalletModal()
  const router = useRouter()
  const [loggingIn, setLoggingIn] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")

  useEffect(() => {
    if (connected && publicKey && !user) {
      const loginAndRedirect = async () => {
        try {
          setLoggingIn(true)
          await loginWithWallet(publicKey.toBase58())
          // Don't redirect - stay on landing page with explorer
          setTimeout(() => {
            setLoggingIn(false)
          }, 500)
        } catch (error) {
          console.error("Login failed:", error)
          setLoggingIn(false)
        }
      }
      loginAndRedirect()
    }
  }, [connected, publicKey, user, loginWithWallet, router])

  const handleConnectWallet = useCallback(() => {
    if (!connected) {
      setVisible(true)
    } else if (publicKey && !user) {
      handleManualLogin()
    }
  }, [connected, publicKey, user, setVisible])

  const handleManualLogin = async () => {
    if (publicKey) {
      setLoggingIn(true)
      try {
        await loginWithWallet(publicKey.toBase58())
        setTimeout(() => {
          setLoggingIn(false)
        }, 500)
      } catch (error) {
        console.error("Login failed:", error)
        setLoggingIn(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent rounded-full blur-3xl"
            animate={{
              y: [0, 30, 0],
              x: [0, 20, 0],
            }}
            transition={{
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-secondary/20 via-secondary/5 to-transparent rounded-full blur-3xl"
            animate={{
              y: [0, -30, 0],
              x: [0, -20, 0],
            }}
            transition={{
              duration: 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: 1,
            }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="inline-block"
                >
                  <span className="text-xs bg-gradient-to-r from-primary to-orange-600 text-white px-4 py-2 rounded-full font-medium">
                    ✨ The Complete Blockchain Intelligence Platform
                  </span>
                </motion.div>

                <h1 className="text-4xl md:text-5xl font-bold text-balance leading-tight">
                  Track Tokens, Monitor{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-500 to-red-500">
                    Wallets, Stay Ahead
                  </span>
                </h1>

                <p className="text-base md:text-lg text-muted-foreground text-balance leading-relaxed font-light">
                  Whether you're a trader seeking emerging opportunities, an investor analyzing market trends, an
                  investigator tracking suspicious activity, or a compliance officer monitoring blockchain transactions
                  — Pifflepath gives you real-time intelligence and actionable insights.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-700 text-white group px-8 py-6 text-lg rounded-lg"
                    onClick={handleConnectWallet}
                    disabled={loggingIn}
                  >
                    {loggingIn ? "Logging in..." : "Connect Wallet & Get Started"}{" "}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" variant="outline" asChild className="px-8 py-6 text-lg bg-transparent">
                    <Link href="/pricing">View Pricing</Link>
                  </Button>
                </motion.div>
              </div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex gap-8 pt-4 border-t border-card-border pt-8"
              >
                {[
                  { value: "500+", label: "Active Users" },
                  { value: "10M+", label: "Daily Requests" },
                  { value: "99.9%", label: "Uptime SLA" },
                ].map((stat, i) => (
                  <motion.div key={i} whileInView={{ scale: 1.05 }} viewport={{ once: true }}>
                    <p className="font-bold text-lg text-primary">{stat.value}</p>
                    <p className="text-muted-foreground text-sm mt-1">{stat.label}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Column - Empty for responsiveness */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative h-96 md:h-full md:min-h-screen flex items-center justify-center hidden md:flex"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-secondary/20 rounded-3xl blur-3xl"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section
        id="features"
        className="py-20 md:py-32 bg-gradient-to-b from-card/50 to-background border-y border-border"
      >
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Built for Everyone</h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              From traders to compliance officers, Pifflepath provides the tools you need
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: TrendingUp,
                title: "Traders & Investors",
                desc: "Discover emerging tokens, track whale movements, and identify trading opportunities in real-time.",
              },
              {
                icon: Shield,
                title: "Compliance Officers",
                desc: "Monitor transactions, detect suspicious patterns, and generate audit reports for regulatory requirements.",
              },
              {
                icon: AlertCircle,
                title: "Investigators",
                desc: "Trace fund flows, identify wallets of interest, and build comprehensive transaction histories.",
              },
              {
                icon: Gauge,
                title: "Risk Analysts",
                desc: "Analyze wallet behavior, assess counterparty risk, and monitor portfolio exposure in real-time.",
              },
            ].map((useCase, i) => {
              const Icon = useCase.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10"
                >
                  <Icon className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-lg mb-2">{useCase.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{useCase.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-background to-card-bg/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-muted-foreground">Everything you need for blockchain intelligence</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {[
              {
                icon: BarChart3,
                title: "Real-Time Token Tracking",
                desc: "Monitor token performance with up-to-the-second updates powered by fast Solana RPC connections. Track price movements, volume changes, and market cap fluctuations across multiple tokens simultaneously with zero latency.",
              },
              {
                icon: Zap,
                title: "Instant Notifications",
                desc: "Get alerts when price changes cross your thresholds or major movements are detected. Never miss important market events with our intelligent notification system that learns your preferences and adapts to your trading style.",
              },
              {
                icon: Lock,
                title: "Secure & Reliable",
                desc: "Built with enterprise-grade security, redundancy, and fast endpoints for trusted analytics. Your data is encrypted, backed up, and delivered with 99.9% uptime SLA guaranteed across all API endpoints.",
              },
              {
                icon: TrendingUp,
                title: "Historical Insights",
                desc: "Visualize token behavior over time with clean charts and trend indicators. Access detailed historical data to identify patterns, validate strategies, and make informed decisions backed by comprehensive analytics.",
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
                  className="group p-8 rounded-lg border border-card-border bg-card hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10"
                >
                  <Icon className="w-10 h-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-2xl mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground text-base leading-relaxed">{feature.desc}</p>
                </motion.div>
              )
            })}
          </div>

          {/* Additional Feature Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-primary/10 via-card-bg to-secondary/10 border border-card-border rounded-lg p-12"
          >
            <h3 className="text-2xl font-bold mb-8 text-center">Why Choose Pifflepath?</h3>
            <div className="grid md:grid-cols-3 gap-12">
              <motion.div whileHover={{ y: -5 }} className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">10M+</div>
                <p className="text-muted-foreground">API Requests Daily</p>
              </motion.div>
              <motion.div whileHover={{ y: -5 }} className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">500+</div>
                <p className="text-muted-foreground">Active Users Worldwide</p>
              </motion.div>
              <motion.div whileHover={{ y: -5 }} className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
                <p className="text-muted-foreground">Platform Uptime SLA</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Explorer Preview Section */}
      <section className="py-20 md:py-32 bg-card-bg/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Explore Wallets Now</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Start tracking wallets instantly—no sign-up required. Get started exploring the Solana blockchain
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-card border border-border rounded-lg p-8 space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Search any Solana wallet</h3>
                <WalletSearch onAddressSubmit={(address) => setWalletAddress(address)} />
              </div>

              {walletAddress && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-border pt-6 animate-fade-in"
                >
                  <h3 className="text-sm font-semibold mb-4">Wallet Details for {walletAddress.slice(0, 8)}...</h3>
                  <div className="bg-background rounded-lg p-4 max-h-[400px] overflow-y-auto">
                    <DashboardLayout walletAddress={walletAddress} />
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-background to-card-bg/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground mb-8">Start free, scale as you grow</p>
          </motion.div>

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
                whileHover={{ y: -5 }}
                className={`p-6 rounded-lg border transition-all ${
                  plan.popular
                    ? "border-primary/50 bg-gradient-to-b from-primary/10 to-transparent scale-105 shadow-lg shadow-primary/20"
                    : "border-card-border bg-card"
                }`}
              >
                {plan.popular && (
                  <motion.div initial={{ opacity: 0, y: -10 }} whileInView={{ opacity: 1, y: 0 }} className="mb-3">
                    <span className="text-xs bg-gradient-to-r from-primary to-orange-600 text-white px-3 py-1 rounded-full font-medium">
                      Most Popular
                    </span>
                  </motion.div>
                )}
                <h3 className="font-semibold text-lg mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold mb-2">{plan.price}</div>
                <p className="text-sm text-muted-foreground mb-4">/month</p>
                <p className="text-sm font-medium text-primary">{plan.requests}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Button size="lg" asChild>
              <Link href="/pricing" className="group">
                View Full Pricing & Details{" "}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-r from-primary/10 via-card-bg to-secondary/10 border-y border-card-border relative overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 15,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="text-4xl md:text-5xl font-bold">Ready to Get Started?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join hundreds of traders, investors, analysts, and compliance officers using Pifflepath today.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-700 text-white group px-8 py-6 text-lg"
                onClick={handleConnectWallet}
                disabled={loggingIn}
              >
                {loggingIn ? "Logging in..." : "Connect Wallet Now"}{" "}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
