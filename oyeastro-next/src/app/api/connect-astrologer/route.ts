import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { db } from '@/lib/firebase'
import { collection, addDoc } from 'firebase/firestore'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { name, email, whatsapp } = await req.json()

    if (!name || !email || !whatsapp) {
      return NextResponse.json({ error: 'Missing name, email, or whatsapp number' }, { status: 400 })
    }

    // Save connection request to Firestore
    try {
      await addDoc(collection(db, 'astrologer_connections'), {
        name,
        email,
        whatsapp,
        created_at: new Date().toISOString()
      })
    } catch (e) {
      console.error('[Connect Astrologer DB Insert] Error:', e)
    }

    // Send email alert and await it so the serverless execution context does not close prematurely
    try {
      await sendEmail({
        to: 'shivampandeyy97@gmail.com',
        subject: 'New Astrologer Connection Request',
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2>🔮 New Astrologer Connection Request 🔮</h2>
            <p>A user wants to connect with a real astrologer. Here are their details:</p>
            <table style="width: 100%; max-width: 400px; border-collapse: collapse; margin-top: 15px;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Name:</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">WhatsApp:</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${whatsapp}</td>
              </tr>
            </table>
            <p style="margin-top: 25px; font-size: 11px; color: #888;">Received from OyeAstro.</p>
          </div>
        `
      })
    } catch (err) {
      console.error('[Connect Astrologer Email Send] Error:', err)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[/api/connect-astrologer] Error:', err)
    return NextResponse.json({ error: 'Failed to process astrologer request' }, { status: 500 })
  }
}
