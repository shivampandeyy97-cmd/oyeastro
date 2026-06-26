'use client'

import { useState } from 'react'
import type { ChartResult } from '@/lib/astro/types'

interface Props {
  chart: ChartResult
  isOpen: boolean
  onClose: () => void
  birthData: { name: string; birthDate: string; birthTime: string; birthPlace: string }
}

export default function ShareModal({ chart, isOpen, onClose, birthData }: Props) {
  const [format, setFormat] = useState<'wide' | 'story'>('wide')
  const [copied, setCopied] = useState(false)
  const { meta, bigThree, vibeScore } = chart

  if (!isOpen) return null

  // Build OG card URL
  const quote = `Dasha Era: ${chart.dasha.eraTitle} • Vibe: ${vibeScore.label}`
  const ogParams = new URLSearchParams({
    name: meta.name,
    quote: quote,
    format: format,
  })
  const imageUrl = `/api/og/card?${ogParams.toString()}`

  // Create shareable link containing encoded birth data
  const handleCopyLink = () => {
    try {
      const payload = btoa(JSON.stringify(birthData))
      const shareUrl = `${window.location.origin}/?share=${payload}`
      navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      console.error(e)
    }
  }

  const handleDownload = async () => {
    try {
      const res = await fetch(imageUrl)
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `${meta.name}_cosmic_alignment_${format}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
    } catch (e) {
      // Fallback: open in new tab
      window.open(imageUrl, '_blank')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso/70 backdrop-blur-sm">
      <div className="bg-bgWarm border-4 border-espresso rounded-neoLg p-6 shadow-neo max-w-lg w-full flex flex-col gap-4 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute -right-3 -top-3 w-10 h-10 bg-brightPink text-white border-2 border-espresso rounded-full shadow-neoSm flex items-center justify-center font-display text-lg font-black hover:scale-105 transition-transform cursor-pointer"
        >
          ✕
        </button>

        <h3 className="font-display font-extrabold text-2xl text-white text-center">
          Share Your Cosmos
        </h3>

        {/* Format Selectors */}
        <div className="flex border-2 border-espresso rounded-neoSm bg-[#0b0d26] overflow-hidden shadow-neoSm">
          <button
            onClick={() => setFormat('wide')}
            className={`flex-1 py-2 text-xs font-bold transition-colors ${
              format === 'wide' ? 'bg-brightPurple text-white' : 'bg-[#0b0d26] text-white hover:bg-pastelPurple/20'
            }`}
          >
            Wide (16:9 Landscape)
          </button>
          <button
            onClick={() => setFormat('story')}
            className={`flex-1 py-2 text-xs font-bold transition-colors border-l-2 border-espresso ${
              format === 'story' ? 'bg-brightPurple text-white' : 'bg-[#0b0d26] text-white hover:bg-pastelPurple/20'
            }`}
          >
            Story (9:16 Portrait)
          </button>
        </div>

        {/* Live Preview Image Box */}
        <div className="border-2 border-espresso rounded-neoSm overflow-hidden bg-black flex items-center justify-center shadow-neoSm max-h-64 relative aspect-video">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Cosmic share card preview"
            className="max-w-full max-h-full object-contain"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5 mt-2">
          <button
            onClick={handleCopyLink}
            className="w-full py-3 bg-brightOrange text-white font-display text-sm font-extrabold border-2 border-espresso rounded-neoSm shadow-neo hover:translate-y-[-2px] hover:shadow-neoLg active:translate-y-[2px] transition-all cursor-pointer"
          >
            {copied ? '✅ Link Copied!' : '🔗 Copy Cosmic Profile Link'}
          </button>

          <button
            onClick={handleDownload}
            className="w-full py-3 bg-[#0b0d26] text-white font-display text-sm font-extrabold border-2 border-espresso rounded-neoSm shadow-neo hover:translate-y-[-2px] hover:shadow-neoLg active:translate-y-[2px] hover:bg-pastelPurple/20 transition-all cursor-pointer"
          >
            💾 Download PNG Image
          </button>
        </div>
      </div>
    </div>
  )
}
