'use client'

import { useState, useEffect } from 'react'
import type { ChartResult, PremiumReport } from '@/lib/astro/types'
import LoadingOrbit from './LoadingOrbit'

interface Props {
  chart: ChartResult
}

export default function PremiumReportCard({ chart }: Props) {
  const chartId = chart.meta.id
  const [isPaid, setIsPaid] = useState<boolean>(chart.isPaid || false)
  const [report, setReport] = useState<PremiumReport | null>(null)
  const [loadingReport, setLoadingReport] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'dasha' | 'transits' | 'career' | 'love' | 'health'>('dasha')

  // Check localStorage on mount
  useEffect(() => {
    if (chartId) {
      const localPaid = localStorage.getItem(`paid_${chartId}`)
      if (localPaid === 'true') {
        setIsPaid(true)
      }
    }
  }, [chartId])

  // Handle Stripe callback URL params (?success=true&session_id=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const success = params.get('success')
    const sessionId = params.get('session_id')
    const queryChartId = params.get('chartId')

    if (success === 'true' && sessionId && queryChartId === chartId) {
      verifyStripePayment(sessionId)
    }
  }, [chartId])

  // Fetch report when paid
  useEffect(() => {
    if (isPaid && chartId && !report && !loadingReport) {
      fetchReport()
    }
  }, [isPaid, chartId])

  const fetchReport = async () => {
    setLoadingReport(true)
    setError(null)
    try {
      const res = await fetch('/api/chart/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chartId }),
      })
      if (!res.ok) {
        throw new Error('Failed to retrieve yearly report')
      }
      const data = await res.json() as PremiumReport
      setReport(data)
    } catch (err) {
      console.error(err)
      setError('Could not retrieve premium report. Try again.')
    } finally {
      setLoadingReport(false)
    }
  }

  const verifyStripePayment = async (sessionId: string) => {
    setPaymentLoading(true)
    try {
      const res = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'stripe', sessionId, chartId }),
      })
      if (res.ok) {
        setIsPaid(true)
        localStorage.setItem(`paid_${chartId}`, 'true')
        // Clean URL params
        window.history.replaceState({}, document.title, window.location.pathname)
      } else {
        setError('Stripe payment verification failed.')
      }
    } catch {
      setError('Stripe payment verification error.')
    } finally {
      setPaymentLoading(false)
    }
  }

  const handleRazorpayCheckout = async () => {
    setPaymentLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/payment/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 10100, receipt: `rcpt_${chartId}` }),
      })
      if (!res.ok) throw new Error('Razorpay order creation failed')
      const order = await res.json()

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'OyeAstro',
        description: '2025-2026 Yearly Premium Report',
        order_id: order.orderId,
        handler: async function (response: any) {
          setPaymentLoading(true)
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                provider: 'razorpay',
                chartId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })
            if (verifyRes.ok) {
              setIsPaid(true)
              localStorage.setItem(`paid_${chartId}`, 'true')
            } else {
              setError('Payment verification failed.')
            }
          } catch {
            setError('Payment verification error.')
          } finally {
            setPaymentLoading(false)
          }
        },
        prefill: {
          name: chart.meta.name,
        },
        theme: {
          color: '#FF7A45',
        },
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.on('payment.failed', function (resp: any) {
        setError(`Payment failed: ${resp.error.description}`)
      })
      rzp.open()
    } catch (err) {
      console.error(err)
      setError('Could not initialize Razorpay checkout.')
    } finally {
      setPaymentLoading(false)
    }
  }

  // Stripe checkout removed — INR only via Razorpay

  if (isPaid) {
    return (
      <div className="premium-card bg-gradient-to-tr from-[#FAF6FF] via-[#F4E9FF] to-[#ECE0FF] border border-[#D5C2F5] rounded-[26px] p-7 shadow-sm text-left flex flex-col gap-6 relative overflow-hidden h-full">
        <div className="z-10 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-ink/5 pb-4">
            <div>
              <span className="text-[10px] font-medium px-2.5 py-1 bg-sage/10 text-sage border border-sage/20 rounded-full">
                ✦ PREMIUM UNLOCKED
              </span>
              <h3 className="font-display font-normal text-xl text-ink mt-2">
                Your 2025-2026 Yearly Forecast
              </h3>
            </div>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 border border-ink/10 rounded-full bg-white/40 hover:bg-white/70 text-xs font-medium text-ink transition-all cursor-pointer font-body"
            >
              📥 Save PDF
            </button>
          </div>

          {loadingReport && (
            <div className="py-12 flex flex-col items-center gap-3">
              <LoadingOrbit />
              <span className="text-xs font-medium text-ink-mid animate-pulse">Calculating premium orbits...</span>
            </div>
          )}

          {error && !report && (
            <div className="text-center py-6 text-coral font-semibold text-sm">
              ⚠️ {error}
              <button onClick={fetchReport} className="block mx-auto mt-2 text-xs text-ink-mid underline font-bold">
                Retry Generation
              </button>
            </div>
          )}

          {report && (
            <div className="flex flex-col gap-4">
              {/* Tabs list — scrollable on small screens */}
              <div className="flex bg-ink/[0.04] border border-ink/5 rounded-2xl p-1 w-full overflow-x-auto gap-0.5 scrollbar-hide">
                {[
                  { id: 'dasha', label: '📅 Life' },
                  { id: 'transits', label: '🪐 Stars' },
                  { id: 'career', label: '💼 Career' },
                  { id: 'love', label: '💖 Love' },
                  { id: 'health', label: '🔋 Vibe' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className={`px-2.5 py-1.5 text-[11px] font-medium rounded-xl transition-all duration-150 font-body whitespace-nowrap flex-shrink-0 ${
                      activeTab === t.id
                        ? 'bg-ink text-ivory shadow-sm border-none'
                        : 'text-ink-mid hover:text-ink border-none bg-transparent'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Active Section Content */}
              <div className="bg-white/60 border border-ink/5 rounded-2xl p-4 min-h-[160px] flex items-center justify-center">
                <p className="font-body text-xs leading-[1.75] font-light text-ink-mid text-center italic">
                  {activeTab === 'dasha' && report.dashaAnalysis}
                  {activeTab === 'transits' && report.transitDates}
                  {activeTab === 'career' && report.careerWindows}
                  {activeTab === 'love' && report.loveWindows}
                  {activeTab === 'health' && report.healthWarnings}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="premium-card relative overflow-hidden bg-white/95 border-[1.5px] border-[#FF7A45]/30 rounded-[28px] p-6.5 shadow-[0_15px_35px_rgba(26,18,8,0.06),0_5px_15px_rgba(255,122,69,0.08)] transition-all duration-300 text-left h-full flex flex-col justify-between">
      {/* Top Notification Bar Style Header */}
      <div className="flex gap-4 items-start pb-4 border-b border-ink/5">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-coral to-[#FF9E7A] flex items-center justify-center text-xl shrink-0 text-white shadow-sm animate-bounce">
          🔔
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-coral uppercase tracking-[2px]">Cosmic Notification</span>
            <span className="text-[9px] font-medium text-ink-faint">just now</span>
          </div>
          <h3 className="font-display font-medium text-[17px] text-ink mt-0.5 leading-tight">
            Your 2025-2026 Personal Report is Ready
          </h3>
          <p className="text-[11px] text-ink-mid mt-1 font-light leading-relaxed">
            Gemini has calculated your full 2-year planetary mapping based on {chart.meta.name}'s exact birth chart coordinates.
          </p>
        </div>
      </div>

      {/* Real Tangible Benefits Checklist */}
      <div className="py-4.5 my-1">
        <h4 className="text-[10px] font-bold text-ink uppercase tracking-wider mb-3">What You'll Unlock Instantly:</h4>
        <ul className="flex flex-col gap-3 text-xs text-ink-mid pl-0 list-none">
          <li className="flex gap-3 leading-relaxed">
            <span className="text-coral shrink-0">📅</span>
            <span><strong className="text-ink font-semibold">24-Month Life Chapters:</strong> Timeline mapping that forecasts when your primary life seasons and energy cycles shift.</span>
          </li>
          <li className="flex gap-3 leading-relaxed">
            <span className="text-coral shrink-0">🪐</span>
            <span><strong className="text-ink font-semibold">Star Shift Cycles:</strong> Exact date windows of major environmental movements vs your personal focus areas.</span>
          </li>
          <li className="flex gap-3 leading-relaxed">
            <span className="text-coral shrink-0">💼</span>
            <span><strong className="text-ink font-semibold">Job &amp; Cash Windows:</strong> High-potential phases for career moves, salary negotiations, and financial choices.</span>
          </li>
          <li className="flex gap-3 leading-relaxed">
            <span className="text-coral shrink-0">💖</span>
            <span><strong className="text-ink font-semibold">Love Connection:</strong> Relationship harmony triggers, attraction windows, and connection warnings.</span>
          </li>
          <li className="flex gap-3 leading-relaxed">
            <span className="text-coral shrink-0">🔋</span>
            <span><strong className="text-ink font-semibold">Vibe Drain Alert:</strong> Personal burnout risk calendars, daily energy cycle details, and lifestyle hacks.</span>
          </li>
        </ul>
      </div>

      {/* Pricing and Action Buttons */}
      <div className="bg-cream/40 border border-ink/5 rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-[10px] font-semibold text-ink-faint tracking-wider uppercase block">Total Access Fee</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-display font-medium text-coral leading-none">₹101</span>
              <span className="text-[10px] text-ink-faint">one-time · INR</span>
            </div>
          </div>
          <div className="bg-sage/10 text-sage text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border border-sage/20">
            UPI &amp; Cards
          </div>
        </div>

        {error && (
          <div className="text-center text-xs font-semibold text-coral">
            ⚠️ {error}
          </div>
        )}

        <button
          onClick={handleRazorpayCheckout}
          disabled={paymentLoading}
          className="w-full py-3.5 bg-ink hover:bg-coral text-ivory font-body text-sm font-semibold rounded-full active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border-none cursor-pointer text-center shadow-sm"
        >
          {paymentLoading ? 'Processing...' : '💳 Pay ₹101 · UPI / Card / Net Banking'}
        </button>
        <p className="text-center text-[10px] text-ink-faint">🔒 Secure via Razorpay · NRIs &amp; international users can pay in INR</p>
      </div>
    </div>
  )
}
