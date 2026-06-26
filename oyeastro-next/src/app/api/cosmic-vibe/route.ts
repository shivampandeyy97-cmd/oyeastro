export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { generateCosmicVibeResult } from '@/lib/gemini'
import { cacheGet, cacheSet } from '@/lib/redis'
import type { ChartResult } from '@/lib/astro/types'

export async function POST(req: NextRequest) {
  try {
    const chart = await req.json() as ChartResult
    if (!chart || !chart.meta || chart.meta.julianDay === undefined) {
      return NextResponse.json({ error: 'Invalid chart data' }, { status: 400 })
    }

    const todayStr = new Date().toISOString().split('T')[0]
    const cacheKey = `cosmicvibe:${chart.meta.julianDay}:${todayStr}`

    const cached = await cacheGet<any>(cacheKey)
    if (cached) {
      return NextResponse.json(cached)
    }

    const vibeResult = await generateCosmicVibeResult(chart)

    // Cache until midnight (since today's vibe changes daily)
    const now = new Date()
    const midnight = new Date(now)
    midnight.setUTCHours(24, 0, 0, 0)
    const ttl = Math.max(60, Math.floor((midnight.getTime() - now.getTime()) / 1000))
    await cacheSet(cacheKey, vibeResult, ttl)

    return NextResponse.json(vibeResult)
  } catch (err) {
    console.error('[/api/cosmic-vibe] Error:', err)
    return NextResponse.json({ error: 'Cosmic vibe generation failed' }, { status: 500 })
  }
}
