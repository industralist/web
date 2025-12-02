// Custom SWR hook for fetching wallet data
// Handles caching, retries, and real-time updates with proper error handling

"use client"

import useSWR, { type SWRConfiguration } from "swr"
import type { WalletData, ApiResponse } from "./types"

const fetcher = async (url: string): Promise<WalletData> => {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    const error = await response.json()
    const err = new Error(error.error?.message || "Failed to fetch wallet") as Error & { status?: number }
    err.status = response.status
    throw err
  }

  const data: ApiResponse<WalletData> = await response.json()
  if (!data.success || !data.data) {
    throw new Error(data.error?.message || "Invalid response")
  }

  return data.data
}

export function useWallet(address: string | null, options: SWRConfiguration = {}) {
  const { data, error, isLoading, mutate } = useSWR<WalletData>(address ? `/api/wallet/${address}` : null, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 60000, // 1 minute
    focusThrottleInterval: 300000, // 5 minutes
    errorRetryCount: 3,
    errorRetryInterval: 5000,
    ...options,
  })

  return {
    data,
    error,
    isLoading,
    mutate,
    isValidating: isLoading,
  }
}

export function useWalletWithPolling(address: string | null, pollInterval = 60000) {
  return useWallet(address, {
    refreshInterval: pollInterval,
  })
}
