export const runtime = 'edge'

import { NextRequest } from 'next/server'
import { ImageResponse } from '@vercel/og'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const nameA  = searchParams.get('nameA')  ?? 'Person A'
  const nameB  = searchParams.get('nameB')  ?? 'Person B'
  const score  = searchParams.get('score')  ?? '24'
  const quote  = searchParams.get('quote')  ?? 'The stars have spoken. 🌌'

  const percent = Math.round((parseInt(score) / 36) * 100)
  const color = percent >= 72 ? '#10b981' : percent >= 50 ? '#f97316' : '#ff6b8b'

  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        background: 'linear-gradient(135deg, #1a0a2e 0%, #16213e 60%, #0f3460 100%)',
        fontFamily: 'sans-serif',
        position: 'relative',
      }}>
        {/* Stars */}
        {[...Array(30)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute', width: '2px', height: '2px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.5)',
            left: `${(i * 47 + 11) % 100}%`,
            top: `${(i * 61 + 19) % 100}%`,
          }} />
        ))}

        {/* Brand */}
        <div style={{ color: '#f97316', fontSize: '24px', fontWeight: 800, marginBottom: '32px' }}>
          🪐 OyeAstro Compatibility
        </div>

        {/* Name cards side by side */}
        <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', alignItems: 'center' }}>
          <div style={{
            background: 'rgba(138, 92, 245, 0.2)', border: '2px solid #8a5cf5',
            borderRadius: '16px', padding: '20px 32px', textAlign: 'center',
          }}>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginBottom: '8px' }}>Person A</div>
            <div style={{ color: '#ffffff', fontSize: '28px', fontWeight: 800 }}>{nameA}</div>
          </div>

          <div style={{ color: '#f97316', fontSize: '36px', fontWeight: 800 }}>💞</div>

          <div style={{
            background: 'rgba(249, 115, 22, 0.2)', border: '2px solid #f97316',
            borderRadius: '16px', padding: '20px 32px', textAlign: 'center',
          }}>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginBottom: '8px' }}>Person B</div>
            <div style={{ color: '#ffffff', fontSize: '28px', fontWeight: 800 }}>{nameB}</div>
          </div>
        </div>

        {/* Score */}
        <div style={{
          background: `rgba(${color === '#10b981' ? '16,185,129' : color === '#f97316' ? '249,115,22' : '255,107,139'},0.2)`,
          border: `3px solid ${color}`,
          borderRadius: '100px',
          padding: '16px 48px',
          display: 'flex', alignItems: 'center', gap: '12px',
          marginBottom: '24px',
        }}>
          <span style={{ color, fontSize: '48px', fontWeight: 800 }}>{score}/36</span>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '24px' }}>({percent}%)</span>
        </div>

        {/* Quote */}
        <div style={{
          color: 'rgba(255,255,255,0.7)',
          fontSize: '20px',
          textAlign: 'center',
          maxWidth: '70%',
          fontStyle: 'italic',
        }}>
          "{quote}"
        </div>

        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px', marginTop: '24px' }}>
          oyeastro.com · Vedic Ashtakoot Compatibility
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
