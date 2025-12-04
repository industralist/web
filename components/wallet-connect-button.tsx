"use client"

import { useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronDown, Loader2, LogOut, User } from "lucide-react"

interface WalletConnectButtonProps {
  variant?: "default" | "primary"
  size?: "sm" | "md" | "lg"
}

export function WalletConnectButton({ variant = "default", size = "md" }: WalletConnectButtonProps) {
  const { connected, publicKey, disconnect, connecting } = useWallet()
  const { setVisible } = useWalletModal()
  const { user, loginWithWallet, logout } = useAuth()
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)
  const [loggingIn, setLoggingIn] = useState(false)

  const handleConnect = async () => {
    if (!connected) {
      setVisible(true)
    } else if (publicKey && !user) {
      setLoggingIn(true)
      try {
        await loginWithWallet(publicKey.toBase58())
        setTimeout(() => router.push("/dashboard"), 500)
      } catch (error) {
        console.error("Login failed:", error)
      } finally {
        setLoggingIn(false)
      }
    } else if (user) {
      router.push("/dashboard")
    }
  }

  const handleDisconnect = async () => {
    await logout()
    await disconnect()
    setShowMenu(false)
  }

  if (!connected) {
    return (
      <Button
        onClick={handleConnect}
        disabled={connecting || loggingIn}
        className={`${
          variant === "primary"
            ? "bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-700"
            : "border border-white/20 hover:bg-white/5"
        } ${
          size === "sm" ? "px-4 py-2 text-sm" : size === "lg" ? "px-8 py-3 text-lg" : "px-6 py-2"
        } font-medium text-white rounded-lg transition-all`}
      >
        {connecting || loggingIn ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {connecting ? "Connecting..." : "Logging in..."}
          </>
        ) : (
          "Connect Wallet"
        )}
      </Button>
    )
  }

  const truncatedAddress = publicKey
    ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
    : "Connected"

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={`${
          variant === "primary"
            ? "bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-700"
            : "border border-white/20 hover:bg-white/5"
        } ${
          size === "sm" ? "px-4 py-2 text-sm" : size === "lg" ? "px-8 py-3 text-lg" : "px-6 py-2"
        } font-medium text-white rounded-lg transition-all flex items-center gap-2`}
      >
        <div className="w-2 h-2 rounded-full bg-green-500" />
        <span>{truncatedAddress}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {showMenu && (
        <div className="absolute top-full right-0 mt-2 bg-card border border-card-border rounded-lg shadow-xl min-w-max z-50">
          <div className="p-3 space-y-3">
            {/* Wallet Info */}
            <div className="px-3 py-2 bg-card-bg rounded border border-card-border">
              <p className="text-xs text-muted-foreground">Connected Wallet</p>
              <p className="text-sm text-foreground font-mono break-all">{publicKey?.toBase58()}</p>
            </div>

            {/* User Info */}
            {user && (
              <div className="px-3 py-2 bg-card-bg rounded border border-card-border">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Logged In</p>
                    <p className="text-sm text-foreground">Dashboard Active</p>
                  </div>
                </div>
              </div>
            )}

            {/* Dashboard Button */}
            {user && (
              <Button
                onClick={() => {
                  router.push("/dashboard")
                  setShowMenu(false)
                }}
                className="w-full bg-primary hover:bg-primary/90"
              >
                Go to Dashboard
              </Button>
            )}

            {/* Disconnect Button */}
            <button
              onClick={handleDisconnect}
              className="w-full px-3 py-2 text-sm font-medium text-destructive hover:text-destructive/90 hover:bg-destructive/10 rounded transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
