export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { buildChart } from '@/lib/astro/engine'
import { db } from '@/lib/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
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

    // Check Firestore cache first
    try {
      const docRef = doc(db, 'charts', chartId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const cachedRow = docSnap.data()
        const chartResult = typeof cachedRow.chart_result === 'string'
          ? JSON.parse(cachedRow.chart_result)
          : (cachedRow.chart_result as ChartResult)
        return NextResponse.json({
          ...chartResult,
          meta: { ...chartResult.meta, id: chartId, name: body.name || 'Bestie' },
          isPaid: !!cachedRow.is_paid
        })
      }
    } catch (dbErr) {
      console.warn('[Firestore Cache] Read error:', dbErr)
    }

    // Get today's transits for vibe score calculation
    const { getTodayTransits } = await import('@/lib/astro/engine')
    const transits = await getTodayTransits()

    // Compute full chart
    const chart = await buildChart(body, transits)
    chart.meta.id = chartId
    chart.isPaid = false

    // Cache in Firestore
    try {
      await setDoc(doc(db, 'charts', chartId), {
        id: chartId,
        birth_data: body,
        chart_result: JSON.stringify(chart),
        is_paid: false,
        created_at: new Date().toISOString()
      }, { merge: true })
    } catch (dbErr) {
      console.warn('[Firestore Cache] Write error:', dbErr)
    }

    return NextResponse.json(chart)

  } catch (err) {
    console.error('[/api/chart] Error:', err)
    const message = err instanceof Error ? err.message : 'Calculation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
