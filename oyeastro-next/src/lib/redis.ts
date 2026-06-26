import { Redis } from '@upstash/redis'

let redisClient: Redis | null = null

export function getRedis(): Redis | null {
  if (redisClient) return redisClient

  const url   = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    console.warn('[Redis] Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN — caching disabled')
    return null
  }

  redisClient = new Redis({ url, token })
  return redisClient
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = getRedis()
  if (!redis) return null
  try {
    return await redis.get<T>(key)
  } catch (e) {
    console.error('[Redis] cacheGet error:', e)
    return null
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
  const redis = getRedis()
  if (!redis) return
  try {
    if (ttlSeconds) {
      await redis.set(key, value, { ex: ttlSeconds })
    } else {
      await redis.set(key, value)
    }
  } catch (e) {
    console.error('[Redis] cacheSet error:', e)
  }
}
