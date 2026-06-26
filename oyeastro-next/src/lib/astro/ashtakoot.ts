/**
 * Ashtakoot Compatibility Engine
 * Computes 8 kutas (36 points total) for Vedic match-making
 * Plus Mangal Dosha detection
 */

import type { ChartResult, KutaScore, CompatibilityResult } from './types'
import { NAKSHATRAS, RASHI_LORDS, PLANET_FRIENDSHIP } from './constants'

// ─── Kuta 1: Varna (1 point) ────────────────────────────────────────────────
// Varna = spiritual class based on lagna lord element
function getVarna(lagnaIdx: number): number {
  const lord = RASHI_LORDS[lagnaIdx]
  // Brahmin: Ju, Ve, Mo; Kshatriya: Su, Ma; Vaishya: Me; Shudra: Sa, Ra, Ke
  if (['Ju', 'Ve', 'Mo'].includes(lord)) return 4  // Brahmin
  if (['Su', 'Ma'].includes(lord)) return 3         // Kshatriya
  if (['Me'].includes(lord)) return 2              // Vaishya
  return 1                                          // Shudra
}

function computeVarna(a: ChartResult, b: ChartResult): KutaScore {
  const varnaA = getVarna(a.houseData.lagnaSignIndex)
  const varnaB = getVarna(b.houseData.lagnaSignIndex)
  const compatible = varnaA >= varnaB
  return {
    name: 'Work & Ambition Alignment',
    maxPoints: 1,
    scored: compatible ? 1 : 0,
    compatible,
    description: compatible
      ? 'Drive compatibility ✅ — matching ambition levels and career orientation.'
      : 'Drive mismatch ⚠️ — different speed of execution or life goals may cause friction.',
  }
}

// ─── Kuta 2: Vashya (2 points) ──────────────────────────────────────────────
// Which signs are controllable/attracted to each other
function getVashyaGroup(signIdx: number): string {
  const groups: Record<number, string> = {
    0: 'quadruped', 1: 'quadruped', 5: 'quadruped', 9: 'quadruped', 10: 'aquatic-human',
    2: 'human', 3: 'aquatic', 4: 'forest', 7: 'reptile', 8: 'human',
    6: 'human', 11: 'aquatic',
  }
  return groups[signIdx] ?? 'human'
}

function computeVashya(a: ChartResult, b: ChartResult): KutaScore {
  const gA = getVashyaGroup(a.houseData.lagnaSignIndex)
  const gB = getVashyaGroup(b.houseData.lagnaSignIndex)
  const compatible = gA === gB
  return {
    name: 'Magnetic Attraction',
    maxPoints: 2,
    scored: compatible ? 2 : 1,
    compatible: true,
    description: compatible
      ? 'Natural attraction ✅ — you\'re drawn to each other effortlessly. The vibe is magnetic.'
      : 'Moderate pull — there\'s interest but it requires intentional effort to click.',
  }
}

// ─── Kuta 3: Tara (3 points) ────────────────────────────────────────────────
// Moon nakshatra compatibility based on 9-group cycle
function computeTara(a: ChartResult, b: ChartResult): KutaScore {
  const nkA = Math.floor(a.positions.Mo / (360 / 27))
  const nkB = Math.floor(b.positions.Mo / (360 / 27))
  const diff = Math.abs(nkA - nkB) % 9
  // Favourable: 1 (Janma), 3 (Kshema), 5 (Sadhaka), 7 (Mitra)
  const favourable = [0, 2, 4, 6].includes(diff)
  const pts = favourable ? 3 : diff === 1 || diff === 3 ? 1 : 0
  return {
    name: 'Life Path Sync',
    maxPoints: 3,
    scored: pts,
    compatible: pts > 0,
    description: pts === 3
      ? 'Star groups sync ✅ — your birth constellations are deeply compatible. Long-term bond indicated.'
      : pts > 0
        ? 'Moderate path harmony — some friction but workable with communication.'
        : 'Path tension ⚠️ — different energy cycles. Growth requires conscious alignment.',
  }
}

// ─── Kuta 4: Yoni (4 points) ────────────────────────────────────────────────
// Yoni = sexual/physical compatibility from Moon nakshatra animal
import { YONI_FRIENDLY } from './constants'

function getMoonYoni(chart: ChartResult): string {
  const nkIdx = Math.floor(chart.positions.Mo / (360 / 27))
  return NAKSHATRAS[nkIdx]?.yoni ?? 'Horse'
}

function computeYoni(a: ChartResult, b: ChartResult): KutaScore {
  const yoniA = getMoonYoni(a)
  const yoniB = getMoonYoni(b)
  const sameYoni = yoniA === yoniB
  const friendlyA = YONI_FRIENDLY[yoniA]?.includes(yoniB)
  const pts = sameYoni ? 4 : friendlyA ? 3 : 1
  return {
    name: 'Physical Rhythm Harmony',
    maxPoints: 4,
    scored: pts,
    compatible: pts >= 3,
    description: sameYoni
      ? `${yoniA} + ${yoniB} ✅ — matching physical frequencies! Maximum physical compatibility and attraction. Hot.`
      : friendlyA
        ? `${yoniA} + ${yoniB} — friendly physical chemistry. Good physical harmony with natural understanding.`
        : `${yoniA} + ${yoniB} ⚠️ — different physical rhythms. Intimacy schedules may need alignment.`,
  }
}

// ─── Kuta 5: Graha Maitri (5 points) ────────────────────────────────────────
// Friendship between Moon sign lords of both charts
function computeGrahaMaitri(a: ChartResult, b: ChartResult): KutaScore {
  const lordA = RASHI_LORDS[a.bigThree.moon.index]
  const lordB = RASHI_LORDS[b.bigThree.moon.index]
  const friendshipAtoB = PLANET_FRIENDSHIP[lordA]?.[lordB] ?? 1
  const friendshipBtoA = PLANET_FRIENDSHIP[lordB]?.[lordA] ?? 1
  const avg = (friendshipAtoB + friendshipBtoA) / 2
  const pts = avg >= 2 ? 5 : avg >= 1 ? 3 : 1
  return {
    name: 'Intellectual Connection',
    maxPoints: 5,
    scored: pts,
    compatible: pts >= 3,
    description: pts === 5
      ? `${lordA} + ${lordB} ✅ — stellar best friends! Natural understanding, shared goals, ride or die energy.`
      : pts >= 3
        ? `${lordA} + ${lordB} — neutral-to-friendly energy. Good friendship foundation, communication key.`
        : `${lordA} + ${lordB} ⚠️ — mental friction. Different worldviews; compromise required.`,
  }
}

// ─── Kuta 6: Gana (6 points) ────────────────────────────────────────────────
// Deva (divine), Manushya (human), Rakshasa (demonic)
function getMoonGana(chart: ChartResult): string {
  const nkIdx = Math.floor(chart.positions.Mo / (360 / 27))
  return NAKSHATRAS[nkIdx]?.gana ?? 'Manushya'
}

function computeGana(a: ChartResult, b: ChartResult): KutaScore {
  const ganaA = getMoonGana(a)
  const ganaB = getMoonGana(b)
  const same = ganaA === ganaB
  const compatible = same || (ganaA === 'Deva' && ganaB === 'Manushya') || (ganaA === 'Manushya' && ganaB === 'Deva')
  const pts = same ? 6 : compatible ? 3 : 0
  return {
    name: 'Temperament Compatibility',
    maxPoints: 6,
    scored: pts,
    compatible: pts > 0,
    description: same
      ? `${ganaA} + ${ganaB} ✅ — same temperament type! Perfect personality harmony. You just get each other.`
      : compatible
        ? `${ganaA} + ${ganaB} — workable pairing. Some personality differences but mutual respect holds it together.`
        : `${ganaA} + ${ganaB} ⚠️ — temperament clash. Fundamentally different natures; needs lots of patience.`,
  }
}

// ─── Kuta 7: Bhakoot (7 points) ─────────────────────────────────────────────
// Moon sign to Moon sign rashi distance
function computeBhakoot(a: ChartResult, b: ChartResult): KutaScore {
  const moonSignA = a.bigThree.moon.index
  const moonSignB = b.bigThree.moon.index
  const diff = ((moonSignB - moonSignA + 12) % 12)
  // Inauspicious: 6/8, 2/12 patterns
  const inauspicious = [6, 8].includes(diff) || [2, 12].includes(diff)
    || ([1, 11].includes(diff))
  const pts = inauspicious ? 0 : 7
  return {
    name: 'Emotional Resonance',
    maxPoints: 7,
    scored: pts,
    compatible: !inauspicious,
    description: pts === 7
      ? `${a.bigThree.moon.sign} + ${b.bigThree.moon.sign} ✅ — harmonious heart signs. Emotional resonance, great intuitive understanding.`
      : `${a.bigThree.moon.sign} + ${b.bigThree.moon.sign} ⚠️ — moon tension (6/8 or 2/12 pattern). Health and emotional cycles may clash.`,
  }
}

// ─── Kuta 8: Nadi (8 points) ─────────────────────────────────────────────────
// Most important! Same Nadi = 0 (genetic incompatibility risk)
function getMoonNadi(chart: ChartResult): string {
  const nkIdx = Math.floor(chart.positions.Mo / (360 / 27))
  return NAKSHATRAS[nkIdx]?.nadi ?? 'Vata'
}

function computeNadi(a: ChartResult, b: ChartResult): KutaScore {
  const nadiA = getMoonNadi(a)
  const nadiB = getMoonNadi(b)
  const same = nadiA === nadiB
  return {
    name: 'Biological Energy Sync',
    maxPoints: 8,
    scored: same ? 0 : 8,
    compatible: !same,
    description: !same
      ? `${nadiA} + ${nadiB} ✅ — balanced energy type! Full 8 points. Complementary energies = balanced relationship.`
      : `${nadiA} + ${nadiA} ⚠️ — biological energy clash! Same body constitution can indicate friction. Work on balancing your mutual lifestyle routines.`,
  }
}

// ─── Mangal Dosha ───────────────────────────────────────────────────────────
// Mars in houses 1, 2, 4, 7, 8, 12 from Lagna (most common rule)
export function checkMangalDosha(chart: ChartResult): boolean {
  const positions = chart.positions
  const marsSign = Math.floor(positions.Ma / 30)
  const moonSign = Math.floor(positions.Mo / 30)
  const venusSign = Math.floor(positions.Ve / 30)
  const lagnaSign = Math.floor(positions.Lagn / 30)

  const hLagna = ((marsSign - lagnaSign + 12) % 12) + 1
  const hMoon = ((marsSign - moonSign + 12) % 12) + 1
  const hVenus = ((marsSign - venusSign + 12) % 12) + 1

  const doshaHouses = [1, 4, 7, 8, 12]
  return doshaHouses.includes(hLagna) || doshaHouses.includes(hMoon) || doshaHouses.includes(hVenus)
}

// ─── Full Compatibility Score ────────────────────────────────────────────────

export function computeCompatibility(chartA: ChartResult, chartB: ChartResult): Omit<CompatibilityResult, 'narrative' | 'summary'> {
  const kutas: KutaScore[] = [
    computeVarna(chartA, chartB),
    computeVashya(chartA, chartB),
    computeTara(chartA, chartB),
    computeYoni(chartA, chartB),
    computeGrahaMaitri(chartA, chartB),
    computeGana(chartA, chartB),
    computeBhakoot(chartA, chartB),
    computeNadi(chartA, chartB),
  ]

  const totalScore = kutas.reduce((s, k) => s + k.scored, 0)
  const maxScore = kutas.reduce((s, k) => s + k.maxPoints, 0) // 36

  const mangalDoshaA = checkMangalDosha(chartA)
  const mangalDoshaB = checkMangalDosha(chartB)
  // Mangal Dosha cancellation: both have it = cancels out
  const hasMangalDoshaCancellation = mangalDoshaA && mangalDoshaB

  return {
    personA: chartA,
    personB: chartB,
    kutas,
    totalScore,
    maxScore,
    percentage: Math.round((totalScore / maxScore) * 100),
    mangalDoshaA,
    mangalDoshaB,
    hasMangalDoshaCancellation,
  }
}
