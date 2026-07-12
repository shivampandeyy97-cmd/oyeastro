import { POST as chartPost } from '../src/app/api/chart/route'
import { geocode } from '../src/lib/astro/engine'
import { NextRequest } from 'next/server'

describe('API endpoint tests', () => {
  it('POST /api/chart: rejects missing fields', async () => {
    const request = new NextRequest('http://localhost:3000/api/chart', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test' }), // missing birthDate, birthTime, birthPlace
    })

    const response = await chartPost(request)
    expect(response.status).toBe(400)
  })

  it('POST /api/chart: returns valid chart for Mumbai', async () => {
    const request = new NextRequest('http://localhost:3000/api/chart', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Riya',
        birthDate: '1999-05-15',
        birthTime: '10:30',
        birthPlace: 'Mumbai',
      }),
    })

    const response = await chartPost(request)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toHaveProperty('positions')
    expect(data.positions.Lagn).toBeGreaterThanOrEqual(0)
    expect(data.positions.Lagn).toBeLessThanOrEqual(360)
  })

  it('Geocoder finds Indian tier-2 cities', async () => {
    const geo = await geocode('Nagpur')
    expect(geo.lat).toBeCloseTo(21.14, 0)
    expect(geo.timezone).toBe('Asia/Kolkata')
  })

  it('Geocoder finds international cities', async () => {
    const geo = await geocode('Toronto')
    expect(geo.timezone).toContain('America')
  })
})
