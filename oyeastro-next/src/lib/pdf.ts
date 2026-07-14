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
  purpleMid:  '#15092A', // Deep space violet
  lavender:   '#8A5CF5', // Vibrant brand purple
  coral:      '#FF7A45', // Warm sunset coral (cheerfulness)
  rose:       '#FF5C8A', // Romantic rose
  gold:       '#D4A017', // Vedic gold
  ink:        '#1A1208', // Dark text
  muted:      '#776E85', // Faint text
  border:     '#E2DBEB', // Light border
  bgLight:    '#FDFBFE', // Content page bg
  white:      '#FFFFFF',
  green:      '#4EAD72',
  red:        '#E25B5B',
  blue:       '#4E9CD4',
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

// ─── Document Formatting Helpers ─────────────────────────────────────────────

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

function drawContentPageDecorations(doc: PDFKit.PDFDocument, pageNum: number, titleText = 'OYEASTRO COSMIC REPORT') {
  const oldBottom = doc.page.margins.bottom
  doc.page.margins.bottom = 0 

  // Soft page fill
  doc.rect(0, 0, doc.page.width, doc.page.height).fill(C.bgLight)

  // Elegant border lines
  doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
     .lineWidth(0.5)
     .strokeColor(C.border)
     .stroke()

  const w = doc.page.width
  const h = doc.page.height
  
  doc.font('Roboto-Bold').fontSize(8).fillColor(C.lavender)
    .text('✦', 35, 38)
    .text('✦', w - 42, 38)
    .text('✦', 35, h - 45)
    .text('✦', w - 42, h - 45)

  // Running Header
  doc.font('Roboto-Bold').fontSize(7.5).fillColor(C.lavender).text(titleText, 45, 16, { width: w - 90, align: 'left', characterSpacing: 1 })
  doc.font('Roboto').fontSize(7).fillColor(C.muted).text('Certified Vedic Astrology Alignment', 45, 16, { width: w - 90, align: 'right' })
  doc.moveTo(40, 24).lineTo(w - 40, 24).lineWidth(0.5).strokeColor(C.border).stroke()

  // Running Footer
  doc.moveTo(40, h - 30).lineTo(w - 40, h - 30).lineWidth(0.5).strokeColor(C.border).stroke()
  doc.font('Roboto').fontSize(7).fillColor(C.muted)
    .text('Confidential Vedic Referral Profile · oyeastro.com', 45, h - 23, { width: w - 90, align: 'left' })
    .text(`Page ${pageNum}`, 45, h - 23, { width: w - 90, align: 'right' })

  doc.page.margins.bottom = oldBottom
}

/**
 * Standard counter-clockwise North Indian Kundli chart (as seen on astrotalk.com / genuine Vedic platforms)
 * House 1 (Ascendant) is top diamond. Houses proceed counter-clockwise:
 * H1: top, H2: top-left upper, H3: top-left left, H4: left, H5: bottom-left left,
 * H6: bottom-left bottom, H7: bottom, H8: bottom-right bottom, H9: bottom-right right,
 * H10: right, H11: top-right right, H12: top-right upper.
 */
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

  // Diagonals
  doc.moveTo(x0, y0).lineTo(x0 + s, y0 + s).lineWidth(0.8).strokeColor(C.lavender).stroke()
  doc.moveTo(x0 + s, y0).lineTo(x0, y0 + s).lineWidth(0.8).strokeColor(C.lavender).stroke()

  // Inner diamond
  doc.moveTo(cx, y0).lineTo(x0 + s, cy)
     .lineTo(cx, y0 + s).lineTo(x0, cy)
     .lineTo(cx, y0)
     .lineWidth(0.8).strokeColor(C.lavender).stroke()

  // Highlight House 1 (Ascendant) diamond with soft lavender fill
  doc.path(`M ${cx} ${cy} L ${x0 + s/2} ${y0} L ${x0} ${cy} Z`).fill('#8A5CF508')

  // Map sign names & planet placements
  const signShort = ['Ar', 'Ta', 'Ge', 'Ca', 'Le', 'Vi', 'Li', 'Sc', 'Sg', 'Cp', 'Aq', 'Pi']
  
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
    doc.font('Roboto').fontSize(6.5).fillColor(C.lavender)
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

function drawVibeBadge(doc: PDFKit.PDFDocument, x: number, y: number, w: number, h: number, icon: string, label: string, desc: string, badgeColor: string) {
  doc.rect(x, y, w, h).fill(C.white)
  doc.rect(x, y, w, h).lineWidth(0.5).strokeColor(C.border).stroke()
  
  // Color tag on left edge
  doc.rect(x, y, 4, h).fill(badgeColor)

  doc.font('Roboto-Bold').fontSize(12).text(icon, x + 12, y + 10)
  doc.font('Roboto-Bold').fontSize(8.5).fillColor(badgeColor).text(label.toUpperCase(), x + 32, y + 12)
  doc.font('Roboto').fontSize(8).fillColor(C.ink).text(desc, x + 12, y + 28, { width: w - 24, align: 'justify', lineGap: 2.5 })
}

// ─── Section Header ───────────────────────────────────────────────────────────
function drawSectionHeader(doc: PDFKit.PDFDocument, text: string, color: string) {
  const y = doc.y
  doc.rect(40, y, doc.page.width - 80, 22).fill(color)
  doc.font('Roboto-Bold').fontSize(10.5).fillColor(C.white)
    .text(text, 50, y + 5.5, { width: doc.page.width - 100 })
  doc.y = y + 27
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

      // Hearts & Love graphic accent
      doc.circle(doc.page.width / 2, 210, 50).lineWidth(1.2).strokeColor(C.rose).stroke()
      doc.circle(doc.page.width / 2, 210, 44).lineWidth(0.5).strokeColor(C.gold).stroke()
      doc.font('Roboto-Bold').fontSize(40).fillColor(C.rose).text('♥', doc.page.width / 2 - 14, 192, { align: 'center' })

      // Celebratory text
      doc.font('Roboto-Bold').fontSize(28).fillColor(C.white)
        .text('OYEASTRO', 40, 290, { width: doc.page.width - 80, align: 'center', characterSpacing: 4 })
      
      doc.font('Roboto-Bold').fontSize(14).fillColor(C.rose)
        .text('OUR COSMIC JOURNEY TOGETHER', 40, 335, { width: doc.page.width - 80, align: 'center', characterSpacing: 1 })

      doc.moveTo(doc.page.width / 2 - 60, 362).lineTo(doc.page.width / 2 + 60, 362).lineWidth(1.5).strokeColor(C.rose).stroke()

      // Duo Names
      const scoreY = 410
      doc.font('Roboto-Bold').fontSize(16).fillColor(C.white)
        .text(`${data.cName1}   ♥   ${data.cName2}`, 40, scoreY, { width: doc.page.width - 80, align: 'center' })

      // Match score badge
      doc.rect(doc.page.width / 2 - 70, scoreY + 32, 140, 95).fill(C.purpleMid)
      doc.rect(doc.page.width / 2 - 70, scoreY + 32, 140, 95).lineWidth(0.8).strokeColor(C.rose + '50').stroke()

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
        drawContentPageDecorations(doc, pageNum, `COMPATIBILITY PROFILE: ${data.cName1.toUpperCase()} & ${data.cName2.toUpperCase()}`)
        doc.y = savedY
      })

      // ── Page 2: Astrologer-Ready Kundli Charts & Table ─────────────────────
      doc.addPage()
      outline.addItem('Janma Kundli Charts')

      drawSectionHeader(doc, '🪐  Vedic Birth Charts (Janma Kundli) — Astrologer Referral Profile', C.purpleMid)
      doc.moveDown(0.3)

      // Dual counter-clockwise Kundli charts side-by-side
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

      // Detailed Astrologer table (degrees, signs, nakshatras, nakshatra lords)
      drawSectionHeader(doc, '🌍  Comprehensive Astro-Reference Grid', C.lavender)
      
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

      // ── Page 3: Problem, Solution, Impact Section ────────────────────────
      doc.addPage()
      outline.addItem('Problem & Solution')

      drawSectionHeader(doc, '🔴  Connection Challenges (Problem Statement)', C.coral)
      doc.moveDown(0.4)
      
      const probText = data.score >= 70
        ? `Communication flow is highly harmonious, but the main risk is emotional comfort-zone stagnation. Because you understand each other so naturally, you might avoid difficult growth discussions, which can restrict long-term dynamic compatibility. Watch out for passive agreement over active building.`
        : data.score >= 45
        ? `Vedic friction points exist in Gana (temperament) and Graha Maitri (communication lords). ${data.cName1} and ${data.cName2} speak slightly different relationship languages. This creates expression delays, feeling misunderstood, and intellectual differences during decision-making. Minor arguments could drag on.`
        : `High energetic friction. Significant contrasts in Nadi (sub-conscious/biological wavelengths) and Bhakoot (emotional nodes). This indicates intense emotional blockages, frequent arguments, feeling drained during conflicts, and diverging lifestyle paths which can create separation anxiety.`

      doc.font('Roboto').fontSize(9).fillColor(C.ink).text(probText, 50, doc.y, { width: doc.page.width - 100, align: 'justify', lineGap: 3.5 })
      doc.moveDown(1)

      drawSectionHeader(doc, '🔑  Vedic Remedies & Solutions', C.gold)
      doc.moveDown(0.4)

      const solText = data.score >= 70
        ? `Remedies to sustain interest & energy:\n1. Wear shades of light rose or coral on Tuesdays to invite planetary warmth.\n2. Dedicate Saturday evenings to shared outdoor growth activities to ground Saturn\'s energy.\n3. Together, offer milk and honey to Lord Shiva on Mondays to strengthen the moon connection.`
        : data.score >= 45
        ? `Vedic actions to bridge compatibility gaps:\n1. Wear light green or sky blue on Wednesdays to align Mercury (communication lord).\n2. Together, chant "Om Som Somaya Namah" 108 times on Mondays to soothe emotional friction.\n3. Dedicate a specific day weekly to relationship check-ins where honesty is practiced without defense.`
        : `Strong corrective remedies to handle energy clash:\n1. Keep a silver coin or vessel in your shared living area to absorb negative Nadi clash waves.\n2. Donate yellow sweets or food to children on Thursdays (Jupiter remedy to dissolve Rahu/Mars blockages).\n3. Wear light cream/gold colors on Fridays. Avoid dark blue/black colors during major couple discussions.`

      doc.rect(46, doc.y, doc.page.width - 92, 90).fill('#FFFDF5')
      doc.rect(46, doc.y, doc.page.width - 92, 90).lineWidth(0.5).strokeColor(C.gold).stroke()
      doc.font('Roboto-Bold').fontSize(8.5).fillColor(C.gold).text('SUGGESTED ALIGNMENT SOLUTIONS:', 56, doc.y + 12)
      doc.font('Roboto').fontSize(8.2).fillColor(C.ink).text(solText, 56, doc.y + 28, { width: doc.page.width - 112, lineGap: 3.5 })
      doc.y += 105

      drawSectionHeader(doc, '🟢  Future Transformation (Impact)', C.purpleMid)
      doc.moveDown(0.4)

      const impactText = data.score >= 70
        ? `Implementing these remedies ensures a highly creative partnership that elevates both of your careers and social stand. Your shared fortune will double, leading to stable wealth creation, high mutual respect, and a peaceful domestic sanctuary.`
        : data.score >= 45
        ? `Applying these actions resolves communication delays and aligns your daily lifestyle. You will transform from basic couple attraction into a highly focused partnership, building deep emotional trust and constructive joint ventures.`
        : `Conscientiously following these remedies reduces the intensity of Nadi clash by up to 60%. This transforms constant friction into a powerful growth invitation, teaching both of you deep patience, spiritual empathy, and maturity.`

      doc.font('Roboto').fontSize(9).fillColor(C.ink).text(impactText, 50, doc.y, { width: doc.page.width - 100, align: 'justify', lineGap: 3.5 })

      // ── Page 4: 4-Month Relationship Journey Map ───────────────────────────
      doc.addPage()
      outline.addItem('Relationship Journey Map')

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
        const stepBg = idx % 2 === 0 ? '#FAF6FF' : C.white
        const stepY = doc.y
        doc.rect(40, stepY, doc.page.width - 80, 70).fill(stepBg)
        doc.rect(40, stepY, doc.page.width - 80, 70).lineWidth(0.5).strokeColor(C.border).stroke()
        
        // Month marker
        doc.rect(50, stepY + 12, 6, 6).fill(C.coral)
        doc.font('Roboto-Bold').fontSize(9.5).fillColor(C.purpleMid).text(step.month, 62, stepY + 10)

        // Transit details
        doc.font('Roboto-Bold').fontSize(7.5).fillColor(C.muted).text('Transit Context: ', 50, stepY + 28)
        doc.font('Roboto').fontSize(7.5).fillColor(C.ink).text(step.transits, 125, stepY + 28)

        // Caution details
        doc.font('Roboto-Bold').fontSize(7.5).fillColor(C.rose).text('Astro Caution:   ', 50, stepY + 41)
        doc.font('Roboto').fontSize(7.5).fillColor(C.ink).text(step.caution, 125, stepY + 41)

        // Vibe/Energy
        doc.font('Roboto-Bold').fontSize(7.5).fillColor(C.green).text('Vibe Forecast:   ', 50, stepY + 54)
        doc.font('Roboto').fontSize(7.5).fillColor(C.ink).text(step.vibe, 125, stepY + 54)

        doc.y = stepY + 70
        doc.moveDown(0.3)
      })

      // ── Page 5: Vibe Score & Disclaimer ──────────────────────────────────
      doc.addPage()
      outline.addItem('Wellbeing Snapshot')

      drawSectionHeader(doc, '💖  Relationship Wellbeing Snapshot', C.purpleMid)
      doc.moveDown(0.3)
      doc.font('Roboto').fontSize(9.5).fillColor(C.ink)
        .text(data.score >= 70
          ? `${data.cName1} and ${data.cName2} share a deeply compatible foundation. Your natural wavelengths align beautifully — this connection has the strength to weather challenges and grow over time.`
          : data.score >= 45
          ? `${data.cName1} and ${data.cName2} have real potential with conscious effort. Some natural tensions exist, but these build character and depth in a meaningful relationship.`
          : `${data.cName1} and ${data.cName2} bring very different energies together. This can be transformative if both commit to understanding each other — contrast isn't incompatibility, it's a growth invitation.`
        , 50, doc.y, { width: doc.page.width - 100, align: 'justify', lineGap: 3.5 })
      doc.moveDown(0.8)

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

      doc.y = gridY + cardH * 2 + 25
      doc.moveDown(1.5)

      // Disclaimer
      drawSectionHeader(doc, '⚠️  Vedic Referral Disclaimer', C.ink)
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

      // Main branding
      doc.font('Roboto-Bold').fontSize(28).fillColor(C.white)
        .text('OYEASTRO', 40, 290, { width: doc.page.width - 80, align: 'center', characterSpacing: 4 })
      
      doc.font('Roboto-Bold').fontSize(14).fillColor(C.gold)
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
        drawContentPageDecorations(doc, pageNum, `COSMIC REPORT: ${data.name.toUpperCase()}`)
        doc.y = savedY
      })

      // ── Page 2: Astrologer-Ready Kundli Chart & Table ─────────────────────
      doc.addPage()
      outline.addItem('Vedic Birth Chart')

      drawSectionHeader(doc, '🪐  Vedic Birth Chart (Janma Kundli) — Astrologer Referral Profile', C.purpleMid)
      doc.moveDown(0.3)

      const cy = doc.y + 115
      if (data.houseData && data.positions) {
        drawNorthIndianChart(doc, doc.page.width / 2, cy, 210, data.houseData, data.positions, data.houseData.lagnaSignIndex, `${data.name}'s Lagna Chart`)
      }
      doc.y = cy + 120

      drawSectionHeader(doc, '🌍  Planetary Longitude & Nakshatra Coordinates', C.lavender)
      
      const planets = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra', 'Ke']
      const pNames: Record<string, string> = {
        Su: 'Sun (Surya)', Mo: 'Moon (Chandra)', Ma: 'Mars (Mangal)', Me: 'Mercury (Budh)',
        Ju: 'Jupiter (Guru)', Ve: 'Venus (Shukra)', Sa: 'Saturn (Shani)', Ra: 'Rahu (Asc. Node)', Ke: 'Ketu (Desc. Node)'
      }

      drawGridRow(doc, C.purpleMid, [
        { text: 'PLANET', width: 100, bold: true, color: C.white },
        { text: 'VVEDIC RASHI', width: 110, bold: true, color: C.white },
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

      // ── Page 3: Problem, Solution, Impact Section ────────────────────────
      doc.addPage()
      outline.addItem('Problem & Solution')

      drawSectionHeader(doc, '🔴  Life Blockages (Problem Statement)', C.coral)
      doc.moveDown(0.4)

      const personalProb = `Current dasha cycle and transit aspects indicate minor stagnation in career focus, feeling energetically drained due to Saturn transits, and emotional overthinking caused by Moon aspects. Undercurrents of stress during major work/life transitions might block the manifestation of positive yogas in your chart.`
      doc.font('Roboto').fontSize(9).fillColor(C.ink).text(personalProb, 50, doc.y, { width: doc.page.width - 100, align: 'justify', lineGap: 3.5 })
      doc.moveDown(1)

      drawSectionHeader(doc, '🔑  Vedic Remedies & Solutions', C.gold)
      doc.moveDown(0.4)

      const gemstone = data.remedies?.stone || 'Yellow Sapphire'
      const colors = data.remedies?.color || 'Bright Yellow'
      const mantraText = data.remedies?.mantra || 'Om Gram Greem Groum Sah Gurave Namah'
      const tipsText = data.remedies?.tips || 'Offer water to the Sun daily and meditate during morning transition hours.'

      doc.rect(46, doc.y, doc.page.width - 92, 90).fill('#FFFDF5')
      doc.rect(46, doc.y, doc.page.width - 92, 90).lineWidth(0.5).strokeColor(C.gold).stroke()
      
      doc.font('Roboto-Bold').fontSize(8.5).fillColor(C.gold).text('VEDIC STRENGTHENING PLAN:', 56, doc.y + 12)
      doc.font('Roboto').fontSize(8.2).fillColor(C.ink).text(`1. Suggested Gemstone: Wear a natural ${gemstone} on your index finger on Thursday mornings.\n2. Auspicious Color: Surround yourself with ${colors} to boost Mercury/Jupiter energies.\n3. Planetary Chant: Meditate on the mantra "${mantraText}" 108 times daily.\n4. Daily Ritual: ${tipsText}`, 56, doc.y + 28, { width: doc.page.width - 112, lineGap: 3.5 })
      doc.y += 105

      drawSectionHeader(doc, '🟢  Future Impact (Transformational Outlook)', C.purpleMid)
      doc.moveDown(0.4)

      const personalImpact = `Successfully performing these solutions will align your active dasha eras, dissolving blockages in career and relationships. You will experience up to 40% reduction in mental fatigue, unlock the full manifestation of your chart\'s active yogas, and gain sharp clarity in major financial decisions.`
      doc.font('Roboto').fontSize(9).fillColor(C.ink).text(personalImpact, 50, doc.y, { width: doc.page.width - 100, align: 'justify', lineGap: 3.5 })

      // ── Page 4: 4-Month Journey Map ────────────────────────────────────────
      doc.addPage()
      outline.addItem('Annual Journey Map')

      drawSectionHeader(doc, '📅  4-Month Future Cosmic Journey Map', C.purpleMid)
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
        const stepBg = idx % 2 === 0 ? '#FAF6FF' : C.white
        const stepY = doc.y
        doc.rect(40, stepY, doc.page.width - 80, 70).fill(stepBg)
        doc.rect(40, stepY, doc.page.width - 80, 70).lineWidth(0.5).strokeColor(C.border).stroke()
        
        // Month marker
        doc.rect(50, stepY + 12, 6, 6).fill(C.gold)
        doc.font('Roboto-Bold').fontSize(9.5).fillColor(C.purpleMid).text(step.month, 62, stepY + 10)

        // Transit details
        doc.font('Roboto-Bold').fontSize(7.5).fillColor(C.muted).text('Transit Context: ', 50, stepY + 28)
        doc.font('Roboto').fontSize(7.5).fillColor(C.ink).text(step.transits, 125, stepY + 28)

        // Caution details
        doc.font('Roboto-Bold').fontSize(7.5).fillColor(C.rose).text('Astro Caution:   ', 50, stepY + 41)
        doc.font('Roboto').fontSize(7.5).fillColor(C.ink).text(step.caution, 125, stepY + 41)

        // Vibe/Energy
        doc.font('Roboto-Bold').fontSize(7.5).fillColor(C.green).text('Vibe Forecast:   ', 50, stepY + 54)
        doc.font('Roboto').fontSize(7.5).fillColor(C.ink).text(step.vibe, 125, stepY + 54)

        doc.y = stepY + 70
        doc.moveDown(0.3)
      })

      // ── Page 5: Annual Forecast Chapters & Disclaimer ─────────────────────
      doc.addPage()
      outline.addItem('Annual Forecast')

      drawSectionHeader(doc, '📅  Life Chapters: Dasha Era Analysis', C.purpleMid)
      doc.moveDown(0.3)
      doc.font('Roboto').fontSize(8.5).fillColor(C.ink)
        .text(data.dashaAnalysis, 50, doc.y, { width: doc.page.width - 100, align: 'justify', lineGap: 3.5 })
      doc.moveDown(0.8)

      drawSectionHeader(doc, '💼  Job & Cash Windows: Career Outlook', C.lavender)
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
