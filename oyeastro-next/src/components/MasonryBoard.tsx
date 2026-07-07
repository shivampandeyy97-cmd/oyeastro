'use client'

import type { ChartResult } from '@/lib/astro/types'
import CosmicVibeCard from './cards/CosmicVibeCard'
import PremiumReportCard from './PremiumReportCard'
import KundliCard from './cards/KundliCard'
import BigThreeCard from './cards/BigThreeCard'
import VibeScoreCard from './cards/VibeScoreCard'
import FlagsCard from './cards/FlagsCard'
import RemediesCard from './cards/RemediesCard'
import HoroscopeCard from './cards/HoroscopeCard'
import SocialRadarCard from './cards/SocialRadarCard'
import DashaPlaylistCard from './cards/DashaPlaylistCard'
import MemeCard from './cards/MemeCard'
import ShareCard from './cards/ShareCard'
import { audioSystem } from '@/lib/audio'

interface Props {
  chart: ChartResult
  birthData: { name: string; birthDate: string; birthTime: string; birthPlace: string }
  onShare: () => void
}

export default function MasonryBoard({ chart, birthData, onShare }: Props) {
  const initial = birthData.name ? birthData.name.charAt(0).toUpperCase() : 'B'

  const handleCardClick = () => {
    audioSystem.playClick()
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 mt-10">
      {/* Identity Card */}
      <div 
        onClick={handleCardClick}
        className="pin-card bg-[#0b0c2a] border-4 border-black rounded-3xl p-5 shadow-[5px_5px_0px_#00f5d4] break-inside-avoid mb-6 flex items-center gap-4 hover:translate-y-[-1px] transition-transform cursor-pointer"
      >
        <div className="w-14 h-14 rounded-full border-3 border-black bg-brightPink text-white font-graffiti text-2xl flex items-center justify-center shadow-[2px_2px_0px_#000] rotate-[-5deg]">
          {initial}
        </div>
        <div className="flex flex-col">
          <h2 className="font-graffiti text-2xl text-white tracking-wide">
            {birthData.name}'s Cosmic Run
          </h2>
          <p className="text-xs font-black uppercase text-textSecondary mt-1 leading-none">
            Born in {chart.meta.location} | {chart.meta.lat}°N, {chart.meta.lon}°E
          </p>
        </div>
      </div>

      <div className="masonry-board">
        {/* Core Cosmic Vibe Card (cyan theme) */}
        <div className="pin-card arcade-card-cyan bg-[#0b0c20] text-white rounded-3xl overflow-hidden mb-6">
          <CosmicVibeCard chart={chart} onShare={onShare} />
        </div>

        {/* Aura Vibe Score Card (blue / cyan theme) */}
        <div className="pin-card arcade-card-cyan bg-pastelBlue rounded-3xl overflow-hidden mb-6">
          <VibeScoreCard chart={chart} />
        </div>

        {/* Big Three Polaroids Card (pink theme) */}
        <div className="pin-card arcade-card-pink bg-pastelPink rounded-3xl overflow-hidden mb-6">
          <BigThreeCard chart={chart} />
        </div>

        {/* Daily Horror-scope Card (yellow theme) */}
        <div className="pin-card arcade-card-yellow bg-[#3b320d] rounded-3xl overflow-hidden mb-6">
          <HoroscopeCard chart={chart} />
        </div>

        {/* Dasha Playlist Card (vinyl/black theme) */}
        <div className="pin-card arcade-card-green bg-[#111] rounded-3xl overflow-hidden mb-6">
          <DashaPlaylistCard chart={chart} />
        </div>

        {/* Kundli Card (purple theme) */}
        <div className="pin-card arcade-card-purple bg-[#0f0b2a] rounded-3xl overflow-hidden mb-6">
          <KundliCard chart={chart} />
        </div>

        {/* Sticker Flags Card (pink/purple theme) */}
        <div className="pin-card arcade-card-pink bg-pastelPurple rounded-3xl overflow-hidden mb-6">
          <FlagsCard chart={chart} />
        </div>

        {/* Remedies & Hacks Card (green theme) */}
        <div className="pin-card arcade-card-green bg-pastelGreen rounded-3xl overflow-hidden mb-6">
          <RemediesCard chart={chart} />
        </div>

        {/* Social Radar Card (orange theme) */}
        <div className="pin-card arcade-card-orange bg-pastelOrange rounded-3xl overflow-hidden mb-6">
          <SocialRadarCard chart={chart} />
        </div>

        {/* Meme Joke Card (pink theme) */}
        <div className="pin-card arcade-card-pink bg-pastelPink rounded-3xl overflow-hidden mb-6">
          <MemeCard chart={chart} />
        </div>

        {/* Premium Report Upgrade Card (yellow theme) */}
        <div className="pin-card arcade-card-yellow bg-[#1c1809] rounded-3xl overflow-hidden mb-6">
          <PremiumReportCard chart={chart} />
        </div>

        {/* Share Launcher Card */}
        <div className="pin-card arcade-card-cyan bg-pastelBlue rounded-3xl overflow-hidden mb-6">
          <ShareCard onShare={onShare} />
        </div>
      </div>
    </div>
  )
}

