"use client"

import Link from "next/link"
import { Menu, X, BarChart3 } from "lucide-react"
import { useState } from "react"
import { WalletConnectButton } from "./wallet-connect-button"
import { useAuth } from "./auth-provider"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user } = useAuth()

  if (user) {
    return null
  }

  return (
    <header className="border-b border-white/5 bg-black/95 backdrop-blur supports-backdrop-filter:bg-black/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl group">
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-orange-500 to-red-500 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-orange-500/50 transition-all">
            <BarChart3 className="text-white font-bold text-sm w-5 h-5" />
          </div>
          <span className="text-white">Pifflepath</span>
          <span className="text-xs bg-orange-500/20 text-orange-500 px-2 py-1 hidden md:block rounded-full font-medium">
            Blockchain Tracker
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/pricing" className="text-gray-400 hover:text-white transition text-sm font-medium">
            Pricing
          </Link>
          <Link href="/docs" className="text-gray-400 hover:text-white transition text-sm font-medium">
            Documentation
          </Link>
          <Link href="/about" className="text-gray-400 hover:text-white transition text-sm font-medium">
            About
          </Link>
        </nav>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <WalletConnectButton variant="primary" size="sm" />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-400 hover:text-white"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/5 bg-black/50 backdrop-blur">
          <nav className="container mx-auto px-4 py-4 space-y-4">
            <Link href="/pricing" className="block text-gray-400 hover:text-white transition text-sm font-medium">
              Pricing
            </Link>
            <Link href="/docs" className="block text-gray-400 hover:text-white transition text-sm font-medium">
              Documentation
            </Link>
            <Link href="/about" className="block text-gray-400 hover:text-white transition text-sm font-medium">
              About
            </Link>

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
