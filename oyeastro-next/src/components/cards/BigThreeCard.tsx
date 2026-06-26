'use client'

import type { ChartResult } from '@/lib/astro/types'

interface Props {
  chart: ChartResult
}

export default function BigThreeCard({ chart }: Props) {
  const { bigThree } = chart

  return (
    <div className="pin-card bg-pastelPink border-2 border-espresso rounded-neoLg p-6 shadow-neo break-inside-avoid mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-display font-extrabold text-espresso text-base">Your Big Three</h3>
        <span className="px-2.5 py-1 text-xs font-bold border-2 border-espresso bg-white text-espresso rounded-neoSm shadow-neoSm">
          Polaroids
        </span>
      </div>

      <div className="flex flex-col gap-4 my-2">
        {/* Rising / Lagna */}
        <div className="polaroid-shot bg-white border-2 border-espresso p-3 pb-6 shadow-neoSm transition-all duration-200 rotate-[-1deg] hover:scale-105 hover:rotate-0">
          <div className="h-[110px] w-full border-2 border-espresso bg-white flex items-center justify-center mb-2">
            <svg className="w-14 h-14 stroke-espresso fill-none" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="25" fill="none" stroke="var(--espresso)" strokeWidth="2.5" />
              <path d="M50 15 L50 85 M15 50 L85 50" stroke="var(--espresso)" strokeWidth="1.5" />
              <polygon points="50,20 45,32 55,32" fill="var(--espresso)" />
            </svg>
          </div>
          <div className="font-display text-[0.95rem] font-bold text-center text-espresso">
            {bigThree.rising.sign}
            <span className="block text-[0.7rem] font-body font-medium text-textSecondary uppercase tracking-wider mt-0.5">
              Rising
            </span>
          </div>
        </div>

        {/* Sun Sign */}
        <div className="polaroid-shot bg-white border-2 border-espresso p-3 pb-6 shadow-neoSm transition-all duration-200 rotate-[1.5deg] hover:scale-105 hover:rotate-0">
          <div className="h-[110px] w-full border-2 border-espresso bg-white flex items-center justify-center mb-2">
            <svg className="w-14 h-14 stroke-espresso fill-none" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="20" fill="none" stroke="var(--espresso)" strokeWidth="3" />
              <circle cx="50" cy="50" r="5" fill="var(--espresso)" />
              <path d="M50 10 L50 16 M50 84 L50 90 M10 50 L16 50 M84 50 L90 50" stroke="var(--espresso)" strokeWidth="2" />
            </svg>
          </div>
          <div className="font-display text-[0.95rem] font-bold text-center text-espresso">
            {bigThree.sun.sign}
            <span className="block text-[0.7rem] font-body font-medium text-textSecondary uppercase tracking-wider mt-0.5">
              Sun
            </span>
          </div>
        </div>

        {/* Moon Sign */}
        <div className="polaroid-shot bg-white border-2 border-espresso p-3 pb-6 shadow-neoSm transition-all duration-200 rotate-[-1.2deg] hover:scale-105 hover:rotate-0">
          <div className="h-[110px] w-full border-2 border-espresso bg-white flex items-center justify-center mb-2">
            <svg className="w-14 h-14 stroke-espresso fill-none" viewBox="0 0 100 100">
              <path d="M30 50 A 20 20 0 1 0 70 50 A 14 14 0 1 1 30 50 Z" fill="none" stroke="var(--espresso)" strokeWidth="3" />
            </svg>
          </div>
          <div className="font-display text-[0.95rem] font-bold text-center text-espresso">
            {bigThree.moon.sign}
            <span className="block text-[0.7rem] font-body font-medium text-textSecondary uppercase tracking-wider mt-0.5">
              Moon
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mt-4 border-t border-espresso/10 pt-4 text-xs font-bold text-textMuted justify-between">
        <span>📌 1.5k saves</span>
        <span>❤️ 642 likes</span>
      </div>
    </div>
  )
}
