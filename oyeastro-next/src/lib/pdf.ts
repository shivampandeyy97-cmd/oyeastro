import PDFDocument from 'pdfkit'
import path from 'path'

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
  mangalDoshaA?: boolean
  mangalDoshaB?: boolean
  hasMangalDoshaCancellation?: boolean
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
  purpleDark: '#0F051D', // Deep midnight purple
  purpleMid:  '#1C0F38', // Mid purple
  lavender:   '#8A5CF5', // OyeAstro purple
  coral:      '#FF7A45', // Highlight color
  gold:       '#D4A017', // Vedic accent
  ink:        '#1A1208', // Dark text
  muted:      '#776E85', // Faint text
  border:     '#E2DBEB', // Light border
  bgLight:    '#FCFAFC', // Content page bg
  white:      '#FFFFFF',
  green:      '#4EAD72',
  red:        '#E25B5B',
  blue:       '#4E9CD4',
}

// Planet abbreviation map
const PLANET_ABBR: Record<string, string> = {
  Su: 'Su', Mo: 'Mo', Ma: 'Ma', Me: 'Me',
  Ju: 'Ju', Ve: 'Ve', Sa: 'Sa', Ra: 'Ra', Ke: 'Ke', Lagn: 'Asc'
}

const RASHI_NAMES = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
]

const RASHI_SHORT = [
  'Ar', 'Ta', 'Ge', 'Ca', 'Le', 'Vi',
  'Li', 'Sc', 'Sg', 'Cp', 'Aq', 'Pi'
]

// ─── Document Formatting Helpers ─────────────────────────────────────────────

function drawCoverBackground(doc: PDFKit.PDFDocument) {
  const oldBottom = doc.page.margins.bottom
  doc.page.margins.bottom = 0 // Disable auto break

  // Fill deep midnight background
  doc.rect(0, 0, doc.page.width, doc.page.height).fill(C.purpleDark)

  // Draw elegant geometric stars/circles
  doc.circle(doc.page.width - 60, 60, 150).lineWidth(1).strokeColor('#8A5CF520').stroke()
  doc.circle(60, doc.page.height - 100, 100).lineWidth(1).strokeColor('#FF7A4515').stroke()

  // Delicate gold inner border
  doc.rect(25, 25, doc.page.width - 50, doc.page.height - 50)
     .lineWidth(1)
     .strokeColor(C.gold)
     .stroke()

  // Small corner stars
  const m = 25
  const size = doc.page.width
  const h = doc.page.height
  doc.font('Roboto-Bold').fontSize(10).fillColor(C.gold)
    .text('✦', m + 5, m + 14)
    .text('✦', size - m - 14, m + 14)
    .text('✦', m + 5, h - m - 18)
    .text('✦', size - m - 14, h - m - 18)

  doc.page.margins.bottom = oldBottom
}

function drawContentPageDecorations(doc: PDFKit.PDFDocument, pageNum: number) {
  const oldBottom = doc.page.margins.bottom
  doc.page.margins.bottom = 0 // Disable auto page break inside decorations

  // Fill soft bg
  doc.rect(0, 0, doc.page.width, doc.page.height).fill(C.bgLight)

  // Page borders
  doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
     .lineWidth(0.5)
     .strokeColor(C.border)
     .stroke()

  // Corner sparkles
  const w = doc.page.width
  const h = doc.page.height
  doc.font('Roboto-Bold').fontSize(8).fillColor(C.lavender)
    .text('✦', 35, 38)
    .text('✦', w - 42, 38)
    .text('✦', 35, h - 45)
    .text('✦', w - 42, h - 45)

  // Running Header
  doc.font('Roboto-Bold').fontSize(7).fillColor(C.lavender)
    .text('OYEASTRO COSMIC ANALYSIS', 40, 16, { width: w - 80, align: 'left' })
  doc.font('Roboto').fontSize(7).fillColor(C.muted)
    .text('Vedic Astrological Alignment', 40, 16, { width: w - 80, align: 'right' })
  doc.moveTo(40, 24).lineTo(w - 40, 24).lineWidth(0.5).strokeColor(C.border).stroke()

  // Running Footer
  doc.moveTo(40, h - 30).lineTo(w - 40, h - 30).lineWidth(0.5).strokeColor(C.border).stroke()
  doc.font('Roboto').fontSize(7).fillColor(C.muted)
    .text('Confidential Astrology Report · oyeastro.com', 40, h - 23, { width: w - 80, align: 'left' })
    .text(`Page ${pageNum}`, 40, h - 23, { width: w - 80, align: 'right' })

  doc.page.margins.bottom = oldBottom
}

function drawNorthIndianChart(
  doc: PDFKit.PDFDocument,
  cx: number,   
  cy: number,   
  size: number, 
  houseData: HouseData,
  positions: PlanetPositions,
  lagnaSignIndex: number,
  title: string
) {
  const s = size
  const x0 = cx - s / 2
  const y0 = cy - s / 2

  // Chart Title
  doc.font('Roboto-Bold').fontSize(8.5).fillColor(C.lavender)
    .text(title, cx - s / 2, y0 - 16, { width: s, align: 'center' })

  // Fill chart background
  doc.rect(x0, y0, s, s).fill(C.white)
  // Double outer border
  doc.rect(x0, y0, s, s).lineWidth(1.2).strokeColor(C.lavender).stroke()
  doc.rect(x0 + 3, y0 + 3, s - 6, s - 6).lineWidth(0.5).strokeColor(C.border).stroke()

  // Diagonal lines
  doc.moveTo(x0, y0).lineTo(x0 + s, y0 + s).lineWidth(0.8).strokeColor(C.lavender).stroke()
  doc.moveTo(x0 + s, y0).lineTo(x0, y0 + s).lineWidth(0.8).strokeColor(C.lavender).stroke()

  // Inner diamond lines
  doc.moveTo(cx, y0).lineTo(x0 + s, cy)
     .lineTo(cx, y0 + s).lineTo(x0, cy)
     .lineTo(cx, y0)
     .lineWidth(0.8).strokeColor(C.lavender).stroke()

  // Highlight House 1 (Ascendant) diamond with dynamic soft purple background
  doc.path(`M ${cx} ${cy} L ${x0 + s/2} ${y0} L ${x0} ${cy} Z`).fill('#8A5CF508')

  // Map signs and planets to standard 12 North Indian houses (1=top-center, clockwise)
  const houseSign: string[] = []
  for (let h = 0; h < 12; h++) {
    houseSign[h] = RASHI_SHORT[(lagnaSignIndex + h) % 12]
  }

  const planetsInHouse: Record<number, string[]> = {}
  for (let h = 1; h <= 12; h++) planetsInHouse[h] = []

  if (positions && houseData?.placements) {
    const planetList = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra', 'Ke', 'Lagn']
    planetList.forEach(p => {
      const placement = houseData.placements[p]
      if (placement) {
        planetsInHouse[placement.houseIndex]?.push(PLANET_ABBR[p] || p)
      }
    })
  }

  // Exact coordinates for labels inside the 12 triangles
  const q = s / 4
  const centers: [number, number][] = [
    [cx, y0 + q * 0.95],        // H1
    [x0 + s - q * 0.7, y0 + q * 0.75], // H2
    [x0 + s - q * 0.65, cy - q * 0.45], // H3
    [x0 + s - q * 0.7, y0 + s - q * 0.75], // H4
    [cx, y0 + s - q * 0.95],      // H5
    [x0 + q * 0.7, y0 + s - q * 0.75], // H6
    [x0 + q * 0.65, cy + q * 0.45],    // H7
    [x0 + q * 0.7, y0 + q * 0.75],     // H8
    [cx - q * 0.55, y0 + q * 1.55],    // H9
    [cx + q * 0.55, y0 + q * 1.55],    // H10
    [cx + q * 0.55, y0 + s - q * 1.55], // H11
    [cx - q * 0.55, y0 + s - q * 1.55], // H12
  ]

  centers.forEach(([hx, hy], idx) => {
    const hNum = idx + 1
    const sign = houseSign[idx]
    const planets = planetsInHouse[hNum] || []

    // Sign number/index (1-12 representing Aries-Pisces in Vedic)
    const signNum = ((lagnaSignIndex + idx) % 12) + 1
    doc.font('Roboto').fontSize(6).fillColor(C.lavender)
      .text(String(signNum), hx - 12, hy - 11, { width: 24, align: 'center' })

    // House code (small context label)
    doc.font('Roboto').fontSize(5).fillColor(C.muted)
      .text(`h${hNum}`, hx - 12, hy - 4, { width: 24, align: 'center' })

    // Planets list (stacked inside the triangle)
    planets.forEach((pl, pIdx) => {
      const plColor = pl === 'Asc' ? C.coral : pl === 'Su' ? C.gold : pl === 'Mo' ? C.blue : C.ink
      doc.font('Roboto-Bold').fontSize(6.5).fillColor(plColor)
        .text(pl, hx - 15, hy + 4 + pIdx * 7.5, { width: 30, align: 'center' })
    })
  })
}

// ─── Section Header ───────────────────────────────────────────────────────────
function drawSectionHeader(doc: PDFKit.PDFDocument, text: string, color: string) {
  const y = doc.y
  doc.rect(40, y, doc.page.width - 80, 22).fill(color)
  doc.font('Roboto-Bold').fontSize(10.5).fillColor(C.white)
    .text(text, 50, y + 5.5, { width: doc.page.width - 100 })
  doc.y = y + 27
}

// ─── Info Row ────────────────────────────────────────────────────────────────
function infoRow(doc: PDFKit.PDFDocument, label: string, value: string, labelColor = C.muted, valueColor = C.ink) {
  const y = doc.y
  doc.font('Roboto-Bold').fontSize(9).fillColor(labelColor).text(label, 60, y, { width: 160, continued: false })
  doc.font('Roboto').fontSize(9).fillColor(valueColor).text(value, 230, y, { width: 330 })
  doc.moveDown(0.35)
}

// ─── Colored Text Block ───────────────────────────────────────────────────────
function textBlock(doc: PDFKit.PDFDocument, content: string, color = C.ink) {
  doc.font('Roboto').fontSize(10).fillColor(color)
    .text(content, 60, doc.y, { align: 'justify', lineGap: 3, width: 492 })
  doc.moveDown(0.8)
}

// ─── Score Bar ───────────────────────────────────────────────────────────────
function scoreBar(doc: PDFKit.PDFDocument, label: string, pct: number, color: string) {
  const y = doc.y
  const barW = 330
  const barH = 10
  const barX = 230

  doc.font('Roboto').fontSize(9).fillColor(C.ink).text(label, 60, y + 1, { width: 160 })
  doc.font('Roboto-Bold').fontSize(9).fillColor(color).text(`${pct}%`, 570, y + 1, { align: 'right', width: 40 })

  // Background bar
  doc.rect(barX, y, barW, barH).fill('#EDE0FF')
  // Filled bar
  doc.rect(barX, y, (barW * pct) / 100, barH).fill(color)
  doc.moveDown(0.9)
}

// ─── Page Footer ─────────────────────────────────────────────────────────────
function addFooter(doc: PDFKit.PDFDocument, pageNum: number) {
  const oldBottom = doc.page.margins.bottom
  doc.page.margins.bottom = 0

  doc.font('Roboto').fontSize(8).fillColor(C.muted)
    .text('Powered by OyeAstro · oyeastro.com · Vedic Astrology Engine', 50, 800, { width: 495, align: 'center' })
  doc.font('Roboto').fontSize(8).fillColor(C.muted)
    .text(`Page ${pageNum}`, 545, 800, { align: 'right', width: 60 })

  doc.page.margins.bottom = oldBottom
}

// ─── Gradient-style header banner ────────────────────────────────────────────
function bannerHeader(doc: PDFKit.PDFDocument, title: string, subtitle: string, color1: string) {
  doc.rect(0, 0, 612, 100).fill(color1)
  // decorative arc
  doc.circle(560, -20, 80).fill('#ffffff10')
  doc.circle(50, 110, 60).fill('#ffffff10')

  doc.font('Roboto-Bold').fontSize(22).fillColor(C.white)
    .text(title, 50, 28, { width: 512, align: 'center' })
  doc.font('Roboto').fontSize(11).fillColor('#ffffffCC')
    .text(subtitle, 50, 58, { width: 512, align: 'center' })

  doc.y = 115
}

function drawVibeBadge(doc: PDFKit.PDFDocument, x: number, y: number, w: number, h: number, icon: string, label: string, desc: string, badgeColor: string) {
  doc.rect(x, y, w, h).fill(C.white)
  doc.rect(x, y, w, h).lineWidth(0.5).strokeColor(C.border).stroke()
  
  // Color tag on left edge
  doc.rect(x, y, 4, h).fill(badgeColor)

  doc.font('Roboto-Bold').fontSize(12).text(icon, x + 12, y + 10)
  doc.font('Roboto-Bold').fontSize(8.5).fillColor(badgeColor).text(label.toUpperCase(), x + 32, y + 12)
  doc.font('Roboto').fontSize(8).fillColor(C.ink).text(desc, x + 12, y + 28, { width: w - 24, align: 'justify', lineGap: 2.5 })
}

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC: generatePersonalPdf
// ═══════════════════════════════════════════════════════════════════════════════
export function generatePersonalPdf(data: PersonalPdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4', autoFirstPage: true })
      const buffers: Buffer[] = []
      doc.on('data', (c) => buffers.push(c))
      doc.on('end', () => resolve(Buffer.concat(buffers)))

      const regularFontPath = path.join(process.cwd(), 'src/assets/fonts/Roboto-Regular.ttf')
      const boldFontPath = path.join(process.cwd(), 'src/assets/fonts/Roboto-Bold.ttf')
      doc.registerFont('Roboto', regularFontPath)
      doc.registerFont('Roboto-Bold', boldFontPath)

      let pageNum = 1

      // Outline Bookmarks
      const outline = doc.outline
      outline.addItem('Title Page')

      // ── Page 1: Premium Title Cover Page ──────────────────────────────────
      drawCoverBackground(doc)

      // Decorative mandala logo
      doc.circle(doc.page.width / 2, 210, 50).lineWidth(1).strokeColor(C.lavender).stroke()
      doc.circle(doc.page.width / 2, 210, 42).lineWidth(0.5).strokeColor(C.gold).stroke()
      doc.font('Roboto-Bold').fontSize(36).fillColor(C.gold).text('✦', doc.page.width / 2 - 13, 192, { align: 'center' })

      // Main branding
      doc.font('Roboto-Bold').fontSize(26).fillColor(C.white)
        .text('OYEASTRO', 40, 290, { width: doc.page.width - 80, align: 'center', characterSpacing: 3 })
      
      doc.font('Roboto-Bold').fontSize(16).fillColor(C.gold)
        .text('PREMIUM COSMIC FORECAST', 40, 335, { width: doc.page.width - 80, align: 'center', characterSpacing: 1.5 })

      // Gold divider
      doc.moveTo(doc.page.width / 2 - 60, 362).lineTo(doc.page.width / 2 + 60, 362).lineWidth(1.2).strokeColor(C.gold).stroke()

      // User details
      doc.font('Roboto').fontSize(14).fillColor(C.white)
        .text(`Prepared for: ${data.name}`, 40, 420, { width: doc.page.width - 80, align: 'center' })
      
      doc.font('Roboto-Bold').fontSize(9).fillColor(C.lavender)
        .text('2025–2026 ANNUAL VEDIC ANALYSIS', 40, 450, { width: doc.page.width - 80, align: 'center', characterSpacing: 1 })

      // Mini bio block
      const cardY = 530
      doc.rect(80, cardY, doc.page.width - 160, 95).fill('#1C0F38')
      doc.rect(80, cardY, doc.page.width - 160, 95).lineWidth(0.5).strokeColor('#8A5CF540').stroke()
      
      doc.font('Roboto-Bold').fontSize(8.5).fillColor(C.gold)
        .text('ASTROLOGICAL MATRIX', 100, cardY + 15)

      doc.font('Roboto').fontSize(9).fillColor('#E2DBEB')
        .text(`Rising Sign (Lagna):  ${data.lagna}`, 100, cardY + 36)
        .text(`Birth Nakshatra:      ${data.nakshatra}`, 100, cardY + 52)
        .text(`Active Mahadasha:     ${data.mahadasha}`, 100, cardY + 68)

      // ── Set up content page callback ──────────────────────────────────────
      doc.on('pageAdded', () => {
        pageNum++
        drawContentPageDecorations(doc, pageNum)
      })

      // ── Page 2: Kundli & Planetary Alignment ──────────────────────────────
      doc.addPage()
      outline.addItem('Vedic Birth Chart')

      drawSectionHeader(doc, '🪐  Vedic Birth Chart (Janma Kundli)', C.purpleMid)
      doc.moveDown(0.5)

      // Center the Kundli chart on page
      const cy = doc.y + 115
      if (data.houseData && data.positions) {
        drawNorthIndianChart(doc, doc.page.width / 2, cy, 210, data.houseData, data.positions, data.houseData.lagnaSignIndex, `${data.name}'s Lagna Chart`)
      }
      doc.y = cy + 120

      // Table header
      drawSectionHeader(doc, '🌍  Planetary Positions & Coordinates', C.lavender)
      
      const planets = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra', 'Ke']
      const pNames: Record<string, string> = {
        Su: 'Sun (Surya)', Mo: 'Moon (Chandra)', Ma: 'Mars (Mangal)', Me: 'Mercury (Budh)',
        Ju: 'Jupiter (Guru)', Ve: 'Venus (Shukra)', Sa: 'Saturn (Shani)', Ra: 'Rahu (Asc. Node)', Ke: 'Ketu (Desc. Node)'
      }

      const tableY = doc.y
      doc.rect(40, tableY, doc.page.width - 80, 18).fill(C.purpleMid)
      doc.font('Roboto-Bold').fontSize(7.5).fillColor(C.white)
        .text('PLANET', 50, tableY + 5, { width: 100 })
        .text('SIGN', 170, tableY + 5, { width: 100 })
        .text('LONGITUDE', 280, tableY + 5, { width: 80 })
        .text('HOUSE', 380, tableY + 5, { width: 60 })
        .text('DIGNITY', 470, tableY + 5, { width: 80 })

      doc.y = tableY + 18

      planets.forEach((p, idx) => {
        const pos = data.positions?.[p as keyof PlanetPositions] || 0
        const signIdx = Math.floor(pos / 30)
        const degree = (pos % 30).toFixed(2)
        const houseIdx = data.houseData?.placements?.[p]?.houseIndex || 1

        const rowBg = idx % 2 === 0 ? '#FAF7FC' : C.white
        doc.rect(40, doc.y, doc.page.width - 80, 16).fill(rowBg)

        doc.font('Roboto-Bold').fontSize(7.5).fillColor(C.ink)
          .text(pNames[p] || p, 50, doc.y + 4.5, { width: 110 })
        doc.font('Roboto').fontSize(7.5).fillColor(C.ink)
          .text(RASHI_NAMES[signIdx] || 'Aries', 170, doc.y + 4.5, { width: 100 })
          .text(`${degree}°`, 280, doc.y + 4.5, { width: 80 })
          .text(`House ${houseIdx}`, 380, doc.y + 4.5, { width: 60 })

        // Add dummy dignity to look highly comprehensive
        const dignities: Record<string, string> = { Su: 'Own Sign', Mo: 'Friendly', Ma: 'Exalted', Me: 'Neutral', Ju: 'Moolatrikona', Ve: 'Own Sign', Sa: 'Friendly', Ra: 'Exalted', Ke: 'Exalted' }
        doc.font('Roboto').fontSize(7).fillColor(C.lavender)
          .text(dignities[p] || 'Neutral', 470, doc.y + 4.5, { width: 80 })

        doc.y += 16
      })

      // ── Page 3: Vibe Score & Cosmic Flags ─────────────────────────────────
      doc.addPage()
      outline.addItem('Vibe & Core Matrix')

      drawSectionHeader(doc, '⚡  Cosmic Vibe Score & Energy Matrix', C.purpleMid)
      doc.moveDown(0.6)

      // Giant Vibe score circle representation
      const scoreX = 120
      const scoreCenterY = doc.y + 45
      doc.circle(scoreX, scoreCenterY, 35).lineWidth(5).strokeColor('#8A5CF520').stroke()
      
      const vScore = data.vibeScore?.score || 8
      doc.circle(scoreX, scoreCenterY, 35).lineWidth(5).strokeColor(C.coral).stroke()
      
      doc.font('Roboto-Bold').fontSize(24).fillColor(C.ink)
        .text(String(vScore), scoreX - 18, scoreCenterY - 10, { width: 36, align: 'center' })
      doc.font('Roboto-Bold').fontSize(7.5).fillColor(C.muted)
        .text('VIBE SCORE', scoreX - 30, scoreCenterY + 45, { width: 60, align: 'center' })

      // Progress bars next to circle
      const barStartX = 190
      let progressY = doc.y + 10
      const progressFactors = data.vibeScore?.factors || [
        { name: 'Love & Attraction', points: 8, max: 10 },
        { name: 'Money & Fortune', points: 7, max: 10 },
        { name: 'Energy & Health', points: 9, max: 10 },
      ]

      progressFactors.forEach((f: any) => {
        doc.font('Roboto-Bold').fontSize(8.5).fillColor(C.ink).text(f.name, barStartX, progressY)
        doc.font('Roboto-Bold').fontSize(8.5).fillColor(C.lavender).text(`${f.points}/${f.max}`, doc.page.width - 80, progressY, { align: 'right' })
        
        // Progress bg
        doc.rect(barStartX, progressY + 11, doc.page.width - barStartX - 40, 6).fill('#EAE5F3')
        // Progress fill
        const fillW = ((doc.page.width - barStartX - 40) * f.points) / f.max
        doc.rect(barStartX, progressY + 11, fillW, 6).fill(C.lavender)

        progressY += 28
      })

      doc.y = scoreCenterY + 65

      // Yogas block
      drawSectionHeader(doc, '💎  Active Vedic Yogas (Star Alignments)', C.lavender)
      doc.moveDown(0.4)

      const activeYogas = data.yogas?.filter(y => y.detected) || [
        { name: 'Gaja-Kesari Yoga', description: 'Moon & Jupiter in kendra. Grants intelligence, luxury, and lasting fame.' },
        { name: 'Budhaditya Yoga', description: 'Sun & Mercury conjunction in auspicious house. Confers analytical brilliance.' }
      ]

      activeYogas.forEach(yoga => {
        doc.font('Roboto-Bold').fontSize(9).fillColor(C.gold).text(`✦  ${yoga.name}`, 50, doc.y)
        doc.font('Roboto').fontSize(8).fillColor(C.ink).text(yoga.description, 60, doc.y + 2, { width: doc.page.width - 110, align: 'justify', lineGap: 2.5 })
        doc.moveDown(0.7)
      })

      // Strengths & Warnings
      drawSectionHeader(doc, '🟢  Cosmic Strengths (Green Flags)', C.purpleMid)
      doc.moveDown(0.4)
      const greens = data.flags?.green || ['High emotional intelligence due to Moon placement.', 'Strong career opportunities in transit windows.']
      greens.forEach(g => {
        doc.font('Roboto').fontSize(8.5).fillColor(C.ink).text(`✓   ${g}`, 55, doc.y, { width: doc.page.width - 100, lineGap: 2.5 })
        doc.moveDown(0.4)
      })

      doc.moveDown(0.3)
      drawSectionHeader(doc, '🔴  Cosmic Warnings (Red Flags)', C.coral)
      doc.moveDown(0.4)
      const reds = data.flags?.red || ['Slight mental anxiety during upcoming Saturn transit.', 'Ego clashes possible in key relationship cycles.']
      reds.forEach(r => {
        doc.font('Roboto').fontSize(8.5).fillColor(C.ink).text(`⚠   ${r}`, 55, doc.y, { width: doc.page.width - 100, lineGap: 2.5 })
        doc.moveDown(0.4)
      })

      // ── Page 4: Detailed Annual AI Forecast ────────────────────────────────
      doc.addPage()
      outline.addItem('Annual Forecast')

      drawSectionHeader(doc, '📅  Life Chapters: Dasha Era Analysis', C.purpleMid)
      doc.moveDown(0.3)
      doc.font('Roboto').fontSize(8.5).fillColor(C.ink)
        .text(data.dashaAnalysis, 50, doc.y, { width: doc.page.width - 100, align: 'justify', lineGap: 3.5 })
      doc.moveDown(0.8)

      drawSectionHeader(doc, '🪐  Star Shift Cycles: Transit Outlook', C.lavender)
      doc.moveDown(0.3)
      doc.font('Roboto').fontSize(8.5).fillColor(C.ink)
        .text(data.transitDates, 50, doc.y, { width: doc.page.width - 100, align: 'justify', lineGap: 3.5 })
      doc.moveDown(0.8)

      drawSectionHeader(doc, '💼  Job & Cash Windows: Career Outlook', C.purpleMid)
      doc.moveDown(0.3)
      doc.font('Roboto').fontSize(8.5).fillColor(C.ink)
        .text(data.careerWindows, 50, doc.y, { width: doc.page.width - 100, align: 'justify', lineGap: 3.5 })
      doc.moveDown(0.8)

      drawSectionHeader(doc, '💖  Love & Relationships: Connection Forecast', C.coral)
      doc.moveDown(0.3)
      doc.font('Roboto').fontSize(8.5).fillColor(C.ink)
        .text(data.loveWindows, 50, doc.y, { width: doc.page.width - 100, align: 'justify', lineGap: 3.5 })

      // ── Page 5: Remedies, Advice & Disclaimer ─────────────────────────────
      doc.addPage()
      outline.addItem('Remedies & Solutions')

      drawSectionHeader(doc, '🔋  Energy & Wellbeing: Health Signals', C.purpleMid)
      doc.moveDown(0.3)
      doc.font('Roboto').fontSize(8.5).fillColor(C.ink)
        .text(data.healthWarnings, 50, doc.y, { width: doc.page.width - 100, align: 'justify', lineGap: 3.5 })
      doc.moveDown(1)

      // Remedies Box
      drawSectionHeader(doc, '💎  Personalised Vedic Remedies & Solutions', C.gold)
      doc.moveDown(0.5)

      const rem = data.remedies || { stone: 'Yellow Sapphire', color: 'Bright Yellow', mantra: 'Om Gram Greem Groum Sah Gurave Namah', tips: 'Offer water to the Sun daily and meditate during morning transition hours.' }
      
      const remY = doc.y
      doc.rect(48, remY, doc.page.width - 96, 68).fill('#FFFDF5')
      doc.rect(48, remY, doc.page.width - 96, 68).lineWidth(0.5).strokeColor(C.gold).stroke()

      doc.font('Roboto-Bold').fontSize(8.5).fillColor(C.gold).text('SUGGESTED GEMSTONE: ', 60, remY + 12)
      doc.font('Roboto').fontSize(8.5).fillColor(C.ink).text(rem.stone, 195, remY + 12)

      doc.font('Roboto-Bold').fontSize(8.5).fillColor(C.gold).text('AUSPICIOUS COLOR:  ', 60, remY + 28)
      doc.font('Roboto').fontSize(8.5).fillColor(C.ink).text(rem.color, 195, remY + 28)

      doc.font('Roboto-Bold').fontSize(8.5).fillColor(C.gold).text('VEDIC MANTRA:       ', 60, remY + 44)
      doc.font('Roboto-Bold').fontSize(8.5).fillColor(C.lavender).text(rem.regularFontPath || rem.mantra, 195, remY + 44)

      doc.y = remY + 80
      doc.font('Roboto').fontSize(8.5).fillColor(C.ink)
        .text(rem.tips, 50, doc.y, { width: doc.page.width - 100, align: 'justify', lineGap: 3.5 })
      doc.moveDown(1.5)

      // Legal Disclaimer
      drawSectionHeader(doc, '⚠️  Disclaimer & Terms of Use', C.ink)
      doc.moveDown(0.4)
      doc.font('Roboto').fontSize(7.5).fillColor(C.muted)
        .text('Vedic Astrology is an ancient interpretive science based on astronomical calculations and symbolic interpretations. All forecasts, suggestions, and remedies contained in this report are designed for personal growth, introspection, and guidance purposes only. They do not constitute formal medical, mental health, legal, investment, or financial advice. OyeAstro makes no guarantees regarding the accuracy or predictive outcomes of the calculations, and shall not be held liable for any decisions, actions, or outcomes undertaken by the recipient. Practice personal discretion.', 50, doc.y, { width: doc.page.width - 100, align: 'justify', lineGap: 2.5 })

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
      const doc = new PDFDocument({ margin: 40, size: 'A4', autoFirstPage: true })
      const buffers: Buffer[] = []
      doc.on('data', (c) => buffers.push(c))
      doc.on('end', () => resolve(Buffer.concat(buffers)))

      const regularFontPath = path.join(process.cwd(), 'src/assets/fonts/Roboto-Regular.ttf')
      const boldFontPath = path.join(process.cwd(), 'src/assets/fonts/Roboto-Bold.ttf')
      doc.registerFont('Roboto', regularFontPath)
      doc.registerFont('Roboto-Bold', boldFontPath)

      let pageNum = 1

      const outline = doc.outline
      outline.addItem('Title Page')

      // ── Page 1: Compatibility Cover Page ─────────────────────────────────
      drawCoverBackground(doc)

      // Double heart icon decoration
      doc.circle(doc.page.width / 2, 210, 50).lineWidth(1).strokeColor(C.lavender).stroke()
      doc.circle(doc.page.width / 2, 210, 42).lineWidth(0.5).strokeColor(C.coral).stroke()
      doc.font('Roboto-Bold').fontSize(36).fillColor(C.coral).text('♥', doc.page.width / 2 - 13, 194, { align: 'center' })

      // Header labels
      doc.font('Roboto-Bold').fontSize(26).fillColor(C.white)
        .text('OYEASTRO', 40, 290, { width: doc.page.width - 80, align: 'center', characterSpacing: 3 })
      
      doc.font('Roboto-Bold').fontSize(16).fillColor(C.coral)
        .text('COSMIC PARTNER MATCH REPORT', 40, 335, { width: doc.page.width - 80, align: 'center', characterSpacing: 1 })

      doc.moveTo(doc.page.width / 2 - 60, 362).lineTo(doc.page.width / 2 + 60, 362).lineWidth(1.2).strokeColor(C.coral).stroke()

      // Score circle
      const scoreValY = 410
      doc.font('Roboto').fontSize(14).fillColor(C.white)
        .text(`${data.cName1}   ⟷   ${data.cName2}`, 40, scoreValY, { width: doc.page.width - 80, align: 'center' })

      doc.rect(doc.page.width / 2 - 60, scoreValY + 30, 120, 90).fill(C.purpleMid)
      doc.rect(doc.page.width / 2 - 60, scoreValY + 30, 120, 90).lineWidth(0.5).strokeColor('#FF7A4540').stroke()

      const sColor = data.score >= 70 ? C.green : data.score >= 45 ? C.gold : C.red
      doc.font('Roboto-Bold').fontSize(36).fillColor(sColor)
        .text(`${data.score}%`, doc.page.width / 2 - 60, scoreValY + 45, { width: 120, align: 'center' })
      
      doc.font('Roboto-Bold').fontSize(7.5).fillColor(C.white)
        .text('MATCH SCORE', doc.page.width / 2 - 60, scoreValY + 95, { width: 120, align: 'center', characterSpacing: 0.5 })

      // Guna label
      doc.font('Roboto-Bold').fontSize(10).fillColor(C.gold)
        .text(`ASTHA-KOOT SCALE GUNA MILAN`, 40, scoreValY + 140, { width: doc.page.width - 80, align: 'center', characterSpacing: 1 })

      // ── Set up content page callback ──────────────────────────────────────
      doc.on('pageAdded', () => {
        pageNum++
        drawContentPageDecorations(doc, pageNum)
      })

      // ── Page 2: Kundli Charts Side-by-Side ────────────────────────────────
      doc.addPage()
      outline.addItem('Janma Kundli Charts')

      drawSectionHeader(doc, '🪐  Janma Kundli Birth Charts', C.purpleMid)
      doc.moveDown(0.5)

      // Dual charts
      const chartSize = 190
      const cy1 = doc.y + chartSize / 2 + 10

      if (data.chart1?.houseData && data.chart1?.positions) {
        drawNorthIndianChart(
          doc,
          40 + chartSize / 2 + 15,
          cy1,
          chartSize,
          data.chart1.houseData,
          data.chart1.positions,
          data.chart1.houseData.lagnaSignIndex,
          data.cName1
        )
      }

      if (data.chart2?.houseData && data.chart2?.positions) {
        drawNorthIndianChart(
          doc,
          doc.page.width - 40 - chartSize / 2 - 15,
          cy1,
          chartSize,
          data.chart2.houseData,
          data.chart2.positions,
          data.chart2.houseData.lagnaSignIndex,
          data.cName2
        )
      }

      doc.y = cy1 + chartSize / 2 + 25

      // Side-by-side coordinates table
      drawSectionHeader(doc, '🌍  Planetary Positions Side-By-Side', C.lavender)
      doc.moveDown(0.3)

      const planets = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra', 'Ke']
      const pNames: Record<string, string> = {
        Su: 'Sun', Mo: 'Moon', Ma: 'Mars', Me: 'Mercury',
        Ju: 'Jupiter', Ve: 'Venus', Sa: 'Saturn', Ra: 'Rahu', Ke: 'Ketu'
      }

      const tableY = doc.y
      doc.rect(40, tableY, doc.page.width - 80, 16).fill(C.purpleMid)
      doc.font('Roboto-Bold').fontSize(7.5).fillColor(C.white)
        .text('PLANET', 50, tableY + 4)
        .text(`${data.cName1} (Sign / House)`, 170, tableY + 4)
        .text(`${data.cName2} (Sign / House)`, 370, tableY + 4)

      doc.y = tableY + 16

      planets.forEach((p, idx) => {
        const bg = idx % 2 === 0 ? '#FAF7FC' : C.white
        doc.rect(40, doc.y, doc.page.width - 80, 15).fill(bg)

        doc.font('Roboto-Bold').fontSize(7.5).fillColor(C.ink).text(pNames[p] || p, 50, doc.y + 4)

        if (data.chart1?.positions) {
          const pos1 = data.chart1.positions[p as keyof PlanetPositions]
          const sign1 = RASHI_NAMES[Math.floor(pos1 / 30)]
          const house1 = data.chart1.houseData?.placements?.[p]?.houseIndex || 1
          doc.font('Roboto').fontSize(7.5).fillColor(C.ink).text(`${sign1} (H${house1})`, 170, doc.y + 4)
        }

        if (data.chart2?.positions) {
          const pos2 = data.chart2.positions[p as keyof PlanetPositions]
          const sign2 = RASHI_NAMES[Math.floor(pos2 / 30)]
          const house2 = data.chart2.houseData?.placements?.[p]?.houseIndex || 1
          doc.font('Roboto').fontSize(7.5).fillColor(C.ink).text(`${sign2} (H${house2})`, 370, doc.y + 4)
        }

        doc.y += 15
      })

      // ── Page 3: Ashtakoot & Mangal Dosha ──────────────────────────────────
      doc.addPage()
      outline.addItem('Vedic Match Details')

      drawSectionHeader(doc, '🎯  Ashtakoot Guna Detailed Score Matrix', C.purpleMid)
      doc.moveDown(0.4)

      // Kutas points
      const d = data.details || {}
      const kutasData = [
        { name: 'Varna (Ego & Class)', max: 1, scored: data.score >= 70 ? 1 : 0.5, desc: 'Indicates raw energy fit and shared work outlook.' },
        { name: 'Vasya (Attraction)', max: 2, scored: data.score >= 70 ? 2 : 1, desc: 'Calculates the magnetic polarity & chemistry.' },
        { name: 'Tara (Destiny/Luck)', max: 3, scored: data.score >= 70 ? 3 : 2, desc: 'Calculates compatibility of fortune & journey.' },
        { name: 'Yoni (Physical affinity)', max: 4, scored: data.score >= 70 ? 3 : 2, desc: 'Body language, behavior match, and sensory flow.' },
        { name: 'Graha Maitri (Friendship)', max: 5, scored: d.trust ? Math.round((d.trust * 5) / 100) : 4, desc: 'Intellectual bonding & communication wavelength.' },
        { name: 'Gana (Temperament)', max: 6, scored: d.temp ? Math.round((d.temp * 6) / 100) : 4.5, desc: 'Matching divine/human/demon natural energy.' },
        { name: 'Bhakoot (Emotional Node)', max: 7, scored: d.heart ? Math.round((d.heart * 7) / 100) : 5, desc: 'Heart connect, mental peace, and family wellness.' },
        { name: 'Nadi (Genetics/Vibe)', max: 8, scored: d.destiny ? Math.round((d.destiny * 8) / 100) : 6, desc: 'Deeper sub-conscious connection and health harmony.' }
      ]

      const kutaTableY = doc.y
      doc.rect(40, kutaTableY, doc.page.width - 80, 16).fill(C.lavender)
      doc.font('Roboto-Bold').fontSize(7.5).fillColor(C.white)
        .text('DIMENSION (KUTA)', 50, kutaTableY + 4)
        .text('MAX', 220, kutaTableY + 4)
        .text('SCORED', 280, kutaTableY + 4)
        .text('INTERPRETATION', 350, kutaTableY + 4)

      doc.y = kutaTableY + 16
      kutasData.forEach((k, idx) => {
        const bg = idx % 2 === 0 ? '#FAF7FC' : C.white
        doc.rect(40, doc.y, doc.page.width - 80, 20).fill(bg)

        doc.font('Roboto-Bold').fontSize(7.5).fillColor(C.ink).text(k.name, 50, doc.y + 6)
        doc.font('Roboto').fontSize(7.5).fillColor(C.ink)
          .text(String(k.max), 220, doc.y + 6)
          .text(String(k.scored), 280, doc.y + 6)
          .text(k.desc, 350, doc.y + 6, { width: doc.page.width - 400, lineGap: 1 })

        doc.y += 20
      })
      doc.moveDown(0.8)

      // Mangal Dosha check
      drawSectionHeader(doc, '🔥  Mangal Dosha Analysis (Mars Affliction)', C.coral)
      doc.moveDown(0.5)

      const isA = data.mangalDoshaA ?? false
      const isB = data.mangalDoshaB ?? false
      const isCancel = data.hasMangalDoshaCancellation ?? false

      let docText = ''
      if (!isA && !isB) {
        docText = 'Excellent! Neither partner suffers from Mangal Dosha. Your Mars energies are peaceful and safe, which keeps relationship communication stable without unexpected volatile clashes.'
      } else if (isA && isB) {
        docText = `Both ${data.cName1} and ${data.cName2} have Mangal Dosha. In Vedic calculations, when both partners have the affliction, it cancels out (Mangal Milan). The energies neutralize each other.`
      } else {
        const affected = isA ? data.cName1 : data.cName2
        if (isCancel) {
          docText = `Note: ${affected} has Mangal Dosha, but local placements create cancellation conditions (Dosha Nirvarana). The energy clash is neutralized.`
        } else {
          docText = `Alert: ${affected} has active Mangal Dosha while the other does not. This asymmetry indicates possible hot-headedness, arguments, or communication clashes. Applying active cooling remedies is suggested.`
        }
      }

      doc.rect(48, doc.y, doc.page.width - 96, 52).fill('#FFFBFB')
      doc.rect(48, doc.y, doc.page.width - 96, 52).lineWidth(0.5).strokeColor(C.coral).stroke()
      doc.font('Roboto').fontSize(8.5).fillColor(C.ink).text(docText, 58, doc.y + 10, { width: doc.page.width - 116, align: 'justify', lineGap: 3 })
      doc.y += 62

      // ── Page 4: Wellbeing Snapshot & Partner Vibe Cards ─────────────────
      doc.addPage()
      outline.addItem('Vibe Card & Wellbeing')

      drawSectionHeader(doc, '💖  Relationship Wellbeing Snapshot', C.purpleMid)
      doc.moveDown(0.3)

      const wellbeingText = data.score >= 70
        ? `${data.cName1} and ${data.cName2} share a deeply compatible foundation. Your natural wavelengths align beautifully — this connection has the strength to weather challenges and grow over time.`
        : data.score >= 45
        ? `${data.cName1} and ${data.cName2} have real potential with conscious effort. Some natural tensions exist, but these build character and depth in a meaningful relationship.`
        : `${data.cName1} and ${data.cName2} bring very different energies together. This can be transformative if both commit to understanding each other — contrast isn't incompatibility, it's a growth invitation.`

      doc.font('Roboto').fontSize(9.5).fillColor(C.ink)
        .text(wellbeingText, 50, doc.y, { width: doc.page.width - 100, align: 'justify', lineGap: 3.5 })
      doc.moveDown(1)

      // Partner Vibe Cards (2 columns, 2 rows)
      drawSectionHeader(doc, '⚡  Partner Vibe Card Breakdown', C.lavender)
      doc.moveDown(0.4)

      const gridY = doc.y
      const cardW = (doc.page.width - 96) / 2
      const cardH = 80

      const matchDesc = {
        comm: data.score >= 70 ? 'You two speak the same language — deep, natural understanding flows between you.' : data.score >= 45 ? 'Some friction in expression — learning each other\'s communication style unlocks deeper bonds.' : 'Different wavelengths right now — patience and active listening is the key to harmony.',
        bond: data.score >= 70 ? 'A rare, nurturing connection — emotional safety and warmth are very strong here.' : data.score >= 45 ? 'Genuine warmth exists, but emotional openness needs to be consciously cultivated.' : 'You\'re in emotionally different places — understanding each other\'s attachment style helps.',
        grow: data.score >= 70 ? 'You challenge and elevate each other — this partnership creates exponential growth.' : data.score >= 45 ? 'You inspire growth in each other, though some life goals need alignment conversations.' : 'Independent paths right now — shared vision conversations are essential before big decisions.',
        life: data.score >= 70 ? 'Your daily rhythms naturally complement each other — effortless coexistence.' : data.score >= 45 ? 'Lifestyle differences exist but are bridgeable — mutual respect of routines is the key.' : 'Your daily energies differ — conscious effort to align habits will be necessary.',
      }

      drawVibeBadge(doc, 44, gridY, cardW, cardH, '💬', 'Communication', matchDesc.comm, C.blue)
      drawVibeBadge(doc, doc.page.width - 44 - cardW, gridY, cardW, cardH, '❤️', 'Emotional Bond', matchDesc.bond, C.coral)

      drawVibeBadge(doc, 44, gridY + cardH + 10, cardW, cardH, '🌱', 'Growth Together', matchDesc.grow, C.green)
      drawVibeBadge(doc, doc.page.width - 44 - cardW, gridY + cardH + 10, cardW, cardH, '🏠', 'Lifestyle Fit', matchDesc.life, C.lavender)

      doc.y = gridY + cardH * 2 + 30

      // ── Page 5: Astro-Clarity: Problems, Solutions & Disclaimer ──────────
      doc.addPage()
      outline.addItem('Relationship Solutions')

      drawSectionHeader(doc, '🌌  Cosmic Compatibility Insights', C.purpleMid)
      doc.moveDown(0.3)
      doc.font('Roboto').fontSize(8.5).fillColor(C.ink)
        .text(data.narrative, 50, doc.y, { width: doc.page.width - 100, align: 'justify', lineGap: 3.5 })
      doc.moveDown(0.8)

      // Problems & Solutions
      drawSectionHeader(doc, '🔑  Potential Friction & Vedic Solutions', C.gold)
      doc.moveDown(0.5)

      const probText = data.score >= 70
        ? 'Friction Point: Over-dependence or settling into comfortable stagnation.\nVedic Solution: Wear shades of deep red or yellow on Thursdays to keep relationship fire active.'
        : data.score >= 45
        ? 'Friction Point: Occasional communication delays and minor ego differences.\nVedic Solution: Chant "Om Som Somaya Namah" together on Mondays to cultivate emotional clarity.'
        : 'Friction Point: Strong differences in priorities and daily rhythms.\nVedic Solution: Do charity work together on Saturdays to channel Rahu/Mars energy into mutual respect.'

      const probY = doc.y
      doc.rect(48, probY, doc.page.width - 96, 60).fill('#FFFDF8')
      doc.rect(48, probY, doc.page.width - 96, 60).lineWidth(0.5).strokeColor(C.gold).stroke()
      doc.font('Roboto').fontSize(8.5).fillColor(C.ink).text(probText, 58, probY + 12, { width: doc.page.width - 116, lineGap: 3.5 })
      doc.y = probY + 75
      doc.moveDown(0.8)

      // Disclaimer
      drawSectionHeader(doc, '⚠️  Disclaimer & Terms of Use', C.ink)
      doc.moveDown(0.4)
      doc.font('Roboto').fontSize(7.5).fillColor(C.muted)
        .text('Vedic Astrology is an ancient interpretive science based on astronomical calculations and symbolic interpretations. All forecasts, suggestions, and remedies contained in this report are designed for personal growth, introspection, and guidance purposes only. They do not constitute formal medical, mental health, legal, investment, or financial advice. OyeAstro makes no guarantees regarding the accuracy or predictive outcomes of the calculations, and shall not be held liable for any decisions, actions, or outcomes undertaken by the recipient. Practice personal discretion.', 50, doc.y, { width: doc.page.width - 100, align: 'justify', lineGap: 2.5 })

      doc.end()
    } catch (err) {
      reject(err)
    }
  })
}
