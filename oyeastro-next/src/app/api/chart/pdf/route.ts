import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { generateCompatibilityPdf, generatePersonalPdf } from '@/lib/pdf'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const isCompat = searchParams.get('isCompat') === 'true'

    if (isCompat) {
      const cName1 = searchParams.get('cName1') || 'Partner 1'
      const cName2 = searchParams.get('cName2') || 'Partner 2'
      const score = parseInt(searchParams.get('score') || '0', 10)
      const temp = parseInt(searchParams.get('temp') || '0', 10)
      const heart = parseInt(searchParams.get('heart') || '0', 10)
      const destiny = parseInt(searchParams.get('destiny') || '0', 10)
      const trust = parseInt(searchParams.get('trust') || '0', 10)
      const narrative = searchParams.get('narrative') || 'Focus on communication.'

      const pdfBuffer = await generateCompatibilityPdf({
        cName1,
        cName2,
        score,
        details: { temp, heart, destiny, trust },
        narrative,
      })

      return new NextResponse(pdfBuffer as any, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="OyeAstro_Compatibility_${cName1}_${cName2}.pdf"`,
        },
      })
    } else {
      const chartId = searchParams.get('chartId')
      if (!chartId) {
        return NextResponse.json({ error: 'chartId is required' }, { status: 400 })
      }

      const docRef = doc(db, 'charts', chartId)
      const docSnap = await getDoc(docRef)
      if (!docSnap.exists()) {
        return NextResponse.json({ error: 'Chart not found' }, { status: 404 })
      }

      const chartData = docSnap.data()
      if (!chartData.is_paid) {
        return NextResponse.json({ error: 'Chart report is unpaid' }, { status: 402 })
      }

      const chartResult = typeof chartData.chart_result === 'string'
        ? JSON.parse(chartData.chart_result)
        : chartData.chart_result

      let report = chartData.premium_report
      if (!report) {
        const { generatePremiumReport } = await import('@/lib/gemini')
        report = await generatePremiumReport(chartResult)
      }

      const pdfBuffer = await generatePersonalPdf({
        name: chartResult.meta.name || 'Bestie',
        lagna: chartResult.bigThree.rising.sign,
        nakshatra: chartResult.dasha.nakshatra?.name || 'Vedic',
        mahadasha: chartResult.dasha.activeDasha.rulerName,
        dashaAnalysis: report.dashaAnalysis,
        transitDates: report.transitDates,
        careerWindows: report.careerWindows,
        loveWindows: report.loveWindows,
        healthWarnings: report.healthWarnings,
      })

      return new NextResponse(pdfBuffer as any, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="OyeAstro_${chartResult.meta.name || 'Bestie'}_Cosmic_Report.pdf"`,
        },
      })
    }
  } catch (err: any) {
    console.error('[PDF Download API] Error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
