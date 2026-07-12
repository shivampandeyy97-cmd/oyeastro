import Razorpay from 'razorpay'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

let razorpay: Razorpay | null = null

function getRazorpay() {
  if (!razorpay) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay keys are missing from environment variables')
    }
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    })
  }
  return razorpay
}

const PLANS = {
  monthly: { amount: 14900, currency: 'INR', name: 'OyeAstro+ Monthly' },   // ₹149
  annual:  { amount: 118800, currency: 'INR', name: 'OyeAstro Annual' },     // ₹99×12=₹1,188
}

export async function POST(req: NextRequest) {
  try {
    const { plan } = await req.json()
    const selectedPlan = PLANS[plan as keyof typeof PLANS]
    if (!selectedPlan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.warn('[Razorpay] Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET')
      return NextResponse.json({ error: 'Razorpay is not configured' }, { status: 500 })
    }

    const client = getRazorpay()
    const order = await client.orders.create({
      amount: selectedPlan.amount,
      currency: selectedPlan.currency,
      receipt: `receipt_${Date.now()}`,
      notes: { plan }
    })

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    })
  } catch (err: any) {
    console.error('[/api/create-order] Error:', err)
    return NextResponse.json({ error: err.message || 'Failed to create order' }, { status: 500 })
  }
}
