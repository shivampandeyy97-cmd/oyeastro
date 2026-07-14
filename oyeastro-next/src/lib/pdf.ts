import PDFDocument from 'pdfkit'

// ─── Types ───────────────────────────────────────────────────────────────────
interface PlanetPositions {
  Su: number; Mo: number; Ma: number; Me: number
  Ju: number; Ve: number; Sa: number; Ra: number
  Ke: number; Lagn: number
}

interface HouseData {
  placements: Record<string, { houseIndex: number; degree: number; signIndex: number; longitude: number }>
  houses: string[][]
  lagnaSignIndex: number
}

interface CompatibilityPdfData {
  cName1: string
  cName2: string
  score: number
  details?: { temp?: number; heart?: number; destiny?: number; trust?: number }
  narrative: string
  chart1?: { positions?: PlanetPositions; houseData?: HouseData; bigThree?: any }
  chart2?: { positions?: PlanetPositions; houseData?: HouseData; bigThree?: any }
}

interface PersonalPdfData {
  name: string
  lagna: string
  nakshatra: string
  mahadasha: string
  dashaAnalysis: string
  transitDates: string
  careerWindows: string
  loveWindows: string
  healthWarnings: string
  positions?: PlanetPositions
  houseData?: HouseData
  bigThree?: any
  dasha?: any
  yogas?: any[]
  vibeScore?: any
  flags?: { green: string[]; red: string[] }
  remedies?: any
}

// ─── Color Palette ───────────────────────────────────────────────────────────
const C = {
  coral:    '#FF7A45',
  lavender: '#8A5CF5',
  ink:      '#1A1208',
  sage:     '#6DB88A',
  teal:     '#4A9EDB',
  bg:       '#FFF9F6',
  bgPurple: '#F8F4FF',
  muted:    '#888888',
  border:   '#E8E0F0',
  white:    '#FFFFFF',
  gold:     '#D4A017',
  midnight: '#2D1B69',
}

// ─── Planet display names & symbols ──────────────────────────────────────────
const PLANET_ABBR: Record<string, string> = {
  Su: 'Su', Mo: 'Mo', Ma: 'Ma', Me: 'Me',
  Ju: 'Ju', Ve: 'Ve', Sa: 'Sa', Ra: 'Ra', Ke: 'Ke', Lagn: 'As'
}

const RASHI_NAMES = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
]

const RASHI_SHORT = [
  'Ar', 'Ta', 'Ge', 'Ca', 'Le', 'Vi',
  'Li', 'Sc', 'Sg', 'Cp', 'Aq', 'Pi'
]

// ─── North Indian Kundli Chart (Diamond/rhombus style) ───────────────────────
/**
 * Draws the classic North Indian diamond Kundli chart using PDFKit primitives.
 * House 1 (Lagna) is always in the top-center diamond cell.
 * Houses go clockwise: 1(top), 2(top-right), 3(right), 4(bottom-right),
 *   5(bottom), 6(bottom-left), 7(left), 8(top-left),
 *   9(top), 10(right), 11(bottom), 12(left) — standard North Indian layout.
 */
function drawKundliChart(
  doc: PDFKit.PDFDocument,
  cx: number,   // center x
  cy: number,   // center y  
  size: number, // total size of chart square
  houseData: HouseData,
  positions: PlanetPositions,
  lagnaSignIndex: number,
  title: string
) {
  const s = size
  const x0 = cx - s / 2
  const y0 = cy - s / 2

  // Title above chart
  doc.font('Helvetica-Bold').fontSize(9).fillColor(C.lavender)
    .text(title, cx - s / 2, y0 - 18, { width: s, align: 'center' })

  // Background
  doc.rect(x0, y0, s, s).fill('#F8F4FF')

  // Outer border
  doc.rect(x0, y0, s, s).strokeColor(C.lavender).lineWidth(1.5).stroke()

  // The 4 diagonal lines dividing into corner triangles + center diamond
  const mx = cx, my = cy
  const t = { x: mx, y: y0 }    // top
  const r = { x: x0 + s, y: my } // right
  const b = { x: mx, y: y0 + s } // bottom
  const l = { x: x0, y: my }    // left

  // draw diamond lines
  doc.moveTo(t.x, t.y).lineTo(r.x, r.y)
    .lineTo(b.x, b.y).lineTo(l.x, l.y)
    .lineTo(t.x, t.y)
    .strokeColor(C.lavender).lineWidth(0.8).stroke()

  // midpoints of outer edges for inner triangles
  const tm = { x: (t.x + r.x) / 2, y: (t.y + r.y) / 2 } // top-right edge mid
  const rm = { x: (r.x + b.x) / 2, y: (r.y + b.y) / 2 } // bottom-right edge mid
  const bm = { x: (b.x + l.x) / 2, y: (b.y + l.y) / 2 } // bottom-left edge mid
  const lm = { x: (l.x + t.x) / 2, y: (l.y + t.y) / 2 } // top-left edge mid

  // Extra inner lines for house subdivisions
  doc.moveTo(t.x, t.y).lineTo(mx, my).strokeColor(C.lavender).lineWidth(0.5).stroke()
  doc.moveTo(r.x, r.y).lineTo(mx, my).strokeColor(C.lavender).lineWidth(0.5).stroke()
  doc.moveTo(b.x, b.y).lineTo(mx, my).strokeColor(C.lavender).lineWidth(0.5).stroke()
  doc.moveTo(l.x, l.y).lineTo(mx, my).strokeColor(C.lavender).lineWidth(0.5).stroke()

  // corners to midpoints
  doc.moveTo(x0, y0).lineTo(tm.x, tm.y).strokeColor(C.lavender).lineWidth(0.5).stroke()
  doc.moveTo(x0 + s, y0).lineTo(tm.x, tm.y).strokeColor(C.lavender).lineWidth(0.5).stroke()
  doc.moveTo(x0 + s, y0 + s).lineTo(rm.x, rm.y).strokeColor(C.lavender).lineWidth(0.5).stroke()
  doc.moveTo(x0, y0 + s).lineTo(bm.x, bm.y).strokeColor(C.lavender).lineWidth(0.5).stroke()

  // Build house sign mappings: house i gets sign (lagnaSignIndex + i) % 12
  const houseSign: string[] = []
  for (let h = 0; h < 12; h++) {
    houseSign[h] = RASHI_SHORT[(lagnaSignIndex + h) % 12]
  }

  // Build planet-in-house map
  const planetsInHouse: Record<number, string[]> = {}
  for (let h = 1; h <= 12; h++) planetsInHouse[h] = []

  if (positions) {
    const planetList = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra', 'Ke', 'Lagn']
    planetList.forEach(p => {
      const placement = houseData?.placements?.[p]
      if (placement) {
        planetsInHouse[placement.houseIndex]?.push(PLANET_ABBR[p])
      }
    })
  }

  // North Indian house position centers (relative to chart square)
  // 12 houses: standard North Indian layout
  // H1=top-center, H2=top-right, H3=right-top, H4=right-bottom,
  // H5=bottom-right, H6=bottom-center, H7=bottom-left, H8=left-bottom,
  // H9=left-top, H10=top-left, H11=top (2nd top), H12=left (2nd left)
  // Actually, North Indian: H1 always top-center diamond, clockwise
  const q = s / 4
  const houseCenters: [number, number][] = [
    [cx,        y0 + q],        // H1  top diamond
    [x0 + s - q*0.7, y0 + q*0.7],  // H2  top-right triangle
    [x0 + s - q*0.7, cy],         // H3  right-center triangle
    [x0 + s - q*0.7, y0 + s - q*0.7], // H4 bottom-right
    [cx,        y0 + s - q],      // H5  bottom diamond
    [x0 + q*0.7, y0 + s - q*0.7],  // H6  bottom-left
    [x0 + q*0.7, cy],              // H7  left-center
    [x0 + q*0.7, y0 + q*0.7],      // H8  top-left
    [cx - q*0.5, y0 + q*1.6],      // H9  inner top-left
    [cx + q*0.5, y0 + q*1.6],      // H10 inner top-right
    [cx + q*0.5, y0 + s - q*1.6],  // H11 inner bottom-right
    [cx - q*0.5, y0 + s - q*1.6],  // H12 inner bottom-left
  ]

  // Label each house
  houseCenters.forEach(([hx, hy], idx) => {
    const hNum = idx + 1
    const sign = houseSign[idx]
    const planets = planetsInHouse[hNum] || []

    // House number (small)
    doc.font('Helvetica').fontSize(6).fillColor('#AAAAAA')
      .text(`H${hNum}`, hx - 10, hy - 14, { width: 20, align: 'center' })

    // Sign abbreviation
    doc.font('Helvetica-Bold').fontSize(7).fillColor(C.midnight)
      .text(sign, hx - 12, hy - 5, { width: 24, align: 'center' })

    // Planets (colored, stacked)
    planets.forEach((pl, pIdx) => {
      const color = pl === 'As' ? C.coral : pl === 'Mo' ? C.teal : pl === 'Su' ? C.gold : C.sage
      doc.font('Helvetica-Bold').fontSize(6).fillColor(color)
        .text(pl, hx - 12, hy + 5 + pIdx * 8, { width: 24, align: 'center' })
    })
  })
}

// ─── Section Header ───────────────────────────────────────────────────────────
function sectionHeader(doc: PDFKit.PDFDocument, text: string, color: string) {
  const y = doc.y
  doc.rect(50, y, 512, 22).fill(color)
  doc.font('Helvetica-Bold').fontSize(11).fillColor(C.white)
    .text(text, 58, y + 5, { width: 500 })
  doc.y = y + 26
  doc.moveDown(0.4)
}

// ─── Info Row ────────────────────────────────────────────────────────────────
function infoRow(doc: PDFKit.PDFDocument, label: string, value: string, labelColor = C.muted, valueColor = C.ink) {
  const y = doc.y
  doc.font('Helvetica-Bold').fontSize(9).fillColor(labelColor).text(label, 60, y, { width: 160, continued: false })
  doc.font('Helvetica').fontSize(9).fillColor(valueColor).text(value, 230, y, { width: 330 })
  doc.moveDown(0.35)
}

// ─── Colored Text Block ───────────────────────────────────────────────────────
function textBlock(doc: PDFKit.PDFDocument, content: string, color = C.ink) {
  doc.font('Helvetica').fontSize(10).fillColor(color)
    .text(content, 60, doc.y, { align: 'justify', lineGap: 3, width: 492 })
  doc.moveDown(0.8)
}

// ─── Score Bar ───────────────────────────────────────────────────────────────
function scoreBar(doc: PDFKit.PDFDocument, label: string, pct: number, color: string) {
  const y = doc.y
  const barW = 330
  const barH = 10
  const barX = 230

  doc.font('Helvetica').fontSize(9).fillColor(C.ink).text(label, 60, y + 1, { width: 160 })
  doc.font('Helvetica-Bold').fontSize(9).fillColor(color).text(`${pct}%`, 570, y + 1, { align: 'right', width: 40 })

  // Background bar
  doc.rect(barX, y, barW, barH).fill('#EDE0FF')
  // Filled bar
  doc.rect(barX, y, (barW * pct) / 100, barH).fill(color)
  doc.moveDown(0.9)
}

// ─── Page Footer ─────────────────────────────────────────────────────────────
function addFooter(doc: PDFKit.PDFDocument, pageNum: number) {
  doc.font('Helvetica').fontSize(8).fillColor(C.muted)
    .text('Powered by OyeAstro · oyeastro.com · Vedic Astrology Engine', 50, 800, { width: 495, align: 'center' })
  doc.font('Helvetica').fontSize(8).fillColor(C.muted)
    .text(`Page ${pageNum}`, 545, 800, { align: 'right', width: 60 })
}

// ─── Gradient-style header banner ────────────────────────────────────────────
function bannerHeader(doc: PDFKit.PDFDocument, title: string, subtitle: string, color1: string) {
  doc.rect(0, 0, 612, 100).fill(color1)
  // decorative arc
  doc.circle(560, -20, 80).fill('#ffffff10')
  doc.circle(50, 110, 60).fill('#ffffff10')

  doc.font('Helvetica-Bold').fontSize(22).fillColor(C.white)
    .text(title, 50, 28, { width: 512, align: 'center' })
  doc.font('Helvetica').fontSize(11).fillColor('#ffffffCC')
    .text(subtitle, 50, 58, { width: 512, align: 'center' })

  doc.y = 115
}

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC: generatePersonalPdf
// ═══════════════════════════════════════════════════════════════════════════════
export function generatePersonalPdf(data: PersonalPdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4', autoFirstPage: true })
      const buffers: Buffer[] = []
      doc.on('data', (c) => buffers.push(c))
      doc.on('end', () => resolve(Buffer.concat(buffers)))

      let pageNum = 1

      // ── Page 1: Cover + Kundli Chart ──────────────────────────────────────
      bannerHeader(doc,
        `🔮 ${data.name}'s Premium Cosmic Forecast`,
        '2025–2026 Annual Vedic Astrology Report by OyeAstro',
        C.midnight
      )

      // Big Three Info Box
      doc.rect(50, doc.y, 512, 70).fill(C.bgPurple)
      const infoY = doc.y + 8
      doc.font('Helvetica-Bold').fontSize(10).fillColor(C.lavender)
        .text('YOUR COSMIC PROFILE', 50, infoY, { width: 512, align: 'center' })
      doc.font('Helvetica').fontSize(9).fillColor(C.ink)
        .text(`Rising Sign (Lagna): ${data.lagna}    ·    Nakshatra: ${data.nakshatra}    ·    Active Mahadasha: ${data.mahadasha}`, 50, infoY + 18, { width: 512, align: 'center' })

      if (data.bigThree) {
        doc.font('Helvetica').fontSize(9).fillColor(C.muted)
          .text(`Sun: ${data.bigThree?.sun?.sign || ''}   ·   Moon: ${data.bigThree?.moon?.sign || ''}   ·   Rising: ${data.bigThree?.rising?.sign || ''}`, 50, infoY + 34, { width: 512, align: 'center' })
      }
      doc.y = infoY + 72
      doc.moveDown(1)

      // Kundli Chart
      if (data.positions && data.houseData) {
        sectionHeader(doc, '🪐  Birth Chart (Janma Kundli)', C.midnight)
        doc.moveDown(0.5)

        const chartCy = doc.y + 140
        drawKundliChart(doc, 306, chartCy, 240, data.houseData, data.positions, data.houseData.lagnaSignIndex, data.name)
        doc.y = chartCy + 130
        doc.moveDown(1.5)

        // Planet table
        sectionHeader(doc, '🌍  Planetary Positions at Birth', C.lavender)
        const planets = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra', 'Ke']
        const pNames: Record<string, string> = {
          Su: 'Sun', Mo: 'Moon', Ma: 'Mars', Me: 'Mercury',
          Ju: 'Jupiter', Ve: 'Venus', Sa: 'Saturn', Ra: 'Rahu', Ke: 'Ketu'
        }
        planets.forEach((p, i) => {
          const pos = data.positions![p as keyof PlanetPositions]
          const signIdx = Math.floor(pos / 30)
          const degree = (pos % 30).toFixed(1)
          const house = data.houseData!.placements?.[p]?.houseIndex
          const color = i % 2 === 0 ? '#FAF6FF' : C.white
          doc.rect(50, doc.y, 512, 16).fill(color)
          doc.font('Helvetica-Bold').fontSize(8).fillColor(C.midnight)
            .text(pNames[p], 60, doc.y + 3, { width: 80 })
          doc.font('Helvetica').fontSize(8).fillColor(C.ink)
            .text(RASHI_NAMES[signIdx], 150, doc.y + 3, { width: 100 })
            .text(`${degree}°`, 260, doc.y + 3, { width: 60 })
            .text(`House ${house}`, 330, doc.y + 3, { width: 80 })
          doc.y += 16
        })
        doc.moveDown(1)
      }

      // ── Page 2: Yogas, Vibe, Remedies ────────────────────────────────────
      doc.addPage()
      pageNum++
      addFooter(doc, pageNum)

      sectionHeader(doc, '⚡  Active Yogas in Your Chart', C.coral)
      if (data.yogas && data.yogas.length) {
        data.yogas.forEach(yoga => {
          const dotColor = yoga.detected ? C.sage : C.muted
          doc.rect(60, doc.y, 8, 8).fill(dotColor)
          doc.font('Helvetica-Bold').fontSize(9).fillColor(yoga.detected ? C.sage : C.muted)
            .text(yoga.name, 76, doc.y - 1, { width: 200 })
          doc.font('Helvetica').fontSize(8).fillColor(C.ink)
            .text(yoga.description, 60, doc.y + 2, { width: 492, lineGap: 2 })
          doc.moveDown(0.8)
        })
      }

      if (data.vibeScore) {
        doc.moveDown(0.5)
        sectionHeader(doc, `✨  Today's Cosmic Vibe Score: ${data.vibeScore.score}/10 — ${data.vibeScore.label}`, C.coral)
        data.vibeScore.factors?.forEach((f: any) => {
          scoreBar(doc, f.name, (f.points / f.max) * 100, C.coral)
        })
      }

      if (data.flags) {
        doc.moveDown(0.5)
        sectionHeader(doc, '🟢  Your Cosmic Strengths', C.sage)
        data.flags.green?.forEach(g => {
          doc.font('Helvetica').fontSize(9).fillColor(C.ink)
            .text(`✓  ${g}`, 65, doc.y, { width: 492, lineGap: 2 })
          doc.moveDown(0.4)
        })

        doc.moveDown(0.5)
        sectionHeader(doc, '🔴  Watch Out For', C.coral)
        data.flags.red?.forEach(r => {
          doc.font('Helvetica').fontSize(9).fillColor(C.ink)
            .text(`⚠  ${r}`, 65, doc.y, { width: 492, lineGap: 2 })
          doc.moveDown(0.4)
        })
      }

      if (data.remedies) {
        doc.moveDown(0.5)
        sectionHeader(doc, '💎  Your Personalised Remedies', C.gold)
        const rem = data.remedies
        if (rem.stone) infoRow(doc, 'Lucky Stone:', rem.stone, C.gold, C.ink)
        if (rem.color) infoRow(doc, 'Lucky Color:', rem.color, C.gold, C.ink)
        if (rem.mantra) infoRow(doc, 'Daily Mantra:', rem.mantra, C.gold, C.ink)
        if (rem.tips) textBlock(doc, rem.tips, C.ink)
      }

      // ── Page 3: Premium AI Report Sections ───────────────────────────────
      doc.addPage()
      pageNum++
      addFooter(doc, pageNum)

      // Decorative top bar
      doc.rect(0, 0, 612, 12).fill(C.coral)
      doc.y = 22

      const reportSections = [
        { title: '📅  Life Chapters — Dasha Era Analysis', content: data.dashaAnalysis, color: C.midnight },
        { title: '🪐  Star Shift Cycles — Transit Forecast', content: data.transitDates, color: C.lavender },
        { title: '💼  Job & Cash Windows — Career Outlook', content: data.careerWindows, color: C.teal },
        { title: '💖  Love & Relationships — Connection Forecast', content: data.loveWindows, color: C.coral },
        { title: '🔋  Energy & Wellbeing — Health Signals', content: data.healthWarnings, color: C.sage },
      ]

      reportSections.forEach(sec => {
        if (doc.y > 720) { doc.addPage(); pageNum++; addFooter(doc, pageNum) }
        sectionHeader(doc, sec.title, sec.color)
        textBlock(doc, sec.content, C.ink)
        doc.moveDown(0.5)
      })

      // Final footer note
      doc.moveDown(1)
      doc.rect(50, doc.y, 512, 40).fill(C.bgPurple)
      doc.font('Helvetica').fontSize(9).fillColor(C.muted)
        .text('This report has been generated using the Vedic astrology calculation engine built by OyeAstro. Interpretations are meant for insight and inspiration — not as medical or legal advice.', 58, doc.y + 6, { width: 496, align: 'justify', lineGap: 2 })

      doc.end()
    } catch (err) {
      reject(err)
    }
  })
}

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC: generateCompatibilityPdf
// ═══════════════════════════════════════════════════════════════════════════════
export function generateCompatibilityPdf(data: CompatibilityPdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4', autoFirstPage: true })
      const buffers: Buffer[] = []
      doc.on('data', (c) => buffers.push(c))
      doc.on('end', () => resolve(Buffer.concat(buffers)))

      let pageNum = 1

      // ── Page 1: Cover + Score ─────────────────────────────────────────────
      bannerHeader(doc,
        `✨ Cosmic Compatibility Report`,
        `${data.cName1}  ♥  ${data.cName2}`,
        C.lavender
      )

      // Big Score Box
      const scoreY = doc.y
      doc.rect(156, scoreY, 300, 90).fill(C.bgPurple)
      doc.font('Helvetica').fontSize(9).fillColor(C.muted)
        .text('ASHTAKOOT MATCH SCORE', 156, scoreY + 12, { width: 300, align: 'center' })

      const scoreColor = data.score >= 70 ? C.sage : data.score >= 45 ? C.coral : '#E53935'
      doc.font('Helvetica-Bold').fontSize(44).fillColor(scoreColor)
        .text(`${data.score}%`, 156, scoreY + 28, { width: 300, align: 'center' })

      const label = data.score >= 70 ? 'Highly Compatible ✨' : data.score >= 45 ? 'Moderate Compatibility' : 'Challenging Match'
      doc.font('Helvetica').fontSize(10).fillColor(C.muted)
        .text(label, 156, scoreY + 72, { width: 300, align: 'center' })

      doc.y = scoreY + 100
      doc.moveDown(1.2)

      // Compatibility Dimension Bars
      sectionHeader(doc, '🎯  Ashtakoot Compatibility Dimensions', C.lavender)
      const dims = [
        { label: '🎭 Temperament (Gana)', val: data.details?.temp ?? 80, color: C.teal },
        { label: '💖 Heart Connect (Bhakoot)', val: data.details?.heart ?? 75, color: C.coral },
        { label: '🚀 Destiny (Yoni / Nadi)', val: data.details?.destiny ?? 70, color: C.sage },
        { label: '🤝 Trust Bond (Graha Maitri)', val: data.details?.trust ?? 85, color: C.lavender },
      ]
      dims.forEach(d => scoreBar(doc, d.label, d.val, d.color))
      doc.moveDown(0.8)

      // Narrative
      sectionHeader(doc, '🌌  Cosmic Connection Insight', C.midnight)
      doc.rect(50, doc.y, 512, 4).fill(C.lavender)
      doc.moveDown(0.6)
      doc.font('Helvetica').fontSize(11).fillColor(C.midnight)
        .text(`"${data.narrative}"`, 60, doc.y, { align: 'justify', lineGap: 4, width: 492, oblique: true })
      doc.moveDown(1.2)

      // ── Page 2: Kundli Charts side by side ──────────────────────────────
      if (data.chart1?.houseData && data.chart1?.positions) {
        doc.addPage()
        pageNum++
        addFooter(doc, pageNum)

        doc.rect(0, 0, 612, 12).fill(C.lavender)
        doc.y = 22

        sectionHeader(doc, `🪐  Birth Charts (Janma Kundli)`, C.midnight)
        doc.moveDown(0.5)

        const chartSize = 210
        const cy1 = doc.y + chartSize / 2 + 10

        // Chart 1 (left side)
        drawKundliChart(doc,
          50 + chartSize / 2, cy1, chartSize,
          data.chart1.houseData, data.chart1.positions,
          data.chart1.houseData.lagnaSignIndex,
          data.cName1
        )

        // Chart 2 (right side, if available)
        if (data.chart2?.houseData && data.chart2?.positions) {
          drawKundliChart(doc,
            562 - chartSize / 2, cy1, chartSize,
            data.chart2.houseData, data.chart2.positions,
            data.chart2.houseData.lagnaSignIndex,
            data.cName2
          )
        }

        doc.y = cy1 + chartSize / 2 + 30

        // Planet tables side by side
        sectionHeader(doc, '🌍  Planetary Positions — Both Partners', C.lavender)

        const pNames: Record<string, string> = {
          Su: 'Sun', Mo: 'Moon', Ma: 'Mars', Me: 'Mercury',
          Ju: 'Jupiter', Ve: 'Venus', Sa: 'Saturn', Ra: 'Rahu', Ke: 'Ketu'
        }
        const planets = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra', 'Ke']

        // Header row
        doc.rect(50, doc.y, 512, 18).fill(C.midnight)
        doc.font('Helvetica-Bold').fontSize(8).fillColor(C.white)
          .text('Planet', 60, doc.y + 5, { width: 70 })
          .text(`${data.cName1} — Sign / House`, 140, doc.y + 5, { width: 190 })
          .text(`${data.cName2} — Sign / House`, 340, doc.y + 5, { width: 190 })
        doc.y += 18

        planets.forEach((p, i) => {
          const bg = i % 2 === 0 ? '#F8F4FF' : C.white
          doc.rect(50, doc.y, 512, 16).fill(bg)

          const pos1 = data.chart1!.positions![p as keyof PlanetPositions]
          const sign1 = RASHI_NAMES[Math.floor(pos1 / 30)]
          const house1 = data.chart1!.houseData!.placements?.[p]?.houseIndex

          doc.font('Helvetica-Bold').fontSize(8).fillColor(C.midnight)
            .text(pNames[p], 60, doc.y + 4, { width: 70 })
          doc.font('Helvetica').fontSize(8).fillColor(C.ink)
            .text(`${sign1} · H${house1}`, 140, doc.y + 4, { width: 190 })

          if (data.chart2?.positions) {
            const pos2 = data.chart2.positions[p as keyof PlanetPositions]
            const sign2 = RASHI_NAMES[Math.floor(pos2 / 30)]
            const house2 = data.chart2?.houseData?.placements?.[p]?.houseIndex
            doc.font('Helvetica').fontSize(8).fillColor(C.ink)
              .text(`${sign2} · H${house2}`, 340, doc.y + 4, { width: 190 })
          }
          doc.y += 16
        })
      }

      // ── Final footer note ────────────────────────────────────────────────
      doc.moveDown(1.5)
      doc.rect(50, doc.y, 512, 40).fill(C.bgPurple)
      doc.font('Helvetica').fontSize(9).fillColor(C.muted)
        .text('This compatibility report has been generated using the Vedic Ashtakoot method. It is meant for insight and inspiration — not medical or legal advice. Powered by OyeAstro · oyeastro.com', 58, doc.y + 8, { width: 496, align: 'justify', lineGap: 2 })

      doc.end()
    } catch (err) {
      reject(err)
    }
  })
}
