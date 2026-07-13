import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabase } from '@/lib/supabase'
import Stripe from 'stripe'
import { sendEmail } from '@/lib/email'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { provider, chartId, isCompat, email, cName1, cName2, score, details, narrative } = body

    if (!chartId) {
      return NextResponse.json({ error: 'Missing chartId' }, { status: 400 })
    }

    let isSuccess = false
    let paymentMeta = {}

    if (provider === 'razorpay') {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return NextResponse.json({ error: 'Missing Razorpay details' }, { status: 400 })
      }

      const keySecret = process.env.RAZORPAY_KEY_SECRET
      if (!keySecret) {
        return NextResponse.json({ error: 'Razorpay secret key is not configured' }, { status: 500 })
      }

      // Verify HMAC SHA256 signature
      const hash = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex')

      if (hash === razorpay_signature) {
        isSuccess = true
        paymentMeta = {
          provider: 'razorpay',
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          verifiedAt: new Date().toISOString(),
        }
      }
    } else if (provider === 'stripe') {
      const { sessionId } = body

      if (!sessionId) {
        return NextResponse.json({ error: 'Missing Stripe session ID' }, { status: 400 })
      }

      const secretKey = process.env.STRIPE_SECRET_KEY
      if (!secretKey) {
        return NextResponse.json({ error: 'Stripe secret key is not configured' }, { status: 500 })
      }

      const stripe = new Stripe(secretKey, {
        apiVersion: '2024-04-10' as any,
      })

      const session = await stripe.checkout.sessions.retrieve(sessionId)
      if (session.payment_status === 'paid' && session.metadata?.chartId === chartId) {
        isSuccess = true
        paymentMeta = {
          provider: 'stripe',
          sessionId,
          verifiedAt: new Date().toISOString(),
        }
      }
    } else {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 })
    }

    if (isSuccess) {
      if (isCompat) {
        // Send detailed compatibility report email
        try {
          const targetEmail = email || 'shivampandeyy97@gmail.com'
          await sendEmail({
            to: targetEmail,
            subject: 'Oyeatsro report',
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #f0f0f0; border-radius: 16px; background-color: #fff;">
                <h2 style="font-size: 20px; font-weight: bold; color: #1a1208; border-bottom: 1px solid #f0f0f0; padding-bottom: 12px; margin-bottom: 16px;">
                  ✨ OyeAstro Cosmic Compatibility Report
                </h2>
                
                <p style="font-size: 14px; line-height: 1.6; color: #4a4a4a;">
                  Here is your certified Vedic Ashtakoot compatibility breakdown for <strong>${cName1 || 'Partner 1'}</strong> and <strong>${cName2 || 'Partner 2'}</strong>.
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
            `
          })
        } catch (emailErr) {
          console.error('[Verify Email Send] Error:', emailErr)
        }
      } else if (supabase) {
        // Update charts table for personal vibe check
        try {
          const { error: updateError } = await supabase
            .from('charts')
            .update({
              is_paid: true,
              payment_details: paymentMeta,
            })
            .eq('id', chartId)

          if (updateError) throw updateError
        } catch (dbErr) {
          console.error('[Verify Database Update] Error:', dbErr)
          return NextResponse.json({ error: 'Failed to update purchase status in database' }, { status: 500 })
        }
      }
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ success: false, error: 'Signature verification failed' }, { status: 400 })
    }
  } catch (err) {
    console.error('[/api/payment/verify] Error:', err)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
