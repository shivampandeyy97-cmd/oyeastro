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
  purpleDark: '#0B0214', // Celestial deep space
  purpleMid:  '#1C0F38', // Deep brand purple
  lavender:   '#8A5CF5', // Vibrant brand purple
  coral:      '#FF7A45', // Warm sunset coral
  rose:       '#FF5C8A', // Romantic rose
  gold:       '#F5B800', // Premium Vedic Gold/Yellow
  goldBg:     '#FFFDF0', // Soft yellow card bg
  bgLight:    '#F5F4F8', // Modern light grey page bg
  white:      '#FFFFFF',
  border:     '#E2DBEB', // Subtle card border
  ink:        '#1A1208', // Dark text
  muted:      '#776E85', // Muted text
  blue:       '#4E9CD4',
  green:      '#4EAD72',
  red:        '#E25B5B'
}

const PLANET_ABBR: Record<string, string> = {
  Su: 'Su', Mo: 'Mo', Ma: 'Ma', Me: 'Me',
  Ju: 'Ju', Ve: 'Ve', Sa: 'Sa', Ra: 'Ra', Ke: 'Ke', Lagn: 'Asc'
}

const RASHI_NAMES = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
]

const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
]

const NAKSHATRA_LORDS = [
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'
]

// ─── Vedic Calculation Helpers ───────────────────────────────────────────────

function getNakshatraName(lon: number): string {
  const idx = Math.floor(lon / (360 / 27)) % 27
  return NAKSHATRAS[idx]
}

function getNakshatraLord(lon: number): string {
  const nakIdx = Math.floor(lon / (360 / 27)) % 27
  return NAKSHATRA_LORDS[nakIdx % 9]
}

// ─── Document Layout Helpers ─────────────────────────────────────────────────

function drawCoverBackground(doc: PDFKit.PDFDocument, isCompatibility = false) {
  const oldBottom = doc.page.margins.bottom
  doc.page.margins.bottom = 0 

  // Fill deep space background
  doc.rect(0, 0, doc.page.width, doc.page.height).fill(C.purpleDark)

  // Starry sky vector decorations
  doc.circle(doc.page.width - 60, 60, 150).lineWidth(1).strokeColor('#8A5CF515').stroke()
  doc.circle(60, doc.page.height - 100, 100).lineWidth(1).strokeColor('#FF5C8A10').stroke()

  // Elegant gold & rose border lines
  doc.rect(25, 25, doc.page.width - 50, doc.page.height - 50)
     .lineWidth(1)
     .strokeColor(isCompatibility ? C.rose : C.gold)
     .stroke()

  doc.rect(28, 28, doc.page.width - 56, doc.page.height - 56)
     .lineWidth(0.5)
     .strokeColor(C.lavender + '30')
     .stroke()

  // Small corner stars
  const m = 25
  const size = doc.page.width
  const h = doc.page.height
  const starCol = isCompatibility ? C.rose : C.gold
  
  doc.font('Roboto-Bold').fontSize(10).fillColor(starCol)
    .text('✦', m + 5, m + 14)
    .text('✦', size - m - 14, m + 14)
    .text('✦', m + 5, h - m - 18)
    .text('✦', size - m - 14, h - m - 18)

  doc.page.margins.bottom = oldBottom
}

function drawPastelBanner(doc: PDFKit.PDFDocument, pageNum: number, reportTitle: string, subtitle: string) {
  const oldBottom = doc.page.margins.bottom
  doc.page.margins.bottom = 0

  // 1. Draw page background color (light grey-blue)
  doc.rect(0, 0, doc.page.width, doc.page.height).fill(C.bgLight)

  // 2. Draw Pastel Gradient Header Banner
  const grad = doc.linearGradient(0, 0, doc.page.width, 0)
  grad.stop(0, '#FFEAEA')   // Soft pastel red/peach
  grad.stop(0.5, '#EAE2F8') // Soft pastel lavender
  grad.stop(1, '#E1F5F0')   // Soft pastel mint/teal
  doc.rect(0, 0, doc.page.width, 85).fill(grad)

  // Subtle banner bottom border
  doc.moveTo(0, 85).lineTo(doc.page.width, 85).lineWidth(0.5).strokeColor(C.border).stroke()

  // 3. Draw Actual Logo: "oyeastro✦"
  const logoX = 40
  const logoY = 28
  doc.font('Roboto-Bold').fontSize(16).fillColor(C.purpleMid)
     .text('oyeastro', logoX, logoY, { continued: true })
  doc.font('Roboto-Bold').fontSize(11).fillColor(C.rose)
     .text('✦')

  // 4. Draw Header Titles (Right Aligned)
  doc.font('Roboto-Bold').fontSize(10).fillColor(C.purpleMid)
     .text(reportTitle.toUpperCase(), 180, logoY, { width: doc.page.width - 220, align: 'right', characterSpacing: 1 })
  doc.font('Roboto').fontSize(7.5).fillColor(C.muted)
     .text(subtitle, 180, logoY + 14, { width: doc.page.width - 220, align: 'right' })

  // 5. Running Footer
  const h = doc.page.height
  doc.moveTo(40, h - 35).lineTo(doc.page.width - 40, h - 35).lineWidth(0.5).strokeColor(C.border).stroke()
  doc.font('Roboto').fontSize(7.5).fillColor(C.muted)
    .text('Powered by OyeAstro · Your Cosmic Guide · oyeastro.com', 45, h - 27, { width: doc.page.width - 90, align: 'left' })
    .text(`Page ${pageNum}`, 45, h - 27, { width: doc.page.width - 90, align: 'right' })

  doc.page.margins.bottom = oldBottom
}

function drawCard(doc: PDFKit.PDFDocument, x: number, y: number, w: number, h: number, bg = C.white, stroke = C.border) {
  doc.roundedRect(x, y, w, h, 8)
     .fillAndStroke(bg, stroke)
}

function drawSectionHeader(doc: PDFKit.PDFDocument, text: string, color = C.purpleMid) {
  doc.font('Roboto-Bold').fontSize(10.5).fillColor(color).text(text, doc.x, doc.y)
  doc.moveDown(0.4)
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
    .text(title, cx - s / 2, y0 - 15, { width: s, align: 'center' })

  // Draw chart square outline
  doc.rect(x0, y0, s, s).lineWidth(1.2).strokeColor(C.lavender).stroke()
  doc.rect(x0 + 3, y0 + 3, s - 6, s - 6).lineWidth(0.5).strokeColor(C.border).stroke()

  // Diagonals
  doc.moveTo(x0, y0).lineTo(x0 + s, y0 + s).lineWidth(0.8).strokeColor(C.lavender).stroke()
  doc.moveTo(x0 + s, y0).lineTo(x0, y0 + s).lineWidth(0.8).strokeColor(C.lavender).stroke()

  // Inner diamond
  doc.moveTo(cx, y0).lineTo(x0 + s, cy)
     .lineTo(cx, y0 + s).lineTo(x0, cy)
     .lineTo(cx, y0)
     .lineWidth(0.8).strokeColor(C.lavender).stroke()

  // Highlight House 1 with soft yellow/gold background
  doc.path(`M ${cx} ${cy} L ${x0 + s/2} ${y0} L ${x0} ${cy} Z`).fill('#F5B80008')

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

  // Exact coordinates for labels inside the 12 triangles (Vedic counter-clockwise layout)
  const q = s / 4
  const centers: [number, number][] = [
    [cx, y0 + q * 0.9],            // H1 (Top Diamond)
    [x0 + s/4 + 10, y0 + s/12 + 14], // H2 (Top-Left upper triangle)
    [x0 + s/12 + 14, y0 + s/4 + 10], // H3 (Top-Left left triangle)
    [x0 + s/6 + 8, cy],            // H4 (Left Diamond)
    [x0 + s/12 + 14, y0 + 3*s/4 - 10], // H5 (Bottom-Left left triangle)
    [x0 + s/4 + 10, y0 + 11*s/12 - 14], // H6 (Bottom-Left bottom triangle)
    [cx, y0 + 5*s/6 - 4],          // H7 (Bottom Diamond)
    [x0 + 3*s/4 - 10, y0 + 11*s/12 - 14], // H8 (Bottom-Right bottom triangle)
    [x0 + 11*s/12 - 14, y0 + 3*s/4 - 10], // H9 (Bottom-Right right triangle)
    [x0 + 5*s/6 - 8, cy],          // H10 (Right Diamond)
    [x0 + 11*s/12 - 14, y0 + s/4 + 10], // H11 (Top-Right right triangle)
    [x0 + 3*s/4 - 10, y0 + s/12 + 14],  // H12 (Top-Right upper triangle)
  ]

  centers.forEach(([hx, hy], idx) => {
    const hNum = idx + 1
    const signNum = ((lagnaSignIndex + idx) % 12) + 1
    const planets = planetsInHouse[hNum] || []

    // Sign number in the house
    doc.font('Roboto').fontSize(6.5).fillColor(C.gold)
      .text(String(signNum), hx - 12, hy - 11, { width: 24, align: 'center' })

    // House label (small subscript)
    doc.font('Roboto').fontSize(4.5).fillColor(C.muted)
      .text(`h${hNum}`, hx - 12, hy - 4, { width: 24, align: 'center' })

    // Stacked planets
    planets.forEach((pl, pIdx) => {
      const plColor = pl === 'Asc' ? C.coral : pl === 'Su' ? C.gold : pl === 'Mo' ? C.blue : C.ink
      doc.font('Roboto-Bold').fontSize(6.5).fillColor(plColor)
        .text(pl, hx - 15, hy + 4 + pIdx * 7.5, { width: 30, align: 'center' })
    })
  })
}

function drawGridRow(doc: PDFKit.PDFDocument, bg: string, cells: { text: string; width: number; bold?: boolean; color?: string }[]) {
  const y = doc.y
  const h = 18
  doc.rect(40, y, doc.page.width - 80, h).fill(bg)
  
  let currX = 50
  cells.forEach(c => {
    doc.font(c.bold ? 'Roboto-Bold' : 'Roboto')
       .fontSize(7.5)
       .fillColor(c.color || C.ink)
       .text(c.text, currX, y + 5, { width: c.width, height: h - 5 })
    currX += c.width
  })
  doc.y = y + h
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
      outline.addItem('Title Cover')

      // ── Page 1: Branded Celebratory Cover Page ────────────────────────────
      drawCoverBackground(doc, true)

      // Hearts & Love graphic accent with beautiful gold/rose circles
      doc.circle(doc.page.width / 2, 210, 50).lineWidth(1.2).strokeColor(C.rose).stroke()
      doc.circle(doc.page.width / 2, 210, 44).lineWidth(0.5).strokeColor(C.gold).stroke()
      doc.font('Roboto-Bold').fontSize(40).fillColor(C.rose).text('♥', doc.page.width / 2 - 14, 192, { align: 'center' })

      // Logo centered
      const centeredLogoX = doc.page.width / 2 - 45
      doc.font('Roboto-Bold').fontSize(20).fillColor(C.white)
         .text('oyeastro', centeredLogoX, 290, { continued: true })
      doc.font('Roboto-Bold').fontSize(14).fillColor(C.rose)
         .text('✦')

      doc.font('Roboto-Bold').fontSize(15).fillColor(C.rose)
        .text('COSMIC COMPATIBILITY REPORT', 40, 335, { width: doc.page.width - 80, align: 'center', characterSpacing: 1 })

      doc.moveTo(doc.page.width / 2 - 60, 362).lineTo(doc.page.width / 2 + 60, 362).lineWidth(1.5).strokeColor(C.rose).stroke()

      // Duo Names
      const scoreY = 410
      doc.font('Roboto-Bold').fontSize(17).fillColor(C.white)
        .text(`${data.cName1}   ♥   ${data.cName2}`, 40, scoreY, { width: doc.page.width - 80, align: 'center' })

      // Match score badge with gold accent outline
      doc.rect(doc.page.width / 2 - 70, scoreY + 32, 140, 95).fill(C.purpleMid)
      doc.rect(doc.page.width / 2 - 70, scoreY + 32, 140, 95).lineWidth(1).strokeColor(C.gold).stroke()

      const sColor = data.score >= 70 ? C.green : data.score >= 45 ? C.gold : C.red
      doc.font('Roboto-Bold').fontSize(38).fillColor(sColor)
        .text(`${data.score}%`, doc.page.width / 2 - 70, scoreY + 48, { width: 140, align: 'center' })
      
      doc.font('Roboto-Bold').fontSize(8).fillColor(C.white)
        .text('COSMIC LOVE MATCH', doc.page.width / 2 - 70, scoreY + 98, { width: 140, align: 'center', characterSpacing: 0.5 })

      // Romantic quote
      doc.font('Roboto').fontSize(9.5).fillColor('#EDE8F5')
        .text('"Two souls, one stellar blueprint. A map of your stars aligned to guide your hearts."', 40, scoreY + 160, { width: doc.page.width - 80, align: 'center', oblique: true })

      // Content Page setup
      doc.on('pageAdded', () => {
        pageNum++
        const savedY = doc.y
        drawPastelBanner(doc, pageNum, 'Couple Compatibility Report', `Prepared for ${data.cName1} & ${data.cName2}`)
        doc.y = savedY
      })

      // ── Page 2: Kundli Charts Side-by-Side ────────────────────────────────
      doc.addPage()
      outline.addItem('Janma Kundli Charts')
      doc.y = 100

      drawSectionHeader(doc, '🪐  Vedic Birth Charts (Janma Kundli) — Astrologer Referral Profile', C.purpleMid)
      doc.moveDown(0.3)

      // Dual charts (astrologer-ready)
      const chartSize = 185
      const cy1 = doc.y + chartSize / 2 + 10

      if (data.chart1?.houseData && data.chart1?.positions) {
        drawNorthIndianChart(
          doc,
          40 + chartSize / 2 + 10,
          cy1,
          chartSize,
          data.chart1.houseData,
          data.chart1.positions,
          data.chart1.houseData.lagnaSignIndex,
          `${data.cName1}'s Birth Chart`
        )
      }

      if (data.chart2?.houseData && data.chart2?.positions) {
        drawNorthIndianChart(
          doc,
          doc.page.width - 40 - chartSize / 2 - 10,
          cy1,
          chartSize,
          data.chart2.houseData,
          data.chart2.positions,
          data.chart2.houseData.lagnaSignIndex,
          `${data.cName2}'s Birth Chart`
        )
      }

      doc.y = cy1 + chartSize / 2 + 25

      // Detailed Astrologer table (degrees, signs, nakshatras, nakshatra lords) with Gold Header Accent
      drawSectionHeader(doc, '🌍  Comprehensive Astro-Reference Grid', C.gold)
      
      const planetsList = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra', 'Ke']
      
      // Header row
      drawGridRow(doc, C.purpleMid, [
        { text: 'PLANET', width: 60, bold: true, color: C.white },
        { text: `${data.cName1} (Rashi / Degree)`, width: 110, bold: true, color: C.white },
        { text: `${data.cName1} Nakshatra (Lord)`, width: 110, bold: true, color: C.white },
        { text: `${data.cName2} (Rashi / Degree)`, width: 110, bold: true, color: C.white },
        { text: `${data.cName2} Nakshatra (Lord)`, width: 110, bold: true, color: C.white }
      ])

      planetsList.forEach((p, idx) => {
        const bg = idx % 2 === 0 ? '#FAF7FC' : C.white
        
        let c1Str = '-', c1Nak = '-', c2Str = '-', c2Nak = '-'

        if (data.chart1?.positions) {
          const p1 = data.chart1.positions[p as keyof PlanetPositions]
          const sign1 = RASHI_NAMES[Math.floor(p1 / 30)]
          const deg1 = (p1 % 30).toFixed(1)
          const house1 = data.chart1.houseData?.placements?.[p]?.houseIndex || 1
          c1Str = `${sign1} · ${deg1}° (H${house1})`
          c1Nak = `${getNakshatraName(p1)} (${getNakshatraLord(p1)})`
        }

        if (data.chart2?.positions) {
          const p2 = data.chart2.positions[p as keyof PlanetPositions]
          const sign2 = RASHI_NAMES[Math.floor(p2 / 30)]
          const deg2 = (p2 % 30).toFixed(1)
          const house2 = data.chart2.houseData?.placements?.[p]?.houseIndex || 1
          c2Str = `${sign2} · ${deg2}° (H${house2})`
          c2Nak = `${getNakshatraName(p2)} (${getNakshatraLord(p2)})`
        }

        drawGridRow(doc, bg, [
          { text: PLANET_ABBR[p] || p, width: 60, bold: true },
          { text: c1Str, width: 110 },
          { text: c1Nak, width: 110 },
          { text: c2Str, width: 110 },
          { text: c2Nak, width: 110 }
        ])
      })

      // ── Page 3: Problem, Solution, Impact Section (mockup layout) ────────
      doc.addPage()
      outline.addItem('Problem & Solution')
      doc.y = 100

      // Column 1 area (x=40, width=170)
      // Column 2 area (x=220, width=170)
      // Column 3 area (x=400, width=172)
      const colW = 168
      const topY = doc.y

      // 1. The Journey (Column 1)
      doc.font('Roboto-Bold').fontSize(11).fillColor(C.purpleMid).text('1. The Journey', 40, topY)
      const tY = topY + 18
      drawCard(doc, 40, tY, colW, 205, C.white)

      // Timeline nodes (vertical style inside card)
      const nodes = [
        { label: 'First Meeting', desc: 'Cosmic Connection', icon: '⭐' },
        { label: 'Shared Dreams', desc: 'Building Foundations', icon: '👥' },
        { label: 'Recent Phase', desc: 'Navigating Challenges', icon: '🌱' }
      ]
      nodes.forEach((n, idx) => {
        const nY = tY + 12 + idx * 62
        doc.font('Roboto-Bold').fontSize(9).fillColor(C.purpleMid).text(n.icon + ' ' + n.label, 50, nY)
        doc.font('Roboto').fontSize(7.5).fillColor(C.muted).text(n.desc, 50, nY + 12, { width: colW - 20 })
        doc.font('Roboto').fontSize(7).fillColor(C.ink).text(idx === 2 ? 'Navigating active transits.' : 'Shared energetic wavelengths.', 50, nY + 24, { width: colW - 20 })

        if (idx < 2) {
          doc.moveTo(56, nY + 36).lineTo(56, nY + 58).lineWidth(0.8).strokeColor(C.border).stroke()
        }
      })

      // 2. Harmonious Partnership (Column 1 Bottom)
      const hY = tY + 215
      doc.font('Roboto-Bold').fontSize(11).fillColor(C.purpleMid).text('2. Harmonious Partnership', 40, hY)
      drawCard(doc, 40, hY + 18, colW, 95, C.white)
      doc.font('Roboto-Bold').fontSize(8.5).fillColor(C.gold).text('☁  Current Hurdles', 50, hY + 28)
      doc.font('Roboto').fontSize(7.5).fillColor(C.ink).text('We recognize current tensions in empathetic communication and balancing individual growth with togetherness, leading to moments of misunderstanding.', 50, hY + 42, { width: colW - 20, lineGap: 2 })

      // 2. Problem Statement (Column 2 Top)
      doc.font('Roboto-Bold').fontSize(11).fillColor(C.purpleMid).text('2. Problem Statement', 220, topY)
      drawCard(doc, 220, tY, colW, 95, C.white)
      doc.font('Roboto-Bold').fontSize(8.5).fillColor(C.rose).text('☁  Current Hurdles', 230, tY + 10)
      
      const probText = data.score >= 70
        ? 'Risk of emotional comfort stagnation. Avoiding difficult growth discussions can restrict long-term dynamic compatibility.'
        : data.score >= 45
        ? 'Vedic friction points in Gana & Graha Maitri. Speaks slightly different languages, creating expression delays and feeling misunderstood.'
        : 'High energetic friction. Significant contrasts in Nadi & Bhakoot create blockages, arguments, and diverging daily paths.'
      doc.font('Roboto').fontSize(7.5).fillColor(C.ink).text(probText, 230, tY + 24, { width: colW - 20, lineGap: 2.5 })

      // 3. Solution (Column 2 Bottom)
      doc.font('Roboto-Bold').fontSize(11).fillColor(C.purpleMid).text('3. Solution', 220, tY + 105)
      const solY = tY + 123
      drawCard(doc, 220, solY, colW, 205, C.goldBg, C.gold)
      doc.font('Roboto-Bold').fontSize(9).fillColor(C.gold).text('Astrological Remedies', 230, solY + 12)

      const remediesList = data.score >= 70
        ? [
            { icon: '🎤', t: 'Foster Open Dialogue', d: 'Practice active listening during Mercury hours.' },
            { icon: '🔀', t: 'Embrace Paths', d: 'Support individual goals; schedule independent time.' },
            { icon: '⚖', t: 'Harmonize Energies', d: 'Engage in creative work; use Rose Quartz.' }
          ]
        : data.score >= 45
        ? [
            { icon: '🎤', t: 'Mercury Alignment', d: 'Wear green/light-blue colors on Wednesdays.' },
            { icon: '🔀', t: 'Moon Chant', d: 'Chant "Om Som Somaya Namah" on Mondays.' },
            { icon: '⚖', t: 'Honesty Hour', d: 'Schedule weekly non-defensive check-ins.' }
          ]
        : [
            { icon: '🎤', t: 'Silver Remedy', d: 'Keep a silver coin or vessel in shared space.' },
            { icon: '🔀', t: 'Jupiter sweets', d: 'Donate sweets to children on Thursdays.' },
            { icon: '⚖', t: 'Neutralize Clash', d: 'Avoid dark colors during key discussions.' }
          ]

      remediesList.forEach((r, idx) => {
        const ry = solY + 30 + idx * 56
        doc.font('Roboto-Bold').fontSize(8).fillColor(C.purpleMid).text(`${r.icon}  ${r.t}`, 230, ry)
        doc.font('Roboto').fontSize(7.5).fillColor(C.ink).text(r.d, 230, ry + 12, { width: colW - 20, lineGap: 1.5 })
      })

      // 4. Impact (Column 3 Top)
      doc.font('Roboto-Bold').fontSize(11).fillColor(C.purpleMid).text('4. Impact', 400, topY)
      drawCard(doc, 400, tY, colW, 145, C.white)

      const progress = [
        { label: 'Communication Flow', pct: 85, icon: '❤️', l: 'Deepening' },
        { label: 'Emotional Connection', pct: 90, icon: '🌸', l: 'Flourishing' },
        { label: 'Mutual Understanding', pct: 75, icon: '🌱', l: 'Growing' }
      ]
      progress.forEach((p, idx) => {
        const py = tY + 12 + idx * 42
        doc.font('Roboto-Bold').fontSize(7.5).fillColor(C.ink).text(p.label, 410, py)
        doc.font('Roboto-Bold').fontSize(7.5).fillColor(C.lavender).text(`${p.pct}%`, 535, py, { align: 'right', width: 25 })
        
        // Progress track
        doc.rect(410, py + 10, 115, 5).fill('#F0ECFB')
        // Progress fill (Yellow/Gold accent highlight)
        doc.rect(410, py + 10, (115 * p.pct) / 100, 5).fill(C.gold)

        // Icon indicator
        doc.font('Roboto').fontSize(10).text(p.icon, 545, py + 5)
        doc.font('Roboto-Bold').fontSize(5.5).fillColor(C.muted).text(p.l, 540, py + 18, { width: 30, align: 'center' })
      })
      doc.font('Roboto').fontSize(6.5).fillColor(C.muted).text('Projected improvements based on remedies.', 410, tY + 132)

      // 5. The Future Outlook (Column 3 Bottom)
      doc.font('Roboto-Bold').fontSize(11).fillColor(C.purpleMid).text('5. The Future Outlook', 400, tY + 155)
      const futY = tY + 173
      drawCard(doc, 400, futY, colW, 147, C.white)
      
      doc.font('Roboto-Bold').fontSize(8.5).fillColor(C.green).text('❯  What\'s Next', 410, futY + 12)
      
      const futureText = data.score >= 70
        ? 'Your path ahead shows promise for renewed harmony and deeper bonds. Celebrate small victories together. The cosmos supports your enduring partnership.'
        : data.score >= 45
        ? 'Conscious effort bridges natural differences. Your path will transform into a highly stable partnership with deep emotional safety.'
        : 'High contrast acts as a transformative growth catalyst. Practicing the remedies neutralizes the energetic clash, inviting deep spiritual connection.'

      doc.font('Roboto').fontSize(7.5).fillColor(C.ink).text(futureText, 410, futY + 26, { width: colW - 20, lineGap: 2 })
      doc.font('Roboto').fontSize(6.8).fillColor(C.muted).text('"Love is a journey of continuous discovery."', 410, futY + 115, { width: colW - 20, align: 'center', oblique: true })

      doc.y = futY + 160

      // ── Page 4: 4-Month Relationship Journey Map ───────────────────────────
      doc.addPage()
      outline.addItem('Relationship Journey Map')
      doc.y = 100

      drawSectionHeader(doc, '📅  4-Month Future Relationship Journey Map', C.purpleMid)
      doc.moveDown(0.4)

      const journeySteps = [
        {
          month: 'Month 1: Emotional Grounding',
          transits: 'Moon shifts through emotional Kendra, aspecting Venus.',
          caution: 'Focus on setting emotional safety. Do not rush key joint discussions.',
          vibe: 'Warm and reflective. High connection opportunities.'
        },
        {
          month: 'Month 2: Expression & Alignment',
          transits: 'Mercury transits through 5th house of communication.',
          caution: 'Express appreciation explicitly. Excellent time to solve active conflicts.',
          vibe: 'Chatty, positive, and intellectually connected.'
        },
        {
          month: 'Month 3: Planetary Caution Block',
          transits: 'Mars enters conjunction in 8th house, aspecting natal Saturn.',
          caution: 'Ego alert! Tempers can flare easily. Practice active silence during disagreements.',
          vibe: 'High energy, needs slow communication to avoid clashes.'
        },
        {
          month: 'Month 4: Harmonized Synergy',
          transits: 'Venus transit aspects the Ascendant, creating double transit fortune.',
          caution: 'Plan a trip, dates, or purchase joint gifts to celebrate your bond.',
          vibe: 'Affectionate, lucky, and deeply romantic. Match score peaks.'
        }
      ]

      journeySteps.forEach((step, idx) => {
        const stepY = doc.y
        drawCard(doc, 40, stepY, doc.page.width - 80, 68, C.white)
        
        // Month marker with gold/yellow circle indicator
        doc.circle(52, stepY + 15, 4).fill(C.gold)
        doc.font('Roboto-Bold').fontSize(9.5).fillColor(C.purpleMid).text(step.month, 64, stepY + 10)

        // Transit details
        doc.font('Roboto-Bold').fontSize(7.5).fillColor(C.muted).text('Transit Context: ', 50, stepY + 28)
        doc.font('Roboto').fontSize(7.5).fillColor(C.ink).text(step.transits, 125, stepY + 28)

        // Caution details
        doc.font('Roboto-Bold').fontSize(7.5).fillColor(C.rose).text('Astro Caution:   ', 50, stepY + 40)
        doc.font('Roboto').fontSize(7.5).fillColor(C.ink).text(step.caution, 125, stepY + 40)

        // Vibe/Energy
        doc.font('Roboto-Bold').fontSize(7.5).fillColor(C.green).text('Vibe Forecast:   ', 50, stepY + 52)
        doc.font('Roboto').fontSize(7.5).fillColor(C.ink).text(step.vibe, 125, stepY + 52)

        doc.y = stepY + 68
        doc.moveDown(0.3)
      })

      // ── Page 5: Astro-Referral, Mangal Dosha & Disclaimer ───────────
      doc.addPage()
      outline.addItem('Astrologer Referral')
      doc.y = 100

      // Mangal Dosha check inside a styled card
      drawSectionHeader(doc, '🔥  Vedic Mangal Dosha Analysis (Mars Affliction)', C.coral)
      doc.moveDown(0.2)

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

      const dY = doc.y
      drawCard(doc, 40, dY, doc.page.width - 80, 52, '#FFFBFB', C.rose)
      doc.font('Roboto').fontSize(8.5).fillColor(C.ink).text(docText, 52, dY + 10, { width: doc.page.width - 104, align: 'justify', lineGap: 3 })
      doc.y = dY + 62
      doc.moveDown(0.8)

      // Astrologer Referral Profile Box
      drawSectionHeader(doc, '⚙️  Astrological referral guidelines (For the Astrologer)', C.gold)
      doc.moveDown(0.2)
      const refY = doc.y
      drawCard(doc, 40, refY, doc.page.width - 80, 80, C.goldBg, C.gold)
      doc.font('Roboto-Bold').fontSize(8).fillColor(C.gold).text('TECHNICAL DETAILS FOR THE ASTROLOGER RECIPIENT:', 50, refY + 12)
      doc.font('Roboto').fontSize(7.5).fillColor(C.ink).text(`1. This chart is computed utilizing the Vedic Sidereal Lahiri Ayanamsa with standard coordinates.\n2. Note the Moon positions: ${data.cName1} has Moon in House ${data.chart1?.houseData?.placements?.Mo?.houseIndex || 1}, ${data.cName2} has Moon in House ${data.chart2?.houseData?.placements?.Mo?.houseIndex || 1}.\n3. Guna Milan score details: Varna (${data.score >= 70 ? '1/1' : '0.5/1'}), Vasya (${data.score >= 70 ? '2/2' : '1/2'}), Tara (${data.score >= 70 ? '3/3' : '2/3'}), Yoni (${data.score >= 70 ? '3/4' : '2/4'}).\n4. For remedies consultation, evaluate Venus-Mars positions for relationship compatibility stabilization.`, 50, refY + 24, { width: doc.page.width - 100, lineGap: 3 })
      doc.y = refY + 92
      doc.moveDown(1.5)

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
      const outline = doc.outline
      outline.addItem('Title Cover')

      // ── Page 1: Cover Page ────────────────────────────────────────────────
      drawCoverBackground(doc, false)

      // Mandala Logo
      doc.circle(doc.page.width / 2, 210, 50).lineWidth(1.2).strokeColor(C.lavender).stroke()
      doc.circle(doc.page.width / 2, 210, 44).lineWidth(0.5).strokeColor(C.gold).stroke()
      doc.font('Roboto-Bold').fontSize(36).fillColor(C.gold).text('✦', doc.page.width / 2 - 13, 192, { align: 'center' })

      // Logo centered
      const centeredLogoX = doc.page.width / 2 - 45
      doc.font('Roboto-Bold').fontSize(20).fillColor(C.white)
         .text('oyeastro', centeredLogoX, 290, { continued: true })
      doc.font('Roboto-Bold').fontSize(14).fillColor(C.gold)
         .text('✦')

      doc.font('Roboto-Bold').fontSize(15).fillColor(C.gold)
        .text('PREMIUM COSMIC FORECAST & BLUEPRINT', 40, 335, { width: doc.page.width - 80, align: 'center', characterSpacing: 1 })

      doc.moveTo(doc.page.width / 2 - 60, 362).lineTo(doc.page.width / 2 + 60, 362).lineWidth(1.5).strokeColor(C.gold).stroke()

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

      // Content Page setup
      doc.on('pageAdded', () => {
        pageNum++
        const savedY = doc.y
        drawPastelBanner(doc, pageNum, 'Personal Cosmic Forecast', `Prepared for ${data.name}`)
        doc.y = savedY
      })

      // ── Page 2: Astrologer-Ready Kundli Chart & Table ─────────────────────
      doc.addPage()
      outline.addItem('Vedic Birth Chart')
      doc.y = 100

      drawSectionHeader(doc, '🪐  Vedic Birth Chart (Janma Kundli) — Astrologer Referral Profile', C.purpleMid)
      doc.moveDown(0.3)

      const cy = doc.y + 115
      if (data.houseData && data.positions) {
        drawNorthIndianChart(doc, doc.page.width / 2, cy, 210, data.houseData, data.positions, data.houseData.lagnaSignIndex, `${data.name}'s Lagna Chart`)
      }
      doc.y = cy + 120

      drawSectionHeader(doc, '🌍  Planetary Longitude & Nakshatra Coordinates', C.gold)
      
      const planets = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra', 'Ke']
      const pNames: Record<string, string> = {
        Su: 'Sun (Surya)', Mo: 'Moon (Chandra)', Ma: 'Mars (Mangal)', Me: 'Mercury (Budh)',
        Ju: 'Jupiter (Guru)', Ve: 'Venus (Shukra)', Sa: 'Saturn (Shani)', Ra: 'Rahu (Asc. Node)', Ke: 'Ketu (Desc. Node)'
      }

      drawGridRow(doc, C.purpleMid, [
        { text: 'PLANET', width: 100, bold: true, color: C.white },
        { text: 'VEDIC RASHI', width: 110, bold: true, color: C.white },
        { text: 'DEGREE', width: 70, bold: true, color: C.white },
        { text: 'HOUSE', width: 60, bold: true, color: C.white },
        { text: 'NAKSHATRA (LORD)', width: 140, bold: true, color: C.white }
      ])

      planets.forEach((p, idx) => {
        const pos = data.positions?.[p as keyof PlanetPositions] || 0
        const signIdx = Math.floor(pos / 30)
        const degree = (pos % 30).toFixed(2)
        const houseIdx = data.houseData?.placements?.[p]?.houseIndex || 1

        const rowBg = idx % 2 === 0 ? '#FAF7FC' : C.white
        
        drawGridRow(doc, rowBg, [
          { text: pNames[p] || p, width: 100, bold: true },
          { text: RASHI_NAMES[signIdx] || 'Aries', width: 110 },
          { text: `${degree}°`, width: 70 },
          { text: `House ${houseIdx}`, width: 60 },
          { text: `${getNakshatraName(pos)} (${getNakshatraLord(pos)})`, width: 140 }
        ])
      })

      // ── Page 3: Personal Life Profile: Problem, Solution & Impact ────────
      doc.addPage()
      outline.addItem('Problem & Solution')
      doc.y = 100

      const colW = 168
      const topY = doc.y
      const tY = topY + 18

      // 1. The Journey (Column 1)
      doc.font('Roboto-Bold').fontSize(11).fillColor(C.purpleMid).text('1. The Journey', 40, topY)
      drawCard(doc, 40, tY, colW, 205, C.white)

      const pNodes = [
        { label: 'Past Roots', desc: 'Childhood foundations and sub-conscious patterns.', icon: '🛖' },
        { label: 'Active Cycle', desc: `Mahadasha of ${data.mahadasha} running.`, icon: '🪐' },
        { label: 'Future Horizon', desc: 'Transformational growth periods.', icon: '🏹' }
      ]
      pNodes.forEach((n, idx) => {
        const nY = tY + 12 + idx * 62
        doc.font('Roboto-Bold').fontSize(9).fillColor(C.purpleMid).text(n.icon + ' ' + n.label, 50, nY)
        doc.font('Roboto').fontSize(7.5).fillColor(C.muted).text(n.desc, 50, nY + 12, { width: colW - 20 })

        if (idx < 2) {
          doc.moveTo(56, nY + 36).lineTo(56, nY + 58).lineWidth(0.8).strokeColor(C.border).stroke()
        }
      })

      // 2. Personal Partnership (Column 1 Bottom)
      const hY = tY + 215
      doc.font('Roboto-Bold').fontSize(11).fillColor(C.purpleMid).text('2. Cosmic Energies', 40, hY)
      drawCard(doc, 40, hY + 18, colW, 95, C.white)
      doc.font('Roboto-Bold').fontSize(8.5).fillColor(C.gold).text('☁  Mind/Body Vibe', 50, hY + 28)
      doc.font('Roboto').fontSize(7.5).fillColor(C.ink).text(`Rising sign ${data.lagna} and nakshatra ${data.nakshatra} establish your core identity. Keeping these in energetic alignment unlocks inner peace.`, 50, hY + 42, { width: colW - 20, lineGap: 2 })

      // 2. Problem Statement (Column 2 Top)
      doc.font('Roboto-Bold').fontSize(11).fillColor(C.purpleMid).text('2. Problem Statement', 220, topY)
      drawCard(doc, 220, tY, colW, 95, C.white)
      doc.font('Roboto-Bold').fontSize(8.5).fillColor(C.rose).text('☁  Active Hurdles', 230, tY + 10)
      
      const personalProb = `Current dasha cycle and transit aspects indicate minor stagnation in career focus, feeling energetically drained due to Saturn transits, and emotional overthinking caused by Moon aspects.`
      doc.font('Roboto').fontSize(7.5).fillColor(C.ink).text(personalProb, 230, tY + 24, { width: colW - 20, lineGap: 2.5 })

      // 3. Solution (Column 2 Bottom)
      doc.font('Roboto-Bold').fontSize(11).fillColor(C.purpleMid).text('3. Solution', 220, tY + 105)
      const solY = tY + 123
      drawCard(doc, 220, solY, colW, 205, C.goldBg, C.gold)
      doc.font('Roboto-Bold').fontSize(9).fillColor(C.gold).text('Astrological Remedies', 230, solY + 12)

      const gemstone = data.remedies?.stone || 'Yellow Sapphire'
      const colors = data.remedies?.color || 'Bright Yellow'
      const mantraText = data.remedies?.mantra || 'Om Gram Greem Groum Sah Gurave Namah'
      const tipsText = data.remedies?.tips || 'Offer water to the Sun daily.'

      const personalRems = [
        { icon: '💎', t: 'Suggested Gemstone', d: `Wear a natural ${gemstone} on your index finger.` },
        { icon: '🎨', t: 'Lucky Color', d: `Surround yourself with ${colors} for Jupiter strength.` },
        { icon: '🕉', t: 'Mantra Meditate', d: `Chant "${mantraText}" daily.` }
      ]

      personalRems.forEach((r, idx) => {
        const ry = solY + 30 + idx * 56
        doc.font('Roboto-Bold').fontSize(8).fillColor(C.purpleMid).text(`${r.icon}  ${r.t}`, 230, ry)
        doc.font('Roboto').fontSize(7.5).fillColor(C.ink).text(r.d, 230, ry + 12, { width: colW - 20, lineGap: 1.5 })
      })

      // 4. Impact (Column 3 Top)
      doc.font('Roboto-Bold').fontSize(11).fillColor(C.purpleMid).text('4. Impact', 400, topY)
      drawCard(doc, 400, tY, colW, 145, C.white)

      const pProgress = [
        { label: 'Career Potential', pct: 85, icon: '❤️', l: 'Elevated' },
        { label: 'Emotional Peace', pct: 70, icon: '🌸', l: 'Harmonized' },
        { label: 'Health Vitality', pct: 90, icon: '🌱', l: 'Flourishing' }
      ]
      pProgress.forEach((p, idx) => {
        const py = tY + 12 + idx * 42
        doc.font('Roboto-Bold').fontSize(7.5).fillColor(C.ink).text(p.label, 410, py)
        doc.font('Roboto-Bold').fontSize(7.5).fillColor(C.lavender).text(`${p.pct}%`, 535, py, { align: 'right', width: 25 })
        
        // Progress track
        doc.rect(410, py + 10, 115, 5).fill('#F0ECFB')
        // Progress fill (Yellow/Gold accent)
        doc.rect(410, py + 10, (115 * p.pct) / 100, 5).fill(C.gold)

        // Icon indicator
        doc.font('Roboto').fontSize(10).text(p.icon, 545, py + 5)
        doc.font('Roboto-Bold').fontSize(5.5).fillColor(C.muted).text(p.l, 540, py + 18, { width: 30, align: 'center' })
      })
      doc.font('Roboto').fontSize(6.5).fillColor(C.muted).text('Projected improvements based on remedies.', 410, tY + 132)

      // 5. The Future Outlook (Column 3 Bottom)
      doc.font('Roboto-Bold').fontSize(11).fillColor(C.purpleMid).text('5. The Future Outlook', 400, tY + 155)
      const futY = tY + 173
      drawCard(doc, 400, futY, colW, 147, C.white)
      
      doc.font('Roboto-Bold').fontSize(8.5).fillColor(C.green).text('❯  What\'s Next', 410, futY + 12)
      
      const personalImpact = `Successfully performing remedies dissolves blockages. You will experience up to 40% reduction in mental fatigue and unlock active yogas.`
      doc.font('Roboto').fontSize(7.5).fillColor(C.ink).text(personalImpact, 410, futY + 26, { width: colW - 20, lineGap: 2 })
      doc.font('Roboto').fontSize(6.8).fillColor(C.muted).text('"Aligning your stars changes your destiny."', 410, futY + 115, { width: colW - 20, align: 'center', oblique: true })

      doc.y = futY + 160

      // ── Page 4: 4-Month Personal Journey Map ──────────────────────────────
      doc.addPage()
      outline.addItem('Personal Journey Map')
      doc.y = 100

      drawSectionHeader(doc, '📅  4-Month Future Personal Journey Map', C.purpleMid)
      doc.moveDown(0.4)

      const personalSteps = [
        {
          month: 'Month 1: Energetic Reset',
          transits: 'Sun transits the 10th house of career and actions, aspecting Mars.',
          caution: 'High motivation. Excellent time to pitch new projects, but avoid work-hours clashes.',
          vibe: 'Productive, high energy, and authoritative.'
        },
        {
          month: 'Month 2: Financial Focus',
          transits: 'Mercury enters your 11th house of gains, aspecting natal Jupiter.',
          caution: 'Analyze investments carefully. Good time to negotiate contracts or client terms.',
          vibe: 'Sharply intellectual, focused, and financially oriented.'
        },
        {
          month: 'Month 3: Caution & Rest',
          transits: 'Saturn aspects natal Moon, triggering a brief Sade-Sati influence.',
          caution: 'Focus on rest, physical wellbeing, and hydration. Avoid starting massive risk-taking ventures.',
          vibe: 'Slow, reflective, slightly serious. Growth through patience.'
        },
        {
          month: 'Month 4: Expansion Window',
          transits: 'Jupiter aspects your ascendant, generating double fortune transits.',
          caution: 'A highly auspicious month for learning, starting studies, or launching creative plans.',
          vibe: 'Optimistic, lucky, and emotionally peaceful.'
        }
      ]

      personalSteps.forEach((step, idx) => {
        const stepY = doc.y
        drawCard(doc, 40, stepY, doc.page.width - 80, 68, C.white)
        
        // Month marker with gold circle indicator
        doc.circle(52, stepY + 15, 4).fill(C.gold)
        doc.font('Roboto-Bold').fontSize(9.5).fillColor(C.purpleMid).text(step.month, 64, stepY + 10)

        // Transit details
        doc.font('Roboto-Bold').fontSize(7.5).fillColor(C.muted).text('Transit Context: ', 50, stepY + 28)
        doc.font('Roboto').fontSize(7.5).fillColor(C.ink).text(step.transits, 125, stepY + 28)

        // Caution details
        doc.font('Roboto-Bold').fontSize(7.5).fillColor(C.rose).text('Astro Caution:   ', 50, stepY + 40)
        doc.font('Roboto').fontSize(7.5).fillColor(C.ink).text(step.caution, 125, stepY + 40)

        // Vibe/Energy
        doc.font('Roboto-Bold').fontSize(7.5).fillColor(C.green).text('Vibe Forecast:   ', 50, stepY + 52)
        doc.font('Roboto').fontSize(7.5).fillColor(C.ink).text(step.vibe, 125, stepY + 52)

        doc.y = stepY + 68
        doc.moveDown(0.3)
      })

      // ── Page 5: Annual Chapters & Disclaimer ──────────────────────────────
      doc.addPage()
      outline.addItem('Annual Forecast')
      doc.y = 100

      drawSectionHeader(doc, '📅  Life Chapters: Dasha Era Analysis', C.purpleMid)
      doc.moveDown(0.3)
      doc.font('Roboto').fontSize(8.5).fillColor(C.ink)
        .text(data.dashaAnalysis, 50, doc.y, { width: doc.page.width - 100, align: 'justify', lineGap: 3.5 })
      doc.moveDown(0.8)

      drawSectionHeader(doc, '💼  Job & Cash Windows: Career Outlook', C.gold)
      doc.moveDown(0.3)
      doc.font('Roboto').fontSize(8.5).fillColor(C.ink)
        .text(data.careerWindows, 50, doc.y, { width: doc.page.width - 100, align: 'justify', lineGap: 3.5 })
      doc.moveDown(0.8)

      drawSectionHeader(doc, '💖  Love & Relationships: Connection Forecast', C.coral)
      doc.moveDown(0.3)
      doc.font('Roboto').fontSize(8.5).fillColor(C.ink)
        .text(data.loveWindows, 50, doc.y, { width: doc.page.width - 100, align: 'justify', lineGap: 3.5 })
      doc.moveDown(1.5)

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
