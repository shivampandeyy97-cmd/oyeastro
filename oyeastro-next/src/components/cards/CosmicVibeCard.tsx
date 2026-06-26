'use client'

import { useState, useEffect } from 'react'
import type { ChartResult, CosmicVibeResult } from '@/lib/astro/types'
import { VEDIC_RASHI_NAMES } from '@/lib/astro/constants'

interface Props {
  chart: ChartResult
  onShare: () => void
}

function getMetricColors(color: string) {
  switch (color) {
    case 'green':
      return {
        text: 'text-emerald-400',
        bg: 'bg-emerald-950/40',
        border: 'border-emerald-500/20',
      }
    case 'red':
      return {
        text: 'text-rose-400',
        bg: 'bg-rose-950/40',
        border: 'border-rose-500/20',
      }
    case 'amber':
      return {
        text: 'text-amber-400',
        bg: 'bg-amber-950/40',
        border: 'border-amber-500/20',
      }
    case 'purple':
      return {
        text: 'text-purple-400',
        bg: 'bg-purple-950/40',
        border: 'border-purple-500/20',
      }
    case 'cyan':
    default:
      return {
        text: 'text-cyan-400',
        bg: 'bg-cyan-950/40',
        border: 'border-cyan-500/20',
      }
  }
}

export default function CosmicVibeCard({ chart, onShare }: Props) {
  const [data, setData] = useState<CosmicVibeResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'month'>('today')

  const name = chart.meta.name || 'Bestie'
  const vedicLagna = VEDIC_RASHI_NAMES[chart.bigThree.rising.index] ?? chart.bigThree.rising.sign
  const nakshatra = chart.dasha.nakshatra.name

  useEffect(() => {
    let active = true
    async function fetchVibeData() {
      try {
        setLoading(true)
        const res = await fetch('/api/cosmic-vibe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(chart),
        })
        if (res.ok) {
          const parsed = await res.json() as CosmicVibeResult
          if (active) setData(parsed)
        } else {
          throw new Error('API failed')
        }
      } catch (e) {
        console.error('[CosmicVibeCard] fetch failed, using fallback:', e)
        // Fallback to static generation if API fails
        if (active) {
          setData({
            today: {
              money: { status: 'Flowing', emoji: '🟢', colorClass: 'green' },
              love: { status: 'Complicated', emoji: '💔', colorClass: 'red' },
              energy: { status: 'Chaotic', emoji: '⚡', colorClass: 'amber' },
              score: 8,
              interpretation: 'Jupiter is side-eying your comfort zone right now. Your next big glow-up starts with one uncomfortable conversation you\'ve been avoiding.'
            },
            week: {
              money: { status: 'Secured', emoji: '💵', colorClass: 'green' },
              love: { status: 'Ghost Mode', emoji: '👻', colorClass: 'purple' },
              energy: { status: 'Recharging', emoji: '🔋', colorClass: 'cyan' },
              score: 6,
              interpretation: 'This week calls for a major emotional battery recharge. Protect your peace and don\'t overthink.'
            },
            month: {
              money: { status: 'Hustling', emoji: '🔥', colorClass: 'amber' },
              love: { status: 'Deep Connection', emoji: '💖', colorClass: 'red' },
              energy: { status: 'High Focus', emoji: '🎯', colorClass: 'cyan' },
              score: 9,
              interpretation: 'Your current stellar alignment is hitting its peak. Time to make big moves and act like the main character.'
            }
          })
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchVibeData()
    return () => {
      active = false
    }
  }, [chart])

  const currentVibe = data ? data[activeTab] : null
  const score = currentVibe ? currentVibe.score : 8
  const activeDots = Math.round(score / 2)

  return (
    <div className="pin-card bg-[#0b0c20] text-white border-2 border-espresso rounded-neoLg p-6 shadow-neo break-inside-avoid mb-6 flex flex-col gap-6 relative overflow-hidden">
      {/* Background stars / ambient glow */}
      <div className="absolute inset-0 bg-radial-gradient from-purple-900/10 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 z-10">
        <div>
          <h3 className="font-display font-extrabold text-xl flex items-center gap-1.5 text-white">
            {name}'s Cosmic Vibe +
          </h3>
          <p className="text-xs font-semibold text-purple-300/70 mt-1">
            {vedicLagna} Lagna • {nakshatra} Nakshatra
          </p>
        </div>

        {/* Tabs switcher */}
        <div className="flex bg-[#131438] border border-purple-500/10 rounded-full p-1 self-start md:self-auto">
          {(['today', 'week', 'month'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all duration-200 capitalize ${
                activeTab === tab
                  ? 'bg-brightPurple text-white shadow-lg'
                  : 'text-purple-300/60 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        /* Skeleton Loader */
        <div className="flex flex-col gap-6 animate-pulse z-10">
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-white/5 border border-white/10 rounded-neoSm" />
            ))}
          </div>
          <div className="h-6 bg-white/5 rounded-full w-2/3" />
          <div className="h-16 bg-white/5 rounded-neoSm w-full" />
          <div className="h-10 bg-white/5 rounded-neoSm w-full mt-2" />
        </div>
      ) : currentVibe ? (
        <div className="flex flex-col gap-6 z-10">
          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
            {/* Money */}
            <div className="flex flex-col items-center justify-center p-3 bg-[#131438] border border-purple-500/10 rounded-neoSm text-center shadow-inner hover:scale-[1.02] transition-transform duration-200">
              <span className="text-xs font-bold text-purple-300/50 mb-1.5 flex items-center gap-1">
                💸 Money
              </span>
              <span className={`text-sm font-black flex items-center gap-1 ${getMetricColors(currentVibe.money.colorClass).text}`}>
                {currentVibe.money.status} {currentVibe.money.emoji}
              </span>
            </div>

            {/* Love */}
            <div className="flex flex-col items-center justify-center p-3 bg-[#131438] border border-purple-500/10 rounded-neoSm text-center shadow-inner hover:scale-[1.02] transition-transform duration-200">
              <span className="text-xs font-bold text-purple-300/50 mb-1.5 flex items-center gap-1">
                ❤️ Love
              </span>
              <span className={`text-sm font-black flex items-center gap-1 ${getMetricColors(currentVibe.love.colorClass).text}`}>
                {currentVibe.love.status} {currentVibe.love.emoji}
              </span>
            </div>

            {/* Energy */}
            <div className="flex flex-col items-center justify-center p-3 bg-[#131438] border border-purple-500/10 rounded-neoSm text-center shadow-inner hover:scale-[1.02] transition-transform duration-200">
              <span className="text-xs font-bold text-purple-300/50 mb-1.5 flex items-center gap-1">
                ⚡ Energy
              </span>
              <span className={`text-sm font-black flex items-center gap-1 ${getMetricColors(currentVibe.energy.colorClass).text}`}>
                {currentVibe.energy.status} {currentVibe.energy.emoji}
              </span>
            </div>
          </div>

          {/* Vibe Score Slider Info */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#131438] border border-purple-500/10 rounded-neoSm px-4 py-3 shadow-inner">
            <span className="text-xs font-bold text-purple-300/80">Overall vibe score</span>
            <div className="flex items-center gap-3">
              {/* Dot scores */}
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={`text-base transition-colors duration-300 ${
                      i < activeDots ? 'text-brightPurple' : 'text-purple-900'
                    }`}
                  >
                    ●
                  </span>
                ))}
              </div>
              <span className="text-sm font-black text-white">{score}/10</span>
            </div>
          </div>

          {/* Interpretation Copy */}
          <p className="font-body text-sm font-semibold text-purple-200 leading-relaxed italic bg-purple-950/20 border border-purple-500/5 rounded-neoSm p-4 shadow-inner text-center">
            "{currentVibe.interpretation}"
          </p>

          {/* CTA Footer Bar */}
          <div className="flex items-center justify-between gap-4 border-t border-purple-500/10 pt-4 mt-1">
            <span className="text-xs font-bold text-purple-300/60">Share your vibe with the world</span>
            <button
              onClick={onShare}
              className="px-4 py-2 text-xs font-bold bg-[#1453b0] hover:bg-brightCyan text-white border border-[#2b7fff]/30 rounded-neoSm shadow-[0_0_15px_rgba(20,83,176,0.3)] transition-all duration-200 flex items-center gap-1 active:scale-95"
            >
              Share Card <span className="text-[10px]">↗</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
