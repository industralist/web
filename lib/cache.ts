// In-memory cache with optional Redis for distributed persistence
// Works with or without Redis configuration

interface CacheEntry {
  data: any
  expires: number
}

const memoryCache = new Map<string, CacheEntry>()

let redisClient: any = null

try {
  if (process.env.UPSTASH_KV_KV_REST_API_URL && process.env.UPSTASH_KV_KV_REST_API_TOKEN) {
    const { Redis } = require("@upstash/redis")
    redisClient = new Redis({
      url: process.env.UPSTASH_KV_KV_REST_API_URL,
      token: process.env.UPSTASH_KV_KV_REST_API_TOKEN,
    })
  }
} catch (error) {
  console.warn("[v0] Redis not available, using memory cache only")
}

export interface CacheOptions {
  ttl?: number // Time to live in seconds
}

/**
 * Get cached value - checks memory first, then Redis
 * Memory cache is instant, Redis is distributed fallback
 */
export async function getCache(key: string): Promise<any | null> {
  // Check memory cache first (instant)
  const cached = memoryCache.get(key)
  if (cached && cached.expires > Date.now()) {
    return cached.data
  }
  memoryCache.delete(key)

  // Only try Redis if it's configured
  if (redisClient) {
    try {
      const redisValue = await redisClient.get(key)
      if (redisValue) {
        const parsed = typeof redisValue === "string" ? JSON.parse(redisValue) : redisValue
        // Store in memory for next access
        memoryCache.set(key, {
          data: parsed,
          expires: Date.now() + 60 * 1000, // 1 min in memory
        })
        return parsed
      }
    } catch (error) {
      console.debug(`[v0] Redis GET failed for key ${key}, falling back to memory cache`)
      // Continue gracefully if Redis fails
    }
  }

  return null
}

/**
 * Set cached value - stores in memory, optionally in Redis
 */
export async function setCache(key: string, data: any, options: CacheOptions = {}): Promise<void> {
  const ttl = options.ttl || 60 // Default 60 seconds

  // Store in memory cache
  memoryCache.set(key, {
    data,
    expires: Date.now() + ttl * 1000,
  })

  // Store in Redis if available
  if (redisClient) {
    try {
      await redisClient.setex(key, ttl, JSON.stringify(data))
    } catch (error) {
      console.debug(`[v0] Redis SET failed for key ${key}, continuing with memory cache`)
      // Continue gracefully if Redis fails - memory cache is still valid
    }
  }
}

export function clearCache(key?: string): void {
  if (key) {
    memoryCache.delete(key)
    if (redisClient) {
      redisClient.del(key).catch((error: any) => console.debug(`[v0] Redis DELETE failed for ${key}`))
    }
  } else {
    memoryCache.clear()
    if (redisClient) {
      redisClient.flushall().catch((error: any) => console.debug("[v0] Redis FLUSHALL failed"))
    }
  }
}

export function getCacheAge(key: string): number | null {
  const cached = memoryCache.get(key)
  if (!cached) return null
  const age = (Date.now() - (cached.expires - (cached.expires - Date.now()))) / 1000
  return Math.max(0, age)
}

export function isCacheStale(key: string, maxAge: number): boolean {
  const age = getCacheAge(key)
  return age === null || age > maxAge
}
