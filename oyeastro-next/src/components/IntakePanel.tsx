'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
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
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(birthPlace)}&limit=5&addressdetails=0`,
          { headers: { 'User-Agent': 'OyeAstro/2.0 (oyeastro.com)' } }
        )
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
    onSubmit({ name: name || 'Bestie', birthDate, birthTime, birthPlace: birthPlace || 'New Delhi' })
  }

  const inputClass = "w-full pl-10 pr-3 py-3 border-2 border-espresso rounded-neoSm font-body text-sm font-medium text-white bg-[#0b0d26] neo-input focus:outline-none transition-all"

  return (
    <motion.section
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-cardBg border-2 border-espresso rounded-neoLg p-8 shadow-neoLg flex flex-col gap-6 items-center relative overflow-hidden"
    >
      {/* Floating sticker decals */}
      <span className="absolute -left-3 -top-3 text-3xl select-none rotate-[-15deg]">🪐</span>
      <span className="absolute -right-3 -top-3 text-3xl select-none rotate-[15deg]">✨</span>
      <span className="absolute -left-3 -bottom-3 text-3xl select-none rotate-[10deg]">🌙</span>
      <span className="absolute -right-3 -bottom-3 text-3xl select-none rotate-[-10deg]">⭐</span>

      <h1 className="font-display text-2xl md:text-3xl font-extrabold text-center text-white">
        Vibe-Check Your Stars
      </h1>
      <p className="text-textMuted text-sm text-center -mt-3">
        100% accurate planetary calculations · Real space telemetry · Whole-sky system
      </p>

      <form onSubmit={handleSubmit} className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-textSecondary">Your Name</label>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 stroke-textSecondary fill-none stroke-2" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>
            </svg>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Shivam"
              className={inputClass}
              id="user-name"
            />
          </div>
        </div>

        {/* Birth Date */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-textSecondary">Birth Date</label>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 stroke-textSecondary fill-none stroke-2" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <input
              type="date"
              value={birthDate}
              onChange={e => setBirthDate(e.target.value)}
              required
              className={inputClass}
              id="birth-date"
            />
          </div>
        </div>

        {/* Birth Time */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-textSecondary">Birth Time</label>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 stroke-textSecondary fill-none stroke-2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <input
              type="time"
              value={birthTime}
              onChange={e => setBirthTime(e.target.value)}
              required
              className={inputClass}
              id="birth-time"
            />
          </div>
        </div>

        {/* Birth Place */}
        <div className="flex flex-col gap-1.5 relative">
          <label className="text-xs font-bold uppercase tracking-wider text-textSecondary">Birth Place</label>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 stroke-textSecondary fill-none stroke-2 z-10" viewBox="0 0 24 24">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <input
              type="text"
              value={birthPlace}
              onChange={e => { setBirthPlace(e.target.value); setShowSuggestions(true) }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="e.g. Mumbai, India"
              className={inputClass}
              id="birth-place"
              autoComplete="off"
            />
          </div>
          {/* Autocomplete dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute top-full left-0 right-0 mt-1 bg-[#090a1e] text-white border-2 border-espresso rounded-neoSm shadow-neo z-50 overflow-hidden">
              {suggestions.map((s, i) => (
                <li
                  key={i}
                  className="px-4 py-2.5 text-sm cursor-pointer hover:bg-pastelOrange border-b border-espresso/30 last:border-0 truncate"
                  onMouseDown={() => { setBirthPlace(s.display_name.split(',').slice(0, 3).join(',')); setShowSuggestions(false); setSuggestions([]) }}
                >
                  📍 {s.display_name.split(',').slice(0, 3).join(', ')}
                </li>
              ))}
            </ul>
          )}
        </div>
      </form>

      <motion.button
        onClick={handleSubmit as unknown as React.MouseEventHandler}
        disabled={isLoading || !birthDate || !birthTime}
        whileHover={{ y: -2, boxShadow: '6px 6px 0px var(--shadow-color)' }}
        whileTap={{ y: 2, boxShadow: '2px 2px 0px var(--shadow-color)' }}
        className="px-10 py-4 bg-brightOrange text-white font-display text-lg font-extrabold border-2 border-espresso rounded-neoSm shadow-neo cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        id="reveal-btn"
      >
        {isLoading ? '⟳ Consulting the Stars...' : '🔮 Reveal My Cosmic Chart'}
      </motion.button>
    </motion.section>
  )
}
