"use client"

import { motion } from "framer-motion"
import { Copy, Code2, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useState } from "react"
import { toast } from "sonner"
import Link from "next/link"

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<"curl" | "js" | "python">("curl")

  const copyExample = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard!")
  }

  const codeExamples = {
    wallet: {
      curl: `curl -H "Authorization: Bearer YOUR_API_KEY" \\
  https://api.pifflepath.com/v1/wallet/EPjFWaLb3odccxmLVGGJMKc1EvYkUyt2j9tzLCUHhP8i`,
      js: `const response = await fetch(
  'https://api.pifflepath.com/v1/wallet/EPjFWaLb3o...',
  {
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY'
    }
  }
);
const data = await response.json();`,
      python: `import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY'
}
response = requests.get(
    'https://api.pifflepath.com/v1/wallet/EPjFWaLb3o...',
    headers=headers
)
data = response.json()`,
    },
    transactions: {
      curl: `curl -H "Authorization: Bearer YOUR_API_KEY" \\
  https://api.pifflepath.com/v1/wallet/EPjFWaLb3o.../transactions?limit=50`,
      js: `const response = await fetch(
  'https://api.pifflepath.com/v1/wallet/EPjFWaLb3o.../transactions?limit=50',
  {
    headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
  }
);`,
      python: `response = requests.get(
    'https://api.pifflepath.com/v1/wallet/EPjFWaLb3o.../transactions?limit=50',
    headers={'Authorization': 'Bearer YOUR_API_KEY'}
)`,
    },
  }

  const endpoints = [
    {
      method: "GET",
      path: "/v1/wallet/:address",
      description: "Fetch complete wallet information including balance, token accounts, and recent transactions",
      response: {
        address: "EPjFWaLb3o...",
        balance: 150.5,
        tokenCount: 12,
        transactionCount: 245,
        transactions: [],
      },
    },
    {
      method: "GET",
      path: "/v1/wallet/:address/transactions",
      description: "Get paginated transaction history with filtering options",
      params: "?limit=50&offset=0&type=all",
    },
    {
      method: "GET",
      path: "/v1/tokens/trending",
      description: "Get current trending tokens with price data",
      response: {
        tokens: [
          { symbol: "SOL", price: 150.25, change24h: 2.5 },
          { symbol: "USDC", price: 1.0, change24h: 0.0 },
        ],
      },
    },
  ]

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 border-b border-border">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium text-primary">Documentation</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Build with the Pifflepath API</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Integrate blockchain intelligence into your applications. Real-time wallet tracking, transaction
              monitoring, and token analysis.
            </p>
            <div className="flex gap-3">
              <Button asChild>
                <Link href="/api-keys">Get Your API Key</Link>
              </Button>
              <Button variant="outline">View on GitHub</Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="py-20 border-b border-border">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-3xl font-bold mb-2">Quick Start</h2>
              <p className="text-muted-foreground">Get up and running in minutes</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { step: 1, title: "Create API Key", desc: "Generate a new API key from your dashboard" },
                { step: 2, title: "Choose Endpoint", desc: "Select from wallet, transaction, or token endpoints" },
                { step: 3, title: "Make Request", desc: "Include your API key in the Authorization header" },
              ].map((item) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: item.step * 0.1 }}
                  className="relative p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors"
                >
                  <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* API Reference */}
      <section className="py-20 border-b border-border">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-3xl font-bold mb-2">API Endpoints</h2>
              <p className="text-muted-foreground">Complete reference for available endpoints</p>
            </div>

            {endpoints.map((endpoint, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            endpoint.method === "GET"
                              ? "bg-blue-500/10 text-blue-500"
                              : "bg-green-500/10 text-green-500"
                          }`}
                        >
                          {endpoint.method}
                        </span>
                        <code className="font-mono text-sm text-foreground">{endpoint.path}</code>
                      </div>
                      <p className="text-muted-foreground text-sm">{endpoint.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Example Requests */}
      <section className="py-20 border-b border-border">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-3xl font-bold mb-2">Example Requests</h2>
              <p className="text-muted-foreground">See how to use the Pifflepath API</p>
            </div>

            {/* Wallet Endpoint Example */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Code2 className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Fetch Wallet Data</h3>
              </div>

              <div className="space-y-4">
                {/* Language Tabs */}
                <div className="flex gap-2 border-b border-border">
                  {(["curl", "js", "python"] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setActiveTab(lang)}
                      className={`px-4 py-2 border-b-2 transition-colors text-sm font-medium ${
                        activeTab === lang
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Code Block */}
                <div className="relative">
                  <pre className="bg-background p-4 rounded-lg overflow-x-auto text-xs">
                    <code className="text-foreground/70">{codeExamples.wallet[activeTab]}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyExample(codeExamples.wallet[activeTab])}
                    className="absolute top-2 right-2"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Authentication */}
      <section className="py-20 border-b border-border">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-3xl font-bold mb-2">Authentication</h2>
              <p className="text-muted-foreground">All requests require an API key</p>
            </div>

            <Card className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Include your API key in the <code className="bg-background px-2 py-1 rounded">Authorization</code>{" "}
                header of every request:
              </p>
              <div className="bg-background p-4 rounded-lg border border-border font-mono text-sm overflow-x-auto">
                <code className="text-foreground/70">Authorization: Bearer YOUR_API_KEY</code>
              </div>
              <p className="text-xs text-muted-foreground">
                🔒 Never expose your API key in client-side code or version control. Treat it like a password.
              </p>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Rate Limiting */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-3xl font-bold mb-2">Rate Limiting</h2>
              <p className="text-muted-foreground">Fair usage limits for all plans</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { plan: "Free", limit: "100 requests/day", concurrent: "1" },
                { plan: "Pro", limit: "3,000 requests/day", concurrent: "5" },
                { plan: "Pro+", limit: "10,000 requests/day", concurrent: "20" },
              ].map((item) => (
                <Card key={item.plan} className="p-6">
                  <p className="font-semibold mb-3">{item.plan}</p>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Daily Limit</p>
                      <p className="font-mono text-primary">{item.limit}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Concurrent</p>
                      <p className="font-mono text-primary">{item.concurrent}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
