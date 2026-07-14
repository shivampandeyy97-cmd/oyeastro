/**
 * OyeAstro - Vedic Astrology Calculation Engine
 * Uses Swiss Ephemeris (swisseph) with Lahiri Ayanamsa + Whole Sign houses
 * Timezone: geo-tz npm package (offline, no API key)
 * Geocoding: Nominatim OSM (free, no key) with Redis cache + CITIES_DB fallback
 */

import type { BirthData, ChartResult, GeoLocation, HouseData, PlanetPositions, DashaResult, DashaEntry, Yoga, VibeScore, NakshatraInfo } from './types'
import {
  RASHI_NAMES, PLANET_NAMES, NAKSHATRAS, DASHA_SEQUENCE, DASHA_YEARS,
  LAGNA_INTERPRETATIONS, SUN_INTERPRETATIONS, MOON_INTERPRETATIONS,
  DASHA_INTERPRETATIONS, ZODIAC_MATCHES, HOROSCOPES, REMEDIES_DB,
  CITIES_DB, RASHI_LORDS, PLANET_FRIENDSHIP,
} from './constants'

// ─── Swiss Ephemeris Setup ─────────────────────────────────────────────────

import SwissEph from 'swisseph-wasm'

let sweInstance: SwissEph | null = null

async function getSwe() {
  if (!sweInstance) {
    const swe = new SwissEph()
    await swe.initSwissEph()
    // Set Lahiri Ayanamsa (SE_SIDM_LAHIRI = 1)
    swe.set_sid_mode(swe.SE_SIDM_LAHIRI, 0, 0)
    sweInstance = swe
  }
  return sweInstance
}

// ─── Geocoding ─────────────────────────────────────────────────────────────

const geocodeCache: Record<string, GeoLocation> = {}

export async function geocode(place: string): Promise<GeoLocation> {
  const query = place.trim().toLowerCase()

  if (geocodeCache[query]) {
    return geocodeCache[query]
  }

  const resolveAndCache = (loc: GeoLocation): GeoLocation => {
    geocodeCache[query] = loc
    return loc
  }

  // 0. Check if manual coordinates (e.g. "coords:12.34,56.78" or just "12.34,56.78")
  if (query.startsWith('coords:') || /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(query)) {
    const cleanStr = query.replace('coords:', '')
    const [latStr, lonStr] = cleanStr.split(',')
    const lat = parseFloat(latStr)
    const lon = parseFloat(lonStr)
    if (!isNaN(lat) && !isNaN(lon)) {
      return resolveAndCache({
        lat,
        lon,
        displayName: `Manual Coords (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
        timezone: 'UTC',
        tzOffsetHours: 0,
        confidence: 1.0
      })
    }
  }

  // 1. Check static city DB first (instant, zero network)
  for (const [key, city] of Object.entries(CITIES_DB)) {
    if (query === key || query.includes(key) || key.includes(query.split(',')[0].trim())) {
      const tzOff = getTzOffsetFromIANA(city.timezone, new Date())
      return resolveAndCache({ lat: city.lat, lon: city.lon, displayName: city.name, timezone: city.timezone, tzOffsetHours: tzOff, confidence: 1.0 })
    }
  }

  // 2. Nominatim geocoding (free OSM API, no key, 1 req/sec)
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}&limit=1&addressdetails=0`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'OyeAstro/2.0 (oyeastro.com contact:shivampandeyy97@gmail.com)' },
      signal: AbortSignal.timeout(1500),
    })
    if (res.ok) {
      const data = await res.json()
      if (data.length > 0) {
        const lat = parseFloat(data[0].lat)
        const lon = parseFloat(data[0].lon)
        const tz = getTimezoneFromCoords(lat, lon)
        const tzOff = getTzOffsetFromIANA(tz, new Date())
        const importance = data[0].importance !== undefined ? parseFloat(data[0].importance) : 0.5
        return resolveAndCache({ lat, lon, displayName: data[0].display_name, timezone: tz, tzOffsetHours: tzOff, confidence: importance })
      }
    }
  } catch {
    // Network error — fall through to hash fallback
  }

  // 3. Deterministic hash fallback (preserves original behavior)
  let hash = 0
  for (let i = 0; i < query.length; i++) {
    hash = query.charCodeAt(i) + ((hash << 5) - hash)
  }
  const lat = 10 + (Math.abs(hash % 40))
  const lon = -120 + (Math.abs((hash >> 3) % 240))
  const tz = 'UTC'
  return resolveAndCache({ lat, lon, displayName: place, timezone: tz, tzOffsetHours: 0, confidence: 0.1 })
}

// ─── TimeZoneDB Historical Timezone Query ───────────────────────────────────

export async function getTimezoneOffset(
  lat: number,
  lon: number,
  dateStr: string,
  timeStr: string
): Promise<{ timezone: string; tzOffsetHours: number }> {
  const key = process.env.TIMEZONEDB_API_KEY
  const localDate = new Date(`${dateStr}T${timeStr}:00Z`)
  const localTimestamp = Math.floor(localDate.getTime() / 1000)

  if (key) {
    try {
      const url = `https://api.timezonedb.com/v2.1/get-time-zone?key=${key}&format=json&by=position&lat=${lat}&lng=${lon}&time=${localTimestamp}`
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
      if (res.ok) {
        const data = await res.json()
        if (data.status === 'OK') {
          return {
            timezone: data.zoneName || 'UTC',
            tzOffsetHours: (data.gmtOffset ?? 0) / 3600,
          }
        }
      }
    } catch (e) {
      console.warn('[TimeZoneDB] Request failed, using offline fallback:', e)
    }
  }

  // Offline fallback
  const timezone = getTimezoneFromCoords(lat, lon)
  const tzOffsetHours = getTzOffsetFromIANA(timezone, new Date(`${dateStr}T${timeStr}:00`))
  return { timezone, tzOffsetHours }
}

// geo-tz: offline timezone from lat/lon (no API call)
function getTimezoneFromCoords(lat: number, lon: number): string {
  // Ultra-fast check for India (covers >98% of users)
  if (lat > 6 && lat < 37 && lon > 68 && lon < 98) {
    return 'Asia/Kolkata'
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { find } = require('geo-tz')
    const results = find(lat, lon)
    return results[0] ?? 'UTC'
  } catch {
    // Rough TZ from longitude if geo-tz fails
    const offset = Math.round(lon / 15)
    return `Etc/GMT${offset >= 0 ? '-' : '+'}${Math.abs(offset)}`
  }
}

// Get UTC offset in hours for a given IANA timezone at a specific date
function getTzOffsetFromIANA(tz: string, date: Date): number {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      timeZoneName: 'shortOffset',
    })
    const parts = formatter.formatToParts(date)
    const tzPart = parts.find(p => p.type === 'timeZoneName')?.value ?? 'GMT+0'
    const match = tzPart.match(/GMT([+-]\d+(?::\d+)?)/)
    if (!match) return 0
    const [h, m] = match[1].split(':').map(Number)
    return h + (m ? (h < 0 ? -m / 60 : m / 60) : 0)
  } catch {
    return 0
  }
}

// ─── Julian Day Number ──────────────────────────────────────────────────────

export async function julianDay(year: number, month: number, day: number, utHour: number): Promise<number> {
  const swe = await getSwe()
  return swe.julday(year, month, day, utHour)
}

// ─── Planet Computation ─────────────────────────────────────────────────────

export async function computePlanets(jd: number): Promise<PlanetPositions> {
  const swe = await getSwe()
  const flags = swe.SEFLG_SIDEREAL | swe.SEFLG_SPEED

  function getPlanetLon(planetId: number): number {
    const result = swe.calc_ut(jd, planetId, flags)
    const lon = result[0]
    return ((lon % 360) + 360) % 360
  }

  const Su  = getPlanetLon(swe.SE_SUN)
  const Mo  = getPlanetLon(swe.SE_MOON)
  const Ma  = getPlanetLon(swe.SE_MARS)
  const Me  = getPlanetLon(swe.SE_MERCURY)
  const Ju  = getPlanetLon(swe.SE_JUPITER)
  const Ve  = getPlanetLon(swe.SE_VENUS)
  const Sa  = getPlanetLon(swe.SE_SATURN)
  const Ra  = getPlanetLon(swe.SE_MEAN_NODE)   // Mean Rahu (North Node)
  const Ke  = ((Ra + 180) % 360 + 360) % 360   // Ketu is exactly opposite
  const Lagn = 0 // placeholder; will be set by computeLagna

  return { Su, Mo, Ma, Me, Ju, Ve, Sa, Ra, Ke, Lagn }
}

// ─── Lagna (Ascendant) via swe_houses ──────────────────────────────────────

export async function computeLagna(jd: number, lat: number, lon: number): Promise<number> {
  const swe = await getSwe()
  // Whole Sign houses ('W')
  const result = swe.houses(jd, lat, lon, 'W') as any
  if (!result || !result.ascmc || result.ascmc.length === 0) {
    return 0
  }
  return ((result.ascmc[0] % 360) + 360) % 360
}

// ─── House Placements ───────────────────────────────────────────────────────

export function getHousePlacements(positions: PlanetPositions): HouseData {
  const lagnaSignIndex = Math.floor(positions.Lagn / 30)
  const placements: HouseData['placements'] = {}
  const houses: string[][] = Array.from({ length: 12 }, () => [])

  for (const [code, lon] of Object.entries(positions)) {
    const signIndex = Math.floor(lon / 30)
    const houseIndex = ((signIndex - lagnaSignIndex + 12) % 12) + 1
    placements[code] = {
      degree: lon % 30,
      signIndex,
      houseIndex,
      longitude: lon,
    }
    if (code !== 'Lagn') {
      houses[(houseIndex - 1)].push(code)
    }
  }

  return { placements, houses, lagnaSignIndex }
}

// ─── Nakshatra ─────────────────────────────────────────────────────────────

export function computeNakshatra(moonLon: number): NakshatraInfo {
  const nakshatraWidth = 360 / 27
  const padaWidth = nakshatraWidth / 4
  const index = Math.floor(moonLon / nakshatraWidth)
  const posWithinNakshatra = moonLon % nakshatraWidth
  const pada = Math.floor(posWithinNakshatra / padaWidth) + 1
  const nk = NAKSHATRAS[index]
  return { name: nk.name, index, pada, ruler: nk.ruler, longitude: moonLon }
}

// ─── Vimshottari Dasha ─────────────────────────────────────────────────────

export function computeVimshottariDasha(moonLon: number, birthDateStr: string, birthTimeStr: string): DashaResult {
  const nakshatraWidth = 360 / 27
  const nakshatraIndex = Math.floor(moonLon / nakshatraWidth)
  const posInNakshatra = moonLon % nakshatraWidth
  const traversePercent = posInNakshatra / nakshatraWidth

  const nakshatra = NAKSHATRAS[nakshatraIndex]
  const nakInfo = computeNakshatra(moonLon)

  const startRulerIndex = DASHA_SEQUENCE.indexOf(nakshatra.ruler as typeof DASHA_SEQUENCE[number])
  const remainingFirstYears = DASHA_YEARS[nakshatra.ruler] * (1 - traversePercent)

  const birthDate = new Date(`${birthDateStr}T${birthTimeStr}:00`)
  const timeline: DashaEntry[] = []
  let currentMs = birthDate.getTime()

  // First partial dasha
  const firstDurationMs = remainingFirstYears * 365.25 * 24 * 3600000
  const firstRuler = DASHA_SEQUENCE[startRulerIndex]
  timeline.push(buildEntry(firstRuler, currentMs, currentMs + firstDurationMs, DASHA_YEARS[firstRuler]))
  currentMs += firstDurationMs

  // Following 8 full dashas
  for (let i = 1; i < 9; i++) {
    const rulerIndex = (startRulerIndex + i) % 9
    const ruler = DASHA_SEQUENCE[rulerIndex]
    const durationMs = DASHA_YEARS[ruler] * 365.25 * 24 * 3600000
    timeline.push(buildEntry(ruler, currentMs, currentMs + durationMs, DASHA_YEARS[ruler]))
    currentMs += durationMs
  }

  const now = Date.now()
  const activeDasha = timeline.find(d => now >= d.start.getTime() && now <= d.end.getTime()) ?? timeline[0]
  const interp = DASHA_INTERPRETATIONS[activeDasha.ruler]

  // Compute antardasha (sub-dasha within active mahadasha)
  const activeAntardasha = computeAntardasha(activeDasha)

  return {
    nakshatra: nakInfo,
    timeline,
    activeDasha,
    activeAntardasha,
    eraTitle: interp.title,
    eraTrack: interp.track,
    eraCopy:  interp.copy,
  }
}

function buildEntry(ruler: string, startMs: number, endMs: number, yearsTotal: number): DashaEntry {
  const start = new Date(startMs)
  const end = new Date(endMs)
  return {
    ruler,
    rulerName: PLANET_NAMES[ruler],
    start,
    end,
    startFormatted: start.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
    endFormatted:   end.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
    yearsTotal,
  }
}

function computeAntardasha(mahadasha: DashaEntry): DashaEntry {
  const mhRulerIndex = DASHA_SEQUENCE.indexOf(mahadasha.ruler as typeof DASHA_SEQUENCE[number])
  const mhTotalMs = mahadasha.end.getTime() - mahadasha.start.getTime()
  const now = Date.now()
  let currentMs = mahadasha.start.getTime()

  for (let i = 0; i < 9; i++) {
    const adRuler = DASHA_SEQUENCE[(mhRulerIndex + i) % 9]
    const adDurationMs = (DASHA_YEARS[adRuler] / 120) * mhTotalMs
    if (now >= currentMs && now < currentMs + adDurationMs) {
      return buildEntry(adRuler, currentMs, currentMs + adDurationMs, DASHA_YEARS[adRuler])
    }
    currentMs += adDurationMs
  }

  // fallback to first antardasha
  const adRuler = DASHA_SEQUENCE[mhRulerIndex]
  const adDurationMs = (DASHA_YEARS[adRuler] / 120) * mhTotalMs
  return buildEntry(adRuler, mahadasha.start.getTime(), mahadasha.start.getTime() + adDurationMs, DASHA_YEARS[adRuler])
}

// ─── Yoga Detection ─────────────────────────────────────────────────────────

export function computeYogas(positions: PlanetPositions, houseData: HouseData): Yoga[] {
  const yogas: Yoga[] = []
  const { placements } = houseData

  // 1. Budhaditya Yoga: Sun and Mercury in same sign
  const suHouse = placements['Su']?.houseIndex
  const meHouse = placements['Me']?.houseIndex
  yogas.push({
    name: 'Budhaditya Yoga',
    detected: suHouse === meHouse,
    description: suHouse === meHouse
      ? '☀️ Sun + Mercury in same house → Sharp intellect, excellent communication, natural leadership. You\'re built for public life.'
      : 'Sun and Mercury in different signs — sharp but scattered focus.',
  })

  // 2. Gaja Kesari Yoga: Moon in kendra (1,4,7,10) from Jupiter
  const moSign = placements['Mo']?.signIndex ?? 0
  const juSign = placements['Ju']?.signIndex ?? 0
  const diff = Math.abs(moSign - juSign) % 12
  const isKendra = [0, 3, 6, 9].includes(diff)
  yogas.push({
    name: 'Gaja Kesari Yoga',
    detected: isKendra,
    description: isKendra
      ? '🐘 Moon-Jupiter kendra → Wisdom, popularity, and fame. People trust you without explanation. Major social magnetism.'
      : 'Moon and Jupiter not in kendra — build trust through consistent action.',
  })

  // 3. Kemadruma Dosha: Moon has no planets in adjacent houses (2nd and 12th from it)
  const moHouse = placements['Mo']?.houseIndex ?? 1
  const h2 = moHouse === 12 ? 1 : moHouse + 1
  const h12 = moHouse === 1 ? 12 : moHouse - 1
  const hasNeighbor = Object.entries(placements).some(
    ([code, p]) => code !== 'Mo' && code !== 'Lagn' && code !== 'Ra' && code !== 'Ke'
      && (p.houseIndex === h2 || p.houseIndex === h12)
  )
  yogas.push({
    name: 'Kemadruma Dosha',
    detected: !hasNeighbor,
    description: !hasNeighbor
      ? '⚠️ Moon is isolated — emotional independence is your strength but loneliness can creep in. Ground yourself with routine.'
      : '✅ Moon well-supported — emotional stability and good family bonds indicated.',
  })

  // 4. Saraswati Yoga: Jupiter, Venus, Mercury in kendra or trikona
  const kendraTrikona = [1, 4, 5, 7, 9, 10]
  const veH = placements['Ve']?.houseIndex ?? 0
  const juH = placements['Ju']?.houseIndex ?? 0
  const meH = placements['Me']?.houseIndex ?? 0
  const saraswati = kendraTrikona.includes(veH) && kendraTrikona.includes(juH) && kendraTrikona.includes(meH)
  yogas.push({
    name: 'Saraswati Yoga',
    detected: saraswati,
    description: saraswati
      ? '🎨 Ju+Ve+Me in kendra/trikona → Creative genius. Arts, music, writing, and beauty are your domains. You have a gift.'
      : 'Creative planets scattered — express yourself consistently to build your creative identity.',
  })

  return yogas
}

// ─── Vibe Score ─────────────────────────────────────────────────────────────

export function computeVibeScore(
  positions: PlanetPositions,
  transitPositions: PlanetPositions,
  dasha: DashaResult,
): VibeScore {
  const factors: { name: string; points: number; max: number }[] = []

  // Factor 1: Active dasha ruler quality (benefic = higher)
  const benefics = ['Ju', 'Ve', 'Mo', 'Me']
  const dashaPts = benefics.includes(dasha.activeDasha.ruler) ? 2 : 1
  factors.push({ name: 'Dasha Energy', points: dashaPts, max: 2 })

  // Factor 2: Moon phase (transit Moon to natal Moon)
  const moonDiff = Math.abs(transitPositions.Mo - positions.Mo) % 360
  const moonPhaseScore = moonDiff < 60 || moonDiff > 300 ? 2 : moonDiff < 120 ? 1 : 0
  factors.push({ name: 'Moon Resonance', points: moonPhaseScore, max: 2 })

  // Factor 3: Jupiter transit to natal Moon (good aspect = trine/conjunction)
  const juMooDiff = Math.abs(transitPositions.Ju - positions.Mo) % 360
  const juTransitPts = juMooDiff < 30 || (juMooDiff > 115 && juMooDiff < 125) || (juMooDiff > 235 && juMooDiff < 245) ? 2 : 1
  factors.push({ name: 'Jupiter Blessing', points: juTransitPts, max: 2 })

  // Factor 4: Saturn transit to natal Sun (hard aspect = lower)
  const saSunDiff = Math.abs(transitPositions.Sa - positions.Su) % 360
  const saTransitPts = saSunDiff < 30 || (saSunDiff > 85 && saSunDiff < 95) ? 0 : saSunDiff > 115 && saSunDiff < 125 ? 2 : 1
  factors.push({ name: 'Saturn Pressure', points: saTransitPts, max: 2 })

  // Factor 5: Rahu transit to natal Lagna (volatile but energising)
  const raLagnDiff = Math.abs(transitPositions.Ra - positions.Lagn) % 360
  const raTransitPts = raLagnDiff < 30 || raLagnDiff > 330 ? 1 : 0
  factors.push({ name: 'Rahu Surge', points: raTransitPts, max: 1 })

  // Factor 6: Antardasha ruler benefic
  const adBenefic = dasha.activeAntardasha && benefics.includes(dasha.activeAntardasha.ruler) ? 1 : 0
  factors.push({ name: 'Antardasha Boost', points: adBenefic, max: 1 })

  // Total: max 10
  const totalPts = factors.reduce((a, f) => a + f.points, 0)
  const score = Math.round((totalPts / 10) * 10)

  const labels = ['', '', 'Cloudy ☁️', 'Low Vibe 🌫️', 'Meh 😐', 'Okay ✨', 'Rising 🌙', 'Good Vibes 💫', 'High Energy 🔥', 'Thriving 🌟', 'Cosmic Peak 🚀']
  return { score: Math.max(1, score), label: labels[Math.max(1, score)] ?? 'Rising 🌙', factors }
}

// ─── Flags & Remedies ───────────────────────────────────────────────────────

export function getFlags(lagnaIdx: number, sunIdx: number, moonIdx: number): { green: string[]; red: string[] } {
  const green: string[] = []
  const red: string[] = []

  if (lagnaIdx === sunIdx) {
    green.push('High alignment: Your outer mask matches your core. Unapologetically you.')
  } else {
    green.push('Mystery shield: You give off a completely different vibe than who you really are.')
  }

  if ([3, 11, 1].includes(moonIdx)) {
    green.push('Vibe check: Elite emotional resilience. You handle drama like a pro.')
  } else {
    green.push('Highly intuitive: You absorb room energy instantly. Great lie detector.')
  }

  if (sunIdx === 6) red.push('Indecisiveness: You will literally starve before choosing a lunch spot.')
  if (moonIdx === 7) red.push('Trust limits: You check read-receipts and look for hidden meanings in a single emoji.')
  if ([0, 4].includes(lagnaIdx)) red.push('Main-character syndrome: You low-key think every sad song was written about your life.')

  if (green.length < 2) green.push('Loyalty level: 100%. You protect your crew at all costs.')
  if (red.length < 1) red.push('Ghosting mode: You toggle Do Not Disturb when slightly overwhelmed.')

  return { green, red }
}

// ─── Full Chart Builder ─────────────────────────────────────────────────────

export async function buildChart(data: BirthData, transitPositions?: PlanetPositions): Promise<ChartResult> {
  const { name, birthDate, birthTime, birthPlace } = data

  // 1. Geocode
  const locRaw = await geocode(birthPlace)

  // 2. Get accurate timezone and offset at birth time
  const tzInfo = await getTimezoneOffset(locRaw.lat, locRaw.lon, birthDate, birthTime)
  const loc: GeoLocation = {
    ...locRaw,
    timezone: tzInfo.timezone,
    tzOffsetHours: tzInfo.tzOffsetHours,
  }

  // 3. Parse date/time into UTC
  const [year, month, day] = birthDate.split('-').map(Number)
  const [hour, minute] = birthTime.split(':').map(Number)
  const localHour = hour + minute / 60
  const utcHour = localHour - loc.tzOffsetHours

  // 4. Julian Day
  const jd = await julianDay(year, month, day, utcHour)

  // 5. Planet positions
  const rawPositions = await computePlanets(jd)

  // 6. Lagna
  const lagnaLon = await computeLagna(jd, loc.lat, loc.lon)
  const positions: PlanetPositions = { ...rawPositions, Lagn: lagnaLon }

  // 7. House data
  const houseData = getHousePlacements(positions)
  const lagnaSignIdx = houseData.lagnaSignIndex
  const sunSignIdx   = Math.floor(positions.Su / 30)
  const moonSignIdx  = Math.floor(positions.Mo / 30)

  // 8. Dasha
  const dasha = computeVimshottariDasha(positions.Mo, birthDate, birthTime)

  // 9. Yogas
  const yogas = computeYogas(positions, houseData)

  // 10. Vibe Score
  const transits = transitPositions ?? positions // fallback to natal if no transits
  const vibeScore = computeVibeScore(positions, transits, dasha)

  // 11. Interpretations
  const lagnaInterp = LAGNA_INTERPRETATIONS[lagnaSignIdx]

  return {
    meta: {
      name,
      location: loc.displayName,
      lat: loc.lat.toFixed(3),
      lon: loc.lon.toFixed(3),
      timezone: loc.timezone,
      julianDay: jd,
      computedAt: new Date().toISOString(),
    },
    positions,
    houseData,
    bigThree: {
      rising: { sign: RASHI_NAMES[lagnaSignIdx], index: lagnaSignIdx, tag: lagnaInterp.tag, copy: lagnaInterp.copy },
      sun:    { sign: RASHI_NAMES[sunSignIdx],   index: sunSignIdx,   copy: SUN_INTERPRETATIONS[sunSignIdx] },
      moon:   { sign: RASHI_NAMES[moonSignIdx],  index: moonSignIdx,  copy: MOON_INTERPRETATIONS[moonSignIdx] },
    },
    dasha,
    yogas,
    vibeScore,
    socialMatch: ZODIAC_MATCHES[lagnaSignIdx] ?? ZODIAC_MATCHES[0],
    flags: getFlags(lagnaSignIdx, sunSignIdx, moonSignIdx),
    remedies: REMEDIES_DB[moonSignIdx] ?? REMEDIES_DB[0],
    horoscope: HOROSCOPES[lagnaSignIdx] ?? HOROSCOPES[0],
  }
}

// ─── Today's Transits ───────────────────────────────────────────────────────

export async function getTodayTransits(): Promise<PlanetPositions> {
  const now = new Date()
  const jd = await julianDay(
    now.getUTCFullYear(),
    now.getUTCMonth() + 1,
    now.getUTCDate(),
    now.getUTCHours() + now.getUTCMinutes() / 60,
  )
  const pos = await computePlanets(jd)
  const lagnaLon = 0 // transits don't have a personal lagna
  return { ...pos, Lagn: lagnaLon }
}
