'use client'

import { useState, useRef, useEffect } from 'react'
import type { BirthData, CompatibilityResult } from '@/lib/astro/types'
import LoadingOrbit from './LoadingOrbit'

interface CitySuggestion {
  display_name: string
  lat: string
  lon: string
}

export default function CompatibilityBoard() {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!dateA || !timeA || !placeA || !dateB || !timeB || !placeB) return

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please check your inputs.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadCard = async () => {
    if (!result) return
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
    } catch {
      window.open(url, '_blank')
    }
  }

  const inputClass = "w-full pl-10 pr-3 py-3 border-2 border-espresso rounded-neoSm font-body text-sm font-medium text-espresso bg-white neo-input focus:outline-none transition-all"

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-8 mt-6">
      {/* Intake Forms Panel */}
      {!result && !isLoading && (
        <form onSubmit={handleSubmit} className="bg-cardBg border-2 border-espresso rounded-neoLg p-8 shadow-neoLg flex flex-col gap-6 relative">
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-center text-espresso">
            💞 Cosmic Compatibility Matcher
          </h1>
          <p className="text-textSecondary text-sm text-center -mt-3">
            Real 8-Kuta Vedic Ashtakoot (36 points) analysis & Gemini-narrated match alignment.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Person A Box */}
            <div className="flex flex-col gap-4 bg-pastelPurple/30 border-2 border-espresso border-dashed rounded-neoLg p-6">
              <h2 className="font-display text-lg font-extrabold text-espresso border-b-2 border-espresso pb-1">
                Person A (You)
              </h2>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-textSecondary">Name</label>
                <input
                  type="text"
                  value={nameA}
                  onChange={e => setNameA(e.target.value)}
                  placeholder="e.g. Alex"
                  className={inputClass}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-textSecondary">Birth Date</label>
                <input
                  type="date"
                  value={dateA}
                  onChange={e => setDateA(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-textSecondary">Birth Time</label>
                <input
                  type="time"
                  value={timeA}
                  onChange={e => setTimeA(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>

              <div className="flex flex-col gap-1 relative">
                <label className="text-xs font-bold uppercase tracking-wider text-textSecondary">Birth Place</label>
                <input
                  type="text"
                  value={placeA}
                  onChange={e => { setPlaceA(e.target.value); setShowSuggestionsA(true) }}
                  onBlur={() => setTimeout(() => setShowSuggestionsA(false), 200)}
                  placeholder="e.g. Mumbai, India"
                  className={inputClass}
                  required
                  autoComplete="off"
                />
                {showSuggestionsA && suggestionsA.length > 0 && (
                  <ul className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-espresso rounded-neoSm shadow-neo z-50 overflow-hidden">
                    {suggestionsA.map((s, i) => (
                      <li
                        key={i}
                        className="px-3 py-2 text-xs cursor-pointer hover:bg-pastelOrange border-b border-espresso/10 last:border-0 truncate"
                        onMouseDown={() => { setPlaceA(s.display_name.split(',').slice(0, 3).join(',')); setSuggestionsA([]) }}
                      >
                        📍 {s.display_name.split(',').slice(0, 3).join(', ')}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Person B Box */}
            <div className="flex flex-col gap-4 bg-pastelOrange/20 border-2 border-espresso border-dashed rounded-neoLg p-6">
              <h2 className="font-display text-lg font-extrabold text-espresso border-b-2 border-espresso pb-1">
                Person B (Them)
              </h2>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-textSecondary">Name</label>
                <input
                  type="text"
                  value={nameB}
                  onChange={e => setNameB(e.target.value)}
                  placeholder="e.g. Sarah"
                  className={inputClass}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-textSecondary">Birth Date</label>
                <input
                  type="date"
                  value={dateB}
                  onChange={e => setDateB(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-textSecondary">Birth Time</label>
                <input
                  type="time"
                  value={timeB}
                  onChange={e => setTimeB(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>

              <div className="flex flex-col gap-1 relative">
                <label className="text-xs font-bold uppercase tracking-wider text-textSecondary">Birth Place</label>
                <input
                  type="text"
                  value={placeB}
                  onChange={e => { setPlaceB(e.target.value); setShowSuggestionsB(true) }}
                  onBlur={() => setTimeout(() => setShowSuggestionsB(false), 200)}
                  placeholder="e.g. Delhi, India"
                  className={inputClass}
                  required
                  autoComplete="off"
                />
                {showSuggestionsB && suggestionsB.length > 0 && (
                  <ul className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-espresso rounded-neoSm shadow-neo z-50 overflow-hidden">
                    {suggestionsB.map((s, i) => (
                      <li
                        key={i}
                        className="px-3 py-2 text-xs cursor-pointer hover:bg-pastelOrange border-b border-espresso/10 last:border-0 truncate"
                        onMouseDown={() => { setPlaceB(s.display_name.split(',').slice(0, 3).join(',')); setSuggestionsB([]) }}
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
            className="px-10 py-4 bg-brightOrange text-white font-display text-lg font-extrabold border-2 border-espresso rounded-neoSm shadow-neo hover:scale-[1.02] transition-transform cursor-pointer"
          >
            🔮 Match Our Vibes
          </button>
        </form>
      )}

      {error && (
        <div className="max-w-xl mx-auto my-6 px-4 py-3 bg-pastelPink text-brightPink border-2 border-espresso rounded-neoSm font-bold text-center shadow-neoSm">
          ⚠️ {error}
        </div>
      )}

      {isLoading && (
        <div className="my-16 flex flex-col items-center gap-4">
          <LoadingOrbit />
          <span className="font-display font-bold text-espresso text-sm tracking-wider">Matching your orbits...</span>
        </div>
      )}

      {/* Results Display */}
      {result && !isLoading && (
        <div className="flex flex-col gap-8 animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-cardBg border-2 border-espresso rounded-neoLg p-6 md:p-8 shadow-neoLg flex flex-col items-center gap-6 relative">
            <button
              onClick={() => setResult(null)}
              className="absolute left-6 top-6 px-4 py-2 border-2 border-espresso bg-white font-display text-xs font-extrabold rounded-neoSm shadow-neoSm hover:scale-[1.02] transition-transform cursor-pointer"
            >
              ← Back to Matcher
            </button>

            {/* Score circle */}
            <div className="w-40 h-40 rounded-full border-4 border-espresso bg-pastelPink flex flex-col items-center justify-center shadow-neo mt-12 md:mt-0">
              <span className="font-display text-4xl md:text-5xl font-black text-espresso">
                {result.totalScore}
              </span>
              <span className="text-xs font-bold text-textSecondary uppercase tracking-wider -mt-1">
                / 36 pts
              </span>
              <span className="text-xs font-extrabold text-brightPurple mt-1 bg-white border border-espresso px-2 py-0.5 rounded-full">
                {result.percentage}% Match
              </span>
            </div>

            {/* Verdict */}
            <div className="text-center max-w-xl">
              <h2 className="font-display text-2xl font-black text-espresso mb-2">
                The Cosmic Verdict
              </h2>
              <p className="font-body text-sm font-bold text-espresso leading-relaxed italic bg-pastelOrange/25 border-2 border-dashed border-espresso/20 rounded-neoSm p-4">
                "{result.summary}"
              </p>
            </div>

            {/* AI narrative */}
            {result.narrative && (
              <div className="bg-pastelPurple/20 border-2 border-espresso rounded-neoLg p-6 max-w-2xl w-full flex flex-col gap-2">
                <span className="self-start text-[10px] font-bold uppercase tracking-wider text-brightPurple bg-pastelPurple px-2.5 py-0.5 border-2 border-espresso rounded-full shadow-neoSm">
                  Gemini Cosmic Narrative
                </span>
                <p className="font-body text-sm font-semibold text-espresso leading-relaxed mt-2">
                  {result.narrative}
                </p>
              </div>
            )}

            {/* Mangal Dosha flags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl border-t-2 border-espresso/10 pt-6">
              <div className="bg-white border-2 border-espresso rounded-neoSm p-3 shadow-neoSm flex justify-between items-center text-xs font-bold">
                <span>{result.personA.meta.name}'s Mars Vibe</span>
                <span className={result.mangalDoshaA ? "text-brightPink bg-pastelPink border border-espresso px-2 py-0.5 rounded" : "text-brightGreen bg-pastelGreen border border-espresso px-2 py-0.5 rounded"}>
                  {result.mangalDoshaA ? "⚠️ Mangal Dosha" : "✅ No Dosha"}
                </span>
              </div>
              <div className="bg-white border-2 border-espresso rounded-neoSm p-3 shadow-neoSm flex justify-between items-center text-xs font-bold">
                <span>{result.personB.meta.name}'s Mars Vibe</span>
                <span className={result.mangalDoshaB ? "text-brightPink bg-pastelPink border border-espresso px-2 py-0.5 rounded" : "text-brightGreen bg-pastelGreen border border-espresso px-2 py-0.5 rounded"}>
                  {result.mangalDoshaB ? "⚠️ Mangal Dosha" : "✅ No Dosha"}
                </span>
              </div>
              {result.hasMangalDoshaCancellation && (
                <div className="bg-pastelGreen border-2 border-espresso rounded-neoSm p-3 shadow-neoSm text-xs font-bold text-espresso text-center col-span-2">
                  💫 Double Trouble! Both have Mangal Dosha, which cancel out naturally. Banter remains high.
                </div>
              )}
            </div>

            {/* Share Card Trigger */}
            <button
              onClick={handleDownloadCard}
              className="mt-2 px-8 py-3 bg-brightPurple text-white font-display text-sm font-extrabold border-2 border-espresso rounded-neoSm shadow-neo hover:scale-[1.02] transition-transform cursor-pointer"
            >
              📥 Download Match Share Card (PNG)
            </button>
          </div>

          {/* 8 Kutas breakdown table */}
          <div className="bg-cardBg border-2 border-espresso rounded-neoLg p-6 md:p-8 shadow-neoLg">
            <h3 className="font-display text-xl font-black text-espresso mb-4 text-center">
              Ashtakoot 8-Kuta Score Breakdown
            </h3>
            <div className="flex flex-col gap-3">
              {result.kutas.map((kuta, index) => (
                <div
                  key={index}
                  className="bg-white border-2 border-espresso rounded-neoSm p-4 shadow-neoSm flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="flex flex-col gap-1 md:max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-extrabold text-espresso text-base">
                        {kuta.name}
                      </span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border border-espresso ${
                        kuta.compatible ? "bg-pastelGreen text-brightGreen" : "bg-pastelPink text-brightPink"
                      }`}>
                        {kuta.compatible ? "Compatible" : "Tension"}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-textSecondary leading-relaxed">
                      {kuta.description}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 self-end md:self-center font-display text-lg font-black text-espresso">
                    <span>{kuta.scored}</span>
                    <span className="text-xs font-bold text-textMuted uppercase">/ {kuta.maxPoints} pts</span>
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
