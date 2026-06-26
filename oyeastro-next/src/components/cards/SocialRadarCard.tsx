'use client'

import type { ChartResult } from '@/lib/astro/types'

interface Props {
  chart: ChartResult
}

export default function SocialRadarCard({ chart }: Props) {
  const { socialMatch } = chart

  return (
    <div className="pin-card bg-pastelOrange border-2 border-espresso rounded-neoLg p-6 shadow-neo break-inside-avoid mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-display font-extrabold text-espresso text-base">Social Radar</h3>
        <span className="px-2.5 py-1 text-xs font-bold border-2 border-espresso bg-white text-espresso rounded-neoSm shadow-neoSm">
          Match Vibe
        </span>
      </div>

      <div className="flex flex-col gap-4 my-2">
        {/* Bestie Match */}
        <div className="bg-white border-2 border-espresso rounded-neoSm p-4 shadow-neoSm relative overflow-hidden flex flex-col gap-1">
          <span className="self-start text-[10px] font-bold uppercase tracking-wider text-brightGreen bg-pastelGreen px-2 py-0.5 border border-espresso rounded-full">
            Bestie Match
          </span>
          <div className="font-display text-lg font-black text-espresso mt-1.5">
            {socialMatch.bestie} ✨
          </div>
          <p className="text-xs font-semibold text-textSecondary leading-relaxed">
            Vibe score: 98%. Excellent communication flow. Shared values, great chats.
          </p>
        </div>

        {/* Caution Area */}
        <div className="bg-white border-2 border-espresso rounded-neoSm p-4 shadow-neoSm relative overflow-hidden flex flex-col gap-1">
          <span className="self-start text-[10px] font-bold uppercase tracking-wider text-brightPink bg-pastelPink px-2 py-0.5 border border-espresso rounded-full">
            Caution Area
          </span>
          <div className="font-display text-lg font-black text-espresso mt-1.5">
            {socialMatch.rival} 🛑
          </div>
          <p className="text-xs font-semibold text-textSecondary leading-relaxed">
            Caution node. Keep your distance bestie, mismatching wavelengths here.
          </p>
        </div>

        {/* Captioned Comparison */}
        <p className="text-xs font-bold text-espresso italic mt-1 leading-relaxed text-center">
          "{socialMatch.copy}"
        </p>
      </div>

      <div className="flex gap-4 mt-4 border-t border-espresso/10 pt-4 text-xs font-bold text-textMuted justify-between">
        <span>📌 1.1k saves</span>
        <span>❤️ 540 likes</span>
      </div>
    </div>
  )
}
