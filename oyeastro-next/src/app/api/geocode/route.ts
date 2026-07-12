import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q')
    if (!query || query.length < 3) {
      return NextResponse.json([])
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=0`
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'OyeAstro/2.0 (oyeastro.com contact:shivampandeyy97@gmail.com)'
      }
    })

    if (!res.ok) {
      console.error('[Geocode Proxy] Fetch error:', res.status, res.statusText)
      return NextResponse.json({ error: 'Failed to fetch from Nominatim' }, { status: 502 })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err: any) {
    console.error('[Geocode Proxy] Error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
