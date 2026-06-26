import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      console.warn('[Stripe] Missing STRIPE_SECRET_KEY')
      return NextResponse.json({ error: 'Stripe payment provider is not configured' }, { status: 500 })
    }

    const { chartId, name } = await req.json()
    if (!chartId) {
      return NextResponse.json({ error: 'Missing chartId for Stripe payment' }, { status: 400 })
    }

    const stripe = new Stripe(secretKey, {
      apiVersion: '2024-04-10' as any,
    })

    const origin = req.headers.get('origin') || 'https://oyeastro.com'

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'OyeAstro 2025-2026 Yearly Premium Report',
              description: `Personalized cosmic forecast for ${name || 'Bestie'}`,
            },
            unit_amount: 149, // $1.49 USD
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/?chartId=${chartId}&session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${origin}/?chartId=${chartId}&success=false`,
      metadata: {
        chartId,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[/api/payment/stripe] Error:', err)
    return NextResponse.json({ error: 'Failed to initiate checkout session' }, { status: 500 })
  }
}
