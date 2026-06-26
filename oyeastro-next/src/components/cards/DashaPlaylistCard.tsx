'use client'

import { useState, useEffect } from 'react'
import type { ChartResult } from '@/lib/astro/types'

interface Props {
  chart: ChartResult
}

export default function DashaPlaylistCard({ chart }: Props) {
  const { dasha } = chart
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false)
            return 0
          }
          return prev + 1
        })
      }, 1800) // 180 seconds total (3:00 mins) = 1.8s per 1%
    } else {
      if (interval) clearInterval(interval)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying])

  const formatTime = (pct: number) => {
    const totalSecs = Math.round((pct / 100) * 180)
    const mins = Math.floor(totalSecs / 60)
    const secs = totalSecs % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="pin-card bg-[#111] text-white border-2 border-[#222] rounded-neoLg p-6 shadow-[5px_5px_0px_#000] break-inside-avoid mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-display font-extrabold text-brightGreen text-base">Cosmic Playlist</h3>
        <span className="px-2.5 py-1 text-xs font-bold border-2 border-[#333] bg-white/5 text-gray-300 rounded-neoSm">
          Vibe Player
        </span>
      </div>

      <div className="flex flex-col gap-5 py-2">
        <div className="flex items-center gap-4">
          {/* Vinyl cover */}
          <div
            className={`relative w-20 h-20 rounded-full border-2 border-[#555] bg-[radial-gradient(circle,_#333_25%,_#111_60%,_#000_100%)] flex items-center justify-center ${
              isPlaying ? 'animate-[spinVinyl_12s_linear_infinite]' : ''
            }`}
            style={{
              animationPlayState: isPlaying ? 'running' : 'paused',
            }}
          >
            {/* Center label */}
            <div className="absolute w-6 h-6 rounded-full bg-brightGreen border-2 border-[#111]" />
          </div>

          <div className="flex flex-col">
            <h4 className="font-display text-lg font-black text-white leading-tight">
              {dasha.eraTitle}
            </h4>
            <span className="text-xs font-semibold text-[#888] mt-0.5">
              Lilo the Cosmic Cat · Vimshottari
            </span>
          </div>
        </div>

        {/* Playlist Description */}
        <p className="text-xs font-medium text-gray-400 leading-relaxed italic bg-white/5 border border-white/10 rounded-neoSm p-3 shadow-inner">
          "{dasha.eraCopy}"
        </p>

        {/* Info detail */}
        <div className="flex flex-col gap-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-[#1a1a1a] rounded p-2.5 border border-white/5">
          <div>🪐 Major Era: {dasha.activeDasha.rulerName}</div>
          {dasha.activeAntardasha && (
            <div className="text-brightGreen">📡 Current Sub-Era: {dasha.activeAntardasha.rulerName}</div>
          )}
          <div className="text-gray-500">⏳ Timeline: {dasha.activeDasha.startFormatted} - {dasha.activeDasha.endFormatted}</div>
        </div>

        {/* Music Player Controls */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#888]">
            <span>{formatTime(progress)}</span>
            <div
              className="flex-1 h-1 bg-[#333] rounded-full relative cursor-pointer"
              onClick={e => {
                const rect = e.currentTarget.getBoundingClientRect()
                const clickX = e.clientX - rect.left
                setProgress(Math.max(0, Math.min(100, Math.round((clickX / rect.width) * 100))))
              }}
            >
              <div
                className="h-full bg-brightGreen rounded-full absolute left-0 top-0 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span>3:00</span>
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
            >
              {isPlaying ? (
                // Pause Icon
                <svg className="w-5 h-5 fill-black" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                // Play Icon
                <svg className="w-5 h-5 fill-black ml-0.5" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mt-4 border-t border-white/5 pt-4 text-xs font-bold text-gray-500 justify-between">
        <span>📌 3.4k saves</span>
        <span>❤️ 1.8k likes</span>
      </div>
    </div>
  )
}
