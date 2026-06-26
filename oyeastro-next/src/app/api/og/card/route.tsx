export const runtime = 'edge'

import { NextRequest } from 'next/server'
import { ImageResponse } from '@vercel/og'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const name   = searchParams.get('name')   ?? 'Your Chart'
  const lagna  = searchParams.get('lagna')  ?? 'Aries'
  const sun    = searchParams.get('sun')    ?? 'Libra'
  const moon   = searchParams.get('moon')   ?? 'Cancer'
  const vibe   = searchParams.get('vibe')   ?? '7'
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
          background: 'linear-gradient(135deg, #1a0a2e 0%, #16213e 50%, #0f3460 100%)',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Star field dots */}
        {[...Array(40)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.6)',
            left: `${(i * 37 + 13) % 100}%`,
            top: `${(i * 53 + 7) % 100}%`,
          }} />
        ))}

        {/* OyeAstro brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            background: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px',
          }}>🪐</div>
          <span style={{ color: '#f97316', fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px' }}>OyeAstro</span>
        </div>

        {/* Name */}
        <div style={{ color: '#ffffff', fontSize: isStory ? '72px' : '52px', fontWeight: 800, marginBottom: '8px', textAlign: 'center', maxWidth: '80%' }}>
          {name.toUpperCase()}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '18px', marginBottom: '32px' }}>VEDIC CHART · oyeastro.com</div>

        {/* Big Three pills */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { label: '⬆️ Rising', value: lagna, color: '#8a5cf5' },
            { label: '☀️ Sun',    value: sun,   color: '#f97316' },
            { label: '🌙 Moon',   value: moon,  color: '#0ea5e9' },
          ].map(pill => (
            <div key={pill.label} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              background: 'rgba(255,255,255,0.1)',
              border: `2px solid ${pill.color}`,
              borderRadius: '16px',
              padding: '12px 24px',
              minWidth: '140px',
            }}>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '4px' }}>{pill.label}</span>
              <span style={{ color: '#ffffff', fontSize: '22px', fontWeight: 800 }}>{pill.value}</span>
            </div>
          ))}
        </div>

        {/* Vibe score */}
        <div style={{
          background: 'rgba(16, 185, 129, 0.2)',
          border: '2px solid #10b981',
          borderRadius: '50px',
          padding: '10px 28px',
          color: '#10b981',
          fontSize: '18px',
          fontWeight: 700,
          marginBottom: '24px',
        }}>
          ✨ Vibe Score: {vibe}/10
        </div>

        {/* Quote */}
        <div style={{
          color: 'rgba(255,255,255,0.8)',
          fontSize: isStory ? '26px' : '20px',
          textAlign: 'center',
          maxWidth: '75%',
          fontStyle: 'italic',
          lineHeight: 1.4,
        }}>
          "{quote}"
        </div>
      </div>
    ),
    { width: w, height: h }
  )
}
