'use client'

import type { ChartResult } from '@/lib/astro/types'

interface Props {
  chart: ChartResult
}

export default function FlagsCard({ chart }: Props) {
  const { flags } = chart

  return (
    <div className="pin-card bg-pastelPurple border-2 border-espresso rounded-neoLg p-6 shadow-neo break-inside-avoid mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-display font-extrabold text-espresso text-base">Flags & Warnings</h3>
        <span className="px-2.5 py-1 text-xs font-bold border-2 border-espresso bg-white text-espresso rounded-neoSm shadow-neoSm">
          Sticker Flags
        </span>
      </div>

      <div className="flex flex-col gap-3 my-2">
        {/* Green Flags */}
        {flags.green.map((flag, idx) => (
          <div
            key={`green-${idx}`}
            className="flex items-start gap-3 bg-white border-2 border-espresso rounded-neoSm p-3 shadow-neoSm border-l-[6px] border-l-brightGreen"
          >
            <span className="text-lg">🟩</span>
            <div className="text-xs font-bold text-espresso leading-relaxed">
              <span className="text-brightGreen uppercase tracking-wider block text-[10px] mb-0.5">Green Flag</span>
              {flag}
            </div>
          </div>
        ))}

        {/* Red Flags */}
        {flags.red.map((flag, idx) => (
          <div
            key={`red-${idx}`}
            className="flex items-start gap-3 bg-white border-2 border-espresso rounded-neoSm p-3 shadow-neoSm border-l-[6px] border-l-brightPink"
          >
            <span className="text-lg">🟥</span>
            <div className="text-xs font-bold text-espresso leading-relaxed">
              <span className="text-brightPink uppercase tracking-wider block text-[10px] mb-0.5">Red Flag</span>
              {flag}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4 mt-4 border-t border-espresso/10 pt-4 text-xs font-bold text-textMuted justify-between">
        <span>📌 754 saves</span>
        <span>❤️ 210 likes</span>
      </div>
    </div>
  )
}
