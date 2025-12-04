"use client"

import { useAuth } from "@/components/auth-provider"
import { DashboardHeader } from "@/components/dashboard-header"
import { ApiKeyManager } from "@/components/api-key-manager"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ApiKeysPage() {
  const { user, loading } = useAuth()
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

  if (!user) return null

  return (
    <>
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <ApiKeyManager />
      </main>
    </>
  )
}
