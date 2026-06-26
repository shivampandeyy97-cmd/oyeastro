'use client'

import { useState } from 'react'
import type { ChartResult } from '@/lib/astro/types'

interface Props {
  chart: ChartResult
}

export default function VibeScoreCard({ chart }: Props) {
  const { vibeScore } = chart
  const [showBreakdown, setShowBreakdown] = useState(false)

  const radius = 45
  const circumference = 2 * Math.PI * radius // 282.74
  const strokeDashoffset = circumference - (circumference * vibeScore.score) / 10

  return (
    <div
      className="pin-card bg-pastelBlue border-2 border-espresso rounded-neoLg p-6 shadow-neo break-inside-avoid mb-6 cursor-pointer relative"
      onClick={() => setShowBreakdown(!showBreakdown)}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-display font-extrabold text-espresso text-base">Aura Energy</h3>
        <span className="px-2.5 py-1 text-xs font-bold border-2 border-espresso bg-white text-espresso rounded-neoSm shadow-neoSm">
          Vibe Check
        </span>
      </div>

      <div className="flex flex-col items-center gap-4 my-2">
        {/* Animated Circular Gauge */}
        <div className="relative w-32 h-32 flex items-center justify-center bg-white border-2 border-espresso rounded-full shadow-neoSm">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background Track Circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="stroke-pastelOrange fill-none stroke-[8]"
            />
            {/* Foreground Progress Circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="stroke-brightOrange fill-none stroke-[8] transition-all duration-1000 ease-out"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="font-display text-3xl font-black text-espresso">
              {vibeScore.score}
            </span>
            <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider -mt-1">
              / 10
            </span>
          </div>
        </div>

        {/* Status Label */}
        <div className="text-center">
          <div className="font-display text-lg font-extrabold text-espresso">
            {vibeScore.label}
          </div>
          <p className="text-xs font-medium text-textSecondary mt-1">
            {showBreakdown ? '👇 Tap to close breakdown' : '👉 Tap to check factor breakdown'}
          </p>
        </div>

        {/* Factor Breakdown Panel */}
        {showBreakdown && (
          <div className="w-full bg-white border-2 border-espresso rounded-neoSm p-3 shadow-neoSm mt-2 flex flex-col gap-2 transition-all">
            <h4 className="text-xs font-bold uppercase tracking-wider text-espresso border-b border-espresso/10 pb-1.5">
              Cosmic Alignment Factors
            </h4>
            <div className="flex flex-col gap-1.5">
              {vibeScore.factors.map((f, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-textSecondary">{f.name}</span>
                  <span className="text-espresso">
                    {f.points} / {f.max}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4 mt-4 border-t border-espresso/10 pt-4 text-xs font-bold text-textMuted justify-between">
        <span>📌 982 saves</span>
        <span>❤️ 311 likes</span>
      </div>
    </div>
  )
}
