"use client"

import { type ReactNode, useMemo } from "react"
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react"

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { detectNetworkFromRpc } from "@/lib/sol-price"

export default function WalletContextProvider({
  children,
}: {
  children: ReactNode
}) {
  const endpoint = useMemo(() => process.env.NEXT_PUBLIC_HELIUS_RPC_URL || "https://api.mainnet-beta.solana.com", [])

  const network = useMemo(() => {
    const detectedNetwork = detectNetworkFromRpc(endpoint)
    console.log("[v0] Wallet network detected:", detectedNetwork, "from endpoint:", endpoint)
    return detectedNetwork === "mainnet" ? WalletAdapterNetwork.Mainnet : WalletAdapterNetwork.Devnet
  }, [endpoint])

  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
