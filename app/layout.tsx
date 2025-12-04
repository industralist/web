import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "@solana/wallet-adapter-react-ui/styles.css"
import "./globals.css"
import { Header } from "@/components/header"
import WalletContextProvider from "@/components/WalletProvider"
import { Footer } from "@/components/ui/footer"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Pifflepath - Blockchain Infrastructure",
  description: "The complete stack for internet markets. Low latency reads and optimized transaction delivery.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <WalletContextProvider>
          <Header />
          {children}
          <Analytics />
          <Footer />
        </WalletContextProvider>
      </body>
    </html>
  )
}
