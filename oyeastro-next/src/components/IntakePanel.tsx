'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '@/components/GameContext'
import { audioSystem } from '@/lib/audio'
import type { BirthData } from '@/lib/astro/types'

interface Props {
  onSubmit: (data: BirthData) => void
  isLoading: boolean
}

interface CitySuggestion {
  display_name: string
  lat: string
  lon: string
}

export default function IntakePanel({ onSubmit, isLoading }: Props) {
  const { completeQuest } = useGame()
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [birthTime, setBirthTime] = useState('')
  const [birthPlace, setBirthPlace] = useState('')
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Nominatim autocomplete
  useEffect(() => {
    if (birthPlace.length < 3) { setSuggestions([]); return }

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(birthPlace)}`)
        if (res.ok) {
          const data = await res.json() as CitySuggestion[]
          setSuggestions(data.slice(0, 5))
          setShowSuggestions(true)
        }
      } catch { /* ignore */ }
    }, 400)
  }, [birthPlace])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!birthDate || !birthTime) return
    
    // Play submit audio and complete quest
    audioSystem.playChestOpen()
    completeQuest('calculate_vibe')
    
    onSubmit({ name: name || 'Bestie', birthDate, birthTime, birthPlace: birthPlace || 'New Delhi' })
  }

  const handleInputChange = (fieldSetter: (val: string) => void, val: string) => {
    fieldSetter(val)
    audioSystem.playClick()
  }

  const inputClass = "w-full pl-10 pr-3 py-3.5 border-3 border-black rounded-2xl font-body text-sm font-bold text-white bg-[#0b0d2a] focus:shadow-[2px_2px_0px_#ff007f] focus:outline-none transition-all placeholder-white/30"

  return (
    <motion.section
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-cardBg border-4 border-black rounded-3xl p-6 md:p-8 shadow-[6px_6px_0px_#ff007f] flex flex-col gap-6 items-center relative overflow-hidden"
    >
      {/* Floating game sticker decals */}
      <span className="absolute -left-3 -top-3 text-4xl select-none rotate-[-15deg] animate-bounce">🪐</span>
      <span className="absolute -right-3 -top-3 text-4xl select-none rotate-[15deg] animate-pulse">✨</span>
      <span className="absolute -left-3 -bottom-3 text-4xl select-none rotate-[10deg] animate-pulse">🛹</span>
      <span className="absolute -right-3 -bottom-3 text-4xl select-none rotate-[-10deg] animate-bounce">⭐</span>

      <div className="text-center">
        <h1 className="font-graffiti text-3xl md:text-4xl text-white tracking-wide">
          Register Your High Score
        </h1>
        <p className="text-xs font-black uppercase text-brightGreen tracking-wider mt-2">
          Teleport your birth coordinates into the cosmic tracks
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black uppercase tracking-wider text-brightCyan">Your Nickname</label>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 stroke-brightCyan fill-none stroke-[2.5]" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>
            </svg>
            <input
              type="text"
              value={name}
              onChange={e => handleInputChange(setName, e.target.value)}
              placeholder="e.g. Shivam"
              className={inputClass}
              id="user-name"
              required
            />
          </div>
        </div>

        {/* Birth Date */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black uppercase tracking-wider text-brightCyan">Birth Date</label>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 stroke-brightCyan fill-none stroke-[2.5]" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <input
              type="date"
              value={birthDate}
              onChange={e => handleInputChange(setBirthDate, e.target.value)}
              required
              className={inputClass}
              id="birth-date"
            />
          </div>
        </div>

        {/* Birth Time */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black uppercase tracking-wider text-brightCyan">Birth Time</label>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 stroke-brightCyan fill-none stroke-[2.5]" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <input
              type="time"
              value={birthTime}
              onChange={e => handleInputChange(setBirthTime, e.target.value)}
              required
              className={inputClass}
              id="birth-time"
            />
          </div>
        </div>

        {/* Birth Place */}
        <div className="flex flex-col gap-1.5 relative">
          <label className="text-xs font-black uppercase tracking-wider text-brightCyan">Birth City</label>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 stroke-brightCyan fill-none stroke-[2.5] z-10" viewBox="0 0 24 24">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <input
              type="text"
              value={birthPlace}
              onChange={e => { handleInputChange(setBirthPlace, e.target.value); setShowSuggestions(true) }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="e.g. Mumbai, India"
              className={inputClass}
              id="birth-place"
              autoComplete="off"
              required
            />
          </div>
          {/* Autocomplete dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute top-full left-0 right-0 mt-2 bg-[#090a24] text-white border-3 border-black rounded-2xl shadow-[4px_4px_0_#000] z-50 overflow-hidden">
              {suggestions.map((s, i) => (
                <li
                  key={i}
                  className="px-4 py-3 text-xs font-bold cursor-pointer hover:bg-brightPink hover:text-white border-b-2 border-black/40 last:border-0 truncate"
                  onMouseDown={() => {
                    handleInputChange(setBirthPlace, s.display_name.split(',').slice(0, 3).join(','));
                    setShowSuggestions(false);
                    setSuggestions([])
                  }}
                >
                  📍 {s.display_name.split(',').slice(0, 3).join(', ')}
                </li>
              ))}
            </ul>
          )}
        </div>
      </form>

      <button
        onClick={handleSubmit as unknown as React.MouseEventHandler}
        disabled={isLoading || !birthDate || !birthTime}
        className="arcade-btn px-12 py-4.5 text-base w-full md:w-auto shrink-0 select-none mt-2"
        id="reveal-btn"
      >
        {isLoading ? '⟳ Calculating Cosmic Score...' : '🔮 Reveal My Cosmic Chart'}
      </button>
    </motion.section>
  )
}
