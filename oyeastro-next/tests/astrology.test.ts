import { buildChart, getTodayTransits } from '../src/lib/astro/engine'
import { computeCompatibility } from '../src/lib/astro/ashtakoot'

describe('Vedic Astrology calculation engine', () => {
  it('Gandhi: Lagna should be Libra (index 6, Tula)', async () => {
    // Mahatma Gandhi: 2 Oct 1869, 07:45, Porbandar (21.64°N, 69.61°E)
    // Birthplace uses coordinates as specified in manual geocoder fallback
    const chart = await buildChart({
      name: 'Gandhi',
      birthDate: '1869-10-02',
      birthTime: '07:45',
      birthPlace: 'coords:21.64,69.61',
    })
    expect(chart.bigThree.rising.index).toBe(6) // Libra
  })

  it('Nehru: Moon sign should be Cancer (index 3, Karka)', async () => {
    // Jawaharlal Nehru: 14 Nov 1889, 23:00, Allahabad (25.45°N, 81.84°E)
    const chart = await buildChart({
      name: 'Nehru',
      birthDate: '1889-11-14',
      birthTime: '23:00',
      birthPlace: 'coords:25.45,81.84',
    })
    expect(chart.bigThree.moon.index).toBe(3) // Cancer
  })

  it('Lagna changes dynamically across a 2-hour window', async () => {
    const chart1 = await buildChart({
      name: 'A',
      birthDate: '2000-01-01',
      birthTime: '00:00',
      birthPlace: 'coords:28.6,77.2',
    })
    const chart2 = await buildChart({
      name: 'B',
      birthDate: '2000-01-01',
      birthTime: '04:00',
      birthPlace: 'coords:28.6,77.2',
    })
    expect(chart1.bigThree.rising.index).not.toBe(chart2.bigThree.rising.index)
  })

  it('Ashtakoot total score is bounded between 0 and 36', async () => {
    const chartA = await buildChart({
      name: 'Person A',
      birthDate: '1995-05-10',
      birthTime: '12:00',
      birthPlace: 'coords:19.07,72.87',
    })
    const chartB = await buildChart({
      name: 'Person B',
      birthDate: '1997-09-24',
      birthTime: '08:30',
      birthPlace: 'coords:28.61,77.20',
    })

    const result = computeCompatibility(chartA, chartB)
    expect(result.totalScore).toBeLessThanOrEqual(36)
    expect(result.totalScore).toBeGreaterThanOrEqual(0)
  })
})
