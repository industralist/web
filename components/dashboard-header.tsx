"use client"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { LogOut, Settings, Key } from "lucide-react"
import Link from "next/link"

export function DashboardHeader() {
  const { user, logout } = useAuth()

  if (!user) return null

  const truncatedAddress = `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-6)}`

  return (
    <header className="border-b border-card-border bg-card">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
          <p className="text-muted-foreground text-sm">{truncatedAddress}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/api-keys">
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Key className="w-4 h-4" />
              API Keys
            </Button>
          </Link>
          <Link href="/dashboard/settings">
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </Link>
          <Button variant="destructive" size="sm" onClick={logout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}
