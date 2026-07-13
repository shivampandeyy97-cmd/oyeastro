'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import type { ChartResult, BirthData, CosmicVibeResult, HorizonVibeData } from '@/lib/astro/types'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PremiumReportCard from '@/components/PremiumReportCard'

const getArchetype = (signName: string) => {
  const map: Record<string, string> = {
    Aries: "The Trailblazer Vibe",
    Taurus: "The Grounded Anchor Vibe",
    Gemini: "The Spark Catalyst Vibe",
    Cancer: "The Intuitive Nurturer Vibe",
    Leo: "The Radiant Leader Vibe",
    Virgo: "The Detail Architect Vibe",
    Libra: "The Balanced Harmonizer Vibe",
    Scorpio: "The Powerful Mystic Vibe",
    Sagittarius: "The Visionary Explorer Vibe",
    Capricorn: "The Empire Builder Vibe",
    Aquarius: "The Maverick Innovator Vibe",
    Pisces: "The Creative Dreamweaver Vibe"
  }
  return map[signName] || "The Unique Vibe"
}

const getDashaChapter = (ruler: string) => {
  const map: Record<string, string> = {
    Sun: "Leadership & Purpose Era",
    Moon: "Intuitive Flow & Connection Era",
    Mars: "Hustle, Drive & Action Era",
    Rahu: "Ambition, Tech & Innovation Era",
    Jupiter: "Wisdom, Learning & Expansion Era",
    Saturn: "Structure, Discipline & Mastery Era",
    Mercury: "Communication, Wit & Strategy Era",
    Ketu: "Detachment, Insight & Freedom Era",
    Venus: "Creativity, Art, Love & Harmony Era"
  }
  return map[ruler] || "Growth & Alignment Era"
}

const getNakshatraVibe = (nakshatra: string) => {
  const map: Record<string, string> = {
    Ashwini: "Speed & Vitality",
    Bharani: "Creative Transformation",
    Krittika: "Focused Clarity",
    Rohini: "Abundant Attraction",
    Mrigashira: "Curious Exploration",
    Ardra: "Storm Clearance",
    Punarvasu: "Return of Renewal",
    Pushya: "Divine Nourishment",
    Ashlesha: "Intense Insight",
    Magha: "Noble Heritage",
    "Purva Phalguni": "Joy & Pleasure",
    "Uttara Phalguni": "Dedicated Alliance",
    Hasta: "Craftsmanship & Action",
    Chitra: "Brilliant Creation",
    Svati: "Adaptability & Independence",
    Vishakha: "Dual Focus",
    Anuradha: "Devoted Friendship",
    Jyeshtha: "Masterful Leadership",
    Mula: "Root Investigation",
    "Purva Ashadha": "Invincible Force",
    "Uttara Ashadha": "Enduring Victory",
    Shravana: "Deep Listening",
    Dhanishta: "Symphonic Abundance",
    Shatabhisha: "Infinite Healing",
    "Purva Bhadrapada": "Inspired Vision",
    "Uttara Bhadrapada": "Deep Stability",
    Revati: "Graceful Journey"
  }
  return map[nakshatra] || "Cosmic Alignment"
}

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

    // Deterministic metrics based on signs & tabs (always positive & encouraging)
    const metricsMap = {
      today: {
        love: { label: ["Radiant", "Magnetic", "Deepening", "Harmonious", "Sparking"][mIndex % 5], emoji: "💝" },
        money: { label: ["Attracting", "Growing", "Stabilizing", "Securing", "Abundant"][rIndex % 5], emoji: "💵" },
        energy: { label: ["Electric", "Charging", "Revitalized", "Balanced", "Inspired"][(mIndex + rIndex) % 5], emoji: "⚡" }
      },
      week: {
        love: { label: ["Magnetic", "Harmonious", "Sparking", "Radiant", "Deepening"][rIndex % 5], emoji: "💝" },
        money: { label: ["Abundant", "Attracting", "Securing", "Growing", "Stabilizing"][mIndex % 5], emoji: "💵" },
        energy: { label: ["Inspired", "Balanced", "Electric", "Revitalized", "Charging"][(rIndex + 2) % 5], emoji: "⚡" }
      },
      month: {
        love: { label: ["Deepening", "Radiant", "Magnetic", "Sparking", "Harmonious"][(mIndex + 1) % 5], emoji: "💝" },
        money: { label: ["Securing", "Growing", "Abundant", "Stabilizing", "Attracting"][(rIndex + 1) % 5], emoji: "💵" },
        energy: { label: ["Charging", "Revitalized", "Inspired", "Electric", "Balanced"][(mIndex + rIndex + 1) % 5], emoji: "⚡" }
      }
    }

    const todayProblem = [
      "You will feel a brief push to overextend your social battery today",
      "You might encounter minor communication friction in your morning interactions",
      "A sudden rush of pending small tasks will threaten to overwhelm your focus today",
      "You will feel a minor creative block or hesitation when starting your key task today",
      "A quick impulse to change your plans or route might create unnecessary hurry today"
    ][mIndex % 5]

    const todaySolution = [
      "Take a 15-minute breather to reset and say a polite 'no' to non-essentials",
      "Pause for a breath and listen fully before responding or asserting your view",
      "Write down the top three items and tackle them one by one with single-task focus",
      "Set a timer for 10 minutes and just begin without seeking immediate perfection",
      "Stick to your scheduled routine and allow an extra 5 minutes of quiet transition time"
    ][rIndex % 5]

    const todayImpact = [
      "This will lock in your mental clarity, bringing a major wave of focus by evening",
      "This will create instant alignment and double the trust in your primary circle",
      "This will clear your path, leaving you completely stress-free before sunset",
      "This will dissolve the hesitation, leading to a breakthrough output by late afternoon",
      "This will protect your stamina, keeping your motivation high and radiant all day"
    ][(mIndex + rIndex) % 5]

    const weekProblem = [
      "A temporary delay in receiving feedback might test your patience early this week",
      "You will face the temptation to take on other people's responsibilities this week",
      "An unexpected change in resource requirements might challenge your budget plan this week",
      "A slight drop in physical stamina could tempt you to skip your workout/rest routine this week",
      "A conflict of interest in a group project or family decision could create hesitation this week"
    ][rIndex % 5]

    const weekSolution = [
      "Use this gap to audit and optimize your own active project details",
      "Delegate tasks early and focus exclusively on your own core responsibilities",
      "Pause any non-essential checkouts and look for creative, low-cost alternatives",
      "Schedule a dedicated 8-hour sleep window and focus on basic physical hydration",
      "Propose a balanced compromise that respects everyone's individual priorities"
    ][mIndex % 5]

    const weekImpact = [
      "This will keep your progress ahead of schedule, setting you up for a major win by Friday",
      "This will empower your team/partner and free up 5 hours of your own time",
      "This will secure your financial reserves, opening up a highly profitable idea by next Monday",
      "This will double your energy reserves, allowing you to breeze through late-week goals",
      "This will establish you as a natural leader, resolving the tension smoothly and positively"
    ][(mIndex + rIndex + 1) % 5]

    const monthProblem = [
      "You are entering a phase where long-term career focus needs a strategic upgrade",
      "You will face choices that require balancing your personal ambitions with relationship needs",
      "A rise in lifestyle overheads or subscription creep could test your financial margins",
      "Your mental stamina will face competition from distracting short-term goals",
      "An urge to pivot your primary project or direction will create temporary self-doubt"
    ][(rIndex + 1) % 5]

    const monthSolution = [
      "Audit your daily habits and dedicate 30 minutes a day to learning a high-value skill",
      "Schedule a dedicated date night or open conversation to align your future visions",
      "Cut out redundant expenses and redirect the capital to index funds or skill-building",
      "Set strict limits on social media and focus on one major project milestone at a time",
      "Write down the core reasons why you started and stick to the foundation for 3 weeks"
    ][(mIndex + 1) % 5]

    const monthImpact = [
      "This will build massive momentum, paving the way for a highly positive promotion or opportunity",
      "This will strengthen your connection foundation, unlocking a happy shared success by month-end",
      "This will accelerate your savings rate, creating a powerful sense of financial freedom",
      "This will skyrocket your output, placing you in a highly motivated state for the next quarter",
      "This will build deep resilience, proving that your original vision is incredibly solid"
    ][(mIndex + rIndex + 2) % 5]

    const copyMap = {
      today: `${todayProblem} (Problem). ${todaySolution} (Solution) to ${todayImpact} (Impact).`,
      week: `${weekProblem} (Problem). ${weekSolution} (Solution) to ${weekImpact} (Impact).`,
      month: `${monthProblem} (Problem). ${monthSolution} (Solution) to ${monthImpact} (Impact).`
    }

    return {
      love: { status: metricsMap[tab].love.label, emoji: metricsMap[tab].love.emoji, colorClass: "text-[#FF7A45]" },
      money: { status: metricsMap[tab].money.label, emoji: metricsMap[tab].money.emoji, colorClass: "text-[#6DB88A]" },
      energy: { status: metricsMap[tab].energy.label, emoji: metricsMap[tab].energy.emoji, colorClass: "text-[#D4A800]" },
      interpretation: copyMap[tab]
    }
  }

  // Multi-tier clipboard copy and sharing helper
  const shareText = async (text: string, title: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: text,
        })
        return true
      } catch (err) {
        console.log('Web share canceled or failed:', err)
      }
    }
    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (err) {
      console.error('Clipboard API failed, using legacy fallback:', err)
      const textArea = document.createElement("textarea")
      textArea.value = text
      textArea.style.top = "0"
      textArea.style.left = "0"
      textArea.style.position = "fixed"
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand('copy')
      } catch (copyErr) {
        console.error('Legacy fallback copy failed:', copyErr)
      }
      document.body.removeChild(textArea)
      return true
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
      `Insight: "${vData.interpretation.replace(/\s*\(Problem\)|\s*\(Solution\)|\s*\(Impact\)/gi, '')}"\n` +
      `Check yours at: oyeastro.com`;

    shareText(text, 'OyeAstro Vibe Check').then(() => {
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

  // Compatibility States & Payment Triggers
  const [cEmail, setCEmail] = useState('shivampandeyy97@gmail.com')
  const [isCompatPaid, setIsCompatPaid] = useState(false)
  const [compatPaymentLoading, setCompatPaymentLoading] = useState(false)
  const [compatError, setCompatError] = useState('')

  // Check compatibility payment on name/checked change
  useEffect(() => {
    if (compatChecked && cName1 && cName2) {
      const key = `compat_paid_${cName1.toLowerCase().trim()}_${cName2.toLowerCase().trim()}`
      const isPaid = localStorage.getItem(key) === 'true'
      setIsCompatPaid(isPaid)
    }
  }, [compatChecked, cName1, cName2])

  // Copy compat using robust multi-tier shareText
  const handleCompatCopy = () => {
    const text = `✨ Cosmic Compatibility Vibe Match ✨\n` +
      `💖 ${cName1} ⟷ ${cName2}\n` +
      `📊 Match Score: ${compatScore}%\n` +
      `Insight: "${compatText}"\n` +
      `Check yours at: oyeastro.com`;
    
    shareText(text, 'OyeAstro Compatibility Match').then(() => {
      setCompatCopied(true)
      setTimeout(() => setCompatCopied(false), 2000)
    })
  }

  // Handle compatibility Razorpay checkout (₹101)
  const handleCompatRazorpayCheckout = async () => {
    setCompatPaymentLoading(true)
    setCompatError('')
    try {
      const res = await fetch('/api/payment/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 10100, receipt: `compat_${cName1}_${cName2}`.substring(0, 39) }),
      })
      if (!res.ok) throw new Error('Razorpay order creation failed')
      const order = await res.json()

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'OyeAstro',
        description: `Compatibility Report: ${cName1} & ${cName2}`,
        order_id: order.orderId,
        handler: async function (response: any) {
          setCompatPaymentLoading(true)
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                provider: 'razorpay',
                chartId: `compat_${cName1}_${cName2}`,
                isCompat: true,
                email: cEmail,
                cName1,
                cName2,
                score: compatScore,
                details: compatDetails,
                narrative: compatText,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })
            if (verifyRes.ok) {
              setIsCompatPaid(true)
              const key = `compat_paid_${cName1.toLowerCase().trim()}_${cName2.toLowerCase().trim()}`
              localStorage.setItem(key, 'true')
            } else {
              setCompatError('Payment verification failed.')
            }
          } catch {
            setCompatError('Payment verification error.')
          } finally {
            setCompatPaymentLoading(false)
          }
        },
        prefill: {
          name: cName1,
          email: cEmail,
        },
        theme: {
          color: '#8A5CF5',
        },
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.on('payment.failed', function (resp: any) {
        setCompatError(`Payment failed: ${resp.error.description}`)
      })
      rzp.open()
    } catch (err) {
      console.error(err)
      setCompatError('Could not initialize Razorpay checkout.')
    } finally {
      setCompatPaymentLoading(false)
    }
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

        <div className={`hero-content relative z-10 w-full transition-all duration-500 ${chart ? 'max-w-[1240px]' : 'max-w-[780px]'}`}>
          {!chart ? (
            <>
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
            </>
          ) : (
            <div className="w-full text-left max-w-[1240px] mx-auto">
              <div className="mb-8 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center border-b border-black/5 pb-4">
                <div>
                  <h2 className="font-display text-[28px] md:text-[38px] font-normal leading-tight tracking-tight text-ink">
                    Your Cosmos is <em className="not-italic text-coral font-semibold">aligned.</em>
                  </h2>
                  <p className="text-xs text-ink-mid mt-1 font-light">Calculated from your exact birth profile. Here is your daily, weekly, and monthly vibe check.</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setChart(null)}
                  className="bg-black/5 hover:bg-black/10 transition-colors text-ink text-xs font-semibold px-4.5 py-2 rounded-full border-none cursor-pointer font-body shrink-0"
                >
                  ← Edit details
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* Column 1: Intake Form (compact editor) */}
                <div className="w-full bg-white border border-black/5 rounded-[28px] p-6 shadow-[0_10px_40px_rgba(26,18,8,0.02)] text-left">
                  <div className="text-[10px] font-bold text-ink-faint tracking-wider uppercase mb-5">Edit birth details</div>
                  
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="field flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-ink-faint tracking-wider uppercase">Your name</label>
                      <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        required 
                        placeholder="Riya, Arjun, Priya…" 
                        className="bg-cream border-[1.5px] border-transparent outline-[1px] outline-border rounded-xl p-2.5 text-xs font-body text-ink focus:outline-none focus:border-coral focus:bg-white focus:ring-4 focus:ring-coral/10 transition-all duration-200"
                      />
                    </div>

                    <div className="field flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-ink-faint tracking-wider uppercase">Gender</label>
                      <select 
                        value={gender} 
                        onChange={(e) => setGender(e.target.value)}
                        className="bg-cream border-[1.5px] border-transparent outline-[1px] outline-border rounded-xl p-2.5 text-xs font-body text-ink cursor-pointer focus:outline-none focus:border-coral focus:bg-white focus:ring-4 focus:ring-coral/10 transition-all duration-200"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="non-binary">Non-Binary</option>
                      </select>
                    </div>

                    <div className="field flex flex-col gap-1.5 relative">
                      <label className="text-[10px] font-bold text-ink-faint tracking-wider uppercase">Birth city</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={city} 
                          onChange={(e) => { setCity(e.target.value); setShowSuggestions(true) }} 
                          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                          required 
                          placeholder="Mumbai, Delhi, London…" 
                          className="w-full bg-cream border-[1.5px] border-transparent outline-[1px] outline-border rounded-xl p-2.5 text-xs font-body text-ink focus:outline-none focus:border-coral focus:bg-white focus:ring-4 focus:ring-coral/10 transition-all duration-200"
                          autoComplete="off"
                        />
                        {showSuggestions && suggestions.length > 0 && (
                          <ul className="absolute left-0 right-0 top-full mt-1 bg-white border border-border rounded-xl shadow-lg z-50 max-h-40 overflow-y-auto pl-0 list-none m-0 p-0">
                            {suggestions.map((s: any, i: number) => (
                              <li 
                                key={i}
                                className="px-3 py-2 text-[10px] text-ink hover:bg-coral/10 cursor-pointer truncate border-b border-border/40 last:border-0"
                                onMouseDown={() => { setCity(s.display_name.split(',').slice(0, 3).join(',')); setSuggestions([]) }}
                              >
                                📍 {s.display_name.split(',').slice(0, 3).join(', ')}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="field flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-ink-faint tracking-wider uppercase">Date of birth</label>
                        <input 
                          type="date" 
                          value={date} 
                          onChange={(e) => setDate(e.target.value)} 
                          required 
                          className="bg-cream border-[1.5px] border-transparent outline-[1px] outline-border rounded-xl p-2.5 text-xs font-body text-ink focus:outline-none focus:border-coral focus:bg-white focus:ring-4 focus:ring-coral/10 transition-all duration-200"
                        />
                      </div>
                      <div className="field flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-ink-faint tracking-wider uppercase">Time of birth</label>
                        <input 
                          type="time" 
                          value={time} 
                          onChange={(e) => setTime(e.target.value)} 
                          required 
                          className="bg-cream border-[1.5px] border-transparent outline-[1px] outline-border rounded-xl p-2.5 text-xs font-body text-ink focus:outline-none focus:border-coral focus:bg-white focus:ring-4 focus:ring-coral/10 transition-all duration-200"
                        />
                      </div>
                    </div>

                    <div className="field flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-ink-faint tracking-wider uppercase">What do you want clarity on?</label>
                      <select 
                        value={clarity} 
                        onChange={(e) => setClarity(e.target.value)}
                        className="bg-cream border-[1.5px] border-transparent outline-[1px] outline-border rounded-xl p-2.5 text-xs font-body text-ink cursor-pointer focus:outline-none focus:border-coral focus:bg-white focus:ring-4 focus:ring-coral/10 transition-all duration-200"
                      >
                        <option value="everything">Everything — just hit me ✦</option>
                        <option value="love">Love &amp; relationships</option>
                        <option value="career">Career &amp; money</option>
                        <option value="energy">My general energy today</option>
                        <option value="better">When does it get better?</option>
                      </select>
                    </div>

                    <button 
                      type="submit" 
                      disabled={isLoading}
                      className="submit-btn w-full bg-ink text-ivory rounded-xl p-3 mt-1 font-medium text-xs font-body cursor-pointer flex items-center justify-center gap-2 hover:bg-coral transition-all duration-200 disabled:opacity-50"
                    >
                      {isLoading ? 'Re-calculating...' : 'Update Vibe Check'}
                      <span className="inline-block">→</span>
                    </button>
                  </form>
                </div>

                {/* Column 2: Apple-style Vibe Card */}
                <div className="w-full bg-white/95 border border-black/5 rounded-[28px] p-6 shadow-[0_15px_45px_rgba(0,0,0,0.04)] backdrop-blur-xl flex flex-col justify-between text-left transition-all duration-300">
                  <div>
                    <div className="vc-head flex justify-between items-start mb-1">
                      <div className="vc-name text-[10px] font-bold text-ink-faint tracking-[2px] uppercase">
                        {chart.meta.name}'s Vibe Check ✦
                      </div>
                    </div>
                    <div className="vc-lagna font-display text-[26px] font-medium text-ink tracking-tight mb-0.5 leading-tight">
                      {getArchetype(chart.bigThree.rising.sign)}
                    </div>
                    <div className="vc-naksh text-[11px] text-ink-mid font-medium">
                      {getNakshatraVibe(chart.dasha.nakshatra.name)} · {getDashaChapter(chart.dasha.activeDasha.rulerName)}
                    </div>
                    
                    <div className="vc-line h-[0.5px] bg-ink/10 my-3" />
                    
                    {/* iOS style segmented control tabs */}
                    <div className="bg-black/[0.04] p-0.5 rounded-full flex gap-0.5 mb-4">
                      {[
                        { id: 'today', label: 'Today' },
                        { id: 'week', label: 'Week' },
                        { id: 'month', label: 'Month' }
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setActiveTab(t.id as any)}
                          className={`flex-1 text-[11px] py-1.5 rounded-full text-center font-medium transition-all border-none cursor-pointer ${
                            activeTab === t.id
                              ? 'bg-white text-ink shadow-[0_2px_4px_rgba(0,0,0,0.04)] font-semibold'
                              : 'text-ink-mid hover:text-ink bg-transparent'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
    
                    {/* Interactive Metrics Grid */}
                    <div className="vc-metrics grid grid-cols-3 gap-2 mb-4">
                      <button 
                        type="button"
                        onClick={() => setSelectedVibeMetric('love')}
                        className={`vc-m rounded-xl p-2 text-center border transition-all cursor-pointer ${selectedVibeMetric === 'love' ? 'bg-[#FFF2EC]/60 border-[#FF7A45]/30 ring-2 ring-[#FF7A45]/10' : 'bg-black/[0.02] border-transparent hover:bg-black/[0.04]'}`}
                      >
                        <div className="vc-m-emoji text-lg">{vibeData ? vibeData.love.emoji : '💝'}</div>
                        <div className="vc-m-lbl text-[9px] text-ink-faint tracking-wider uppercase mt-0.5 font-medium">Love</div>
                        <div className="vc-m-val text-[11px] font-semibold mt-0.5 text-[#FF7A45]">
                          {vibeData ? vibeData.love.status : 'Tender'}
                        </div>
                      </button>
                      
                      <button 
                        type="button"
                        onClick={() => setSelectedVibeMetric('money')}
                        className={`vc-m rounded-xl p-2 text-center border transition-all cursor-pointer ${selectedVibeMetric === 'money' ? 'bg-[#EEF7F2]/60 border-[#6DB88A]/30 ring-2 ring-[#6DB88A]/10' : 'bg-black/[0.02] border-transparent hover:bg-black/[0.04]'}`}
                      >
                        <div className="vc-m-emoji text-lg">{vibeData ? vibeData.money.emoji : '💵'}</div>
                        <div className="vc-m-lbl text-[9px] text-ink-faint tracking-wider uppercase mt-0.5 font-medium">Money</div>
                        <div className="vc-m-val text-[11px] font-semibold mt-0.5 text-[#6DB88A]">
                          {vibeData ? vibeData.money.status : 'Flowing'}
                        </div>
                      </button>

                      <button 
                        type="button"
                        onClick={() => setSelectedVibeMetric('energy')}
                        className={`vc-m rounded-xl p-2 text-center border transition-all cursor-pointer ${selectedVibeMetric === 'energy' ? 'bg-[#FFFBEB]/60 border-[#D4A800]/30 ring-2 ring-[#D4A800]/10' : 'bg-black/[0.02] border-transparent hover:bg-black/[0.04]'}`}
                      >
                        <div className="vc-m-emoji text-lg">{vibeData ? vibeData.energy.emoji : '⚡'}</div>
                        <div className="vc-m-lbl text-[9px] text-ink-faint tracking-wider uppercase mt-0.5 font-medium">Energy</div>
                        <div className="vc-m-val text-[11px] font-semibold mt-0.5 text-[#D4A800]">
                          {vibeData ? vibeData.energy.status : 'Chaotic'}
                        </div>
                      </button>
                    </div>

                    {/* Detailed Metric Breakdown */}
                    <div className="vc-breakdown bg-black/[0.02] border border-black/5 rounded-2xl p-3.5 text-[10px] mb-4 flex flex-col gap-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]">
                      {selectedVibeMetric === 'love' && (
                        <>
                          <div className="flex flex-col gap-1 px-1">
                            <div className="flex justify-between items-center text-[9px] font-semibold text-ink-mid">
                              <span>💬 Communication Harmony</span>
                              <span className="font-bold text-[#FF7A45]">{Math.abs((chart.houseData.lagnaSignIndex * 7) % 25) + 75}%</span>
                            </div>
                            <div className="w-full h-1 bg-ink/5 rounded-full overflow-hidden">
                              <div className="h-full bg-[#FF7A45] rounded-full" style={{ width: `${Math.abs((chart.houseData.lagnaSignIndex * 7) % 25) + 75}%` }} />
                            </div>
                          </div>
                          <div className="flex flex-col gap-1 px-1">
                            <div className="flex justify-between items-center text-[9px] font-semibold text-ink-mid">
                              <span>⚡ Mutual Spark Status</span>
                              <span className="font-bold text-[#FF7A45]">{Math.abs((chart.houseData.lagnaSignIndex * 9) % 30) + 65}%</span>
                            </div>
                            <div className="w-full h-1 bg-ink/5 rounded-full overflow-hidden">
                              <div className="h-full bg-[#FF7A45]/80 rounded-full" style={{ width: `${Math.abs((chart.houseData.lagnaSignIndex * 9) % 30) + 65}%` }} />
                            </div>
                          </div>
                          <div className="flex flex-col gap-1 px-1">
                            <div className="flex justify-between items-center text-[9px] font-semibold text-ink-mid">
                              <span>🛡️ Relationship Strength</span>
                              <span className="font-bold text-[#FF7A45]">{Math.abs((chart.houseData.lagnaSignIndex * 11) % 20) + 80}%</span>
                            </div>
                            <div className="w-full h-1 bg-ink/5 rounded-full overflow-hidden">
                              <div className="h-full bg-[#FF7A45]/60 rounded-full" style={{ width: `${Math.abs((chart.houseData.lagnaSignIndex * 11) % 20) + 80}%` }} />
                            </div>
                          </div>
                        </>
                      )}
                      {selectedVibeMetric === 'money' && (
                        <>
                          <div className="flex flex-col gap-1 px-1">
                            <div className="flex justify-between items-center text-[9px] font-semibold text-ink-mid">
                              <span>📈 Wealth Attraction Flow</span>
                              <span className="font-bold text-[#6DB88A]">{Math.abs((chart.houseData.lagnaSignIndex * 13) % 25) + 75}%</span>
                            </div>
                            <div className="w-full h-1 bg-ink/5 rounded-full overflow-hidden">
                              <div className="h-full bg-[#6DB88A] rounded-full" style={{ width: `${Math.abs((chart.houseData.lagnaSignIndex * 13) % 25) + 75}%` }} />
                            </div>
                          </div>
                          <div className="flex flex-col gap-1 px-1">
                            <div className="flex justify-between items-center text-[9px] font-semibold text-ink-mid">
                              <span>💸 Spend Control Strength</span>
                              <span className="font-bold text-[#6DB88A]">{Math.abs((chart.houseData.lagnaSignIndex * 5) % 30) + 60}%</span>
                            </div>
                            <div className="w-full h-1 bg-ink/5 rounded-full overflow-hidden">
                              <div className="h-full bg-[#6DB88A]/80 rounded-full" style={{ width: `${Math.abs((chart.houseData.lagnaSignIndex * 5) % 30) + 60}%` }} />
                            </div>
                          </div>
                          <div className="flex flex-col gap-1 px-1">
                            <div className="flex justify-between items-center text-[9px] font-semibold text-ink-mid">
                              <span>💼 Career Alignment Focus</span>
                              <span className="font-bold text-[#6DB88A]">{Math.abs((chart.houseData.lagnaSignIndex * 8) % 20) + 80}%</span>
                            </div>
                            <div className="w-full h-1 bg-ink/5 rounded-full overflow-hidden">
                              <div className="h-full bg-[#6DB88A]/60 rounded-full" style={{ width: `${Math.abs((chart.houseData.lagnaSignIndex * 8) % 20) + 80}%` }} />
                            </div>
                          </div>
                        </>
                      )}
                      {selectedVibeMetric === 'energy' && (
                        <>
                          <div className="flex flex-col gap-1 px-1">
                            <div className="flex justify-between items-center text-[9px] font-semibold text-ink-mid">
                              <span>🔋 Physical Battery Stamina</span>
                              <span className="font-bold text-[#D4A800]">{Math.abs((chart.houseData.lagnaSignIndex * 6) % 35) + 60}%</span>
                            </div>
                            <div className="w-full h-1 bg-ink/5 rounded-full overflow-hidden">
                              <div className="h-full bg-[#D4A800] rounded-full" style={{ width: `${Math.abs((chart.houseData.lagnaSignIndex * 6) % 35) + 60}%` }} />
                            </div>
                          </div>
                          <div className="flex flex-col gap-1 px-1">
                            <div className="flex justify-between items-center text-[9px] font-semibold text-ink-mid">
                              <span>🧠 Focus &amp; Mental Clarity</span>
                              <span className="font-bold text-[#D4A800]">{Math.abs((chart.houseData.lagnaSignIndex * 14) % 20) + 75}%</span>
                            </div>
                            <div className="w-full h-1 bg-ink/5 rounded-full overflow-hidden">
                              <div className="h-full bg-[#D4A800]/80 rounded-full" style={{ width: `${Math.abs((chart.houseData.lagnaSignIndex * 14) % 20) + 75}%` }} />
                            </div>
                          </div>
                          <div className="flex flex-col gap-1 px-1">
                            <div className="flex justify-between items-center text-[9px] font-semibold text-ink-mid">
                              <span>😴 Recharge &amp; Sleep Quality</span>
                              <span className="font-bold text-[#D4A800]">{Math.abs((chart.houseData.lagnaSignIndex * 10) % 30) + 65}%</span>
                            </div>
                            <div className="w-full h-1 bg-ink/5 rounded-full overflow-hidden">
                              <div className="h-full bg-[#D4A800]/60 rounded-full" style={{ width: `${Math.abs((chart.houseData.lagnaSignIndex * 10) % 30) + 65}%` }} />
                            </div>
                          </div>
                        </>
                      )}

                      {/* Clean Problem / Solution / Impact Horizontal Items */}
                      <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-black/5 text-[9.5px] leading-relaxed">
                        {(() => {
                          const text = vibeData?.interpretation || ""
                          const pIndex = text.indexOf("(Problem)")
                          const sIndex = text.indexOf("(Solution)")
                          const iIndex = text.indexOf("(Impact)")
                          
                          let parsedObj = {
                            problem: text,
                            solution: "Focus on your daily alignment and direct your actions intentionally.",
                            impact: "This will create a natural balance, raising your connection alignment to peak levels."
                          }

                          if (pIndex !== -1 && sIndex !== -1 && iIndex !== -1) {
                            parsedObj = {
                              problem: text.substring(0, pIndex).trim(),
                              solution: text.substring(pIndex + 9, sIndex).trim(),
                              impact: text.substring(sIndex + 10, iIndex).trim()
                            }
                          }

                          return (
                            <>
                              <div className="flex gap-2 items-start p-2 bg-[#FFF2EC]/45 border border-[#FF7A45]/10 rounded-xl">
                                <span className="text-xs shrink-0 select-none">⚠️</span>
                                <div>
                                  <span className="text-[8.5px] font-bold text-[#FF7A45] uppercase tracking-wider block mb-0.5">The Challenge</span>
                                  <p className="text-ink-mid font-light leading-normal">{parsedObj.problem}</p>
                                </div>
                              </div>
                              <div className="flex gap-2 items-start p-2 bg-[#EEF7F2]/45 border border-[#6DB88A]/10 rounded-xl">
                                <span className="text-xs shrink-0 select-none">💡</span>
                                <div>
                                  <span className="text-[8.5px] font-bold text-[#6DB88A] uppercase tracking-wider block mb-0.5">The Action</span>
                                  <p className="text-ink-mid font-light leading-normal">{parsedObj.solution}</p>
                                </div>
                              </div>
                              <div className="flex gap-2 items-start p-2 bg-[#EEF7FF]/55 border border-[#7BA7E0]/15 rounded-xl">
                                <span className="text-xs shrink-0 select-none">🎯</span>
                                <div>
                                  <span className="text-[8.5px] font-bold text-[#7BA7E0] uppercase tracking-wider block mb-0.5">The Outlook</span>
                                  <p className="text-ink-mid font-light leading-normal">{parsedObj.impact}</p>
                                </div>
                              </div>
                            </>
                          )
                        })()}
                      </div>
                    </div>

                  </div>
  
                  <div className="vc-share-bar flex items-center justify-between bg-ink rounded-xl p-3 text-xs">
                    <div className="vc-share-txt text-white/60 font-body">Share your vibe</div>
                    <button 
                      onClick={handleVibeCopy}
                      className="vc-share-btn-txt text-[#FDE97B] font-medium bg-transparent border-none cursor-pointer p-0 font-body hover:opacity-90"
                    >
                      {vibeCopied ? 'Copied! 💅' : 'Copy card ↗'}
                    </button>
                  </div>
                </div>

                {/* Column 3: Premium Report Card */}
                <div className="w-full">
                  <PremiumReportCard chart={chart} />
                </div>

              </div>
            </div>
          )}
        </div>

        {!chart && (
          <div className="scroll-hint absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5">
            <div className="scroll-hint-text text-[10px] text-ink-faint tracking-[2px] uppercase">Scroll</div>
            <div className="scroll-line w-[1px] h-9 bg-border overflow-hidden relative after:content-[''] after:absolute after:top-[-100%] after:left-0 after:w-full after:h-full after:bg-coral animate-scroll-line" />
          </div>
        )}
      </section>

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

                {/* Email address for detailed report */}
                  <div className="flex flex-col gap-1.5 pt-2 border-t border-lavender/25 mb-2">
                    <span className="text-[10px] font-semibold text-lavender uppercase tracking-wider">Email for detailed report</span>
                    <input 
                      type="email" 
                      value={cEmail} 
                      onChange={(e) => setCEmail(e.target.value)} 
                      required 
                      placeholder="email@example.com" 
                      className="w-full bg-white/70 border border-border rounded-xl p-2.5 text-xs font-body text-ink outline-none focus:bg-white focus:border-lavender transition-all duration-200"
                    />
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

                    {!isCompatPaid ? (
                      <div className="bg-gradient-to-tr from-[#FAF6FF] to-[#ECE0FF] border border-[#D5C2F5] rounded-2xl p-5 text-left mt-4">
                        <div className="flex gap-3 items-start mb-3">
                          <span className="text-xl">🔒</span>
                          <div>
                            <h4 className="font-display font-medium text-sm text-ink">Unlock Detailed Compatibility Breakdown</h4>
                            <p className="text-[10px] text-ink-mid mt-0.5 leading-relaxed">
                              Get the 8-dimensional Ashtakoot Guna points, Mangal Dosha checks, and full text analysis sent instantly to your email: <strong>{cEmail}</strong>.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-ink/5">
                          <div>
                            <span className="text-[9px] text-ink-faint uppercase block">Detailed Report Fee</span>
                            <span className="text-xl font-display font-bold text-coral">₹101</span>
                          </div>
                          <button
                            type="button"
                            onClick={handleCompatRazorpayCheckout}
                            disabled={compatPaymentLoading}
                            className="bg-ink hover:bg-coral text-ivory px-4 py-2.5 rounded-full text-xs font-semibold border-none cursor-pointer active:scale-95 disabled:opacity-50 transition-all font-body"
                          >
                            {compatPaymentLoading ? 'Processing...' : '💳 Unlock Report (₹101)'}
                          </button>
                        </div>
                        {compatError && (
                          <div className="text-coral text-[10px] font-semibold mt-2 text-center">
                            ⚠️ {compatError}
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
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
                      </>
                    )}
                  </div>

                </div>
              )}
            </div>

          </div>

          {/* Dynamic compatibility couple image based on score */}
          {compatChecked && (
            <div className="mt-12 w-full max-w-[840px] mx-auto rounded-[24px] overflow-hidden border border-border shadow-md bg-white p-2.5">
              <img 
                src={compatScore < 30 ? '/unhappy_couple.png' : compatScore <= 60 ? '/neutral_couple.png' : '/happy_couple.png'} 
                alt="Couple Alignment State" 
                className="w-full h-80 object-cover rounded-2xl transition-all duration-300"
              />
            </div>
          )}
        </div>
      </section>



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
