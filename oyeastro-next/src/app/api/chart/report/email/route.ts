import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { generateCompatibilityPdf, generatePersonalPdf } from '@/lib/pdf'
import { sendEmail } from '@/lib/email'

export const runtime = 'nodejs'
export const maxDuration = 60 // allow up to 60s for AI + PDF generation

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { chartId, email, isCompat, cName1, cName2, score, details, narrative, chart1, chart2 } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    if (isCompat) {
      // Generate compatibility PDF with kundli charts for both partners
      const pdfBuffer = await generateCompatibilityPdf({
        cName1: cName1 || 'Partner 1',
        cName2: cName2 || 'Partner 2',
        score: score || 0,
        details: details || {},
        narrative: narrative || 'Focus on open communication to harmonize your energies.',
        chart1: chart1 || undefined,
        chart2: chart2 || undefined,
      })

      await sendEmail({
        to: email,
        subject: 'Your Chart Breakdown by Oyeastro',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #f0f0f0; border-radius: 16px; background-color: #fff;">
            <h2 style="font-size: 20px; font-weight: bold; color: #1a1208; border-bottom: 1px solid #f0f0f0; padding-bottom: 12px; margin-bottom: 16px;">
              ✨ OyeAstro Cosmic Compatibility Report
            </h2>
            <p style="font-size: 14px; line-height: 1.6; color: #4a4a4a;">
              Here is your certified Vedic Ashtakoot compatibility breakdown for <strong>${cName1 || 'Partner 1'}</strong> and <strong>${cName2 || 'Partner 2'}</strong>. Your detailed PDF report with birth charts (Kundli) for both partners is attached to this email.
            </p>
            <div style="background-color: #f8f4ff; border: 1px solid #eee; border-radius: 12px; padding: 16px; margin: 20px 0; text-align: center;">
              <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888; display: block; margin-bottom: 4px;">Cosmic Match Score</span>
              <span style="font-size: 48px; font-weight: bold; color: #8A5CF5;">${score || 0}%</span>
            </div>
            <p style="font-size: 13px; color: #666; margin-top: 16px;">
              Open the attached PDF for your complete Kundli charts, Ashtakoot breakdown, and cosmic compatibility insight.
            </p>
            <p style="font-size: 11px; color: #bbb; text-align: center; border-top: 1px solid #f0f0f0; padding-top: 16px; margin-top: 32px;">
              This report is powered by OyeAstro mathematical astrology engine · oyeastro.com
            </p>
          </div>
        `,
        attachments: [
          {
            filename: `OyeAstro_Compatibility_${cName1 || 'Partner1'}_${cName2 || 'Partner2'}.pdf`,
            content: pdfBuffer,
          }
        ]
      })

      return NextResponse.json({ success: true })
    } else {
      if (!chartId) {
        return NextResponse.json({ error: 'chartId is required' }, { status: 400 })
      }

      const docRef = doc(db, 'charts', chartId)
      const docSnap = await getDoc(docRef)
      if (!docSnap.exists()) {
        return NextResponse.json({ error: 'Chart not found' }, { status: 404 })
      }

      const chartData = docSnap.data()
      const chartResult = typeof chartData.chart_result === 'string'
        ? JSON.parse(chartData.chart_result)
        : chartData.chart_result

      if (!chartData.is_paid) {
        return NextResponse.json({ error: 'Payment required for report' }, { status: 402 })
      }

      // Generate or retrieve the AI premium report
      let report = chartData.premium_report
      if (!report) {
        const { generatePremiumReport } = await import('@/lib/gemini')
        report = await generatePremiumReport(chartResult)
        await updateDoc(docRef, { premium_report: report })
      }

      // Generate Personal PDF with full Kundli chart
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
        positions: chartResult.positions,
        houseData: chartResult.houseData,
        bigThree: chartResult.bigThree,
        dasha: chartResult.dasha,
        yogas: chartResult.yogas,
        vibeScore: chartResult.vibeScore,
        flags: chartResult.flags,
        remedies: chartResult.remedies,
      })

      await sendEmail({
        to: email,
        subject: 'Your Chart Breakdown by Oyeastro',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #f0f0f0; border-radius: 16px;">
            <h2 style="font-size: 20px; font-weight: bold; color: #1a1208; border-bottom: 1px solid #f0f0f0; padding-bottom: 12px; margin-bottom: 16px;">
              🔮 Your Premium 2025–2026 Cosmic Forecast is Ready!
            </h2>
            <p style="font-size: 14px; line-height: 1.6; color: #4a4a4a;">
              Hello <strong>${chartResult.meta.name || 'Bestie'}</strong>, your personalised Vedic astrology report is attached to this email. It includes your full Kundli chart, active yogas, planetary positions, vibe score, and a detailed 5-chapter cosmic forecast for 2025–2026.
            </p>
            <p style="font-size: 13px; color: #666; margin-top: 16px;">
              Open the PDF to explore your complete cosmic blueprint. The stars have spoken! 🌟
            </p>
            <p style="font-size: 11px; color: #bbb; text-align: center; border-top: 1px solid #f0f0f0; padding-top: 16px; margin-top: 32px;">
              Powered by OyeAstro · oyeastro.com
            </p>
          </div>
        `,
        attachments: [
          {
            filename: `${chartResult.meta.name || 'Bestie'}_Cosmic_Report.pdf`,
            content: pdfBuffer,
          }
        ]
      })

      return NextResponse.json({ success: true })
    }
  } catch (err: any) {
    console.error('[Email Send API] Error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
