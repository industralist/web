"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import { WalletSearch } from "@/components/wallet-search"

export default function WalletPage() {
  const params = useParams()
  const router = useRouter()
  const walletAddress = params.address as string
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <main className="container mx-auto px-4 py-6 md:py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">Wallet Analysis</h1>
            <p className="text-muted-foreground font-mono text-sm mt-1">{walletAddress}</p>
          </div>
          <Button onClick={() => router.back()} variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        {/* New Search */}
        <div className="bg-card p-6 rounded-lg border border-card-border">
          <h2 className="text-lg font-semibold mb-4">Search Another Wallet</h2>
          <WalletSearch onAddressSubmit={(addr) => router.push(`/wallet/${addr}`)} />
        </div>

        {/* Wallet Dashboard */}
        <DashboardLayout walletAddress={walletAddress} />
      </div>
    </main>
  )
}
