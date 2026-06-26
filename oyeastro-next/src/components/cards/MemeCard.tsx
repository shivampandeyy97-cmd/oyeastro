'use client'

import type { ChartResult } from '@/lib/astro/types'

interface Props {
  chart: ChartResult
}

export default function MemeCard({ chart }: Props) {
  const { bigThree } = chart

  return (
    <div className="pin-card bg-pastelPink border-2 border-espresso rounded-neoLg p-6 shadow-neo break-inside-avoid mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-display font-extrabold text-espresso text-base">Cosmic Memes</h3>
        <span className="px-2.5 py-1 text-xs font-bold border-2 border-espresso bg-white text-espresso rounded-neoSm shadow-neoSm">
          Astro Joke
        </span>
      </div>

      <p className="font-body text-sm font-semibold text-espresso leading-relaxed italic my-2">
        "A {bigThree.rising.sign} Rising choosing what outfit to wear: 'I have 8 different options and none of them represent my current soul alignment.'"
      </p>

      <div className="flex gap-4 mt-4 border-t border-espresso/10 pt-4 text-xs font-bold text-textMuted justify-between">
        <span>📌 2.3k saves</span>
        <span>❤️ 988 likes</span>
      </div>
    </div>
  )
}
