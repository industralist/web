"use client"

import { useAuth } from "@/components/auth-provider"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function UsagePage() {
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
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Usage Analytics</h1>
            <p className="text-muted-foreground">Track your API usage and statistics</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <p className="text-muted-foreground text-sm">Requests Today</p>
              <p className="text-2xl font-bold">0</p>
            </Card>
            <Card className="p-4">
              <p className="text-muted-foreground text-sm">Requests This Month</p>
              <p className="text-2xl font-bold">0</p>
            </Card>
            <Card className="p-4">
              <p className="text-muted-foreground text-sm">Success Rate</p>
              <p className="text-2xl font-bold">100%</p>
            </Card>
            <Card className="p-4">
              <p className="text-muted-foreground text-sm">Avg Response Time</p>
              <p className="text-2xl font-bold">0ms</p>
            </Card>
          </div>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Usage Over Time</h2>
            <p className="text-muted-foreground">Usage analytics will appear here as you make API requests.</p>
          </Card>
        </div>
      </main>
    </>
  )
}
