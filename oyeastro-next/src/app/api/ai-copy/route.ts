export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { generateVibeCopy } from '@/lib/gemini'
import type { ChartResult } from '@/lib/astro/types'

export async function POST(req: NextRequest) {
  try {
    const chart = await req.json() as ChartResult
    const copy = await generateVibeCopy(chart)
    return NextResponse.json(copy)
  } catch (err) {
    console.error('[/api/ai-copy] Error:', err)
    return NextResponse.json({ error: 'AI copy generation failed' }, { status: 500 })
  }
}
