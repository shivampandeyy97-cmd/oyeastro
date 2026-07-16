import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, feedback } = body

    if (!name || !email || !feedback) {
      return NextResponse.json({ error: 'Name, email, and feedback are required.' }, { status: 400 })
    }

    // Default admin email to SMTP_USER if not set
    const adminEmail = process.env.SMTP_USER || 'shivampandeyy97@gmail.com'

    await sendEmail({
      to: adminEmail,
      subject: `[OyeAstro] New User Feedback from ${name}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #f0f0f0; border-radius: 16px; background-color: #ffffff;">
          <h2 style="font-size: 20px; font-weight: bold; color: #1a1208; border-bottom: 1px solid #f0f0f0; padding-bottom: 12px; margin-bottom: 16px;">
            📩 New User Feedback Received
          </h2>
          <p style="font-size: 14px; line-height: 1.6; color: #4a4a4a; margin-bottom: 20px;">
            You have received a new feedback submission on OyeAstro.
          </p>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
            <tbody>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #776e85; width: 120px; border-bottom: 1px solid #f9f9f9;">Name:</td>
                <td style="padding: 8px 0; color: #1a1208; border-bottom: 1px solid #f9f9f9;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #776e85; border-bottom: 1px solid #f9f9f9;">Email ID:</td>
                <td style="padding: 8px 0; color: #1a1208; border-bottom: 1px solid #f9f9f9;">
                  <a href="mailto:${email}" style="color: #8A5CF5; text-decoration: none;">${email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #776e85; vertical-align: top; padding-top: 12px;">Feedback:</td>
                <td style="padding: 12px 0 8px 0; color: #1a1208; white-space: pre-wrap; line-height: 1.5; font-style: italic;">
                  "${feedback}"
                </td>
              </tr>
            </tbody>
          </table>
          <p style="font-size: 11px; color: #bbb; text-align: center; border-top: 1px solid #f0f0f0; padding-top: 16px; margin-top: 32px;">
            This notification is powered by OyeAstro Feedback System
          </p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[Feedback API] Error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
