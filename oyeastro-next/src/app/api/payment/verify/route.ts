import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { db } from '@/lib/firebase'
import { doc, updateDoc, getDoc } from 'firebase/firestore'
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
        // Compatibility payment verified successfully.
        // We return success immediately. The frontend will update localStorage,
        // unlock the results, and asynchronously call `/api/chart/report/email` to trigger the SMTP email.
      } else {
        // Update charts table for personal vibe check
        try {
          const docRef = doc(db, 'charts', chartId)
          await updateDoc(docRef, {
            is_paid: true,
            payment_details: paymentMeta,
          })
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
