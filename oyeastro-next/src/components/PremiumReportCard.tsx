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
          color: '#8a5cf5',
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
      <div className="pin-card bg-[#0b0c20] text-white border-2 border-espresso rounded-neoLg p-6 shadow-neo break-inside-avoid mb-6 flex flex-col gap-6 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute inset-0 bg-radial-gradient from-purple-900/10 to-transparent pointer-events-none" />

        <div className="z-10 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-purple-500/10 pb-4">
            <div>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 bg-pastelGreen text-brightGreen border border-espresso rounded-full shadow-neoSm">
                PREMIUM UNLOCKED
              </span>
              <h3 className="font-display font-black text-lg text-white mt-1.5">
                Your 2025-2026 Yearly Forecast
              </h3>
            </div>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 border border-purple-500/20 rounded-neoSm bg-white/5 hover:bg-white/10 text-xs font-bold transition-all"
            >
              📥 Save PDF
            </button>
          </div>

          {loadingReport && (
            <div className="py-12 flex flex-col items-center gap-3">
              <LoadingOrbit />
              <span className="text-xs font-bold text-purple-300 animate-pulse">Calculating premium orbits...</span>
            </div>
          )}

          {error && !report && (
            <div className="text-center py-6 text-brightPink font-semibold text-sm">
              ⚠️ {error}
              <button onClick={fetchReport} className="block mx-auto mt-2 text-xs text-purple-300 underline font-bold">
                Retry Generation
              </button>
            </div>
          )}

          {report && (
            <div className="flex flex-col gap-4">
              {/* Tabs list */}
              <div className="flex bg-[#131438] border border-purple-500/10 rounded-full p-1 self-center w-full justify-between flex-wrap gap-1 md:gap-0">
                {[
                  { id: 'dasha', label: '📅 Era' },
                  { id: 'transits', label: '🪐 Transits' },
                  { id: 'career', label: '💼 Job/Cash' },
                  { id: 'love', label: '💖 Love' },
                  { id: 'health', label: '🔋 Vibe' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all duration-200 ${
                      activeTab === t.id
                        ? 'bg-brightPurple text-white shadow-lg'
                        : 'text-purple-300/60 hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Active Section Content */}
              <div className="bg-purple-950/20 border border-purple-500/10 rounded-neoSm p-4 min-h-[160px] flex items-center justify-center">
                <p className="font-body text-sm font-semibold text-purple-200 leading-relaxed text-center italic">
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
    <div className="pin-card bg-[#110e2d] text-white border-2 border-espresso rounded-neoLg p-6 shadow-neo break-inside-avoid mb-6 flex flex-col gap-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-radial-gradient from-purple-500/10 to-transparent pointer-events-none" />

      <div className="z-10 flex flex-col gap-4">
        {/* Badge */}
        <span className="self-start text-[10px] font-extrabold px-2.5 py-0.5 bg-brightGold text-espresso border border-espresso rounded-full shadow-neoSm">
          UPGRADE SKILLS 💫
        </span>

        <div>
          <h3 className="font-display font-black text-xl text-white">
            Unlock Your 2025-2026 Yearly Report
          </h3>
          <p className="text-xs text-purple-300/80 mt-1 font-semibold">
            Get personalized monthly windows, major shifts, and warnings.
          </p>
        </div>

        {/* Feature List */}
        <ul className="flex flex-col gap-2.5 text-xs font-bold text-purple-200 border-y border-purple-500/10 py-4 my-1">
          <li className="flex items-center gap-2">
            <span>📅</span> Full Vimshottari Dasha expansion (sub-period analysis)
          </li>
          <li className="flex items-center gap-2">
            <span>🪐</span> Significant Transit Dates (Jupiter, Saturn, Rahu)
          </li>
          <li className="flex items-center gap-2">
            <span>💼</span> Career & Money Windows (when to launch or chill)
          </li>
          <li className="flex items-center gap-2">
            <span>💖</span> Relationship & Love Forecasts (spicy periods)
          </li>
          <li className="flex items-center gap-2">
            <span>🔋</span> Health & Energy drain calendars
          </li>
        </ul>

        {/* Pricing & Checkout Buttons */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-white">Unlock everything:</span>
            <div className="text-right">
              <span className="text-lg font-black text-brightGold">₹99</span>
              <span className="text-xs text-purple-300/60 block -mt-1">or $1.49 international</span>
            </div>
          </div>

          {error && (
            <div className="text-center text-xs font-semibold text-brightPink">
              ⚠️ {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mt-1">
            <button
              onClick={handleRazorpayCheckout}
              disabled={paymentLoading}
              className="py-3 bg-brightPurple hover:bg-brightPurple/90 text-white font-display text-xs font-extrabold border-2 border-espresso rounded-neoSm shadow-neoSm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer text-center"
            >
              {paymentLoading ? 'Loading...' : '💳 Pay via UPI/INR (₹99)'}
            </button>
            <button
              onClick={handleStripeCheckout}
              disabled={paymentLoading}
              className="py-3 bg-[#131438] hover:bg-[#1b1c4f] text-white font-display text-xs font-extrabold border border-purple-500/30 rounded-neoSm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer text-center"
            >
              {paymentLoading ? 'Redirecting...' : '🌐 Pay in USD ($1.49)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
