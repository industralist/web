"use client"

import { WalletSearch } from "@/components/wallet-search"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Search } from "lucide-react"

export default function ExplorerPage() {
  const [walletAddress, setWalletAddress] = useState("")

  return (
    <main className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Explorer</h1>
        <p className="text-muted-foreground">Search and analyze wallet activity on the Solana network.</p>
      </div>

      {/* Search Section */}
      <Card className="p-8">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <Search className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Search Wallet</h2>
          </div>
          <p className="text-muted-foreground text-sm mb-6">
            Enter a Solana wallet address to view its transactions and activities.
          </p>
          <WalletSearch onAddressSubmit={(address) => setWalletAddress(address)} />
        </div>
      </Card>

      {/* Results */}
      {walletAddress && (
        <div className="animate-fade-in">
          <DashboardLayout walletAddress={walletAddress} />
        </div>
      )}
    </main>
  )
}
