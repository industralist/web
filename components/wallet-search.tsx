"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, AlertCircle, Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

interface WalletSearchProps {
  onAddressSubmit: (address: string) => void
}

export function WalletSearch({ onAddressSubmit }: WalletSearchProps) {
  const [address, setAddress] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/

    if (!address.trim()) {
      setError("Please enter a wallet address")
      setLoading(false)
      return
    }

    if (!solanaAddressRegex.test(address.trim())) {
      setError("Invalid Solana address format")
      setLoading(false)
      return
    }

    try {
      // Record search in database if user is logged in
      if (user) {
        await fetch("/api/wallet/search/record", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            walletAddress: address.trim(),
          }),
        })
      }

      onAddressSubmit(address.trim())
    } catch (err) {
      console.error("Error recording search:", err)
      // Still submit even if recording fails
      onAddressSubmit(address.trim())
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div
        className="relative flex flex-col md:flex-row md:items-center gap-2 md:gap-3 rounded-lg px-4 py-3 border border-card-border focus-within:border-primary/50 transition-colors"
        style={{ backgroundColor: "var(--card-bg)" }}
      >
        <Search className="w-5 h-5 text-muted-foreground hidden md:block" />
        <Input
          type="text"
          placeholder="Enter Solana wallet address or paste it here..."
          value={address}
          onChange={(e) => {
            setAddress(e.target.value)
            setError("")
          }}
          disabled={loading}
          className="flex-1 bg-transparent border-0 text-foreground placeholder:text-muted-foreground text-sm md:text-base focus:outline-none focus:ring-0"
        />
        <Button
          type="submit"
          disabled={loading}
          className="w-full md:w-auto bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-700 text-white font-semibold rounded-md px-6 py-2 text-sm md:text-base"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Searching...
            </>
          ) : (
            "Search"
          )}
        </Button>
      </div>
      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}
    </form>
  )
}
