"use client"

// Error display component with retry functionality

import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WalletErrorProps {
  error: Error | undefined
  onRetry: () => void
}

export function WalletErrorDisplay({ error, onRetry }: WalletErrorProps) {
  const errorMessage = error?.message || "An unknown error occurred"

  return (
    <div className="rounded-lg p-6 md:p-8 border border-red-500/30 bg-red-500/10">
      <div className="flex gap-4">
        <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-red-500 mb-2">Error Loading Wallet</h3>
          <p className="text-gray-400 text-sm mb-4">{errorMessage}</p>
          <Button onClick={onRetry} variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        </div>
      </div>
    </div>
  )
}
