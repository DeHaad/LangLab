import Redis from "ioredis"

// Kesh / tezlik qatlami. MVP'da ixtiyoriy: REDIS_URL bo'lmasa, kesh o'chiriladi
// va to'g'ridan-to'g'ri PostgreSQL ishlatiladi (graceful fallback).
const globalForRedis = globalThis as unknown as { redis?: Redis | null }

export const redis: Redis | null =
  globalForRedis.redis ??
  (process.env.REDIS_URL ? new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: 2 }) : null)

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis

// Oddiy kesh yordamchisi
export async function cached<T>(key: string, ttlSec: number, fn: () => Promise<T>): Promise<T> {
  if (!redis) return fn()
  try {
    const hit = await redis.get(key)
    if (hit) return JSON.parse(hit) as T
    const value = await fn()
    await redis.set(key, JSON.stringify(value), "EX", ttlSec)
    return value
  } catch {
    return fn()
  }
}

// Oylik AI limit hisobi (freemium) — Redis bo'lmasa DB orqali sanaladi (ai.ts)
export async function incrMonthlyCounter(userId: string): Promise<number | null> {
  if (!redis) return null
  const month = new Date().toISOString().slice(0, 7) // YYYY-MM
  const key = `ai_evals:${userId}:${month}`
  const count = await redis.incr(key)
  if (count === 1) await redis.expire(key, 60 * 60 * 24 * 35)
  return count
}
