import { kv } from "@vercel/kv"

interface CacheOptions {
  ttl?: number
}

export class RedisCache {
  /**
   * Get a value from Redis cache
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const value = await kv.get(key)
      return value as T | null
    } catch (error) {
      console.error(`[v0] Redis GET failed for key ${key}:`, error)
      return null
    }
  }

  /**
   * Set a value in Redis cache with TTL
   */
  static async set<T>(key: string, value: T, options?: CacheOptions): Promise<boolean> {
    try {
      const ttl = options?.ttl || 60 // default 60 seconds
      await kv.setex(key, ttl, JSON.stringify(value))
      return true
    } catch (error) {
      console.error(`[v0] Redis SET failed for key ${key}:`, error)
      return false
    }
  }

  /**
   * Delete a value from Redis cache
   */
  static async delete(key: string): Promise<boolean> {
    try {
      await kv.del(key)
      return true
    } catch (error) {
      console.error(`[v0] Redis DELETE failed for key ${key}:`, error)
      return false
    }
  }

  /**
   * Clear all cache keys matching a pattern
   */
  static async deletePattern(pattern: string): Promise<boolean> {
    try {
      const keys = await kv.keys(pattern)
      if (keys.length > 0) {
        await kv.del(...keys)
      }
      return true
    } catch (error) {
      console.error(`[v0] Redis DELETE pattern failed for ${pattern}:`, error)
      return false
    }
  }

  /**
   * Generate cache key for wallet data
   */
  static walletKey(address: string): string {
    return `wallet:${address.toLowerCase()}`
  }

  /**
   * Generate cache key for wallet metadata (tokens, prices, etc.)
   */
  static walletMetadataKey(address: string): string {
    return `wallet:metadata:${address.toLowerCase()}`
  }
}
