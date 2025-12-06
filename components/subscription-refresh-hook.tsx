"use client"

import { useEffect } from "react"
import { useAuth } from "@/components/auth-provider"

export function useSubscriptionRefresh(refetchInterval = 5000) {
  const { user } = useAuth()

  const refreshSubscription = async () => {
    if (!user) return

    try {
      const response = await fetch("/api/auth/subscription", {
        headers: { "x-user-id": user.id },
      })
      const data = await response.json()

      // Dispatch event to notify all listeners of subscription update
      window.dispatchEvent(
        new CustomEvent("subscriptionUpdated", {
          detail: data.subscription,
        }),
      )

      return data.subscription
    } catch (error) {
      console.error("[v0] Failed to refresh subscription:", error)
    }
  }

  useEffect(() => {
    // Set up periodic refresh
    const interval = setInterval(refreshSubscription, refetchInterval)

    // Also listen for subscription update events from other components
    window.addEventListener("triggerSubscriptionRefresh", refreshSubscription as EventListener)

    return () => {
      clearInterval(interval)
      window.removeEventListener("triggerSubscriptionRefresh", refreshSubscription as EventListener)
    }
  }, [user, refetchInterval])

  return { refreshSubscription }
}
