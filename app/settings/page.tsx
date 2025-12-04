"use client"

import { useAuth } from "@/components/auth-provider"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings, LogOut, Copy } from "lucide-react"
import { toast } from "sonner"

export default function SettingsPage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!user) return null

  return (
    <main className="container mx-auto px-4 py-8 space-y-8 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and security.</p>
      </div>

      {/* Account Information */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Account Information</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Wallet Address</label>
            <div className="flex items-center gap-2 mt-1">
              <code className="flex-1 bg-background p-3 rounded border border-border text-sm font-mono break-all">
                {user.walletAddress}
              </code>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  navigator.clipboard.writeText(user.walletAddress)
                  toast.success("Wallet address copied")
                }}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
          {user.email && (
            <div>
              <label className="text-sm text-muted-foreground">Email</label>
              <p className="mt-1 font-medium">{user.email}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Security */}
      <Card className="p-6 border-destructive/20">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <LogOut className="w-5 h-5 text-destructive" />
          Security
        </h2>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            You're currently connected with your Solana wallet. To disconnect, click the button below.
          </p>
          <Button onClick={handleLogout} variant="destructive" className="w-full">
            <LogOut className="w-4 h-4 mr-2" />
            Disconnect Wallet
          </Button>
        </div>
      </Card>

      {/* Preferences */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-6">Preferences</h2>
        <div className="space-y-4 text-sm">
          <p className="text-muted-foreground">Additional preferences will be available soon.</p>
        </div>
      </Card>
    </main>
  )
}
