import type React from "react"
import { AuthLayout } from "@/components/auth-layout"

export default function ExplorerLayout({ children }: { children: React.ReactNode }) {
  return <AuthLayout>{children}</AuthLayout>
}
