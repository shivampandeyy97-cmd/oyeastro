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
        body: JSON.stringify({ amount: 9900, receipt: `rcpt_${chartId}` }),
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

  const handleStripeCheckout = async () => {
    setPaymentLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/payment/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chartId, name: chart.meta.name }),
      })
      if (!res.ok) throw new Error('Stripe session creation failed')
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('Stripe URL missing')
      }
    } catch (err) {
      console.error(err)
      setError('Could not initialize Stripe checkout.')
      setPaymentLoading(false)
    }
  }

  if (isPaid) {
    return (
      <div className="premium-card bg-gradient-to-tr from-[#FAF6FF] via-[#F4E9FF] to-[#ECE0FF] border border-[#D5C2F5] rounded-[26px] p-7 shadow-sm text-left flex flex-col gap-6 relative overflow-hidden">
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
              {/* Tabs list */}
              <div className="flex bg-ink/[0.04] border border-ink/5 rounded-full p-1 self-center w-full justify-between flex-wrap gap-1 md:gap-0">
                {[
                  { id: 'dasha', label: '📅 Life Chapter' },
                  { id: 'transits', label: '🪐 Star Shifts' },
                  { id: 'career', label: '💼 Job/Cash' },
                  { id: 'love', label: '💖 Love/Rizz' },
                  { id: 'health', label: '🔋 Vibe Energy' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className={`px-3 py-1.5 text-[11px] font-medium rounded-full transition-all duration-150 font-body ${
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
    <div className="premium-card bg-gradient-to-tr from-[#FAF6FF] via-[#F4E9FF] to-[#ECE0FF] border border-[#D5C2F5] rounded-[26px] p-7 shadow-sm text-left flex flex-col gap-6 relative overflow-hidden">
      <div className="z-10 flex flex-col gap-4">
        {/* Badge */}
        <span className="self-start text-[10px] font-medium px-2.5 py-1 bg-coral/10 text-coral border border-coral/20 rounded-full">
          ✦ UPGRADE SKILLS
        </span>

        <div>
          <h3 className="font-display font-normal text-xl text-ink">
            Unlock Your 2025-2026 Yearly Report
          </h3>
          <p className="text-xs text-ink-mid mt-1 font-light leading-relaxed">
            Get personalized monthly windows, major shifts, and warnings.
          </p>
        </div>

        {/* Feature List */}
        <ul className="flex flex-col gap-2.5 text-xs text-ink-mid border-y border-ink/10 py-4 my-1 list-none pl-0">
          <li className="flex gap-2.5 leading-[1.6] before:content-['✦'] before:text-coral before:text-[10px] before:mt-0.5">
            Full Life Chapter breakdown &amp; timeline analysis
          </li>
          <li className="flex gap-2.5 leading-[1.6] before:content-['✦'] before:text-coral before:text-[10px] before:mt-0.5">
            Major Star Shifts &amp; outer planet transitions
          </li>
          <li className="flex gap-2.5 leading-[1.6] before:content-['✦'] before:text-coral before:text-[10px] before:mt-0.5">
            Career &amp; Cash Windows (when to make big moves)
          </li>
          <li className="flex gap-2.5 leading-[1.6] before:content-['✦'] before:text-coral before:text-[10px] before:mt-0.5">
            Rizz, Connection &amp; Relationship Forecasts
          </li>
          <li className="flex gap-2.5 leading-[1.6] before:content-['✦'] before:text-coral before:text-[10px] before:mt-0.5">
            Daily Energy &amp; Vibe Drain calendars
          </li>
        </ul>

        {/* Pricing & Checkout Buttons */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink">Unlock everything:</span>
            <div className="text-right">
              <span className="text-lg font-display font-normal text-coral">₹99</span>
              <span className="text-[10px] text-ink-faint block -mt-1">or $1.49 international</span>
            </div>
          </div>

          {error && (
            <div className="text-center text-xs font-medium text-coral">
              ⚠️ {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mt-1">
            <button
              onClick={handleRazorpayCheckout}
              disabled={paymentLoading}
              className="py-3 bg-ink hover:bg-coral text-ivory font-body text-xs font-medium rounded-full active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border-none cursor-pointer text-center shadow-sm"
            >
              {paymentLoading ? 'Loading...' : '💳 UPI/INR (₹99)'}
            </button>
            <button
              onClick={handleStripeCheckout}
              disabled={paymentLoading}
              className="py-3 bg-white/70 hover:bg-white text-ink-mid font-body text-xs font-medium border border-ink/10 rounded-full active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer text-center shadow-sm"
            >
              {paymentLoading ? 'Redirecting...' : '🌐 Card/USD ($1.49)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
