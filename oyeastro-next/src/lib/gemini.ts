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
  return {
    today: {
      money: { status: 'Attracting', emoji: '💵', colorClass: 'green' },
      love: { status: 'Deepening', emoji: '💝', colorClass: 'red' },
      energy: { status: 'Inspired', emoji: '⚡', colorClass: 'amber' },
      score: 8,
      interpretation: "You will feel multiple demands testing your time and focus today (Problem). Take a step back and prioritize your most important personal goals first (Solution) to reclaim your schedule and unlock a fresh wave of creative drive by tonight (Impact)."
    },
    week: {
      money: { status: 'Growing', emoji: '📈', colorClass: 'green' },
      love: { status: 'Harmonious', emoji: '💖', colorClass: 'red' },
      energy: { status: 'Balanced', emoji: '🔋', colorClass: 'cyan' },
      score: 7,
      interpretation: "A minor communication delay or misunderstanding might disrupt your plans early this week (Problem). Take it as a great opportunity to focus on independent progress (Solution) which will lead to a highly satisfying breakthrough by Friday (Impact)."
    },
    month: {
      money: { status: 'Abundant', emoji: '💰', colorClass: 'green' },
      love: { status: 'Magnetic', emoji: '❤️', colorClass: 'red' },
      energy: { status: 'Radiant', emoji: '🌟', colorClass: 'amber' },
      score: 9,
      interpretation: "You are entering a high-potential phase where financial and career choices need tight alignment (Problem). Review your resource allocations and invest in learning a new skill (Solution) to create a major upward trend in your overall assets by month-end (Impact)."
    }
  }
}

export async function generateCosmicVibeResult(chart: ChartResult): Promise<CosmicVibeResult> {
  const ai = getGenAI()
  if (!ai) return getStaticCosmicVibe(chart)

  const prompt = `You are OyeAstro, a Gen-Z personal vibe check assistant. Generate a personalized Vibe Check for this person's energetic profile across three time horizons (today, week, month).

The astrological properties of their profile are:
Sign Type: ${chart.bigThree.rising.sign}
Sun Profile: ${chart.bigThree.sun.sign}
Moon Profile: ${chart.bigThree.moon.sign}
Active Cycle: ${chart.dasha.activeDasha.rulerName} (${chart.dasha.eraTitle})
Unique Alignments: ${chart.yogas.filter(y => y.detected).map(y => y.name).join(', ') || 'None'}

CRITICAL GUIDELINES:
1. DO NOT use any astrological words or jargon (e.g., do not say "Jupiter", "Saturn", "Mercury", "Aquarius", "Leo", "rising", "lagna", "dasha", "nakshatra", "houses", "planets"). Talk about their energy, focus, mindset, and day-to-day vibes instead.
2. Structure the "interpretation" text to describe:
   - A problem statement (a challenge they might face in the future)
   - A practical solution (a clear action they should take)
   - The positive impact of that solution (what will happen)
3. Keep the tone highly positive, motivating, and encouraging. Users look for high-energy advice even when facing obstacles. Frame everything with a growth mindset.
4. For status values, use active, positive, or empowering Gen-Z/millennial terms (e.g., "Magnetic", "Deepening", "Sparking", "Attracting", "Growing", "Securing", "Electric", "Charging", "Inspired", "Focused"). Avoid negative labels like "Chaotic" or "Broke".

Format the output strictly as a JSON object conforming to this structure (do not include markdown wrapping or notes, return raw JSON):
{
  "today": {
    "money": { "status": "Attracting", "emoji": "💵", "colorClass": "green" },
    "love": { "status": "Deepening", "emoji": "💝", "colorClass": "red" },
    "energy": { "status": "Electric", "emoji": "⚡", "colorClass": "amber" },
    "score": 8,
    "interpretation": "You will feel an urge to rush an important conversation today (Problem). Take a deep breath and listen carefully first (Solution) to build a powerful level of trust and alignment by tonight (Impact)."
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

