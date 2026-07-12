'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export default function PricingGrid() {
  const [loadingPlan, setLoadingPlan] = useState<'monthly' | 'annual' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [subscribedPlan, setSubscribedPlan] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('oyeastro_plan') || null
    }
    return null
  })

  async function handleSubscribe(plan: 'monthly' | 'annual') {
    setLoadingPlan(plan)
    setError(null)
    try {
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      })

      if (!res.ok) {
        throw new Error('Failed to initiate subscription order')
      }

      const order = await res.json()

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'OyeAstro',
        description: plan === 'monthly' ? 'OyeAstro+ Monthly' : 'OyeAstro Annual',
        order_id: order.orderId,
        theme: { color: '#FF7A45' },
        handler: async function(response: any) {
          // Verify payment
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                provider: 'razorpay',
                chartId: `sub_${plan}_${Date.now()}`,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              })
            })

            if (verifyRes.ok) {
              localStorage.setItem('oyeastro_plan', plan)
              setSubscribedPlan(plan)
            } else {
              setError('Payment verification failed. Please contact support.')
            }
          } catch {
            setError('Payment verification error. Please try again.')
          }
        },
        prefill: {
          email: 'bestie@oyeastro.com'
        }
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.open()
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Could not launch payment portal. Try again.')
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <section className="section bg-cream py-32 px-6" id="pricing">
      <div className="section-inner max-w-[1040px] mx-auto text-center">
        <p className="eyebrow text-[11px] font-medium text-ink-faint tracking-[2px] uppercase mb-5">
          Pricing Plans
        </p>
        <h2 className="font-display text-[36px] md:text-[58px] font-normal leading-[1.08] tracking-[-1.5px] text-ink mb-4">
          Align your cosmos with <br />
          <em className="not-italic text-coral font-medium">OyeAstro+</em>
        </h2>
        <p className="text-base text-ink-mid leading-[1.8] font-light max-w-[480px] mx-auto mb-14">
          Unlock unlimited daily calculations, deep historical reports, and priority planetary alerts.
        </p>

        {error && (
          <div className="max-w-[600px] mx-auto mb-8 px-4 py-3 bg-coral-light/20 text-coral border border-coral/30 rounded-xl text-center text-xs font-medium">
            ⚠️ {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-[900px] mx-auto">
          {/* Free Card */}
          <motion.div 
            whileHover={{ y: -4 }}
            className="price-card bg-white border border-border rounded-[22px] p-8 flex flex-col justify-between shadow-[0_4px_20px_rgba(26,18,8,0.02)]"
          >
            <div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-semibold text-ink-faint tracking-[1.5px] uppercase">Free</span>
                <span className="text-2xl">🌱</span>
              </div>
              <div className="font-display text-4xl font-normal text-ink mb-6">
                ₹0 <span className="text-xs text-ink-faint font-light font-body block mt-1">free forever</span>
              </div>
              <ul className="flex flex-col gap-3.5 text-xs text-ink-mid mb-8 pl-0 list-none">
                <li className="flex items-center gap-2 before:content-['✦'] before:text-gold before:text-[10px]">Basic daily vibe card</li>
                <li className="flex items-center gap-2 before:content-['✦'] before:text-gold before:text-[10px]">36-point compatibility match</li>
                <li className="flex items-center gap-2 before:content-['✦'] before:text-gold before:text-[10px]">Zero signup required</li>
              </ul>
            </div>
            <button 
              disabled 
              className="w-full py-3 bg-cream text-ink-faint font-medium text-xs rounded-xl disabled:opacity-80 border-none cursor-default text-center"
            >
              Current Plan
            </button>
          </motion.div>

          {/* OyeAstro+ Monthly Card */}
          <motion.div 
            whileHover={{ y: -4 }}
            className={`price-card bg-white border-2 ${subscribedPlan === 'monthly' ? 'border-sage' : 'border-border'} rounded-[22px] p-8 flex flex-col justify-between shadow-[0_4px_20px_rgba(26,18,8,0.02)]`}
          >
            <div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-semibold text-coral tracking-[1.5px] uppercase">OyeAstro+ Monthly</span>
                <span className="text-2xl">⚡</span>
              </div>
              <div className="font-display text-4xl font-normal text-ink mb-6">
                ₹149 <span className="text-xs text-ink-faint font-light font-body block mt-1">/ month</span>
              </div>
              <ul className="flex flex-col gap-3.5 text-xs text-ink-mid mb-8 pl-0 list-none">
                <li className="flex items-center gap-2 before:content-['✦'] before:text-coral before:text-[10px]">Everything in Free</li>
                <li className="flex items-center gap-2 before:content-['✦'] before:text-coral before:text-[10px]">Unlimited deep reports</li>
                <li className="flex items-center gap-2 before:content-['✦'] before:text-coral before:text-[10px]">Full Life Chapter breakdown</li>
                <li className="flex items-center gap-2 before:content-['✦'] before:text-coral before:text-[10px]">Transit shifts & remedies</li>
              </ul>
            </div>
            <button
              onClick={() => handleSubscribe('monthly')}
              disabled={loadingPlan !== null}
              className={`w-full py-3 ${subscribedPlan === 'monthly' ? 'bg-sage text-white' : 'bg-ink hover:bg-coral text-ivory'} font-medium text-xs rounded-xl active:scale-[0.98] transition-all border-none cursor-pointer text-center`}
            >
              {loadingPlan === 'monthly' ? 'Loading...' : subscribedPlan === 'monthly' ? 'Subscribed ✓' : 'Upgrade Monthly'}
            </button>
          </motion.div>

          {/* OyeAstro+ Annual Card */}
          <motion.div 
            whileHover={{ y: -4 }}
            className={`price-card featured bg-gradient-to-br from-[#FFFBE8] to-[#FFF3C0] border-2 ${subscribedPlan === 'annual' ? 'border-sage' : 'border-[#EDD97A]'} rounded-[22px] p-8 flex flex-col justify-between shadow-[0_8px_30px_rgba(245,197,24,0.12)]`}
          >
            <div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-semibold text-[#7A5F00] tracking-[1.5px] uppercase">OyeAstro Annual</span>
                <span className="bg-gold text-ink text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Save 33%</span>
              </div>
              <div className="font-display text-4xl font-normal text-ink mb-6">
                ₹99 <span className="text-xs text-ink-faint font-light font-body block mt-1">/ month (billed ₹1,188 yearly)</span>
              </div>
              <ul className="flex flex-col gap-3.5 text-xs text-ink-mid mb-8 pl-0 list-none">
                <li className="flex items-center gap-2 before:content-['✦'] before:text-gold before:text-[10px]">Everything in OyeAstro+</li>
                <li className="flex items-center gap-2 before:content-['✦'] before:text-gold before:text-[10px]">33% discount vs Monthly</li>
                <li className="flex items-center gap-2 before:content-['✦'] before:text-gold before:text-[10px]">Exclusive yearly overview</li>
                <li className="flex items-center gap-2 before:content-['✦'] before:text-gold before:text-[10px]">Priority Gemini AI access</li>
              </ul>
            </div>
            <button
              onClick={() => handleSubscribe('annual')}
              disabled={loadingPlan !== null}
              className={`w-full py-3 ${subscribedPlan === 'annual' ? 'bg-sage text-white' : 'bg-ink hover:bg-coral text-ivory'} font-medium text-xs rounded-xl active:scale-[0.98] transition-all border-none cursor-pointer text-center`}
            >
              {loadingPlan === 'annual' ? 'Loading...' : subscribedPlan === 'annual' ? 'Subscribed ✓' : 'Get Annual'}
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
