"use client"

import { useAuth } from "@/components/auth-provider"
import { redirect } from "next/navigation"
import LandingPage from "./landing"

export default function Page() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (user) {
    redirect("/dashboard")
  }

  return <LandingPage />
}
