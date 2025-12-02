"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, BarChart3 } from "lucide-react";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const wallet = useWallet();
  const walletModal = useWalletModal();

  const handleWalletConnect = () => {
    console.log("connecting...");

    if (!wallet.connected) {
      walletModal.setVisible(true);
      console.log("no wallet connected", wallet);
    } else {
      wallet.disconnect();
    }
  };

  return (
    <header className="border-b border-white/5 bg-black/95 backdrop-blur supports-backdrop-filter:bg-black/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl group">
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-orange-500 to-red-500 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-orange-500/50 transition-all">
            <BarChart3 className="text-white font-bold text-sm w-5 h-5" />
          </div>
          <span className="text-white">Piflepath</span>
          <span className="text-xs bg-orange-500/20 text-orange-500 px-2 py-1 hidden md:block rounded-full font-medium">
            Solana Tracker
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/features"
            className="text-gray-400 hover:text-white transition text-sm font-medium">
            Features
          </Link>
          <Link
            href="/docs"
            className="text-gray-400 hover:text-white transition text-sm font-medium">
            Documentation
          </Link>
          <Link
            href="/about"
            className="text-gray-400 hover:text-white transition text-sm font-medium">
            About
          </Link>
        </nav>

        {/* CTA Buttons */}
        <div className="flex items-center  gap-3">
          <Button
            onClick={handleWalletConnect}
            size="sm"
            className="bg-linear-to-r cursor-pointer from-orange-500 to-red-500 hidden md:block hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-full px-6">
            {wallet.connected
              ? `${wallet.publicKey
                  ?.toBase58()
                  .slice(0, 4)}...${wallet.publicKey?.toBase58().slice(-4)}`
              : "Connect Wallet"}
          </Button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-400 hover:text-white">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/5 bg-black/50 backdrop-blur">
          <nav className="container mx-auto px-4 py-4 space-y-4">
            <Link
              href="/features"
              className="block text-gray-400 hover:text-white transition text-sm font-medium">
              Features
            </Link>
            <Link
              href="/docs"
              className="block text-gray-400 hover:text-white transition text-sm font-medium">
              Documentation
            </Link>
            <Link
              href="/about"
              className="block text-gray-400 hover:text-white transition text-sm font-medium">
              About
            </Link>

            {/* Mobile CTA */}

            <button
              onClick={handleWalletConnect}
              className="w-full cursor-pointer bg-linear-to-r from-orange-500 to-red-500 text-white py-2 rounded-full font-medium">
              {wallet.connected
                ? `${wallet.publicKey
                    ?.toBase58()
                    .slice(0, 4)}...${wallet.publicKey?.toBase58().slice(-4)}`
                : "Connect Wallet"}
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
