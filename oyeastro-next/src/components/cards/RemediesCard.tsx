'use client'

import type { ChartResult } from '@/lib/astro/types'

interface Props {
  chart: ChartResult
}

export default function RemediesCard({ chart }: Props) {
  const { remedies } = chart

  return (
    <div className="pin-card bg-pastelGreen border-2 border-espresso rounded-neoLg p-6 shadow-neo break-inside-avoid mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-display font-extrabold text-espresso text-base">Remedies & Hacks</h3>
        <span className="px-2.5 py-1 text-xs font-bold border-2 border-espresso bg-white text-espresso rounded-neoSm shadow-neoSm">
          Crystal Hacks
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 my-2">
        <div className="bg-white border-2 border-espresso rounded-neoSm p-3 flex flex-col gap-1 shadow-neoSm">
          <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider">Gemstone</span>
          <span className="text-sm font-black text-espresso">{remedies.stone}</span>
        </div>

        <div className="bg-white border-2 border-espresso rounded-neoSm p-3 flex flex-col gap-1 shadow-neoSm">
          <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider">Color Power</span>
          <span className="text-sm font-black text-espresso">{remedies.color}</span>
        </div>

        <div className="bg-white border-2 border-espresso rounded-neoSm p-3 flex flex-col gap-1 shadow-neoSm col-span-2">
          <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider">Mantra Chant</span>
          <span className="text-xs font-bold text-espresso italic font-body">{remedies.mantra}</span>
        </div>

        <div className="bg-white border-2 border-espresso border-dashed rounded-neoSm p-3 text-xs font-bold text-textSecondary leading-relaxed col-span-2 shadow-neoSm">
          💡 Remedy Vibe: {remedies.tips}
        </div>
      </div>

      <div className="flex gap-4 mt-4 border-t border-espresso/10 pt-4 text-xs font-bold text-textMuted justify-between">
        <span>📌 861 saves</span>
        <span>❤️ 419 likes</span>
      </div>
    </div>
  )
}
