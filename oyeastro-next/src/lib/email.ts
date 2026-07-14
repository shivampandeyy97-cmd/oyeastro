import nodemailer from 'nodemailer'

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
  const host = process.env.SMTP_HOST || 'smtp.gmail.com'
  const port = parseInt(process.env.SMTP_PORT || '587', 10)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!user || !pass) {
    console.warn('[Email] SMTP_USER or SMTP_PASS environment variables are missing. Logged email details:')
    console.log(`TO: ${to}`)
    console.log(`SUBJECT: ${subject}`)
    console.log(`HTML CONTENT:\n${html}`)
    return { success: true, mocked: true }
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  })

  await transporter.sendMail({
    from: `"OyeAstro" <${user}>`,
    to,
    subject,
    html,
    attachments,
  })

  return { success: true }
}
