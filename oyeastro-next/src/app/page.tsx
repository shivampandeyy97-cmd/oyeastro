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

function HomeContent() {
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
    } catch (e) {
      console.error(e)
      setError(e instanceof Error ? e.message : 'Could not fetch your cosmic chart. Try again.')
      setChart(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col justify-between">
      <div>
        <Header />

        <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
          <IntakePanel onSubmit={handleFetchChart} isLoading={isLoading} />
        </div>

        {error && (
          <div className="max-w-xl mx-auto mt-6 px-4 py-3 bg-pastelPink text-brightPink border-2 border-espresso rounded-neoSm font-bold text-center shadow-neoSm">
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
      <main className="min-h-screen flex flex-col justify-between">
        <Header />
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
