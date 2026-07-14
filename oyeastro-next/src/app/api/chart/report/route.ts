import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { generatePremiumReport } from '@/lib/gemini'
import type { ChartResult } from '@/lib/astro/types'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { chartId } = await req.json()
    if (!chartId) {
      return NextResponse.json({ error: 'Missing chartId' }, { status: 400 })
    }

    const docRef = doc(db, 'charts', chartId)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return NextResponse.json({ error: 'Chart not found' }, { status: 404 })
    }

    const chartRow = docSnap.data()

    if (!chartRow.is_paid) {
      return NextResponse.json({ error: 'Premium report is locked. Payment required.' }, { status: 402 })
    }

    // If already generated, return it
    if (chartRow.premium_report) {
      return NextResponse.json(chartRow.premium_report)
    }

    // Generate it
    const chartResult = typeof chartRow.chart_result === 'string'
      ? JSON.parse(chartRow.chart_result)
      : (chartRow.chart_result as ChartResult)
    const report = await generatePremiumReport(chartResult)

    // Save to Firestore
    await updateDoc(docRef, { premium_report: report })

    return NextResponse.json(report)

  } catch (err) {
    console.error('[/api/chart/report] Error:', err)
    return NextResponse.json({ error: 'Failed to generate premium report' }, { status: 500 })
  }
}
