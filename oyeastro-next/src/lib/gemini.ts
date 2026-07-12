import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
import type { ChartResult, AICopyResult, CosmicVibeResult, PremiumReport } from './astro/types'

let genAI: GoogleGenerativeAI | null = null

function getGenAI(): GoogleGenerativeAI | null {
  if (genAI) return genAI
  const key = process.env.GEMINI_API_KEY
  if (!key) {
    console.warn('[Gemini] Missing GEMINI_API_KEY — using static fallback copy')
    return null
  }
  genAI = new GoogleGenerativeAI(key)
  return genAI
}

// Static fallback copy if Gemini is unavailable
function getStaticCopy(chart: ChartResult): AICopyResult {
  const { rising, sun, moon } = chart.bigThree
  const { eraTrack } = chart.dasha
  return {
    love: `Your ${moon.sign} Moon craves deep connection but ${rising.sign} Rising keeps the mystery alive. Right person will vibe with both sides.`,
    money: `${sun.sign} Sun drives your hustle. ${eraTrack} is your current money soundtrack — ride the wave strategically.`,
    career: `${rising.sign} Rising is your first impression in any room. Use that ${sun.sign} Sun discipline to back it up with actual results.`,
    energy: `Moon in ${moon.sign} means your emotional battery recharges differently from most. Honor your unique rhythm, bestie.`,
    quote: `You're a ${rising.sign} rising with ${sun.sign} Sun energy — the universe built you to stand out. Act like it. ✨`,
  }
}

export async function generateVibeCopy(chart: ChartResult): Promise<AICopyResult> {
  const ai = getGenAI()
  if (!ai) return getStaticCopy(chart)

  const prompt = `You are OyeAstro, a Gen-Z Vedic astrology AI. Write short, punchy, relatable copy for this chart:

Rising/Lagna: ${chart.bigThree.rising.sign} (${chart.bigThree.rising.tag})
Sun Sign: ${chart.bigThree.sun.sign}
Moon Sign: ${chart.bigThree.moon.sign}
Current Dasha: ${chart.dasha.activeDasha.rulerName} (${chart.dasha.eraTitle})
Antardasha: ${chart.dasha.activeAntardasha?.rulerName ?? 'N/A'}
Vibe Score: ${chart.vibeScore.score}/10 (${chart.vibeScore.label})
Active Yogas: ${chart.yogas.filter(y => y.detected).map(y => y.name).join(', ') || 'None detected'}

Write exactly 4 sections (≤40 words each) + 1 tagline quote (≤20 words).
Tone: casual Gen-Z, witty, slightly sarcastic, cosmic metaphors.
Use actual astrology terms naturally. No cringe affirmations.`

  try {
    const model = ai.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            love:   { type: SchemaType.STRING },
            money:  { type: SchemaType.STRING },
            career: { type: SchemaType.STRING },
            energy: { type: SchemaType.STRING },
            quote:  { type: SchemaType.STRING },
          },
          required: ['love', 'money', 'career', 'energy', 'quote'],
        },
      },
    })

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const parsed = JSON.parse(text) as AICopyResult
    return parsed
  } catch (e) {
    console.error('[Gemini] generateVibeCopy failed, using static fallback:', e)
    return getStaticCopy(chart)
  }
}

export async function generateCompatibilityNarrative(
  nameA: string, signA: string, dashaA: string,
  nameB: string, signB: string, dashaB: string,
  totalScore: number,
): Promise<string> {
  const ai = getGenAI()
  if (!ai) {
    return `${nameA} (${signA} Rising, ${dashaA} Dasha) and ${nameB} (${signB} Rising, ${dashaB} Dasha) scored ${totalScore}/36 on the cosmic compatibility chart. Not bad, not perfect — but with the right communication, the vibe is workable. The stars are watching. 👀`
  }

  const prompt = `Write a 3-sentence Gen-Z Vedic astrology compatibility narrative for:
Person A: ${nameA}, ${signA} Rising, currently in ${dashaA} Dasha
Person B: ${nameB}, ${signB} Rising, currently in ${dashaB} Dasha
Ashtakoot score: ${totalScore}/36

Be witty, use astrology terms, speak like a cool astrologer friend, ≤60 words total. End with an emoji.`

  try {
    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })
    const result = await model.generateContent(prompt)
    return result.response.text().trim()
  } catch (e) {
    console.error('[Gemini] generateCompatibilityNarrative failed:', e)
    return `${nameA} and ${nameB} scored ${totalScore}/36 — the cosmos have spoken. Their ${signA}/${signB} energies create an interesting push-pull dynamic worth exploring. Communication is the cheat code here. 🌌`
  }
}

// Static fallback for Cosmic Vibe Card
function getStaticCosmicVibe(chart: ChartResult): CosmicVibeResult {
  const { rising, moon } = chart.bigThree
  const dashaRuler = chart.dasha.activeDasha.rulerName
  return {
    today: {
      money: { status: 'Flowing', emoji: '🟢', colorClass: 'green' },
      love: { status: 'Complicated', emoji: '💔', colorClass: 'red' },
      energy: { status: 'Chaotic', emoji: '⚡', colorClass: 'amber' },
      score: 8,
      interpretation: `${rising.sign} rising is keeping you busy today. Jupiter is side-eying your comfort zone right now—your next big glow-up starts with one uncomfortable conversation you've been avoiding.`
    },
    week: {
      money: { status: 'Secured', emoji: '💵', colorClass: 'green' },
      love: { status: 'Ghost Mode', emoji: '👻', colorClass: 'purple' },
      energy: { status: 'Recharging', emoji: '🔋', colorClass: 'cyan' },
      score: 6,
      interpretation: `With your Moon in ${moon.sign}, this week calls for a major emotional battery recharge. Stand your ground and don't ghost your responsibilities.`
    },
    month: {
      money: { status: 'Hustling', emoji: '🔥', colorClass: 'amber' },
      love: { status: 'Deep Connection', emoji: '💖', colorClass: 'red' },
      energy: { status: 'High Focus', emoji: '🎯', colorClass: 'cyan' },
      score: 9,
      interpretation: `Your current ${dashaRuler} era is hitting its peak. The universe built you to stand out this month. Act like it and make the big moves.`
    }
  }
}

export async function generateCosmicVibeResult(chart: ChartResult): Promise<CosmicVibeResult> {
  const ai = getGenAI()
  if (!ai) return getStaticCosmicVibe(chart)

  const prompt = `You are OyeAstro, a Gen-Z Vedic astrology AI. Generate a personalized Cosmic Vibe Check for this chart across three time horizons (today, week, month):

Rising/Lagna: ${chart.bigThree.rising.sign} (${chart.bigThree.rising.tag})
Sun Sign: ${chart.bigThree.sun.sign}
Moon Sign: ${chart.bigThree.moon.sign}
Current Dasha: ${chart.dasha.activeDasha.rulerName} (${chart.dasha.eraTitle})
Active Yogas: ${chart.yogas.filter(y => y.detected).map(y => y.name).join(', ') || 'None detected'}

For each time horizon (today, week, month), you must return:
1. Money, Love, and Energy metrics:
   - status: a short, witty status (1-3 words, e.g. "Flowing", "Complicated", "Chaotic", "Ghost Mode", "Hustling", "Recharging", "Broke", "Secured", "Spicy", "Stagnant", "High Hustle", "Deep Connection").
   - emoji: 1 relevant emoji.
   - colorClass: a color name (must be one of: "green", "red", "amber", "purple", "cyan") representing the vibe category.
2. Vibe Score (1 to 10).
3. Interpretation: A short, punchy, relatable sentence (15-25 words) explaining the overall vibe. Be witty, casual, slightly sarcastic, and use cosmic/zodiac metaphors.

Format the output strictly as a JSON object conforming to this structure (do not include markdown wrapping or notes, return raw JSON):
{
  "today": {
    "money": { "status": "Flowing", "emoji": "🟢", "colorClass": "green" },
    "love": { "status": "Complicated", "emoji": "💔", "colorClass": "red" },
    "energy": { "status": "Chaotic", "emoji": "⚡", "colorClass": "amber" },
    "score": 8,
    "interpretation": "Jupiter is side-eying your comfort zone right now. Glow up begins today."
  },
  "week": { ... },
  "month": { ... }
}`

  try {
    const model = ai.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            today: {
              type: SchemaType.OBJECT,
              properties: {
                money: {
                  type: SchemaType.OBJECT,
                  properties: {
                    status: { type: SchemaType.STRING },
                    emoji: { type: SchemaType.STRING },
                    colorClass: { type: SchemaType.STRING }
                  },
                  required: ['status', 'emoji', 'colorClass']
                },
                love: {
                  type: SchemaType.OBJECT,
                  properties: {
                    status: { type: SchemaType.STRING },
                    emoji: { type: SchemaType.STRING },
                    colorClass: { type: SchemaType.STRING }
                  },
                  required: ['status', 'emoji', 'colorClass']
                },
                energy: {
                  type: SchemaType.OBJECT,
                  properties: {
                    status: { type: SchemaType.STRING },
                    emoji: { type: SchemaType.STRING },
                    colorClass: { type: SchemaType.STRING }
                  },
                  required: ['status', 'emoji', 'colorClass']
                },
                score: { type: SchemaType.INTEGER },
                interpretation: { type: SchemaType.STRING }
              },
              required: ['money', 'love', 'energy', 'score', 'interpretation']
            },
            week: {
              type: SchemaType.OBJECT,
              properties: {
                money: {
                  type: SchemaType.OBJECT,
                  properties: {
                    status: { type: SchemaType.STRING },
                    emoji: { type: SchemaType.STRING },
                    colorClass: { type: SchemaType.STRING }
                  },
                  required: ['status', 'emoji', 'colorClass']
                },
                love: {
                  type: SchemaType.OBJECT,
                  properties: {
                    status: { type: SchemaType.STRING },
                    emoji: { type: SchemaType.STRING },
                    colorClass: { type: SchemaType.STRING }
                  },
                  required: ['status', 'emoji', 'colorClass']
                },
                energy: {
                  type: SchemaType.OBJECT,
                  properties: {
                    status: { type: SchemaType.STRING },
                    emoji: { type: SchemaType.STRING },
                    colorClass: { type: SchemaType.STRING }
                  },
                  required: ['status', 'emoji', 'colorClass']
                },
                score: { type: SchemaType.INTEGER },
                interpretation: { type: SchemaType.STRING }
              },
              required: ['money', 'love', 'energy', 'score', 'interpretation']
            },
            month: {
              type: SchemaType.OBJECT,
              properties: {
                money: {
                  type: SchemaType.OBJECT,
                  properties: {
                    status: { type: SchemaType.STRING },
                    emoji: { type: SchemaType.STRING },
                    colorClass: { type: SchemaType.STRING }
                  },
                  required: ['status', 'emoji', 'colorClass']
                },
                love: {
                  type: SchemaType.OBJECT,
                  properties: {
                    status: { type: SchemaType.STRING },
                    emoji: { type: SchemaType.STRING },
                    colorClass: { type: SchemaType.STRING }
                  },
                  required: ['status', 'emoji', 'colorClass']
                },
                energy: {
                  type: SchemaType.OBJECT,
                  properties: {
                    status: { type: SchemaType.STRING },
                    emoji: { type: SchemaType.STRING },
                    colorClass: { type: SchemaType.STRING }
                  },
                  required: ['status', 'emoji', 'colorClass']
                },
                score: { type: SchemaType.INTEGER },
                interpretation: { type: SchemaType.STRING }
              },
              required: ['money', 'love', 'energy', 'score', 'interpretation']
            }
          },
          required: ['today', 'week', 'month']
        }
      }
    })

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const parsed = JSON.parse(text) as CosmicVibeResult
    return parsed
  } catch (e) {
    console.error('[Gemini] generateCosmicVibeResult failed, using static fallback:', e)
    return getStaticCosmicVibe(chart)
  }
}

// ─── Claude 3.5 Sonnet / Gemini Premium Yearly Report Generator ──────────────

async function callClaude(prompt: string): Promise<any | null> {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return null
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt + '\nFormat the response strictly as a raw JSON object matching the requested schema. Do not enclose in markdown blocks. Return only JSON.' }],
      }),
    })
    if (res.ok) {
      const data = await res.json()
      const text = data.content?.[0]?.text ?? ''
      const match = text.match(/\{[\s\S]*\}/)
      if (match) return JSON.parse(match[0])
    } else {
      console.warn('[Claude] API returned non-OK status:', res.status, await res.text())
    }
  } catch (e) {
    console.error('[Claude] callClaude failed:', e)
  }
  return null
}

export async function generatePremiumReport(chart: ChartResult): Promise<PremiumReport> {
  const prompt = `You are OyeAstro, an elite Gen-Z Vedic astrologer who speaks in a casual, witty, slightly sarcastic tone.
Generate a highly detailed, personalized 2025-2026 Yearly Premium Report for this birth chart:

Name: ${chart.meta.name}
Lagna: ${chart.bigThree.rising.sign} (${chart.bigThree.rising.tag})
Sun Sign: ${chart.bigThree.sun.sign}
Moon Sign: ${chart.bigThree.moon.sign}
Nakshatra: ${chart.dasha.nakshatra.name}
Current Mahadasha: ${chart.dasha.activeDasha.rulerName} (ends ${chart.dasha.activeDasha.endFormatted})
Current Antardasha: ${chart.dasha.activeAntardasha?.rulerName ?? 'N/A'} (ends ${chart.dasha.activeAntardasha?.endFormatted ?? 'N/A'})

Generate exactly 5 sections (about 50-70 words each):
1. dashaAnalysis: Analysis of how their active Mahadasha/Antardasha era will play out in 2025-2026.
2. transitDates: Major transits of Jupiter, Saturn, Rahu/Ketu affecting their chart in 2025-2026 (give specific ranges/themes).
3. careerWindows: Exact career opportunities, job shifts, and side hustle windows.
4. loveWindows: Love, relationships, compatibility windows, and green flag periods.
5. healthWarnings: Health alerts, self-care suggestions, and mental energy warnings.

Ensure all copy uses second-person ("you", "your"), uses astro terms naturally (e.g. houses, transits, planets) but explains them instantly in Gen-Z slang, and is highly engaging.

Format the output strictly as a JSON object matching this schema:
{
  "dashaAnalysis": "...",
  "transitDates": "...",
  "careerWindows": "...",
  "loveWindows": "...",
  "healthWarnings": "..."
}`

  // 1. Try Claude first
  const claudeResult = await callClaude(prompt)
  if (claudeResult && claudeResult.dashaAnalysis) {
    return claudeResult as PremiumReport
  }

  // 2. Fallback to Gemini
  const ai = getGenAI()
  if (!ai) {
    return {
      dashaAnalysis: "Your current dasha era is full of transitions. Expect a lot of redirection, bestie. Redirection is just a cosmic correction.",
      transitDates: "Watch out for Saturn transits in mid-2025 causing reality checks. Jupiter will balance things out by end of the year.",
      careerWindows: "Autumn 2025 looks stellar for side hustles and cash flow. Don't spend it all on matching aesthetics.",
      loveWindows: "Venus transit in late 2025 brings absolute main character romance vibes. Perfect time to get out of ghost mode.",
      healthWarnings: "Protect your emotional battery during Mercury retrogrades. Turn off read-receipts when you're overwhelmed."
    }
  }

  try {
    const model = ai.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            dashaAnalysis: { type: SchemaType.STRING },
            transitDates:  { type: SchemaType.STRING },
            careerWindows: { type: SchemaType.STRING },
            loveWindows:   { type: SchemaType.STRING },
            healthWarnings: { type: SchemaType.STRING },
          },
          required: ['dashaAnalysis', 'transitDates', 'careerWindows', 'loveWindows', 'healthWarnings'],
        },
      },
    })

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const parsed = JSON.parse(text) as PremiumReport
    return parsed
  } catch (e) {
    console.error('[Gemini] generatePremiumReport failed:', e)
    return {
      dashaAnalysis: "Your current dasha era is full of transitions. Expect a lot of redirection, bestie. Redirection is just a cosmic correction.",
      transitDates: "Watch out for Saturn transits in mid-2025 causing reality checks. Jupiter will balance things out by end of the year.",
      careerWindows: "Autumn 2025 looks stellar for side hustles and cash flow. Don't spend it all on matching aesthetics.",
      loveWindows: "Venus transit in late 2025 brings absolute main character romance vibes. Perfect time to get out of ghost mode.",
      healthWarnings: "Protect your emotional battery during Mercury retrogrades. Turn off read-receipts when you're overwhelmed."
    }
  }
}

