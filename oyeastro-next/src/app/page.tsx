'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import type { ChartResult, BirthData } from '@/lib/astro/types'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import IntakePanel from '@/components/IntakePanel'
import LoadingOrbit from '@/components/LoadingOrbit'
import MasonryBoard from '@/components/MasonryBoard'
import ShareModal from '@/components/ShareModal'
import CosmicRunner from '@/components/CosmicRunner'
import MysteryChest from '@/components/MysteryChest'
import { useGame } from '@/components/GameContext'
import { audioSystem } from '@/lib/audio'

function HomeContent() {
  const { quests, completeQuest } = useGame()
  const searchParams = useSearchParams()
  const [birthData, setBirthData] = useState<BirthData | null>(null)
  const [chart, setChart] = useState<ChartResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)

  // Autoload shared chart from query param (?share=...)
  useEffect(() => {
    const shareParam = searchParams.get('share')
    if (shareParam) {
      try {
        const decoded = JSON.parse(atob(shareParam)) as BirthData
        if (decoded.birthDate && decoded.birthTime && decoded.birthPlace) {
          setBirthData(decoded)
          handleFetchChart(decoded)
        }
      } catch (e) {
        console.error('[Share Autoload] Failed to parse share token:', e)
      }
    }
  }, [searchParams])

  const handleFetchChart = async (data: BirthData) => {
    setIsLoading(true)
    setError(null)
    setBirthData(data)
    try {
      const res = await fetch('/api/chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const errJson = await res.json()
        throw new Error(errJson.error || 'Server calculation failed')
      }
      const result = await res.json() as ChartResult
      setChart(result)
      completeQuest('calculate_vibe')
    } catch (e) {
      console.error(e)
      setError(e instanceof Error ? e.message : 'Could not fetch your cosmic chart. Try again.')
      setChart(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Interactive task clicks
  const handleTaskClick = (taskId: string) => {
    audioSystem.playClick()
    if (taskId === 'check_aura') {
      completeQuest('check_aura')
    } else if (taskId === 'play_playlist') {
      completeQuest('play_playlist')
    }
  }

  return (
    <main className="min-h-screen flex flex-col justify-between">
      <div>
        <Header />

        <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main action form (takes 2 cols on desktop) */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            <IntakePanel onSubmit={handleFetchChart} isLoading={isLoading} />
            
            {/* Playable runner game built-in */}
            <CosmicRunner />
          </div>

          {/* Gamification Sidebar (Missions & Mystery Chest) */}
          <div className="flex flex-col gap-8">
            {/* Active Quests Checklist Card */}
            <div className="w-full bg-[#0d0f30] border-4 border-black rounded-3xl p-6 shadow-[5px_5px_0px_#fee440] relative">
              <h3 className="font-graffiti text-brightGold text-xl mb-1">
                Daily Missions
              </h3>
              <p className="text-[10px] font-black text-textSecondary uppercase tracking-wider mb-4 border-b border-black pb-1.5">
                Complete quests to boost multiplier
              </p>
              
              <div className="flex flex-col gap-2.5">
                {quests.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => handleTaskClick(q.id)}
                    disabled={q.isCompleted}
                    className={`flex items-start gap-3 p-3 rounded-2xl border-2 text-left w-full transition-all ${
                      q.isCompleted
                        ? 'bg-black/30 border-black/50 text-white/50 cursor-not-allowed opacity-60'
                        : 'bg-[#181a4a] border-black text-white hover:translate-y-[-1px] shadow-[2.5px_2.5px_0_#000] cursor-pointer'
                    }`}
                  >
                    <span className="text-xl shrink-0">{q.isCompleted ? '✅' : q.icon}</span>
                    <div className="flex flex-col leading-tight">
                      <span className={`text-xs font-black ${q.isCompleted ? 'line-through text-white/40' : 'text-white'}`}>
                        {q.title}
                      </span>
                      <span className="text-[10px] font-bold text-textMuted mt-0.5">
                        {q.description}
                      </span>
                      {!q.isCompleted && (
                        <span className="text-[9px] font-black text-brightGreen uppercase tracking-wider mt-1.5">
                          🎁 +{q.rewardXp} XP · +x{q.rewardMult} Mult
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Mystery Chest Loot Box */}
            <MysteryChest />
          </div>
        </div>

        {error && (
          <div className="max-w-xl mx-auto mt-6 px-6 py-4.5 bg-pastelPink text-brightPink border-4 border-black rounded-3xl font-black text-center shadow-[4px_4px_0_#000] relative">
            <span className="absolute -top-3 left-4 text-xs font-black bg-brightPink text-white px-2 py-0.5 border-2 border-black rounded-full">Error</span>
            ⚠️ {error}
          </div>
        )}

        {isLoading && (
          <div className="my-16">
            <LoadingOrbit />
          </div>
        )}

        {!isLoading && chart && birthData && (
          <MasonryBoard
            chart={chart}
            birthData={birthData}
            onShare={() => setIsShareModalOpen(true)}
          />
        )}
      </div>

      <Footer />

      {chart && birthData && (
        <ShareModal
          chart={chart}
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          birthData={birthData}
        />
      )}
    </main>
  )
}

export default function Home() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex flex-col justify-between bg-[#03040e]">
        <header className="px-4 py-3 border-b-4 border-black bg-cardBg shadow-[0_4px_0_#000]">
          <span className="font-graffiti text-brightPink text-3xl tracking-wider select-none rotate-[-4deg] inline-block">
            OyeAstro
          </span>
        </header>
        <div className="my-16">
          <LoadingOrbit />
        </div>
        <Footer />
      </main>
    }>
      <HomeContent />
    </Suspense>
  )
}

