"use client"

import Link from "next/link"
import { Menu, X, BarChart3 } from "lucide-react"
import { useState } from "react"
import { WalletConnectButton } from "./wallet-connect-button"
import { useAuth } from "./auth-provider"
import { useWallet } from "@solana/wallet-adapter-react"
import { useRouter } from "next/navigation"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user } = useAuth()
  const { connected } = useWallet()
  const router = useRouter()

  const handleDocumentationClick = () => {
    if (user || connected) {
      router.push("/docs")
    } else {
      router.push("/#features")
    }
  }

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-primary/50 transition-all">
            <BarChart3 className="text-white font-bold text-sm w-5 h-5" />
          </div>
          <span className="text-foreground">Pifflepath</span>
          <span className="text-xs bg-primary/20 text-primary px-2 py-1 hidden md:block rounded-full font-medium">
            Blockchain Tracker
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition text-sm font-medium">
            Pricing
          </Link>
          <button
            onClick={handleDocumentationClick}
            className="text-muted-foreground hover:text-foreground transition text-sm font-medium"
          >
            Documentation
          </button>
          <Link href="/about" className="text-muted-foreground hover:text-foreground transition text-sm font-medium">
            About
          </Link>
          {user && (
            <Link
              href="/dashboard"
              className="text-muted-foreground hover:text-foreground transition text-sm font-medium border-l border-border pl-8"
            >
              Dashboard
            </Link>
          )}
        </nav>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <WalletConnectButton variant="primary" size="sm" />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-muted-foreground hover:text-foreground"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background/50 backdrop-blur">
          <nav className="container mx-auto px-4 py-4 space-y-4">
            <Link
              href="/pricing"
              className="block text-muted-foreground hover:text-foreground transition text-sm font-medium"
            >
              Pricing
            </Link>
            <button
              onClick={handleDocumentationClick}
              className="block w-full text-left text-muted-foreground hover:text-foreground transition text-sm font-medium"
            >
              Documentation
            </button>
            <Link
              href="/about"
              className="block text-muted-foreground hover:text-foreground transition text-sm font-medium"
            >
              About
            </Link>
            {user && (
              <Link
                href="/dashboard"
                className="block text-muted-foreground hover:text-foreground transition text-sm font-medium border-t border-border pt-4"
              >
                Dashboard
              </Link>
            )}

            {/* Mobile CTA */}
            <div className="pt-4">
              <WalletConnectButton variant="primary" size="md" />
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
