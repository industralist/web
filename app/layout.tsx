import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "@solana/wallet-adapter-react-ui/styles.css"
import "./globals.css"
import { Header } from "@/components/header"
import WalletContextProvider from "@/components/WalletProvider"
import { Footer } from "@/components/ui/footer"
import { AuthProvider } from "@/components/auth-provider"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Pifflepath - Real-Time Blockchain Token Tracker",
  description:
    "Track emerging tokens, monitor wallet movements, and get instant blockchain intelligence with Pifflepath.",
  generator: "v0.app",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <WalletContextProvider>
          <AuthProvider>
            <Header />
            {children}
            <Analytics />
            <Footer />
          </AuthProvider>
        </WalletContextProvider>
      </body>
    </html>
  )
}
