import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generatePremiumReport } from '@/lib/gemini'
import type { ChartResult } from '@/lib/astro/types'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { chartId } = await req.json()
    if (!chartId) {
      return NextResponse.json({ error: 'Missing chartId' }, { status: 400 })
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { data: chartRow, error: getError } = await supabase
      .from('charts')
      .select('chart_result, is_paid, premium_report')
      .eq('id', chartId)
      .maybeSingle()

    if (getError || !chartRow) {
      return NextResponse.json({ error: 'Chart not found' }, { status: 404 })
    }

    if (!chartRow.is_paid) {
      return NextResponse.json({ error: 'Premium report is locked. Payment required.' }, { status: 402 })
    }

    // If already generated, return it
    if (chartRow.premium_report) {
      return NextResponse.json(chartRow.premium_report)
    }

    // Generate it
    const chartResult = chartRow.chart_result as ChartResult
    const report = await generatePremiumReport(chartResult)

    // Save to Supabase
    await supabase
      .from('charts')
      .update({ premium_report: report })
      .eq('id', chartId)

    return NextResponse.json(report)

  } catch (err) {
    console.error('[/api/chart/report] Error:', err)
    return NextResponse.json({ error: 'Failed to generate premium report' }, { status: 500 })
  }
}
