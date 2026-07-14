import PDFDocument from 'pdfkit'

interface CompatibilityPdfData {
  cName1: string
  cName2: string
  score: number
  details?: {
    temp?: number
    heart?: number
    destiny?: number
    trust?: number
  }
  narrative: string
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
}

export function generateCompatibilityPdf(data: CompatibilityPdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 })
      const buffers: Buffer[] = []

      doc.on('data', (chunk) => buffers.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(buffers)))

      // Color Palette
      const primaryColor = '#FF7A45'
      const darkColor = '#1A1208'
      const lightBg = '#FCFBFA'
      const borderCol = '#E5E5E5'

      // Title
      doc.font('Helvetica-Bold').fontSize(22).fillColor(darkColor).text('✨ OyeAstro Cosmic Compatibility Report', { align: 'center' })
      doc.moveDown(1)

      // Divider Line
      doc.moveTo(50, doc.y).lineTo(562, doc.y).strokeColor(primaryColor).lineWidth(1.5).stroke()
      doc.moveDown(1.5)

      // Partners section
      doc.font('Helvetica-Bold').fontSize(14).fillColor(darkColor).text(`Partners: ${data.cName1}  ⟷  ${data.cName2}`, { align: 'center' })
      doc.moveDown(1)

      // Score Box
      doc.rect(150, doc.y, 312, 80).fill(lightBg)
      const prevY = doc.y
      doc.font('Helvetica').fontSize(10).fillColor('#888888').text('COSMIC MATCH SCORE', 150, prevY + 15, { align: 'center', width: 312 })
      doc.font('Helvetica-Bold').fontSize(32).fillColor(primaryColor).text(`${data.score}%`, 150, prevY + 30, { align: 'center', width: 312 })
      doc.y = prevY + 80
      doc.moveDown(1.5)

      // Detailed Dimensions Table
      doc.font('Helvetica-Bold').fontSize(12).fillColor(darkColor).text('Detailed Compatibility Dimensions:')
      doc.moveDown(0.5)

      const details = data.details || {}
      const dimensions = [
        { label: '🎭 Temperament (Gana):', val: `${details.temp ?? 80}%` },
        { label: '💖 Heart Connect (Bhakoot):', val: `${details.heart ?? 75}%` },
        { label: '🚀 Destiny (Yoni/Nadi):', val: `${details.destiny ?? 70}%` },
        { label: '🤝 Trust Bond (Graha Maitri):', val: `${details.trust ?? 85}%` },
      ]

      dimensions.forEach((item) => {
        const currentY = doc.y
        doc.font('Helvetica').fontSize(10).fillColor('#555555').text(item.label, 60, currentY)
        doc.font('Helvetica-Bold').fontSize(10).fillColor(darkColor).text(item.val, 480, currentY, { align: 'right', width: 80 })
        doc.moveDown(0.3)
        // Underline row
        doc.moveTo(50, doc.y).lineTo(562, doc.y).strokeColor(borderCol).lineWidth(0.5).stroke()
        doc.moveDown(0.5)
      })

      doc.moveDown(1)

      // Narrative Section
      doc.font('Helvetica-Bold').fontSize(12).fillColor(darkColor).text('Cosmic Connection Insight:')
      doc.moveDown(0.5)

      doc.font('Helvetica').fontSize(11).fillColor('#333333').text(`"${data.narrative}"`, {
        align: 'justify',
        lineGap: 4
      })

      // Footer
      doc.moveDown(3)
      doc.font('Helvetica').fontSize(9).fillColor('#AAAAAA').text('This report is powered by OyeAstro mathematical astrology engine.', { align: 'center' })

      doc.end()
    } catch (err) {
      reject(err)
    }
  })
}

export function generatePersonalPdf(data: PersonalPdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 })
      const buffers: Buffer[] = []

      doc.on('data', (chunk) => buffers.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(buffers)))

      const primaryColor = '#FF7A45'
      const darkColor = '#1A1208'

      // Title
      doc.font('Helvetica-Bold').fontSize(22).fillColor(darkColor).text(`🔮 ${data.name}'s Premium Cosmic Forecast`, { align: 'center' })
      doc.moveDown(0.5)
      doc.font('Helvetica').fontSize(11).fillColor('#888888').text(`${data.lagna} Lagna · ${data.nakshatra} Nakshatra · ${data.mahadasha} Mahadasha`, { align: 'center' })
      doc.moveDown(1)

      doc.moveTo(50, doc.y).lineTo(562, doc.y).strokeColor(primaryColor).lineWidth(1.5).stroke()
      doc.moveDown(1.5)

      const sections = [
        { title: '📅 Life Chapters (Dasha Era)', content: data.dashaAnalysis },
        { title: '🪐 Star Shift Cycles (Transits)', content: data.transitDates },
        { title: '💼 Job & Cash Windows', content: data.careerWindows },
        { title: '💖 Love & Relationship Connection', content: data.loveWindows },
        { title: '🔋 Vibe & Energy Protection', content: data.healthWarnings },
      ]

      sections.forEach((sec) => {
        doc.font('Helvetica-Bold').fontSize(13).fillColor(primaryColor).text(sec.title)
        doc.moveDown(0.3)
        doc.font('Helvetica').fontSize(10).fillColor('#333333').text(sec.content, { align: 'justify', lineGap: 3 })
        doc.moveDown(1.5)
      })

      // Footer
      doc.moveDown(2)
      doc.font('Helvetica').fontSize(9).fillColor('#AAAAAA').text('This report is powered by OyeAstro mathematical astrology engine.', { align: 'center' })

      doc.end()
    } catch (err) {
      reject(err)
    }
  })
}
