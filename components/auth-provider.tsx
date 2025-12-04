"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useRouter } from "next/navigation"

interface AuthUser {
  id: string
  walletAddress: string
  email?: string
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  loginWithWallet: (walletAddress: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const { disconnect } = useWallet()
  const router = useRouter()

  useEffect(() => {
    // Check for stored wallet address
    const storedWallet = localStorage.getItem("wallet_address")
    if (storedWallet) {
      verifyWallet(storedWallet)
    } else {
      setLoading(false)
    }
  }, [])

  const verifyWallet = async (walletAddress: string) => {
    try {
      const response = await fetch("/api/auth/verify-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress }),
      })

      if (response.ok) {
        const data = await response.json()
        setUser({
          id: data.userId,
          walletAddress,
        })
        localStorage.setItem("wallet_address", walletAddress)
      }
    } catch (error) {
      console.error("Wallet verification failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const loginWithWallet = async (walletAddress: string) => {
    await verifyWallet(walletAddress)
  }

  const logout = async () => {
    try {
      await disconnect()
    } catch (error) {
      console.error("Failed to disconnect wallet:", error)
    }

    setUser(null)
    localStorage.removeItem("wallet_address")
    router.push("/")
  }

  return <AuthContext.Provider value={{ user, loading, loginWithWallet, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
