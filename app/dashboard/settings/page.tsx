"use client"

import { useAuth } from "@/components/auth-provider"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function SettingsPage() {
  const { user, logout, loading } = useAuth()
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

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  return (
    <>
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6 max-w-2xl">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your account settings</p>
          </div>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Wallet Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Wallet Address</label>
                <p className="font-mono text-sm bg-card p-3 rounded-lg mt-1">{user.walletAddress}</p>
              </div>
              {user.email && (
                <div>
                  <label className="text-sm text-muted-foreground">Email</label>
                  <p className="text-sm mt-1">{user.email}</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6 border-destructive/30 bg-destructive/5">
            <h2 className="text-lg font-semibold mb-4 text-destructive">Danger Zone</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Logging out will disconnect your wallet. You can log back in anytime with your wallet.
            </p>
            <Button onClick={handleLogout} variant="destructive" className="w-full">
              Logout
            </Button>
          </Card>
        </div>
      </main>
    </>
  )
}
