'use client'

import { useState, useEffect } from 'react'
import type { ChartResult, AICopyResult } from '@/lib/astro/types'

interface Props {
  chart: ChartResult
}

export default function HoroscopeCard({ chart }: Props) {
  const [data, setData] = useState<AICopyResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'love' | 'money' | 'career' | 'energy'>('love')

  useEffect(() => {
    let active = true
    async function fetchAICopy() {
      try {
        setLoading(true)
        const res = await fetch('/api/ai-copy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(chart),
        })
        if (res.ok) {
          const parsed = await res.json() as AICopyResult
          if (active) setData(parsed)
        } else {
          throw new Error('API failed')
        }
      } catch {
        // Fallback to static copy
        if (active) {
          setData({
            love: `Your ${chart.bigThree.moon.sign} Moon craves deep, authentic connection but ${chart.bigThree.rising.sign} Rising keeps a mystery wall. The right person will vibe with both.`,
            money: `${chart.bigThree.sun.sign} Sun drives your hustle. Your current ${chart.dasha.activeDasha.rulerName} era demands structured saving—ride the wave strategically.`,
            career: `${chart.bigThree.rising.sign} Rising is your first impression in any room. Use that ${chart.bigThree.sun.sign} discipline to back it up with actual results.`,
            energy: `Moon in ${chart.bigThree.moon.sign} means your emotional battery recharges differently from most. Honor your unique rhythm, bestie.`,
            quote: `You're a ${chart.bigThree.rising.sign} rising with ${chart.bigThree.sun.sign} Sun energy — built to stand out. ✨`,
          })
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchAICopy()
    return () => {
      active = false
    }
  }, [chart])

  return (
    <div className="pin-card bg-pastelYellow border-2 border-espresso rounded-neoLg p-6 shadow-neo break-inside-avoid mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-display font-extrabold text-espresso text-base">Daily Horror-scope 😈</h3>
        <span className="px-2.5 py-1 text-xs font-bold border-2 border-espresso bg-brightGold text-espresso rounded-neoSm shadow-neoSm">
          Watch out!
        </span>
      </div>

      {loading ? (
        // Skeleton loader
        <div className="flex flex-col gap-4 animate-pulse">
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-8 bg-espresso/10 rounded-neoSm flex-1" />
            ))}
          </div>
          <div className="h-20 bg-espresso/5 rounded-neoSm w-full" />
          <div className="h-10 bg-espresso/5 rounded-neoSm w-3/4 self-center mt-2" />
        </div>
      ) : data ? (
        <div className="flex flex-col gap-4">
          {/* Tabs */}
          <div className="flex border-2 border-espresso rounded-neoSm bg-white overflow-hidden shadow-neoSm">
            {(['love', 'money', 'career', 'energy'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-1.5 text-xs font-bold capitalize border-r last:border-0 border-espresso transition-colors ${
                  activeTab === tab
                    ? 'bg-brightGold text-espresso'
                    : 'bg-white text-textSecondary hover:bg-pastelOrange/30'
                }`}
              >
                {tab === 'love' ? '💖' : tab === 'money' ? '💵' : tab === 'career' ? '💼' : '⚡'}
              </button>
            ))}
          </div>

          {/* Active interpretation content */}
          <p className="font-body text-sm font-semibold text-espresso leading-relaxed min-h-[80px]">
            {data[activeTab]}
          </p>

          {/* Tagline Quote */}
          <div className="bg-white border-2 border-espresso rounded-neoSm p-3 text-center shadow-neoSm mt-2 font-display text-xs font-black text-brightOrange italic">
            "{data.quote}"
          </div>
        </div>
      ) : null}

      <div className="flex gap-4 mt-4 border-t border-espresso/10 pt-4 text-xs font-bold text-textMuted justify-between">
        <span>📌 4.2k saves</span>
        <span>❤️ 2.1k likes</span>
      </div>
    </div>
  )
}
