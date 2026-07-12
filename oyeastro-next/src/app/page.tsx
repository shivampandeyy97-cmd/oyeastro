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
  const [gender, setGender] = useState('male')
  const [city, setCity] = useState('')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [clarity, setClarity] = useState('everything')

  // Autocomplete for Hero Birth City
  useEffect(() => {
    if (city.length < 3) { setSuggestions([]); return }
    const delay = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(city)}`)
        if (res.ok) {
          const data = await res.json()
          setSuggestions(data)
        }
      } catch (err) { console.error(err) }
    }, 400)
    return () => clearTimeout(delay)
  }, [city])

  // Application States
  const [chart, setChart] = useState<ChartResult | null>(null)
  const [vibeResult, setVibeResult] = useState<CosmicVibeResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'month'>('today')
  const [isFlipped, setIsFlipped] = useState(false)
  const [selectedVibeMetric, setSelectedVibeMetric] = useState<'love' | 'money' | 'energy'>('love')

  // Compatibility State
  const [cName1, setCName1] = useState('')
  const [cDate1, setCDate1] = useState('')
  const [cTime1, setCTime1] = useState('')
  const [cPlace1, setCPlace1] = useState('')
  const [cSuggestions1, setCSuggestions1] = useState<any[]>([])
  const [cShowSuggestions1, setCShowSuggestions1] = useState(false)

  const [cName2, setCName2] = useState('')
  const [cDate2, setCDate2] = useState('')
  const [cTime2, setCTime2] = useState('')
  const [cPlace2, setCPlace2] = useState('')
  const [cSuggestions2, setCSuggestions2] = useState<any[]>([])
  const [cShowSuggestions2, setCShowSuggestions2] = useState(false)

  const [compatLoading, setCompatLoading] = useState(false)
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

  // Autocomplete 1
  useEffect(() => {
    if (cPlace1.length < 3) { setCSuggestions1([]); return }
    const delay = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(cPlace1)}`)
        if (res.ok) {
          const data = await res.json()
          setCSuggestions1(data)
        }
      } catch (err) { console.error(err) }
    }, 400)
    return () => clearTimeout(delay)
  }, [cPlace1])

  // Autocomplete 2
  useEffect(() => {
    if (cPlace2.length < 3) { setCSuggestions2([]); return }
    const delay = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(cPlace2)}`)
        if (res.ok) {
          const data = await res.json()
          setCSuggestions2(data)
        }
      } catch (err) { console.error(err) }
    }, 400)
    return () => clearTimeout(delay)
  }, [cPlace2])

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
    setIsFlipped(false)
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
      setTimeout(() => {
        setIsFlipped(true)
      }, 600)

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
    handleFetchChart({ name, gender, birthDate: date, birthTime: time, birthPlace: city })
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
  const handleCompatCheck = async () => {
    if (!cName1 || !cDate1 || !cTime1 || !cPlace1 || !cName2 || !cDate2 || !cTime2 || !cPlace2) {
      alert('Please fill out all details for both partners!')
      return
    }

    setCompatLoading(true)
    try {
      const res = await fetch('/api/compatibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personA: { name: cName1, birthDate: cDate1, birthTime: cTime1, birthPlace: cPlace1 },
          personB: { name: cName2, birthDate: cDate2, birthTime: cTime2, birthPlace: cPlace2 }
        })
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Matching failed')
      }

      const data = await res.json()

      const tempKuta = data.kutas.find((k: any) => k.name === 'Gana')
      const heartKuta = data.kutas.find((k: any) => k.name === 'Bhakoot')
      const destinyKuta = data.kutas.find((k: any) => k.name === 'Graha Maitri')
      const trustKuta = data.kutas.find((k: any) => k.name === 'Nadi')

      setCompatScore(data.percentage)
      setCompatText(data.narrative || data.summary)
      setCompatDetails({
        p1Sign: `${data.personA.meta.rashi || ''} · ${data.personA.meta.nakshatra || ''}`,
        p2Sign: `${data.personB.meta.rashi || ''} · ${data.personB.meta.nakshatra || ''}`,
        temp: tempKuta ? Math.round((tempKuta.scored / tempKuta.maxPoints) * 100) : 75,
        heart: heartKuta ? Math.round((heartKuta.scored / heartKuta.maxPoints) * 100) : 70,
        destiny: destinyKuta ? Math.round((destinyKuta.scored / destinyKuta.maxPoints) * 100) : 60,
        trust: trustKuta ? Math.round((trustKuta.scored / trustKuta.maxPoints) * 100) : 80,
      })
      setCompatChecked(true)
    } catch (err: any) {
      alert(`Error checking compatibility: ${err.message}`)
    } finally {
      setCompatLoading(false)
    }
  }

  // Reset compat
  const handleCompatReset = () => {
    setCName1('')
    setCDate1('')
    setCTime1('')
    setCPlace1('')
    setCName2('')
    setCDate2('')
    setCTime2('')
    setCPlace2('')
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

          <h1 className="hero-title text-[44px] sm:text-[64px] md:text-[84px] lg:text-[104px] leading-[1.05] text-ink mb-8 max-w-4xl mx-auto overflow-visible" style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Icons", "Helvetica Neue", Helvetica, Arial, sans-serif',
            letterSpacing: '-0.025em',
            fontWeight: 800
          }}>
            Know what gonna<br className="hidden md:inline" /> happen next
          </h1>

          <p className="hero-sub text-[16px] md:text-[18px] text-ink-mid leading-[1.8] max-w-[550px] mx-auto font-light mb-12">
            Fully backed by mathematical astrology, but let's be real—consider this a highly educated cosmic guess from a supportive well-wisher who knows too much.
          </p>

          <form onSubmit={handleSubmit} className="input-card bg-white border border-border rounded-[28px] p-[2.25rem] pb-[1.75rem] max-w-[600px] mx-auto shadow-[0_6px_50px_rgba(26,18,8,0.07),0_2px_6px_rgba(26,18,8,0.04)] text-left">
            <div className="card-label text-[11px] font-medium text-ink-faint tracking-[2px] uppercase mb-6">Tell the cosmos who you are</div>
            
            <div className="input-row grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <div className="field flex flex-col gap-1.5 md:col-span-2">
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
                <label className="text-[11px] font-medium text-ink-faint tracking-wider uppercase">Gender</label>
                <select 
                  value={gender} 
                  onChange={(e) => setGender(e.target.value)}
                  className="bg-cream border-[1.5px] border-transparent outline-[1px] outline-border rounded-xl p-3 text-sm font-body text-ink cursor-pointer focus:outline-none focus:border-coral focus:bg-white focus:ring-4 focus:ring-coral/10 transition-all duration-200"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-Binary</option>
                </select>
              </div>
            </div>

            <div className="input-row grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div className="field flex flex-col gap-1.5 relative">
                <label className="text-[11px] font-medium text-ink-faint tracking-wider uppercase">Birth city</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={city} 
                    onChange={(e) => { setCity(e.target.value); setShowSuggestions(true) }} 
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    required 
                    placeholder="Mumbai, Delhi, London…" 
                    className="w-full bg-cream border-[1.5px] border-transparent outline-[1px] outline-border rounded-xl p-3 text-sm font-body text-ink focus:outline-none focus:border-coral focus:bg-white focus:ring-4 focus:ring-coral/10 transition-all duration-200"
                    autoComplete="off"
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <ul className="absolute left-0 right-0 top-full mt-1 bg-white border border-border rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto pl-0 list-none m-0 p-0">
                      {suggestions.map((s: any, i: number) => (
                        <li 
                          key={i}
                          className="px-3.5 py-2.5 text-xs text-ink hover:bg-coral/10 cursor-pointer truncate border-b border-border/40 last:border-0"
                          onMouseDown={() => { setCity(s.display_name.split(',').slice(0, 3).join(',')); setSuggestions([]) }}
                        >
                          📍 {s.display_name.split(',').slice(0, 3).join(', ')}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
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
            </div>

            <div className="input-row grid grid-cols-1 md:grid-cols-2 gap-3 mb-[0.75rem]">
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



      {/* ░░ RESULT PREVIEW ░░ */}
      {chart && (
        <section className="section bg-white py-32 px-6" id="results">
          <div className="section-inner max-w-[1040px] mx-auto">
            <div className="split grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24 items-center">
              <div className="text-left">
                <p className="split-text-label text-[11px] font-medium text-ink-faint tracking-[2px] uppercase mb-5">
                  Your vibe card
                </p>
                <h2 className="split-h font-display text-[28px] md:text-[46px] font-normal leading-[1.15] tracking-tight text-ink mb-4">
                  Your Cosmos is <em className="not-italic text-coral">aligned.</em><br />Read your vibe check.
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
              
              <div className="w-full max-w-[450px] mx-auto lg:mx-0 perspective-1000 min-h-[580px] relative">
                <div className={`w-full h-full transition-transform duration-700 preserve-3d relative ${isFlipped ? 'rotate-y-180' : ''}`} style={{ transformStyle: 'preserve-3d' }}>
                  
                  {/* Card Back Face (Hidden when flipped) */}
                  <div className="absolute inset-0 backface-hidden bg-ink border-2 border-[#EDD890] rounded-[26px] p-8 flex flex-col items-center justify-center text-center shadow-lg cursor-pointer" onClick={() => setIsFlipped(true)} style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
                    <div className="w-14 h-14 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-2xl mb-5 animate-pulse text-gold">
                      ✦
                    </div>
                    <h3 className="font-display font-medium text-lg text-ivory tracking-wider mb-2">Calculating Your Cosmos...</h3>
                    <p className="text-[11px] text-ink-faint max-w-[200px] leading-relaxed mb-4">
                      Reading natal planets, current transit shapes, and lunar nakshatras...
                    </p>
                    <div className="text-[10px] text-gold/60 mt-4 tracking-[3px] uppercase font-semibold">Click to Reveal</div>
                  </div>

                  {/* Card Front Face (Revealed when flipped) */}
                  <div className="absolute inset-0 backface-hidden vibe-card bg-gradient-to-tr from-[#FFFBE8] via-[#FFF3C0] to-[#FFE8C0] border border-[#EDD890] rounded-[26px] p-7 shadow-md text-left rotate-y-180 flex flex-col justify-between" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
                    <div>
                      <div className="vc-head flex justify-between items-start mb-1">
                        <div className="vc-name text-[11px] font-medium text-ink-faint tracking-[2px] uppercase">
                          {chart.meta.name}'s Cosmic Vibe ✦
                        </div>
                      </div>
                      <div className="vc-lagna font-display text-[29px] font-normal text-ink tracking-tight mb-1">
                        {chart.bigThree.rising.sign} Lagna
                      </div>
                      <div className="vc-naksh text-xs text-ink-faint">
                        {chart.dasha.nakshatra.name} Nakshatra · {chart.dasha.activeDasha.rulerName} Mahadasha
                      </div>
                      
                      <div className="vc-line h-[0.5px] bg-ink/10 my-3" />
                      
                      <div className="vc-tabs flex gap-1.5 mb-3">
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
      
                      {/* Interactive Metrics Grid */}
                      <div className="vc-metrics grid grid-cols-3 gap-2 mb-3">
                        <button 
                          type="button"
                          onClick={() => setSelectedVibeMetric('love')}
                          className={`vc-m rounded-xl p-2.5 text-center border transition-all cursor-pointer ${selectedVibeMetric === 'love' ? 'bg-[#FFF2EC] border-[#FF7A45]/30 ring-2 ring-[#FF7A45]/10' : 'bg-white/60 border-transparent hover:bg-white'}`}
                        >
                          <div className="vc-m-emoji text-lg">{vibeData ? vibeData.love.emoji : '💌'}</div>
                          <div className="vc-m-lbl text-[9px] text-ink-faint tracking-wider uppercase mt-0.5 font-medium">Love</div>
                          <div className="vc-m-val text-[11px] font-semibold mt-0.5 text-[#FF7A45]">
                            {vibeData ? vibeData.love.status : 'Tender'}
                          </div>
                        </button>
                        
                        <button 
                          type="button"
                          onClick={() => setSelectedVibeMetric('money')}
                          className={`vc-m rounded-xl p-2.5 text-center border transition-all cursor-pointer ${selectedVibeMetric === 'money' ? 'bg-[#EEF7F2] border-[#6DB88A]/30 ring-2 ring-[#6DB88A]/10' : 'bg-white/60 border-transparent hover:bg-white'}`}
                        >
                          <div className="vc-m-emoji text-lg">{vibeData ? vibeData.money.emoji : '💸'}</div>
                          <div className="vc-m-lbl text-[9px] text-ink-faint tracking-wider uppercase mt-0.5 font-medium">Money</div>
                          <div className="vc-m-val text-[11px] font-semibold mt-0.5 text-[#6DB88A]">
                            {vibeData ? vibeData.money.status : 'Flowing'}
                          </div>
                        </button>

                        <button 
                          type="button"
                          onClick={() => setSelectedVibeMetric('energy')}
                          className={`vc-m rounded-xl p-2.5 text-center border transition-all cursor-pointer ${selectedVibeMetric === 'energy' ? 'bg-[#FFFBEB] border-[#D4A800]/30 ring-2 ring-[#D4A800]/10' : 'bg-white/60 border-transparent hover:bg-white'}`}
                        >
                          <div className="vc-m-emoji text-lg">{vibeData ? vibeData.energy.emoji : '⚡'}</div>
                          <div className="vc-m-lbl text-[9px] text-ink-faint tracking-wider uppercase mt-0.5 font-medium">Energy</div>
                          <div className="vc-m-val text-[11px] font-semibold mt-0.5 text-[#D4A800]">
                            {vibeData ? vibeData.energy.status : 'Chaotic'}
                          </div>
                        </button>
                      </div>

                      {/* Detailed Metric Breakdown */}
                      <div className="vc-breakdown bg-white/70 border border-ink/5 rounded-xl p-3.5 text-xs mb-3 flex flex-col gap-2 shadow-[inset_0_2px_4px_rgba(26,18,8,0.02)]">
                        {selectedVibeMetric === 'love' && (
                          <>
                            <div className="flex justify-between items-center text-[10px] font-bold text-ink uppercase tracking-wide">
                              <span>💖 Love &amp; Connection Alignment</span>
                              <span className="text-[#FF7A45]">{Math.abs((chart.houseData.lagnaSignIndex * 7) % 35) + 65}%</span>
                            </div>
                            <div className="w-full h-1 bg-ink/5 rounded-full overflow-hidden">
                              <div className="h-full bg-[#FF7A45] rounded-full" style={{ width: `${Math.abs((chart.houseData.lagnaSignIndex * 7) % 35) + 65}%` }} />
                            </div>
                            <div className="text-[10px] text-ink-mid leading-relaxed">
                              Transit Venus is aspecting your Moon. If they aren't texting back, it's a direction problem, not a connection problem. Set boundaries!
                            </div>
                          </>
                        )}
                        {selectedVibeMetric === 'money' && (
                          <>
                            <div className="flex justify-between items-center text-[10px] font-bold text-ink uppercase tracking-wide">
                              <span>💵 Financial Flow Status</span>
                              <span className="text-[#6DB88A]">{Math.abs((chart.houseData.lagnaSignIndex * 13) % 40) + 60}%</span>
                            </div>
                            <div className="w-full h-1 bg-ink/5 rounded-full overflow-hidden">
                              <div className="h-full bg-[#6DB88A] rounded-full" style={{ width: `${Math.abs((chart.houseData.lagnaSignIndex * 13) % 40) + 60}%` }} />
                            </div>
                            <div className="text-[10px] text-ink-mid leading-relaxed">
                              Jupiter supports your asset houses, but Mercury's positioning warning points to high shopping/impulse risk. Close that online cart!
                            </div>
                          </>
                        )}
                        {selectedVibeMetric === 'energy' && (
                          <>
                            <div className="flex justify-between items-center text-[10px] font-bold text-ink uppercase tracking-wide">
                              <span>⚡ Cosmic Battery Level</span>
                              <span className="text-[#D4A800]">{Math.abs((chart.houseData.lagnaSignIndex * 9) % 50) + 40}%</span>
                            </div>
                            <div className="w-full h-1 bg-ink/5 rounded-full overflow-hidden">
                              <div className="h-full bg-[#D4A800] rounded-full" style={{ width: `${Math.abs((chart.houseData.lagnaSignIndex * 9) % 50) + 40}%` }} />
                            </div>
                            <div className="text-[10px] text-ink-mid leading-relaxed">
                              Your solar energy is high, but Mars is side-eyeing your 8th house of burnout. Skip the extra screens tonight; recharge your battery.
                            </div>
                          </>
                        )}
                      </div>
      
                      {/* Rich readable description */}
                      <div className="vc-insight bg-white border border-[#EDD890]/40 rounded-xl p-4 text-[13px] text-ink font-semibold leading-[1.8] italic mb-4 border-l-[3px] border-coral shadow-sm">
                        {vibeData ? `"${vibeData.interpretation}"` : `""`}
                      </div>
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
  
                </div>
              </div>
  
              <div className="mt-8 w-full max-w-[450px] mx-auto lg:mx-0">
                <PremiumReportCard chart={chart} />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ░░ COMPATIBILITY ░░ */}
      <section className="section bg-cream py-32 px-6" id="match">
        <div className="section-inner max-w-[1040px] mx-auto">
          <div className="split grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24 items-start">
            
            {/* Left Column: Details Box (Form) */}
            <div className="w-full max-w-[450px] mx-auto lg:mx-0">
              <div className="compat-card bg-gradient-to-tr from-[#F6F0FF] to-[#EDE0FF] border border-[#DCCFFF] rounded-[26px] p-7 shadow-sm text-left">
                <div className="cc-eyebrow text-[10px] font-medium text-lavender tracking-[2px] uppercase mb-4">Cosmic Compatibility</div>
                
                <div className="cc-form flex flex-col gap-4">
                  {/* Partner 1 */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-semibold text-lavender uppercase tracking-wider">Partner 1 (You)</span>
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="text" 
                        value={cName1} 
                        onChange={(e) => setCName1(e.target.value)} 
                        placeholder="Name..." 
                        className="w-full bg-white/70 border border-border rounded-xl p-2 text-xs font-body text-ink outline-none focus:bg-white focus:border-lavender transition-all duration-200"
                      />
                      <input 
                        type="date" 
                        value={cDate1} 
                        onChange={(e) => setCDate1(e.target.value)} 
                        className="w-full bg-white/70 border border-border rounded-xl p-2 text-xs font-body text-ink outline-none focus:bg-white focus:border-lavender transition-all duration-200"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 relative">
                      <input 
                        type="time" 
                        value={cTime1} 
                        onChange={(e) => setCTime1(e.target.value)} 
                        className="w-full bg-white/70 border border-border rounded-xl p-2 text-xs font-body text-ink outline-none focus:bg-white focus:border-lavender transition-all duration-200"
                      />
                      <div className="relative">
                        <input 
                          type="text" 
                          value={cPlace1} 
                          onChange={(e) => { setCPlace1(e.target.value); setCShowSuggestions1(true) }}
                          onBlur={() => setTimeout(() => setCShowSuggestions1(false), 200)}
                          placeholder="Birth City..." 
                          className="w-full bg-white/70 border border-border rounded-xl p-2 text-xs font-body text-ink outline-none focus:bg-white focus:border-lavender transition-all duration-200"
                          autoComplete="off"
                        />
                        {cShowSuggestions1 && cSuggestions1.length > 0 && (
                          <ul className="absolute left-0 right-0 top-full mt-1 bg-white border border-border rounded-xl shadow-lg z-50 max-h-32 overflow-y-auto pl-0 list-none m-0 p-0">
                            {cSuggestions1.map((s: any, i: number) => (
                              <li 
                                key={i}
                                className="px-3 py-2 text-[10px] text-ink hover:bg-lavender/10 cursor-pointer truncate border-b border-border/40 last:border-0"
                                onMouseDown={() => { setCPlace1(s.display_name.split(',').slice(0, 3).join(',')); setCSuggestions1([]) }}
                              >
                                📍 {s.display_name.split(',').slice(0, 3).join(', ')}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Partner 2 */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-lavender/25">
                    <span className="text-[10px] font-semibold text-lavender uppercase tracking-wider">Partner 2 (Them)</span>
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="text" 
                        value={cName2} 
                        onChange={(e) => setCName2(e.target.value)} 
                        placeholder="Name..." 
                        className="w-full bg-white/70 border border-border rounded-xl p-2 text-xs font-body text-ink outline-none focus:bg-white focus:border-lavender transition-all duration-200"
                      />
                      <input 
                        type="date" 
                        value={cDate2} 
                        onChange={(e) => setCDate2(e.target.value)} 
                        className="w-full bg-white/70 border border-border rounded-xl p-2 text-xs font-body text-ink outline-none focus:bg-white focus:border-lavender transition-all duration-200"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 relative">
                      <input 
                        type="time" 
                        value={cTime2} 
                        onChange={(e) => setCTime2(e.target.value)} 
                        className="w-full bg-white/70 border border-border rounded-xl p-2 text-xs font-body text-ink outline-none focus:bg-white focus:border-lavender transition-all duration-200"
                      />
                      <div className="relative">
                        <input 
                          type="text" 
                          value={cPlace2} 
                          onChange={(e) => { setCPlace2(e.target.value); setCShowSuggestions2(true) }}
                          onBlur={() => setTimeout(() => setCShowSuggestions2(false), 200)}
                          placeholder="Birth City..." 
                          className="w-full bg-white/70 border border-border rounded-xl p-2 text-xs font-body text-ink outline-none focus:bg-white focus:border-lavender transition-all duration-200"
                          autoComplete="off"
                        />
                        {cShowSuggestions2 && cSuggestions2.length > 0 && (
                          <ul className="absolute left-0 right-0 top-full mt-1 bg-white border border-border rounded-xl shadow-lg z-50 max-h-32 overflow-y-auto pl-0 list-none m-0 p-0">
                            {cSuggestions2.map((s: any, i: number) => (
                              <li 
                                key={i}
                                className="px-3 py-2 text-[10px] text-ink hover:bg-lavender/10 cursor-pointer truncate border-b border-border/40 last:border-0"
                                onMouseDown={() => { setCPlace2(s.display_name.split(',').slice(0, 3).join(',')); setCSuggestions2([]) }}
                              >
                                📍 {s.display_name.split(',').slice(0, 3).join(', ')}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>

                  <button 
                    type="button" 
                    onClick={handleCompatCheck}
                    disabled={compatLoading}
                    className="cc-form-btn bg-ink text-ivory rounded-xl p-3 font-medium text-xs font-body cursor-pointer hover:bg-lavender transition-colors duration-200 border-none mt-2"
                  >
                    {compatLoading ? 'Matching Orbits...' : 'Check Vibe Match ⟷'}
                  </button>

                  {compatChecked && (
                    <div className="text-center mt-2">
                      <button 
                        type="button" 
                        onClick={handleCompatReset}
                        className="cc-reset-btn text-[10px] bg-transparent border-none text-ink-faint underline cursor-pointer hover:text-ink"
                      >
                        Reset / Clear Details
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Descriptions (Default) OR Partner Results Card (Active) */}
            <div className="text-left w-full">
              {!compatChecked ? (
                <div>
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
              ) : (
                <div className="flex flex-col gap-6">
                  <div className="compat-card bg-white border border-border rounded-[26px] p-7 shadow-sm text-left">
                    <div className="cc-eyebrow text-[10px] font-medium text-lavender tracking-[2px] uppercase mb-4">Vibe Match Result ✦</div>
                    
                    <div className="cc-persons-wrap flex gap-2.5 items-center mb-4">
                      <div className="cc-p flex-1 bg-cream rounded-xl p-2.5 text-center">
                        <div className="cc-p-name text-xs font-semibold text-ink">{cName1}</div>
                        <div className="cc-p-sign text-[10px] text-ink-faint mt-0.5">{compatDetails.p1Sign}</div>
                      </div>
                      <div className="cc-arr text-ink-faint text-lg font-light shrink-0">⟷</div>
                      <div className="cc-p flex-1 bg-cream rounded-xl p-2.5 text-center">
                        <div className="cc-p-name text-xs font-semibold text-ink">{cName2}</div>
                        <div className="cc-p-sign text-[10px] text-ink-faint mt-0.5">{compatDetails.p2Sign}</div>
                      </div>
                    </div>
                    
                    <div className="cc-pct text-center my-4">
                      <div className="cc-pct-val font-display text-[56px] font-bold text-ink tracking-tight leading-none">
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

                    <div className="cc-insight text-[11px] text-ink-mid leading-relaxed italic my-4 min-h-[40px] bg-cream/50 p-3.5 rounded-xl border-l-[2px] border-lavender">
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
                  </div>

                  {/* Copyright free couple picture */}
                  <div className="rounded-[22px] overflow-hidden border border-border shadow-sm bg-white p-2">
                    <img 
                      src="/happy_couple.png" 
                      alt="Happy Couple Cosmic Alignment" 
                      className="w-full h-64 object-cover rounded-xl"
                    />
                  </div>
                </div>
              )}
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
            Ancient wisdom, built for<br /><em className="not-italic text-gold font-light">the next generation.</em>
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
