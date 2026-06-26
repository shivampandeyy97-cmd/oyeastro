'use client'

import type { ChartResult } from '@/lib/astro/types'
import CosmicVibeCard from './cards/CosmicVibeCard'
import PremiumReportCard from './PremiumReportCard'
import KundliCard from './cards/KundliCard'
import ShareCard from './cards/ShareCard'

interface Props {
  chart: ChartResult
  birthData: { name: string; birthDate: string; birthTime: string; birthPlace: string }
  onShare: () => void
}

export default function MasonryBoard({ chart, birthData, onShare }: Props) {
  const initial = birthData.name ? birthData.name.charAt(0).toUpperCase() : 'B'

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 mt-10">
      <div className="masonry-board">
        {/* User Profile Identity Card */}
        <div className="pin-card bg-pastelPurple border-2 border-espresso rounded-neoLg p-5 shadow-neo break-inside-avoid mb-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-espresso bg-brightPurple text-white font-display text-xl font-extrabold flex items-center justify-center shadow-neoSm">
            {initial}
          </div>
          <div className="flex flex-col">
            <h2 className="font-display text-xl font-black text-espresso">
              {birthData.name}'s Cosmos
            </h2>
            <p className="text-xs font-semibold text-textSecondary mt-0.5">
              Born in {chart.meta.location} | {chart.meta.lat}°N, {chart.meta.lon}°E
            </p>
          </div>
        </div>

        {/* Core Cosmic Vibe Card */}
        <CosmicVibeCard chart={chart} onShare={onShare} />

        {/* Premium Yearly Report Upsell / Content Card */}
        <PremiumReportCard chart={chart} />

        {/* 1. Kundli Card */}
        <KundliCard chart={chart} />

        {/* 2. Action Center (Share) Card */}
        <ShareCard onShare={onShare} />
      </div>
    </div>
  )
}
