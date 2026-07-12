'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import type { ChartResult, BirthData, CosmicVibeResult, HorizonVibeData } from '@/lib/astro/types'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PremiumReportCard from '@/components/PremiumReportCard'
import PricingGrid from '@/components/PricingGrid'

function HomeContent() {
  const searchParams = useSearchParams()

  // Form State
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [clarity, setClarity] = useState('everything')

  // Application States
  const [chart, setChart] = useState<ChartResult | null>(null)
  const [vibeResult, setVibeResult] = useState<CosmicVibeResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'month'>('today')

  // Compatibility State
  const [cName1, setCName1] = useState('')
  const [cName2, setCName2] = useState('')
  const [compatChecked, setCompatChecked] = useState(false)
  const [compatScore, setCompatScore] = useState(0)
  const [compatText, setCompatText] = useState('')
  const [compatDetails, setCompatDetails] = useState({
    p1Sign: 'Scorpio · Jyeshtha',
    p2Sign: 'Capricorn · Pushya',
    temp: 90,
    heart: 75,
    destiny: 60,
    trust: 82
  })

  // Share Clipboard Feedbacks
  const [vibeCopied, setVibeCopied] = useState(false)
  const [compatCopied, setCompatCopied] = useState(false)

  // Autoload shared chart from query param (?share=...)
  useEffect(() => {
    const shareParam = searchParams.get('share')
    if (shareParam) {
      try {
        const decoded = JSON.parse(atob(shareParam)) as BirthData
        if (decoded.birthDate && decoded.birthTime && decoded.birthPlace) {
          setName(decoded.name || '')
          setCity(decoded.birthPlace || '')
          setDate(decoded.birthDate || '')
          setTime(decoded.birthTime || '')
          handleFetchChart(decoded)
        }
      } catch (e) {
        console.error('[Share Autoload] Failed to parse share token:', e)
      }
    }
  }, [searchParams])

  const handleFetchChart = async (data: BirthData) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        throw new Error('Server calculation failed')
      }
      const result = await res.json() as ChartResult
      setChart(result)

      // Fetch dynamic cosmic vibes
      try {
        const vibeRes = await fetch('/api/cosmic-vibe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result),
        })
        if (vibeRes.ok) {
          const vResult = await vibeRes.json() as CosmicVibeResult
          setVibeResult(vResult)
        } else {
          setVibeResult(null)
        }
      } catch (vErr) {
        console.warn('[Vibe Fetch] Failed, falling back to deterministic vibes:', vErr)
        setVibeResult(null)
      }

      // Scroll to results
      setTimeout(() => {
        const el = document.getElementById('results')
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 100)

    } catch (e) {
      console.error(e)
      setError(e instanceof Error ? e.message : 'Could not fetch your cosmic chart. Try again.')
      setChart(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!date || !time || !city) {
      setError('Please fill in city, date and time details!')
      return
    }
    handleFetchChart({ name, birthDate: date, birthTime: time, birthPlace: city })
  }

  // Fallback Vibe data generator based on Rashi index and Moon sign index
  const getTabVibeData = (activeChart: ChartResult, tab: 'today' | 'week' | 'month') => {
    if (vibeResult) {
      return vibeResult[tab]
    }

    const rIndex = activeChart.houseData.lagnaSignIndex
    const mIndex = activeChart.positions.Mo ? Math.floor(activeChart.positions.Mo / 30) : 0

    // Deterministic metrics based on signs & tabs
    const metricsMap = {
      today: {
        love: { label: ["Chill", "Sweet", "Tender", "Intense", "Quiet"][mIndex % 5], emoji: "💌" },
        money: { label: ["Flowing", "Saving", "Tending", "Prudent", "Steady"][rIndex % 5], emoji: "💸" },
        energy: { label: ["Chaotic", "Focused", "Resting", "Electric", "Dreamy"][(mIndex + rIndex) % 5], emoji: "⚡" }
      },
      week: {
        love: { label: ["Electric", "Steady", "Quiet", "Sparky", "Drama-free"][rIndex % 5], emoji: "💌" },
        money: { label: ["Growing", "Stable", "Spend-y", "Flowing", "Balanced"][mIndex % 5], emoji: "💸" },
        energy: { label: ["High-Key", "Solitary", "Balanced", "Hyperactive", "Recharged"][(rIndex + 2) % 5], emoji: "⚡" }
      },
      month: {
        love: { label: ["Lover Era", "Solo Era", "Healing Era", "Intimate Era", "Banter Era"][(mIndex + 1) % 5], emoji: "💌" },
        money: { label: ["Abundant", "Building", "Learning", "Frugal", "Expanding"][(rIndex + 1) % 5], emoji: "💸" },
        energy: { label: ["Transformative", "Disciplined", "Expressive", "Calm", "Driven"][(mIndex + rIndex + 1) % 5], emoji: "⚡" }
      }
    }

    const copyMap = {
      today: activeChart.horoscope,
      week: activeChart.bigThree.rising.copy + " Leverage this energy to align your outer objectives with your inner focus.",
      month: activeChart.dasha.eraCopy
    }

    return {
      love: { status: metricsMap[tab].love.label, emoji: metricsMap[tab].love.emoji, colorClass: "text-[#FF7A45]" },
      money: { status: metricsMap[tab].money.label, emoji: metricsMap[tab].money.emoji, colorClass: "text-[#6DB88A]" },
      energy: { status: metricsMap[tab].energy.label, emoji: metricsMap[tab].energy.emoji, colorClass: "text-[#D4A800]" },
      interpretation: copyMap[tab]
    }
  }

  // Interactive Clipboard Copy for Vibe Card
  const handleVibeCopy = () => {
    if (!chart) return
    const vData = getTabVibeData(chart, activeTab)
    const text = `✨ My OyeAstro Cosmic Vibe [${activeTab.toUpperCase()}] ✨\n` +
      `🌅 Rising: ${chart.bigThree.rising.sign} Lagna\n` +
      `🌙 Moon Nakshatra: ${chart.dasha.nakshatra.name}\n` +
      `💌 Love: ${vData.love.status}\n` +
      `💸 Money: ${vData.money.status}\n` +
      `⚡ Energy: ${vData.energy.status}\n` +
      `Insight: "${vData.interpretation}"\n` +
      `Check yours at: oyeastro.com`;

    navigator.clipboard.writeText(text).then(() => {
      setVibeCopied(true)
      setTimeout(() => setVibeCopied(false), 2000)
    })
  }

  // Helper Name Hash
  const hashCode = (str: string) => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    return Math.abs(hash)
  }

  // Compatibility score handler
  const handleCompatCheck = () => {
    if (!cName1 || !cName2) {
      alert('Please enter names for both partners!')
      return
    }

    // Deterministic match percentage 30% - 99%
    const combined = cName1.toLowerCase().trim() + cName2.toLowerCase().trim()
    const hash = hashCode(combined)
    const score = (hash % 70) + 30

    // Determinstic signs
    const rashis = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
    const nakshatras = ["Ashwini", "Krittika", "Rohini", "Ardra", "Pushya", "Magha", "Hasta", "Swati", "Anuradha", "Jyeshtha", "Purva Ashadha", "Revati"]
    
    const hash1 = hashCode(cName1)
    const hash2 = hashCode(cName2)

    const rashi1 = rashis[hash1 % rashis.length]
    const rashi2 = rashis[hash2 % rashis.length]
    const naksh1 = nakshatras[hash1 % nakshatras.length]
    const naksh2 = nakshatras[hash2 % nakshatras.length]

    const scoreTemp = (hash1 % 25) + 75
    const scoreHeart = (hash2 % 30) + 65
    const scoreDest = ((hash1 + hash2) % 40) + 55
    const scoreTrust = ((hash1 * hash2) % 25) + 75

    let txt = ""
    if (score >= 85) {
      txt = "Certified Soulmates 🔒 - You guys are sharing headphones and speaking in code. 10/10 vibe match. The stars are literally screaming!"
    } else if (score >= 65) {
      txt = "Solid Banter Vibe 💬 - Great energy, hilarious text threads. High key compatible. Go send them a meme right now."
    } else if (score >= 45) {
      txt = "Friendzone Hazard ⚠️ - The compatibility is giving 'thanks for the add' vibes. Tread carefully, keep it casual."
    } else {
      txt = "Absolute Red Flag 🚩 - Your charts are actively fighting. Delete their number for your own peace of mind. Not it."
    }

    setCompatScore(score)
    setCompatText(txt)
    setCompatDetails({
      p1Sign: `${rashi1} · ${naksh1}`,
      p2Sign: `${rashi2} · ${naksh2}`,
      temp: scoreTemp,
      heart: scoreHeart,
      destiny: scoreDest,
      trust: scoreTrust
    })
    setCompatChecked(true)
  }

  // Reset compat
  const handleCompatReset = () => {
    setCName1('')
    setCName2('')
    setCompatChecked(false)
  }

  // Copy compat
  const handleCompatCopy = () => {
    const text = `✨ Cosmic Compatibility Vibe Match ✨\n` +
      `💖 ${cName1} ⟷ ${cName2}\n` +
      `📊 Match Score: ${compatScore}%\n` +
      `Insight: "${compatText}"\n` +
      `Check yours at: ${window.location.origin}`;
    
    navigator.clipboard.writeText(text).then(() => {
      setCompatCopied(true)
      setTimeout(() => setCompatCopied(false), 2000)
    })
  }

  // Active Vibe data rendering variables
  const vibeData = chart ? getTabVibeData(chart, activeTab) : null

  return (
    <>
      <Header />

      {/* ░░ HERO ░░ */}
      <section className="hero relative min-h-screen flex flex-col items-center justify-center text-center px-4 md:px-8 py-24 overflow-hidden">
        {/* Background Sky & Orbs */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_-5%,#FFF5C0_0%,#FEFCF7_65%)] pointer-events-none" />
        <div className="absolute rounded-full filter blur-[70px] opacity-[0.4] w-[380px] h-[380px] bg-[#FDE97B] -top-[120px] -left-[100px] animate-float-orb pointer-events-none" />
        <div className="absolute rounded-full filter blur-[70px] opacity-[0.4] w-[240px] h-[240px] bg-[#FFCFB8] top-[15%] -right-[80px] animate-float-orb pointer-events-none [animation-delay:-3.5s]" />
        <div className="absolute rounded-full filter blur-[70px] opacity-[0.4] w-[200px] h-[200px] bg-[#C8EDD9] bottom-[15%] left-[3%] animate-float-orb pointer-events-none [animation-delay:-6s]" />
        <div className="absolute rounded-full filter blur-[70px] opacity-[0.4] w-[160px] h-[160px] bg-[#D4E5FF] bottom-[8%] right-[8%] animate-float-orb pointer-events-none [animation-delay:-2s]" />

        <div className="hero-content relative max-w-[780px] w-full z-10">
          <div className="hero-badge inline-flex items-center gap-2 bg-white/85 border border-[#EDD97A] px-[18px] py-1.5 rounded-full text-xs font-medium text-[#7A5F00] tracking-wider uppercase mb-9">
            <div className="badge-dot w-1.5 h-1.5 bg-gold rounded-full animate-pulse" />
            Your cosmic clarity — zero woo-woo
          </div>

          <h1 className="hero-title font-display text-[46px] md:text-[88px] font-normal leading-[1.02] tracking-[-2.5px] text-ink mb-6">
            The universe has<br />
            <em className="not-italic text-coral font-medium">always</em> been<br />
            watching <span className="hero-underline relative inline-block after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-1 after:bg-gradient-to-r after:from-gold after:to-coral after:rounded">you.</span>
          </h1>

          <p className="hero-sub text-[17px] text-ink-mid leading-[1.8] max-w-[500px] mx-auto font-light mb-12">
            Enter your birth details. Get a deeply personal read on today, your week, and what's coming — backed by 5000 years of Vedic astrology, written for right now.
          </p>

          <form onSubmit={handleSubmit} className="input-card bg-white border border-border rounded-[28px] p-[2.25rem] pb-[1.75rem] max-w-[600px] mx-auto shadow-[0_6px_50px_rgba(26,18,8,0.07),0_2px_6px_rgba(26,18,8,0.04)] text-left">
            <div className="card-label text-[11px] font-medium text-ink-faint tracking-[2px] uppercase mb-6">Tell the cosmos who you are</div>
            
            <div className="input-row grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div className="field flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-ink-faint tracking-wider uppercase">Your name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  placeholder="Riya, Arjun, Priya…" 
                  className="bg-cream border-[1.5px] border-transparent outline-[1px] outline-border rounded-xl p-3 text-sm font-body text-ink focus:outline-none focus:border-coral focus:bg-white focus:ring-4 focus:ring-coral/10 transition-all duration-200"
                />
              </div>
              <div className="field flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-ink-faint tracking-wider uppercase">Birth city</label>
                <input 
                  type="text" 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)} 
                  required 
                  placeholder="Mumbai, Delhi, London…" 
                  className="bg-cream border-[1.5px] border-transparent outline-[1px] outline-border rounded-xl p-3 text-sm font-body text-ink focus:outline-none focus:border-coral focus:bg-white focus:ring-4 focus:ring-coral/10 transition-all duration-200"
                />
              </div>
            </div>

            <div className="input-row grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div className="field flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-ink-faint tracking-wider uppercase">Date of birth</label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  required 
                  className="bg-cream border-[1.5px] border-transparent outline-[1px] outline-border rounded-xl p-3 text-sm font-body text-ink focus:outline-none focus:border-coral focus:bg-white focus:ring-4 focus:ring-coral/10 transition-all duration-200"
                />
              </div>
              <div className="field flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-ink-faint tracking-wider uppercase">Time of birth</label>
                <input 
                  type="time" 
                  value={time} 
                  onChange={(e) => setTime(e.target.value)} 
                  required 
                  className="bg-cream border-[1.5px] border-transparent outline-[1px] outline-border rounded-xl p-3 text-sm font-body text-ink focus:outline-none focus:border-coral focus:bg-white focus:ring-4 focus:ring-coral/10 transition-all duration-200"
                />
              </div>
            </div>

            <div className="input-row grid grid-cols-1 gap-3 mb-[0.75rem]">
              <div className="field flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-ink-faint tracking-wider uppercase">What do you want clarity on?</label>
                <select 
                  value={clarity} 
                  onChange={(e) => setClarity(e.target.value)}
                  className="bg-cream border-[1.5px] border-transparent outline-[1px] outline-border rounded-xl p-3 text-sm font-body text-ink cursor-pointer focus:outline-none focus:border-coral focus:bg-white focus:ring-4 focus:ring-coral/10 transition-all duration-200"
                >
                  <option value="everything">Everything — just hit me ✦</option>
                  <option value="love">Love &amp; relationships</option>
                  <option value="career">Career &amp; money</option>
                  <option value="energy">My general energy today</option>
                  <option value="better">When does it get better?</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="submit-btn w-full bg-ink text-ivory rounded-xl p-4 font-medium text-sm font-body cursor-pointer flex items-center justify-center gap-2 hover:bg-coral hover:scale-[1.01] hover:shadow-[0_10_30_rgba(255,122,69,0.28)] transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? 'Reading your alignment...' : 'Read my cosmos'}
              <span className="inline-block transition-transform duration-200 hover:translate-x-1">→</span>
            </button>
            <p className="privacy text-[11px] text-ink-faint text-center mt-4">No signup needed. No ads. No spiritual uncle energy.</p>
          </form>

          {error && (
            <div className="max-w-[600px] mx-auto mt-4 px-4 py-3 bg-coral-light/20 text-coral border border-coral/30 rounded-xl text-center text-xs font-medium">
              ⚠️ {error}
            </div>
          )}
        </div>

        <div className="scroll-hint absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5">
          <div className="scroll-hint-text text-[10px] text-ink-faint tracking-[2px] uppercase">Scroll</div>
          <div className="scroll-line w-[1px] h-9 bg-border overflow-hidden relative after:content-[''] after:absolute after:top-[-100%] after:left-0 after:w-full after:h-full after:bg-coral animate-scroll-line" />
        </div>
      </section>

      {/* ░░ WHAT YOU GET ░░ */}
      <section className="section bg-white py-32 px-6">
        <div className="section-inner max-w-[1040px] mx-auto">
          <p className="eyebrow text-[11px] font-medium text-ink-faint tracking-[2px] uppercase mb-5">What you get</p>
          <h2 className="what-h font-display text-[36px] md:text-[58px] font-normal leading-[1.08] tracking-[-1.5px] text-ink mb-4">Not your mom's<br /><em className="not-italic text-lavender font-light">horoscope column.</em></h2>
          <p className="what-sub text-base text-ink-mid leading-[1.8] font-light max-w-[480px] mb-14">Personalised to your exact birth data. Written like your most self-aware friend — who happens to know Vedic astrology.</p>
          
          <div className="cards grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[18px]">
            <div className="feat bg-gradient-to-br from-[#FFFBE8] to-[#FFF3C0] border border-border rounded-[22px] p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="feat-ico w-11 h-11 bg-[#FDE97B] rounded-xl flex items-center justify-center text-xl mb-4">✦</div>
              <div className="feat-name font-display text-xl font-normal text-ink mb-2">Today's Vibe</div>
              <div className="feat-desc text-xs text-ink-mid leading-[1.72] font-light">Your energy, love, and money read for right now — based on where planets actually are today vs your natal chart. Refreshes every 24 hours.</div>
            </div>
            <div className="feat bg-gradient-to-br from-[#FFF2EC] to-[#FFE2D0] border border-border rounded-[22px] p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="feat-ico w-11 h-11 bg-[#FFCFB0] rounded-xl flex items-center justify-center text-xl mb-4">🌊</div>
              <div className="feat-name font-display text-xl font-normal text-ink mb-2">This Week's Current</div>
              <div className="feat-desc text-xs text-ink-mid leading-[1.72] font-light">The one thing to lean into and the one thing to watch out for. No 12-paragraph wall of text. Just what actually matters.</div>
            </div>
            <div className="feat bg-gradient-to-br from-[#EDFFF5] to-[#D0F5E4] border border-border rounded-[22px] p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="feat-ico w-11 h-11 bg-[#B0F0D0] rounded-xl flex items-center justify-center text-xl mb-4">🔮</div>
              <div className="feat-name font-display text-xl font-normal text-ink mb-2">Your Big Chapter</div>
              <div className="feat-desc text-xs text-ink-mid leading-[1.72] font-light">Based on your Dasha cycle — the Vedic system that maps your life in chapters. Know exactly which chapter you're in and when the next one begins.</div>
            </div>
            <div className="feat bg-gradient-to-br from-[#EEF3FF] to-[#D8E8FF] border border-border rounded-[22px] p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="feat-ico w-11 h-11 bg-[#C0DCFF] rounded-xl flex items-center justify-center text-xl mb-4">💫</div>
              <div className="feat-name font-display text-xl font-normal text-ink mb-2">Shareable Card</div>
              <div className="feat-desc text-xs text-ink-mid leading-[1.72] font-light">A beautiful, download-ready vibe card for your story. Made to be shared. Designed to make people ask "where did you get this?"</div>
            </div>
          </div>
        </div>
      </section>

      {/* ░░ HOW IT WORKS ░░ */}
      <section className="section bg-cream py-32 px-6" id="how">
        <div className="section-narrow max-w-[700px] mx-auto">
          <h2 className="how-h font-display text-[34px] md:text-[54px] font-normal leading-[1.1] text-ink tracking-tight mb-16">Three steps.<br /><em className="not-italic text-sage font-light">Thirty seconds.</em></h2>
          <div className="steps grid grid-cols-1 md:grid-cols-3 gap-14 text-left">
            <div>
              <div className="step-num font-display text-[72px] font-light text-border leading-none tracking-tighter mb-3">01</div>
              <h3 className="step-title font-display text-lg font-normal text-ink mb-2">Enter your birth details</h3>
              <p className="step-desc text-xs text-ink-mid leading-[1.78] font-light">Name, city, date, and time of birth. That's it. No email. No account. No downloading anything.</p>
            </div>
            <div>
              <div className="step-num font-display text-[72px] font-light text-border leading-none tracking-tighter mb-3">02</div>
              <h3 className="step-title font-display text-lg font-normal text-ink mb-2">We read the cosmos</h3>
              <p className="step-desc text-xs text-ink-mid leading-[1.78] font-light">Real Vedic calculations — your Lagna, Nakshatra, planetary transits, and Dasha cycle — all computed live, just for you.</p>
            </div>
            <div>
              <div className="step-num font-display text-[72px] font-light text-border leading-none tracking-tighter mb-3">03</div>
              <h3 className="step-title font-display text-lg font-normal text-ink mb-2">Get your vibe card</h3>
              <p className="step-desc text-xs text-ink-mid leading-[1.78] font-light">A personal, beautiful, honest read on your life right now. Share it. Screenshot it. Come back tomorrow for a fresh one.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ░░ RESULT PREVIEW ░░ */}
      <section className="section bg-white py-32 px-6" id="results">
        <div className="section-inner max-w-[1040px] mx-auto">
          <div className="split grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24 items-center">
            <div className="text-left">
              <p className="split-text-label text-[11px] font-medium text-ink-faint tracking-[2px] uppercase mb-5">
                {chart ? 'Your vibe card' : 'Sample vibe card'}
              </p>
              <h2 className="split-h font-display text-[28px] md:text-[46px] font-normal leading-[1.15] tracking-tight text-ink mb-4">
                {chart ? (
                  <>Your Cosmos is <em className="not-italic text-coral">aligned.</em><br />Read your vibe check.</>
                ) : (
                  <>Surprisingly <em className="not-italic text-coral">accurate.</em><br />Annoyingly so.</>
                )}
              </h2>
              <p className="split-p text-[15px] text-ink-mid leading-[1.8] font-light mb-8">
                Our readers keep saying the same thing: "This literally described my week." That's because it's not a generic sun-sign column. It's calculated from your exact chart, matched against today's sky.
              </p>
              <ul className="check-list list-none">
                <li className="text-xs text-ink-mid py-1.5 flex gap-2.5 leading-[1.6] before:content-['✦'] before:text-gold before:text-[10px] before:mt-0.5">Based on your real Lagna, Moon sign &amp; Nakshatra</li>
                <li className="text-xs text-ink-mid py-1.5 flex gap-2.5 leading-[1.6] before:content-['✦'] before:text-gold before:text-[10px] before:mt-0.5">Today's planetary transits vs your natal chart</li>
                <li className="text-xs text-ink-mid py-1.5 flex gap-2.5 leading-[1.6] before:content-['✦'] before:text-gold before:text-[10px] before:mt-0.5">Written in plain language — no Sanskrit, no jargon</li>
                <li className="text-xs text-ink-mid py-1.5 flex gap-2.5 leading-[1.6] before:content-['✦'] before:text-gold before:text-[10px] before:mt-0.5">A new reading every day, week, and month</li>
              </ul>
            </div>
            
            <div className="w-full max-w-[450px] mx-auto lg:mx-0">
              <div className="vibe-card bg-gradient-to-tr from-[#FFFBE8] via-[#FFF3C0] to-[#FFE8C0] border border-[#EDD890] rounded-[26px] p-7 shadow-md text-left">
                <div className="vc-head flex justify-between items-start mb-1">
                  <div className="vc-name text-[11px] font-medium text-ink-faint tracking-[2px] uppercase">
                    {chart ? `${chart.meta.name}'s Cosmic Vibe ✦` : "Riya's Cosmic Vibe ✦"}
                  </div>
                </div>
                <div className="vc-lagna font-display text-[29px] font-normal text-ink tracking-tight mb-1">
                  {chart ? `${chart.bigThree.rising.sign} Lagna` : "Meena Lagna"}
                </div>
                <div className="vc-naksh text-xs text-ink-faint">
                  {chart ? (
                    `${chart.dasha.nakshatra.name} Nakshatra · ${chart.dasha.activeDasha.rulerName} Mahadasha`
                  ) : (
                    "Jyeshtha Nakshatra · Venus Mahadasha"
                  )}
                </div>
                
                <div className="vc-line h-[0.5px] bg-ink/10 my-4" />
                
                <div className="vc-tabs flex gap-1.5 mb-4">
                  <button 
                    type="button" 
                    onClick={() => setActiveTab('today')}
                    className={`vc-tab text-[11px] px-3 py-1.5 rounded-full font-medium transition-all duration-150 font-body ${activeTab === 'today' ? 'bg-ink text-ivory border-none' : 'bg-ink/[0.06] text-ink-mid border-none hover:bg-ink/10'}`}
                  >
                    Today
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setActiveTab('week')}
                    className={`vc-tab text-[11px] px-3 py-1.5 rounded-full font-medium transition-all duration-150 font-body ${activeTab === 'week' ? 'bg-ink text-ivory border-none' : 'bg-ink/[0.06] text-ink-mid border-none hover:bg-ink/10'}`}
                  >
                    Week
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setActiveTab('month')}
                    className={`vc-tab text-[11px] px-3 py-1.5 rounded-full font-medium transition-all duration-150 font-body ${activeTab === 'month' ? 'bg-ink text-ivory border-none' : 'bg-ink/[0.06] text-ink-mid border-none hover:bg-ink/10'}`}
                  >
                    Month
                  </button>
                </div>

                <div className="vc-metrics grid grid-cols-3 gap-2 mb-4">
                  <div className="vc-m bg-white/75 rounded-xl p-2.5 text-center">
                    <div className="vc-m-emoji text-lg">{vibeData ? vibeData.love.emoji : '💌'}</div>
                    <div className="vc-m-lbl text-[9px] text-ink-faint tracking-wider uppercase mt-0.5">Love</div>
                    <div className="vc-m-val text-[12px] font-medium mt-1 text-[#FF7A45]">
                      {vibeData ? vibeData.love.status : 'Tender'}
                    </div>
                  </div>
                  <div className="vc-m bg-white/75 rounded-xl p-2.5 text-center">
                    <div className="vc-m-emoji text-lg">{vibeData ? vibeData.money.emoji : '💸'}</div>
                    <div className="vc-m-lbl text-[9px] text-ink-faint tracking-wider uppercase mt-0.5">Money</div>
                    <div className="vc-m-val text-[12px] font-medium mt-1 text-[#6DB88A]">
                      {vibeData ? vibeData.money.status : 'Flowing'}
                    </div>
                  </div>
                  <div className="vc-m bg-white/75 rounded-xl p-2.5 text-center">
                    <div className="vc-m-emoji text-lg">{vibeData ? vibeData.energy.emoji : '⚡'}</div>
                    <div className="vc-m-lbl text-[9px] text-ink-faint tracking-wider uppercase mt-0.5">Energy</div>
                    <div className="vc-m-val text-[12px] font-medium mt-1 text-[#D4A800]">
                      {vibeData ? vibeData.energy.status : 'Chaotic'}
                    </div>
                  </div>
                </div>

                <div className="vc-insight bg-white/65 rounded-xl p-4 text-[12px] text-ink-mid leading-[1.75] italic mb-4 border-l-[2.5px] border-coral min-h-[80px] flex items-center">
                  {vibeData ? `"${vibeData.interpretation}"` : `"Jupiter is side-eyeing your comfort zone right now. The next big chapter starts with one uncomfortable conversation you've been avoiding for weeks."`}
                </div>

                <div className="vc-share-bar flex items-center justify-between bg-ink rounded-xl p-3 text-xs">
                  <div className="vc-share-txt text-white/60">Share your vibe</div>
                  <button 
                    onClick={handleVibeCopy}
                    className="vc-share-btn-txt text-[#FDE97B] font-medium bg-transparent border-none cursor-pointer p-0 font-body hover:opacity-90"
                  >
                    {vibeCopied ? 'Copied! 💅' : 'Copy card ↗'}
                  </button>
                </div>
              </div>

              {chart && (
                <div className="mt-8">
                  <PremiumReportCard chart={chart} />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ░░ COMPATIBILITY ░░ */}
      <section className="section bg-cream py-32 px-6" id="match">
        <div className="section-inner max-w-[1040px] mx-auto">
          <div className="split grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24 items-center">
            
            <div className="w-full max-w-[450px] mx-auto lg:mx-0">
              <div className="compat-card bg-gradient-to-tr from-[#F6F0FF] to-[#EDE0FF] border border-[#DCCFFF] rounded-[26px] p-7 shadow-sm text-left">
                <div className="cc-eyebrow text-[10px] font-medium text-lavender tracking-[2px] uppercase mb-4">Cosmic Compatibility</div>
                
                {/* State 1: Intake inputs */}
                {!compatChecked ? (
                  <div className="cc-form flex flex-col gap-3">
                    <div className="cc-form-row grid grid-cols-1 gap-2.5">
                      <div className="flex flex-col">
                        <label className="text-[10px] font-medium text-ink-mid uppercase tracking-wide mb-1">Your name</label>
                        <input 
                          type="text" 
                          value={cName1} 
                          onChange={(e) => setCName1(e.target.value)} 
                          placeholder="Your name..." 
                          className="w-full bg-white/70 border border-border rounded-xl p-2.5 text-xs font-body text-ink outline-none focus:bg-white focus:border-lavender transition-all duration-200"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-[10px] font-medium text-ink-mid uppercase tracking-wide mb-1">Their name</label>
                        <input 
                          type="text" 
                          value={cName2} 
                          onChange={(e) => setCName2(e.target.value)} 
                          placeholder="Their name..." 
                          className="w-full bg-white/70 border border-border rounded-xl p-2.5 text-xs font-body text-ink outline-none focus:bg-white focus:border-lavender transition-all duration-200"
                        />
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={handleCompatCheck}
                      className="cc-form-btn bg-ink text-ivory rounded-xl p-3 font-medium text-xs font-body cursor-pointer hover:bg-lavender transition-colors duration-200 border-none mt-2"
                    >
                      Check Vibe Match ⟷
                    </button>
                  </div>
                ) : (
                  /* State 2: Results Display */
                  <div>
                    <div className="cc-persons-wrap flex gap-2.5 items-center mb-4">
                      <div className="cc-p flex-1 bg-white/65 rounded-xl p-2.5 text-center">
                        <div className="cc-p-name text-xs font-medium text-ink">{cName1}</div>
                        <div className="cc-p-sign text-[10px] text-ink-faint mt-0.5">{compatDetails.p1Sign}</div>
                      </div>
                      <div className="cc-arr text-ink-faint text-lg font-light shrink-0">⟷</div>
                      <div className="cc-p flex-1 bg-white/65 rounded-xl p-2.5 text-center">
                        <div className="cc-p-name text-xs font-medium text-ink">{cName2}</div>
                        <div className="cc-p-sign text-[10px] text-ink-faint mt-0.5">{compatDetails.p2Sign}</div>
                      </div>
                    </div>
                    
                    <div className="cc-pct text-center my-4">
                      <div className="cc-pct-val font-display text-[56px] font-light text-ink tracking-tight leading-none">
                        {compatScore}%
                      </div>
                      <div className="cc-pct-lbl text-[10px] text-ink-faint uppercase tracking-wider mt-1">Cosmic Match Score</div>
                    </div>

                    <div className="cc-bars flex flex-col gap-2.5 my-4">
                      <div className="cc-br flex items-center gap-2.5">
                        <div className="cc-br-lbl text-[10px] text-ink-faint w-[72px] shrink-0 text-right">Temperament</div>
                        <div className="cc-br-track flex-1 h-1 bg-ink/10 rounded-sm overflow-hidden">
                          <div className="cc-br-fill h-full rounded-sm bg-[#6DB88A] transition-all duration-500" style={{ width: `${compatDetails.temp}%` }} />
                        </div>
                      </div>
                      <div className="cc-br flex items-center gap-2.5">
                        <div className="cc-br-lbl text-[10px] text-ink-faint w-[72px] shrink-0 text-right">Heart connect</div>
                        <div className="cc-br-track flex-1 h-1 bg-ink/10 rounded-sm overflow-hidden">
                          <div className="cc-br-fill h-full rounded-sm bg-[#FF7A45] transition-all duration-500" style={{ width: `${compatDetails.heart}%` }} />
                        </div>
                      </div>
                      <div className="cc-br flex items-center gap-2.5">
                        <div className="cc-br-lbl text-[10px] text-ink-faint w-[72px] shrink-0 text-right">Destiny</div>
                        <div className="cc-br-track flex-1 h-1 bg-ink/10 rounded-sm overflow-hidden">
                          <div className="cc-br-fill h-full rounded-sm bg-[#7BA7E0] transition-all duration-500" style={{ width: `${compatDetails.destiny}%` }} />
                        </div>
                      </div>
                      <div className="cc-br flex items-center gap-2.5">
                        <div className="cc-br-lbl text-[10px] text-ink-faint w-[72px] shrink-0 text-right">Trust bond</div>
                        <div className="cc-br-track flex-1 h-1 bg-ink/10 rounded-sm overflow-hidden">
                          <div className="cc-br-fill h-full rounded-sm bg-[#9B7FD4] transition-all duration-500" style={{ width: `${compatDetails.trust}%` }} />
                        </div>
                      </div>
                    </div>

                    <div className="cc-insight text-[11px] text-ink-faint leading-relaxed italic my-4 min-h-[40px]">
                      "{compatText}"
                    </div>

                    <div className="cc-share-bar flex items-center justify-between bg-ink rounded-xl p-3 text-xs mt-2">
                      <div className="cc-share-txt text-white/55">Send this to your person</div>
                      <button 
                        onClick={handleCompatCopy}
                        className="cc-share-btn-txt text-[#CCAAFF] font-medium bg-transparent border-none cursor-pointer p-0 font-body hover:opacity-90"
                      >
                        {compatCopied ? 'Copied! 💅' : 'Share match ↗'}
                      </button>
                    </div>

                    <div className="text-center mt-4">
                      <button 
                        type="button" 
                        onClick={handleCompatReset}
                        className="cc-reset-btn text-[10px] bg-transparent border-none text-ink-faint underline cursor-pointer hover:text-ink"
                      >
                        Check another match
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="text-left">
              <p className="split-text-label text-[11px] font-medium text-ink-faint tracking-[2px] uppercase mb-5">Feature 02 — Compatibility</p>
              <h2 className="split-h font-display text-[28px] md:text-[46px] font-normal leading-[1.15] tracking-tight text-ink mb-4">
                Are you two actually <em className="not-italic text-lavender font-light">written</em><br />in the stars?
              </h2>
              <p className="split-p text-[15px] text-ink-mid leading-[1.8] font-light mb-8">
                Enter your details and theirs. Get a real Ashtakoot compatibility score — the 5000-year-old Vedic system that looks at 8 dimensions of connection. Not just a number. A story.
              </p>
              <ul className="check-list list-none">
                <li className="text-xs text-ink-mid py-1.5 flex gap-2.5 leading-[1.6] before:content-['✦'] before:text-gold before:text-[10px] before:mt-0.5">36-point Ashtakoot Guna Milan calculation</li>
                <li className="text-xs text-ink-mid py-1.5 flex gap-2.5 leading-[1.6] before:content-['✦'] before:text-gold before:text-[10px] before:mt-0.5">Mangal Dosha check for both partners</li>
                <li className="text-xs text-ink-mid py-1.5 flex gap-2.5 leading-[1.6] before:content-['✦'] before:text-gold before:text-[10px] before:mt-0.5">A narrative: what works, what needs work</li>
                <li className="text-xs text-ink-mid py-1.5 flex gap-2.5 leading-[1.6] before:content-['✦'] before:text-gold before:text-[10px] before:mt-0.5">A shareable duo card for your Instagram</li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* ░░ PRICING (FOLD 3) ░░ */}
      <PricingGrid />

      {/* ░░ TESTIMONIALS ░░ */}
      <section className="section bg-white py-32 px-6">
        <div className="section-inner max-w-[1040px] mx-auto text-center">
          <h2 className="testi-h font-display text-[28px] md:text-[46px] font-normal leading-[1.15] tracking-tight text-ink mb-16">
            People keep saying<br />it's <em className="not-italic text-periwinkle font-light">eerily accurate.</em>
          </h2>
          <div className="testi-grid grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="testi-card bg-cream border border-border rounded-[20px] p-6 transition-transform duration-200 hover:-translate-y-0.5">
              <div className="testi-stars text-gold text-xs tracking-wider mb-3">★★★★★</div>
              <p className="testi-q font-display text-[15px] font-light leading-[1.72] italic text-ink mb-4">"I've tried every astrology app. This is the first one that said something I hadn't heard before. The Dasha insight about my career literally made me tear up."</p>
              <div className="testi-by text-xs font-semibold text-ink">Priya S.</div>
              <div className="testi-sign text-[11px] text-ink-faint mt-0.5">21 · Mumbai · Virgo Rising</div>
            </div>
            <div className="testi-card bg-cream border border-border rounded-[20px] p-6 transition-transform duration-200 hover:-translate-y-0.5">
              <div className="testi-stars text-gold text-xs tracking-wider mb-3">★★★★★</div>
              <p className="testi-q font-display text-[15px] font-light leading-[1.72] italic text-ink mb-4">"Sent the compatibility card to my partner. He's a full skeptic. He read it three times and then asked me to read it to him again. Say less."</p>
              <div className="testi-by text-xs font-semibold text-ink">Rohan K.</div>
              <div className="testi-sign text-[11px] text-ink-faint mt-0.5">27 · Bengaluru · Capricorn Moon</div>
            </div>
            <div className="testi-card bg-cream border border-border rounded-[20px] p-6 transition-transform duration-200 hover:-translate-y-0.5">
              <div className="testi-stars text-gold text-xs tracking-wider mb-3">★★★★★</div>
              <p className="testi-q font-display text-[15px] font-light leading-[1.72] italic text-ink mb-4">"No login. No email. No paywall. It just worked. And it hit so different at 2am when I was spiraling about literally everything."</p>
              <div className="testi-by text-xs font-semibold text-ink">Aisha M.</div>
              <div className="testi-sign text-[11px] text-ink-faint mt-0.5">24 · London · Scorpio Sun</div>
            </div>
          </div>
        </div>
      </section>

      {/* ░░ WHY NOT BORING ░░ */}
      <section className="section bg-cream py-32 px-6">
        <div className="section-inner max-w-[1040px] mx-auto text-center">
          <h2 className="why-h font-display text-[28px] md:text-[46px] font-normal leading-[1.2] tracking-tight text-ink mb-16">
            This isn't your grandfather's<br /><em className="not-italic text-gold font-light">astrology.</em>
          </h2>
          <div className="why-grid grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="why-card bg-ivory border border-border rounded-[20px] p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm">
              <span className="why-tag wt-a text-[10px] font-medium tracking-[1.5px] uppercase px-2.5 py-0.5 rounded-full mb-3 bg-[#FFF3CC] text-[#7A5500]">Accuracy</span>
              <h3 className="why-card-h font-display text-lg font-normal text-ink mb-2">Real Swiss Ephemeris calculations</h3>
              <p className="why-card-p text-xs text-ink-mid leading-[1.75] font-light">Not approximations. Actual Vedic chart computation from your exact birth coordinates — the same engine used by professional astrologers worldwide.</p>
            </div>
            <div className="why-card bg-ivory border border-border rounded-[20px] p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm">
              <span className="why-tag wt-b text-[10px] font-medium tracking-[1.5px] uppercase px-2.5 py-0.5 rounded-full mb-3 bg-[#FFE8E0] text-[#7A2500]">Language</span>
              <h3 className="why-card-h font-display text-lg font-normal text-ink mb-2">Zero Sanskrit. Zero jargon.</h3>
              <p className="why-card-p text-xs text-ink-mid leading-[1.75] font-light">"Jupiter transiting your 9th house" becomes "your biggest glow-up is happening in your career right now." Same truth. Language you actually want to read.</p>
            </div>
            <div className="why-card bg-ivory border border-border rounded-[20px] p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm">
              <span className="why-tag wt-c text-[10px] font-medium tracking-[1.5px] uppercase px-2.5 py-0.5 rounded-full mb-3 bg-[#E0F5E8] text-[#0A5228]">Privacy</span>
              <h3 className="why-card-h font-display text-lg font-normal text-ink mb-2">No signup. No tracking. Just clarity.</h3>
              <p className="why-card-p text-xs text-ink-mid leading-[1.75] font-light">Your birth data stays in your browser. We don't store it, sell it, or ask for your email. Come back anytime. No friction ever.</p>
            </div>
            <div className="why-card bg-ivory border border-border rounded-[20px] p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm">
              <span className="why-tag wt-d text-[10px] font-medium tracking-[1.5px] uppercase px-2.5 py-0.5 rounded-full mb-3 bg-[#E8E0FF] text-[#38107A]">Design</span>
              <h3 className="why-card-h font-display text-lg font-normal text-ink mb-2">Made to be shared.</h3>
              <p className="why-card-p text-xs text-ink-mid leading-[1.75] font-light">Every vibe card is designed for Instagram Stories — beautiful, personal, screenshot-worthy. The first astrology tool your friends will actually ask about.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ░░ FINAL CTA ░░ */}
      <section className="sect-cta bg-ink py-36 px-6 text-center relative overflow-hidden">
        <div className="cta-glow1 absolute w-[500px] h-[500px] rounded-full bg-gold/5 blur-[100px] -top-[150px] -left-[100px]" />
        <div className="cta-glow2 absolute w-[400px] h-[400px] rounded-full bg-coral/5 blur-[100px] -bottom-[100px] -right-[60px]" />
        <div className="cta-wrap relative max-w-[600px] mx-auto z-10">
          <h2 className="cta-h font-display text-[38px] md:text-[68px] font-normal leading-[1.05] tracking-[-1.5px] text-ivory mb-5">
            The stars have been<br />waiting for you<br />to <em className="not-italic text-gold font-light">just ask.</em>
          </h2>
          <p className="cta-p text-sm text-white/50 leading-[1.8] font-light mb-10">No signup. No credit card. No spiritual commitment required. Enter your birth details and see what the cosmos has been trying to tell you.</p>
          <button 
            type="button" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="cta-btn inline-flex items-center gap-2.5 bg-gold text-ink px-10 py-4.5 rounded-full text-sm font-medium font-body hover:bg-white hover:-translate-y-[2px] hover:shadow-[0_14px_40px_rgba(245,197,24,0.2)] transition-all duration-200 border-none cursor-pointer"
          >
            Read my cosmos ✦
          </button>
          <p className="cta-note text-[12px] text-white/25 mt-5">Free forever · Takes 30 seconds · No account needed</p>
        </div>
      </section>

      <Footer />
    </>
  )
}

export default function Home() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex flex-col justify-between bg-ivory text-ink">
        <header className="px-6 py-4 border-b border-border bg-white">
          <span className="font-display font-medium text-ink text-xl">
            oyeastro.
          </span>
        </header>
        <div className="my-16 text-center text-xs font-body text-ink-faint">
          Connecting you to the cosmos...
        </div>
        <Footer />
      </main>
    }>
      <HomeContent />
    </Suspense>
  )
}
