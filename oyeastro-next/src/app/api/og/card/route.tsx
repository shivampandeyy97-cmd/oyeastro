import { NextRequest } from 'next/server'
import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const name   = searchParams.get('name')   ?? 'Your Chart'
  const quote  = searchParams.get('quote')  ?? 'The cosmos built you different. ✨'
  const format = searchParams.get('format') ?? 'wide' // wide | story | square

  const isStory = format === 'story'
  const w = isStory ? 1080 : 1200
  const h = isStory ? 1920 : 630

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #0b0c20 0%, #131438 50%, #080916 100%)',
          border: '16px solid #23120b',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
          padding: '40px',
        }}
      >
        {/* Star field dots */}
        {[...Array(45)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: `${Math.random() * 3 + 1.5}px`,
            height: `${Math.random() * 3 + 1.5}px`,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.45)',
            left: `${(i * 37 + 19) % 100}%`,
            top: `${(i * 53 + 11) % 100}%`,
          }} />
        ))}

        {/* OyeAstro brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: '#8a5cf5', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px',
            border: '2px solid #23120b',
          }}>🪐</div>
          <span style={{ color: '#ffffff', fontSize: '32px', fontWeight: 900, letterSpacing: '-0.5px' }}>OyeAstro</span>
        </div>

        {/* Name */}
        <div style={{ color: '#ffffff', fontSize: isStory ? '80px' : '56px', fontWeight: 900, marginBottom: '12px', textAlign: 'center', maxWidth: '85%', textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
          {name.toUpperCase()}
        </div>
        <div style={{ color: 'rgba(138, 92, 245, 0.8)', fontSize: '20px', fontWeight: 700, letterSpacing: '2px', marginBottom: '48px', textTransform: 'uppercase' }}>Vedic Cosmic Chart • oyeastro.com</div>

        {/* Quote / Dasha Era block */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#ffffff',
          fontSize: isStory ? '34px' : '26px',
          fontWeight: 700,
          textAlign: 'center',
          maxWidth: '80%',
          fontStyle: 'italic',
          lineHeight: 1.5,
          background: 'rgba(19, 20, 56, 0.6)',
          border: '4px solid #23120b',
          borderRadius: '24px',
          padding: '32px 48px',
          boxShadow: '0 8px 0px #23120b',
        }}>
          "{quote}"
        </div>
      </div>
    ),
    { width: w, height: h }
  )
}
