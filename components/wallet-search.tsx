"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, AlertCircle } from "lucide-react"

interface WalletSearchProps {
  onAddressSubmit: (address: string) => void
}

export function WalletSearch({ onAddressSubmit }: WalletSearchProps) {
  const [address, setAddress] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/
    if (!address.trim()) {
      setError("Please enter a wallet address")
      return
    }
    if (!solanaAddressRegex.test(address.trim())) {
      setError("Invalid Solana address format")
      return
    }
    onAddressSubmit(address.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div
        className="relative flex flex-col md:flex-row md:items-center gap-2 md:gap-3 rounded-lg px-4 py-3 border border-slate-700 focus-within:border-orange-500/50 transition-colors"
        style={{ backgroundColor: "rgb(20, 15, 12)" }}
      >
        <Search className="w-5 h-5 text-gray-500 hidden md:block" />
        <Input
          type="text"
          placeholder="Enter Solana wallet address..."
          value={address}
          onChange={(e) => {
            setAddress(e.target.value)
            setError("")
          }}
          className="flex-1 bg-transparent border-0 text-white placeholder:text-gray-500 text-sm md:text-base focus:outline-none focus:ring-0"
        />
        <Button
          type="submit"
          className="w-full md:w-auto bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-md px-6 py-2 text-sm md:text-base"
        >
          Search
        </Button>
      </div>
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}
    </form>
  )
}
