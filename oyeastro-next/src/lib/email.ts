import nodemailer from 'nodemailer'

let cachedTransporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (!cachedTransporter) {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com'
    const port = parseInt(process.env.SMTP_PORT || '587', 10)
    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS

    if (!user || !pass) {
      return null
    }

    // Do NOT use pool: true in Vercel Serverless environment.
    // Frozen serverless containers can result in closed sockets or ECONNRESET on subsequent requests.
    cachedTransporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    })
  }
  return cachedTransporter
}

export async function sendEmail({ 
  to, 
  subject, 
  html,
  attachments
}: { 
  to: string; 
  subject: string; 
  html: string;
  attachments?: Array<{ filename: string; content: Buffer }>
}) {
  const transporter = getTransporter()

  if (!transporter) {
    console.warn('[Email] SMTP_USER or SMTP_PASS environment variables are missing. Logged email details:')
    console.log(`TO: ${to}`)
    console.log(`SUBJECT: ${subject}`)
    console.log(`HTML CONTENT:\n${html}`)
    return { success: true, mocked: true }
  }

  await transporter.sendMail({
    from: `"OyeAstro" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
    attachments,
  })

  return { success: true }
}
