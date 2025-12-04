"use client"

import { useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { Button } from "@/components/ui/button"
import { ChevronDown, Loader2, LogOut } from "lucide-react"

interface WalletConnectButtonProps {
  variant?: "default" | "primary"
  size?: "sm" | "md" | "lg"
}

export function WalletConnectButton({ variant = "default", size = "md" }: WalletConnectButtonProps) {
  const { connected, publicKey, disconnect, signMessage, connecting } = useWallet()
  const { setVisible } = useWalletModal()
  const [isVerifying, setIsVerifying] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConnect = () => {
    setVisible(true)
  }

  const handleDisconnect = async () => {
    try {
      await disconnect()
      setShowMenu(false)
      setError(null)
    } catch (err) {
      console.error("Disconnect error:", err)
    }
  }

  const handleSignMessage = async () => {
    if (!signMessage || !publicKey) return

    try {
      setIsVerifying(true)
      setError(null)

      const message = new TextEncoder().encode(
        `Sign in to Pifflepath\nWallet: ${publicKey.toBase58()}\nTime: ${new Date().toISOString()}`,
      )

      const signature = await signMessage(message)

      // Store signature verification
      sessionStorage.setItem("wallet_signature", Buffer.from(signature).toString("hex"))
      sessionStorage.setItem("wallet_verified", "true")

      setShowMenu(false)
    } catch (err: any) {
      setError(err.message === "User cancelled" ? "Signing cancelled" : "Failed to sign message")
      console.error("Sign error:", err)
    } finally {
      setIsVerifying(false)
    }
  }

  const isVerified = sessionStorage.getItem("wallet_verified") === "true"

  if (!connected) {
    return (
      <Button
        onClick={handleConnect}
        disabled={connecting}
        className={`${
          variant === "primary"
            ? "bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            : "border border-white/20 hover:bg-white/5"
        } ${
          size === "sm" ? "px-4 py-2 text-sm" : size === "lg" ? "px-8 py-3 text-lg" : "px-6 py-2"
        } font-medium text-white rounded-lg transition-all`}
      >
        {connecting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Connecting...
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
            ? "bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
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
        <div className="absolute top-full right-0 mt-2 bg-slate-900 border border-white/10 rounded-lg shadow-xl min-w-max z-50">
          <div className="p-3 space-y-3">
            {/* Wallet Info */}
            <div className="px-3 py-2 bg-white/5 rounded border border-white/10">
              <p className="text-xs text-gray-400">Connected Wallet</p>
              <p className="text-sm text-white font-mono break-all">{publicKey?.toBase58()}</p>
            </div>

            {/* Sign Message Button */}
            {signMessage && (
              <button
                onClick={handleSignMessage}
                disabled={isVerifying}
                className="w-full px-3 py-2 text-sm font-medium text-white bg-orange-500/20 hover:bg-orange-500/30 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing...
                  </>
                ) : isVerified ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    Verified
                  </>
                ) : (
                  "Sign to Verify"
                )}
              </button>
            )}

            {error && <p className="px-3 py-2 text-xs text-red-400 bg-red-500/10 rounded">{error}</p>}

            {/* Disconnect Button */}
            <button
              onClick={handleDisconnect}
              className="w-full px-3 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors flex items-center justify-center gap-2"
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
