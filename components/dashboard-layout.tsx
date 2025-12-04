"use client"

import { useState } from "react"
import { AccountInfo } from "./account-info"
import { TransactionExplorer } from "./transaction-explorer"
import type { Transaction } from "@/lib/types"
import { TransactionDetailModal } from "./transaction-detail-modal"
import { useWallet } from "@/lib/use-wallet"

interface DashboardLayoutProps {
  walletAddress: string
}

export function DashboardLayout({ walletAddress }: DashboardLayoutProps) {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const { data: wallet } = useWallet(walletAddress)

  return (
    <div className="space-y-6 animate-fade-in">
      {wallet && <AccountInfo wallet={wallet} address={walletAddress} />}

      <TransactionExplorer walletAddress={walletAddress} onTransactionClick={setSelectedTransaction} />

      {selectedTransaction && (
        <TransactionDetailModal transaction={selectedTransaction} onClose={() => setSelectedTransaction(null)} />
      )}
    </div>
  )
}

export default DashboardLayout
