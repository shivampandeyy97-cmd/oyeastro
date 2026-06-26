import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret) {
      console.warn('[Razorpay] Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET')
      return NextResponse.json({ error: 'Razorpay payment provider is not configured' }, { status: 500 })
    }

    const { amount, receipt } = await req.json()

    const instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })

    // Amount is in paisa for Razorpay (99 INR = 9900 Paisa)
    const options = {
      amount: amount || 9900,
      currency: 'INR',
      receipt: receipt || `receipt_${Date.now()}`,
    }

    const order = await instance.orders.create(options)
    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    })
  } catch (err) {
    console.error('[/api/payment/razorpay] Error:', err)
    return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 })
  }
}
