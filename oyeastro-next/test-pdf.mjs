import { generatePersonalPdf, generateCompatibilityPdf } from './src/lib/pdf.ts'
import fs from 'fs'

const mockPersonalData = {
  name: 'Shivam Test',
  lagna: 'Cancer',
  nakshatra: 'Pushya',
  mahadasha: 'Jupiter',
  dashaAnalysis: 'You are entering an auspicious Jupiter Mahadasha which will bring growth, wisdom, and spiritual progress. This period will open up new pathways in your life.',
  transitDates: 'Saturn transits your 8th house, indicating a period of deep introspection and transformation. Focus on stabilizing your daily routines.',
  careerWindows: 'A highly favorable career window opens up between September 2025 and January 2026. This is an excellent time for new ventures or promotions.',
  loveWindows: 'Relationship harmonies are strongest in November 2025. Express your feelings openly and focus on building emotional safety.',
  healthWarnings: 'Ensure you maintain stable sleep cycles and avoid overexertion during high-stress work transitions in mid-2026.',
  positions: {
    Su: 45, Mo: 120, Ma: 80, Me: 55, Ju: 95, Ve: 60, Sa: 10, Ra: 15, Ke: 195, Lagn: 90
  },
  houseData: {
    placements: {
      Su: { houseIndex: 11, degree: 15, signIndex: 1, longitude: 45 },
      Mo: { houseIndex: 2, degree: 0, signIndex: 4, longitude: 120 },
      Ma: { houseIndex: 12, degree: 20, signIndex: 2, longitude: 80 },
      Me: { houseIndex: 11, degree: 25, signIndex: 1, longitude: 55 },
      Ju: { houseIndex: 1, degree: 5, signIndex: 3, longitude: 95 },
      Ve: { houseIndex: 12, degree: 0, signIndex: 2, longitude: 60 },
      Sa: { houseIndex: 10, degree: 10, signIndex: 0, longitude: 10 },
      Ra: { houseIndex: 10, degree: 15, signIndex: 0, longitude: 15 },
      Ke: { houseIndex: 4, degree: 15, signIndex: 6, longitude: 195 },
      Lagn: { houseIndex: 1, degree: 0, signIndex: 3, longitude: 90 }
    },
    houses: [['Lagn', 'Ju'], ['Mo'], [], ['Ke'], [], [], [], [], [], ['Sa', 'Ra'], ['Su', 'Me'], ['Ma', 'Ve']],
    lagnaSignIndex: 3
  },
  bigThree: {
    rising: { sign: 'Cancer', index: 3, tag: 'Rising', copy: 'Intuitive and nurturing.' },
    sun: { sign: 'Taurus', index: 1, copy: 'Stable and grounded.' },
    moon: { sign: 'Leo', index: 4, copy: 'Expressive and charismatic.' }
  },
  yogas: [
    { name: 'Gaja-Kesari Yoga', detected: true, description: 'Jupiter in kendra from Moon. Grants wisdom, honor, and prosperity.' },
    { name: 'Budhaditya Yoga', detected: true, description: 'Sun & Mercury conjunction. Confers sharp intelligence.' }
  ],
  vibeScore: {
    score: 8,
    label: 'Very Positive',
    factors: [
      { name: 'Love & Attraction', points: 8, max: 10 },
      { name: 'Money & Fortune', points: 7, max: 10 },
      { name: 'Energy & Health', points: 9, max: 10 }
    ]
  },
  flags: {
    green: ['Highly intuitive and emotionally intelligence.', 'Prosperous dasha era starting.'],
    red: ['Saturn transit could cause minor energy drops.', 'Avoid impulsive investment decisions.']
  },
  remedies: {
    stone: 'Yellow Sapphire',
    color: 'Bright Yellow',
    mantra: 'Om Gram Greem Groum Sah Gurave Namah',
    tips: 'Offer water to the Sun daily and meditate during morning transition hours.'
  }
}

const mockCompatData = {
  cName1: 'Rahul',
  cName2: 'Priya',
  score: 75,
  details: { temp: 80, heart: 75, destiny: 90, trust: 80 },
  narrative: 'A strong and stable cosmic connection. You have high emotional compatibility and a natural wavelength of mutual respect. Communication flows easily, helping you resolve differences constructively.',
  chart1: {
    positions: { Su: 45, Mo: 120, Ma: 80, Me: 55, Ju: 95, Ve: 60, Sa: 10, Ra: 15, Ke: 195, Lagn: 90 },
    houseData: mockPersonalData.houseData
  },
  chart2: {
    positions: { Su: 50, Mo: 130, Ma: 85, Me: 60, Ju: 100, Ve: 65, Sa: 15, Ra: 20, Ke: 200, Lagn: 95 },
    houseData: mockPersonalData.houseData
  },
  mangalDoshaA: false,
  mangalDoshaB: false,
  hasMangalDoshaCancellation: false
}

async function run() {
  console.log('Generating personal PDF...')
  const personalBuf = await generatePersonalPdf(mockPersonalData)
  fs.writeFileSync('personal_test.pdf', personalBuf)
  console.log('Saved personal_test.pdf, size:', personalBuf.length)

  console.log('Generating compatibility PDF...')
  const compatBuf = await generateCompatibilityPdf(mockCompatData)
  fs.writeFileSync('compat_test.pdf', compatBuf)
  console.log('Saved compat_test.pdf, size:', compatBuf.length)
}

run().catch(console.error)
