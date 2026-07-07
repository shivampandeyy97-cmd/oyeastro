'use client'

import { useState, useRef, useEffect } from 'react'
import type { BirthData, CompatibilityResult } from '@/lib/astro/types'
import LoadingOrbit from './LoadingOrbit'
import { useGame } from '@/components/GameContext'
import { audioSystem } from '@/lib/audio'

interface CitySuggestion {
  display_name: string
  lat: string
  lon: string
}

export default function CompatibilityBoard() {
  const { completeQuest } = useGame()
  // Person A
  const [nameA, setNameA] = useState('')
  const [dateA, setDateA] = useState('')
  const [timeA, setTimeA] = useState('')
  const [placeA, setPlaceA] = useState('')
  const [suggestionsA, setSuggestionsA] = useState<CitySuggestion[]>([])
  const [showSuggestionsA, setShowSuggestionsA] = useState(false)

  // Person B
  const [nameB, setNameB] = useState('')
  const [dateB, setDateB] = useState('')
  const [timeB, setTimeB] = useState('')
  const [placeB, setPlaceB] = useState('')
  const [suggestionsB, setSuggestionsB] = useState<CitySuggestion[]>([])
  const [showSuggestionsB, setShowSuggestionsB] = useState(false)

  // Overall State
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<CompatibilityResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const debounceARef = useRef<NodeJS.Timeout | null>(null)
  const debounceBRef = useRef<NodeJS.Timeout | null>(null)

  // Autocomplete A
  useEffect(() => {
    if (placeA.length < 3) { setSuggestionsA([]); return }
    if (debounceARef.current) clearTimeout(debounceARef.current)
    debounceARef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(placeA)}&limit=5&addressdetails=0`,
          { headers: { 'User-Agent': 'OyeAstro/2.0 (oyeastro.com)' } }
        )
        if (res.ok) {
          const data = await res.json() as CitySuggestion[]
          setSuggestionsA(data)
        }
      } catch { /* ignore */ }
    }, 400)
  }, [placeA])

  // Autocomplete B
  useEffect(() => {
    if (placeB.length < 3) { setSuggestionsB([]); return }
    if (debounceBRef.current) clearTimeout(debounceBRef.current)
    debounceBRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(placeB)}&limit=5&addressdetails=0`,
          { headers: { 'User-Agent': 'OyeAstro/2.0 (oyeastro.com)' } }
        )
        if (res.ok) {
          const data = await res.json() as CitySuggestion[]
          setSuggestionsB(data)
        }
      } catch { /* ignore */ }
    }, 400)
  }, [placeB])

  const handleInputChange = (fieldSetter: (val: string) => void, val: string) => {
    fieldSetter(val)
    audioSystem.playClick()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!dateA || !timeA || !placeA || !dateB || !timeB || !placeB) return

    audioSystem.playChestOpen()
    setIsLoading(true)
    setError(null)
    setResult(null)

    const personA: BirthData = { name: nameA || 'Person A', birthDate: dateA, birthTime: timeA, birthPlace: placeA }
    const personB: BirthData = { name: nameB || 'Person B', birthDate: dateB, birthTime: timeB, birthPlace: placeB }

    try {
      const res = await fetch('/api/compatibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personA, personB }),
      })
      if (!res.ok) {
        const errJson = await res.json()
        throw new Error(errJson.error || 'Server matching failed')
      }
      const data = await res.json() as CompatibilityResult
      setResult(data)
      // Play level unlock sound on match success
      audioSystem.playLevelUp()
      completeQuest('check_compatibility')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please check your inputs.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadCard = async () => {
    if (!result) return
    audioSystem.playClick()
    const quote = result.summary.split('—')[1]?.trim() || 'The stars have spoken.'
    const ogParams = new URLSearchParams({
      nameA: result.personA.meta.name,
      nameB: result.personB.meta.name,
      score: result.totalScore.toString(),
      quote: quote,
    })
    const url = `/api/og/match?${ogParams.toString()}`

    try {
      const res = await fetch(url)
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `${result.personA.meta.name}_x_${result.personB.meta.name}_compatibility.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
      completeQuest('download_share')
    } catch {
      window.open(url, '_blank')
      completeQuest('download_share')
    }
  }

  const inputClass = "w-full pl-10 pr-3 py-3 border-3 border-black rounded-2xl font-body text-sm font-bold text-white bg-[#0b0d2a] focus:shadow-[2px_2px_0px_#00f5d4] focus:outline-none transition-all placeholder-white/30"

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-8 mt-6">
      {/* Intake Forms Panel */}
      {!result && !isLoading && (
        <form onSubmit={handleSubmit} className="bg-cardBg border-4 border-black rounded-3xl p-6 md:p-8 shadow-[6px_6px_0px_#00f5d4] flex flex-col gap-6 relative">
          <div className="text-center">
            <h1 className="font-graffiti text-3xl md:text-4xl text-white tracking-wide">
              💞 Ultimate Vibe Matcher
            </h1>
            <p className="text-xs font-black uppercase text-brightGreen tracking-wider mt-2">
              Sync orbits across 8 cosmic parameters (36 max points score)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">
            {/* Person A Box */}
            <div className="flex flex-col gap-4 bg-pastelPurple/40 border-3 border-dashed border-black rounded-3xl p-6">
              <h2 className="font-display text-lg font-black text-brightCyan border-b-2 border-black/40 pb-2">
                Person A (You)
              </h2>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-black uppercase tracking-wider text-textMuted">Nickname</label>
                <input
                  type="text"
                  value={nameA}
                  onChange={e => handleInputChange(setNameA, e.target.value)}
                  placeholder="e.g. Alex"
                  className={inputClass}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-black uppercase tracking-wider text-textMuted">Birth Date</label>
                <input
                  type="date"
                  value={dateA}
                  onChange={e => handleInputChange(setDateA, e.target.value)}
                  className={inputClass}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-black uppercase tracking-wider text-textMuted">Birth Time</label>
                <input
                  type="time"
                  value={timeA}
                  onChange={e => handleInputChange(setTimeA, e.target.value)}
                  className={inputClass}
                  required
                />
              </div>

              <div className="flex flex-col gap-1 relative">
                <label className="text-xs font-black uppercase tracking-wider text-textMuted">Birth City</label>
                <input
                  type="text"
                  value={placeA}
                  onChange={e => { handleInputChange(setPlaceA, e.target.value); setShowSuggestionsA(true) }}
                  onBlur={() => setTimeout(() => setShowSuggestionsA(false), 200)}
                  placeholder="e.g. Mumbai, India"
                  className={inputClass}
                  required
                  autoComplete="off"
                />
                {showSuggestionsA && suggestionsA.length > 0 && (
                  <ul className="absolute top-full left-0 right-0 mt-2 bg-[#090a24] text-white border-3 border-black rounded-2xl shadow-[4px_4px_0_#000] z-50 overflow-hidden">
                    {suggestionsA.map((s, i) => (
                      <li
                        key={i}
                        className="px-4 py-3 text-xs font-bold cursor-pointer hover:bg-brightPink hover:text-white border-b-2 border-black/40 last:border-0 truncate"
                        onMouseDown={() => { handleInputChange(setPlaceA, s.display_name.split(',').slice(0, 3).join(',')); setSuggestionsA([]) }}
                      >
                        📍 {s.display_name.split(',').slice(0, 3).join(', ')}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Person B Box */}
            <div className="flex flex-col gap-4 bg-pastelOrange/20 border-3 border-dashed border-black rounded-3xl p-6">
              <h2 className="font-display text-lg font-black text-brightOrange border-b-2 border-black/40 pb-2">
                Person B (Them)
              </h2>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-black uppercase tracking-wider text-textMuted">Nickname</label>
                <input
                  type="text"
                  value={nameB}
                  onChange={e => handleInputChange(setNameB, e.target.value)}
                  placeholder="e.g. Sarah"
                  className={inputClass}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-black uppercase tracking-wider text-textMuted">Birth Date</label>
                <input
                  type="date"
                  value={dateB}
                  onChange={e => handleInputChange(setDateB, e.target.value)}
                  className={inputClass}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-black uppercase tracking-wider text-textMuted">Birth Time</label>
                <input
                  type="time"
                  value={timeB}
                  onChange={e => handleInputChange(setTimeB, e.target.value)}
                  className={inputClass}
                  required
                />
              </div>

              <div className="flex flex-col gap-1 relative">
                <label className="text-xs font-black uppercase tracking-wider text-textMuted">Birth City</label>
                <input
                  type="text"
                  value={placeB}
                  onChange={e => { handleInputChange(setPlaceB, e.target.value); setShowSuggestionsB(true) }}
                  onBlur={() => setTimeout(() => setShowSuggestionsB(false), 200)}
                  placeholder="e.g. Delhi, India"
                  className={inputClass}
                  required
                  autoComplete="off"
                />
                {showSuggestionsB && suggestionsB.length > 0 && (
                  <ul className="absolute top-full left-0 right-0 mt-2 bg-[#090a24] text-white border-3 border-black rounded-2xl shadow-[4px_4px_0_#000] z-50 overflow-hidden">
                    {suggestionsB.map((s, i) => (
                      <li
                        key={i}
                        className="px-4 py-3 text-xs font-bold cursor-pointer hover:bg-brightPink hover:text-white border-b-2 border-black/40 last:border-0 truncate"
                        onMouseDown={() => { handleInputChange(setPlaceB, s.display_name.split(',').slice(0, 3).join(',')); setSuggestionsB([]) }}
                      >
                        📍 {s.display_name.split(',').slice(0, 3).join(', ')}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="arcade-btn px-12 py-4.5 text-base mt-2"
          >
            🔮 Match Our Vibes
          </button>
        </form>
      )}

      {error && (
        <div className="max-w-xl mx-auto my-6 px-6 py-4.5 bg-pastelPink text-brightPink border-4 border-black rounded-3xl font-black text-center shadow-[4px_4px_0_#000] relative">
          <span className="absolute -top-3 left-4 text-xs font-black bg-brightPink text-white px-2 py-0.5 border-2 border-black rounded-full">Error</span>
          ⚠️ {error}
        </div>
      )}

      {isLoading && (
        <div className="my-16 flex flex-col items-center gap-4">
          <LoadingOrbit />
          <span className="font-display font-black text-brightCyan text-sm tracking-wider animate-pulse uppercase">Syncing orbits at high speed...</span>
        </div>
      )}

      {/* Results Display */}
      {result && !isLoading && (
        <div className="flex flex-col gap-8 animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-cardBg border-4 border-black rounded-3xl p-6 md:p-8 shadow-[6px_6px_0px_#00f5d4] flex flex-col items-center gap-6 relative">
            <button
              onClick={() => { audioSystem.playClick(); setResult(null) }}
              className="absolute left-6 top-6 px-4 py-2 border-3 border-black bg-black text-white font-display text-xs font-black rounded-2xl shadow-[2px_2px_0_#000] hover:translate-y-[-1px] active:translate-y-[1px] transition-transform cursor-pointer"
            >
              ← Retry Match
            </button>

            {/* Score circle */}
            <div className="w-40 h-40 rounded-full border-4 border-black bg-pastelPink flex flex-col items-center justify-center shadow-[4px_4px_0_#000] mt-12 md:mt-0 relative overflow-hidden animate-pulse">
              <span className="font-display text-5xl font-black text-white">
                {result.totalScore}
              </span>
              <span className="text-[10px] font-black text-textSecondary uppercase tracking-wider -mt-1">
                / 36 pts
              </span>
              <span className="text-xs font-black text-black mt-2 bg-brightGreen border-2 border-black px-2.5 py-0.5 rounded-full shadow-[1.5px_1.5px_0_#000]">
                {result.percentage}% Match
              </span>
            </div>

            {/* Verdict */}
            <div className="text-center max-w-xl">
              <h2 className="font-graffiti text-2xl text-white mb-3">
                Cosmic Scoreboard Verdict
              </h2>
              <p className="font-body text-sm font-bold text-white leading-relaxed italic bg-pastelOrange/25 border-3 border-dashed border-black/40 rounded-3xl p-5 shadow-inner">
                "{result.summary}"
              </p>
            </div>

            {/* AI narrative */}
            {result.narrative && (
              <div className="bg-[#0b0d2c] border-3 border-black rounded-3xl p-6 max-w-2xl w-full flex flex-col gap-2 shadow-[3px_3px_0_#000]">
                <span className="self-start text-[10px] font-black uppercase tracking-wider text-black bg-brightPurple px-3 py-1 border-2 border-black rounded-full shadow-[2.5px_2.5px_0_#000] rotate-[-2deg]">
                  Gemini Synastry Breakdown
                </span>
                <p className="font-body text-sm font-bold text-purple-200 leading-relaxed mt-2.5">
                  {result.narrative}
                </p>
              </div>
            )}

            {/* Mangal Dosha flags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl border-t-2 border-black/20 pt-6">
              <div className="bg-[#0b0d2a] text-white border-3 border-black rounded-2xl p-4.5 shadow-[3px_3px_0_#000] flex justify-between items-center text-xs font-bold">
                <span className="font-black text-white">{result.personA.meta.name}'s Heat</span>
                <span className={result.mangalDoshaA ? "text-white bg-brightPink border-2 border-black px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-[1.5px_1.5px_0_#000]" : "text-black bg-brightGreen border-2 border-black px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-[1.5px_1.5px_0_#000]"}>
                  {result.mangalDoshaA ? "⚠️ Aggressive" : "✅ Chill"}
                </span>
              </div>
              <div className="bg-[#0b0d2a] text-white border-3 border-black rounded-2xl p-4.5 shadow-[3px_3px_0_#000] flex justify-between items-center text-xs font-bold">
                <span className="font-black text-white">{result.personB.meta.name}'s Heat</span>
                <span className={result.mangalDoshaB ? "text-white bg-brightPink border-2 border-black px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-[1.5px_1.5px_0_#000]" : "text-black bg-brightGreen border-2 border-black px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-[1.5px_1.5px_0_#000]"}>
                  {result.mangalDoshaB ? "⚠️ Aggressive" : "✅ Chill"}
                </span>
              </div>
              {result.hasMangalDoshaCancellation && (
                <div className="bg-pastelGreen border-3 border-black rounded-2xl p-4.5 shadow-[3px_3px_0_#000] text-xs font-black text-white text-center col-span-2">
                  💫 Double Trouble! Both runners have matching solar heat levels, neutralizing the friction. Perfect banter balance.
                </div>
              )}
            </div>

            {/* Share Card Trigger */}
            <button
              onClick={handleDownloadCard}
              className="arcade-btn px-8 py-3.5 text-xs font-black mt-2"
            >
              📥 Download Match Share Card (PNG)
            </button>
          </div>

          {/* 8 Kutas breakdown table */}
          <div className="bg-cardBg border-4 border-black rounded-3xl p-6 md:p-8 shadow-[6px_6px_0px_#00f5d4]">
            <h3 className="font-graffiti text-xl text-white mb-6 text-center">
              Synastry Parameter Breakdown
            </h3>
            <div className="flex flex-col gap-3">
              {result.kutas.map((kuta, index) => (
                <div
                  key={index}
                  className="bg-[#0b0d2a] border-3 border-black rounded-2xl p-4 shadow-[3px_3px_0_#000] flex flex-col md:flex-row md:items-center justify-between gap-3 text-white hover:scale-[1.01] transition-transform"
                >
                  <div className="flex flex-col gap-1 md:max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-black text-white text-base">
                        {kuta.name}
                      </span>
                      <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full border-2 border-black shadow-[1.5px_1.5px_0_#000] uppercase ${
                        kuta.compatible ? "bg-brightGreen text-black" : "bg-brightPink text-white"
                      }`}>
                        {kuta.compatible ? "Compatible" : "Tension"}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-textMuted leading-relaxed">
                      {kuta.description}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 self-end md:self-center font-display text-lg font-black text-white">
                    <span className="text-brightGold">{kuta.scored}</span>
                    <span className="text-xs font-black text-textMuted uppercase">/ {kuta.maxPoints} pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

