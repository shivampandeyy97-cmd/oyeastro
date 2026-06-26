export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { buildChart } from '@/lib/astro/engine'
import { supabase } from '@/lib/supabase'
import type { BirthData, ChartResult } from '@/lib/astro/types'
import crypto from 'crypto'

function hashBirthData(data: BirthData): string {
  const key = `${data.birthDate}|${data.birthTime}|${data.birthPlace.toLowerCase().trim()}`
  return crypto.createHash('sha256').update(key).digest('hex').slice(0, 16)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as BirthData

    if (!body.birthDate || !body.birthTime || !body.birthPlace) {
      return NextResponse.json(
        { error: 'Missing required fields: birthDate, birthTime, birthPlace' },
        { status: 400 }
      )
    }

    const chartId = hashBirthData(body)

    // Check Supabase cache first
    if (supabase) {
      try {
        const { data: cachedRow, error: getError } = await supabase
          .from('charts')
          .select('chart_result, is_paid')
          .eq('id', chartId)
          .maybeSingle()

        if (!getError && cachedRow) {
          const chartResult = cachedRow.chart_result as ChartResult
          return NextResponse.json({
            ...chartResult,
            meta: { ...chartResult.meta, id: chartId, name: body.name || 'Bestie' },
            isPaid: !!cachedRow.is_paid
          })
        }
      } catch (dbErr) {
        console.warn('[Supabase Cache] Read error:', dbErr)
      }
    }

    // Get today's transits for vibe score calculation
    const { getTodayTransits } = await import('@/lib/astro/engine')
    const transits = await getTodayTransits()

    // Compute full chart
    const chart = await buildChart(body, transits)
    chart.meta.id = chartId
    chart.isPaid = false

    // Cache in Supabase
    if (supabase) {
      try {
        await supabase.from('charts').upsert({
          id: chartId,
          birth_data: body,
          chart_result: chart,
          is_paid: false
        })
      } catch (dbErr) {
        console.warn('[Supabase Cache] Write error:', dbErr)
      }
    }

    return NextResponse.json(chart)

  } catch (err) {
    console.error('[/api/chart] Error:', err)
    const message = err instanceof Error ? err.message : 'Calculation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
