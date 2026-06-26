export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { buildChart } from '@/lib/astro/engine'
import { computeCompatibility } from '@/lib/astro/ashtakoot'
import { generateCompatibilityNarrative } from '@/lib/gemini'
import type { BirthData, CompatibilityResult } from '@/lib/astro/types'

export async function POST(req: NextRequest) {
  try {
    const { personA, personB }: { personA: BirthData; personB: BirthData } = await req.json()

    if (!personA?.birthDate || !personB?.birthDate) {
      return NextResponse.json({ error: 'Missing birth data for one or both persons' }, { status: 400 })
    }

    const [chartA, chartB] = await Promise.all([
      buildChart(personA),
      buildChart(personB),
    ])

    const result = computeCompatibility(chartA, chartB)

    const narrative = await generateCompatibilityNarrative(
      personA.name || 'Person A', chartA.bigThree.rising.sign, chartA.dasha.eraTitle,
      personB.name || 'Person B', chartB.bigThree.rising.sign, chartB.dasha.eraTitle,
      result.totalScore,
    )

    const summary = result.percentage >= 72
      ? `${result.totalScore}/36 — Highly Compatible! The stars approve. 🌟`
      : result.percentage >= 50
        ? `${result.totalScore}/36 — Moderate Compatibility. Worth exploring with open communication. ✨`
        : `${result.totalScore}/36 — Challenging Match. Growth-oriented but requires serious effort. 🌱`

    const fullResult: CompatibilityResult = { ...result, narrative, summary }
    return NextResponse.json(fullResult)

  } catch (err) {
    console.error('[/api/compatibility] Error:', err)
    return NextResponse.json({ error: 'Compatibility calculation failed' }, { status: 500 })
  }
}
