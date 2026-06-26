// All TypeScript types for OyeAstro engine

export interface BirthData {
  name: string
  birthDate: string   // YYYY-MM-DD
  birthTime: string   // HH:MM (24h)
  birthPlace: string
}

export interface GeoLocation {
  lat: number
  lon: number
  displayName: string
  timezone: string    // IANA e.g. "Asia/Kolkata"
  tzOffsetHours: number
  confidence?: number
}

export interface PlanetPositions {
  Su: number   // Sun sidereal longitude
  Mo: number   // Moon
  Ma: number   // Mars
  Me: number   // Mercury
  Ju: number   // Jupiter
  Ve: number   // Venus
  Sa: number   // Saturn
  Ra: number   // Rahu (North Node)
  Ke: number   // Ketu (South Node)
  Lagn: number // Ascendant
}

export interface PlanetPlacement {
  degree: number       // 0-29.99 within sign
  signIndex: number    // 0-11
  houseIndex: number   // 1-12
  longitude: number    // full 0-359 sidereal longitude
}

export interface HouseData {
  placements: Record<string, PlanetPlacement>
  houses: string[][]     // houses[0] = planets in H1, etc.
  lagnaSignIndex: number
}

export interface NakshatraInfo {
  name: string
  index: number      // 0-26
  pada: number       // 1-4
  ruler: string      // planet code
  longitude: number  // Moon longitude used
}

export interface DashaEntry {
  ruler: string
  rulerName: string
  start: Date
  end: Date
  startFormatted: string
  endFormatted: string
  yearsTotal: number
}

export interface DashaResult {
  nakshatra: NakshatraInfo
  timeline: DashaEntry[]
  activeDasha: DashaEntry
  activeAntardasha?: DashaEntry
  eraTitle: string
  eraTrack: string
  eraCopy: string
}

export interface Yoga {
  name: string
  detected: boolean
  description: string
}

export interface VibeScore {
  score: number          // 1-10
  label: string
  factors: { name: string; points: number; max: number }[]
}

export interface SocialMatch {
  bestie: string
  rival: string
  copy: string
}

export interface BigThree {
  rising: { sign: string; index: number; tag: string; copy: string }
  sun:    { sign: string; index: number; copy: string }
  moon:   { sign: string; index: number; copy: string }
}

export interface Remedies {
  stone: string
  color: string
  mantra: string
  tips: string
}

export interface ChartResult {
  meta: {
    id?: string
    name: string
    location: string
    lat: string
    lon: string
    timezone: string
    julianDay: number
    computedAt: string
  }
  positions: PlanetPositions
  houseData: HouseData
  bigThree: BigThree
  dasha: DashaResult
  yogas: Yoga[]
  vibeScore: VibeScore
  socialMatch: SocialMatch
  flags: { green: string[]; red: string[] }
  remedies: Remedies
  horoscope: string
  isPaid?: boolean
}

export interface KutaScore {
  name: string
  maxPoints: number
  scored: number
  compatible: boolean
  description: string
}

export interface CompatibilityResult {
  personA: ChartResult
  personB: ChartResult
  kutas: KutaScore[]
  totalScore: number
  maxScore: number
  percentage: number
  mangalDoshaA: boolean
  mangalDoshaB: boolean
  hasMangalDoshaCancellation: boolean
  narrative: string
  summary: string
}

export interface AICopyResult {
  love: string
  money: string
  career: string
  energy: string
  quote: string
}

export interface PremiumReport {
  dashaAnalysis: string
  transitDates: string
  careerWindows: string
  loveWindows: string
  healthWarnings: string
}

export interface VibeMetric {
  status: string
  emoji: string
  colorClass: string
}

export interface HorizonVibeData {
  money: VibeMetric
  love: VibeMetric
  energy: VibeMetric
  score: number
  interpretation: string
}

export interface CosmicVibeResult {
  today: HorizonVibeData
  week: HorizonVibeData
  month: HorizonVibeData
}

export interface TransitData {
  date: string
  positions: PlanetPositions
  cachedAt: string
}

