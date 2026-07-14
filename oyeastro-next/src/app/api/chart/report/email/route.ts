import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { generateCompatibilityPdf, generatePersonalPdf } from '@/lib/pdf'
import { sendEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { chartId, email, isCompat, cName1, cName2, score, details, narrative } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    if (isCompat) {
      // Generate compatibility PDF buffer
      const pdfBuffer = await generateCompatibilityPdf({
        cName1: cName1 || 'Partner 1',
        cName2: cName2 || 'Partner 2',
        score: score || 0,
        details: details || {},
        narrative: narrative || 'Focus on open communication to harmonize your energies.'
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
              Here is your certified Vedic Ashtakoot compatibility breakdown for <strong>${cName1 || 'Partner 1'}</strong> and <strong>${cName2 || 'Partner 2'}</strong>. We have also attached a complete breakdown PDF to this email.
            </p>

            <div style="background-color: #fcfbfa; border: 1px solid #eee; border-radius: 12px; padding: 16px; margin: 20px 0; text-align: center;">
              <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888; display: block; margin-bottom: 4px;">Cosmic Match Score</span>
              <span style="font-size: 48px; font-weight: bold; color: #FF7A45;">${score || 0}%</span>
            </div>

            <h3 style="font-size: 14px; font-weight: bold; color: #1a1208; margin-top: 24px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
              Detailed Compatibility Dimensions
            </h3>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <tr style="border-bottom: 1px solid #f5f5f5;">
                <td style="padding: 10px 0; font-size: 13px; color: #666;">🎭 Temperament (Gana):</td>
                <td style="padding: 10px 0; font-size: 13px; font-weight: bold; text-align: right; color: #333;">${details?.temp || 0}%</td>
              </tr>
              <tr style="border-bottom: 1px solid #f5f5f5;">
                <td style="padding: 10px 0; font-size: 13px; color: #666;">💖 Heart Connect (Bhakoot):</td>
                <td style="padding: 10px 0; font-size: 13px; font-weight: bold; text-align: right; color: #333;">${details?.heart || 0}%</td>
              </tr>
              <tr style="border-bottom: 1px solid #f5f5f5;">
                <td style="padding: 10px 0; font-size: 13px; color: #666;">🚀 Destiny (Yoni/Nadi):</td>
                <td style="padding: 10px 0; font-size: 13px; font-weight: bold; text-align: right; color: #333;">${details?.destiny || 0}%</td>
              </tr>
              <tr style="border-bottom: 1px solid #f5f5f5;">
                <td style="padding: 10px 0; font-size: 13px; color: #666;">🤝 Trust Bond (Graha Maitri):</td>
                <td style="padding: 10px 0; font-size: 13px; font-weight: bold; text-align: right; color: #333;">${details?.trust || 0}%</td>
              </tr>
            </table>

            <h3 style="font-size: 14px; font-weight: bold; color: #1a1208; margin-top: 24px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
              Cosmic Connection Insight
            </h3>
            <div style="background-color: #FFF2EC; border-left: 3px solid #FF7A45; border-radius: 8px; padding: 16px; font-style: italic; font-size: 13.5px; line-height: 1.6; color: #333; margin-bottom: 24px;">
              "${narrative || 'Focus on open communication to harmonize your energies.'}"
            </div>

            <p style="font-size: 11px; color: #bbb; text-align: center; border-top: 1px solid #f0f0f0; padding-top: 16px; margin-top: 32px;">
              This report is powered by OyeAstro mathematical astrology engine.
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

      let report = chartData.premium_report
      if (!report) {
        const { generatePremiumReport } = await import('@/lib/gemini')
        report = await generatePremiumReport(chartResult)
        await updateDoc(docRef, { premium_report: report })
      }

      // Generate Personal PDF
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

      await sendEmail({
        to: email,
        subject: 'Your Chart Breakdown by Oyeastro',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #f0f0f0; border-radius: 16px;">
            <h2 style="font-size: 20px; font-weight: bold; color: #1a1208; border-bottom: 1px solid #f0f0f0; padding-bottom: 12px; margin-bottom: 16px;">
              🔮 Your Premium Cosmic Forecast is Ready!
            </h2>
            <p style="font-size: 14px; line-height: 1.6; color: #4a4a4a;">
              Hello ${chartResult.meta.name || 'Bestie'}, your purchase for the 2025-2026 Personal Yearly Forecast has been completed successfully. We have attached your complete, detailed PDF report to this email.
            </p>
            <p style="font-size: 13px; color: #666;">
              Enjoy your cosmic mapping, and let the stars guide your way.
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
