"use client"

import { useAuth } from "@/components/auth-provider"
import { useWallet } from "@solana/wallet-adapter-react"
import { DashboardHeader } from "@/components/dashboard-header"
import { SubscriptionManager } from "@/components/subscription-manager"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function SubscriptionsPage() {
  const { user, loading } = useAuth()
  const { publicKey } = useWallet()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!user || !publicKey) return null

  return (
    <>
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <SubscriptionManager />
      </main>
    </>
  )
}
