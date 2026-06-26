export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getTodayTransits } from '@/lib/astro/engine'
import { cacheGet, cacheSet } from '@/lib/redis'
import type { TransitData } from '@/lib/astro/types'

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0]
    const cacheKey = `transits:${today}`

    const cached = await cacheGet<TransitData>(cacheKey)
    if (cached) return NextResponse.json(cached)

    const positions = await getTodayTransits()
    const transit: TransitData = {
      date: today,
      positions,
      cachedAt: new Date().toISOString(),
    }

    // Cache until midnight (86400s max, we use remaining seconds of day)
    const now = new Date()
    const midnight = new Date(now)
    midnight.setUTCHours(24, 0, 0, 0)
    const ttl = Math.floor((midnight.getTime() - now.getTime()) / 1000)
    await cacheSet(cacheKey, transit, ttl)

    return NextResponse.json(transit)
  } catch (err) {
    console.error('[/api/transits] Error:', err)
    return NextResponse.json({ error: 'Transit calculation failed' }, { status: 500 })
  }
}
