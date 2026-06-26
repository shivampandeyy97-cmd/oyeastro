'use client'

import type { ChartResult } from '@/lib/astro/types'

interface Props {
  chart: ChartResult
}

const HOUSE_CENTERS: Record<number, { rashi: { x: number; y: number }; planets: { x: number; y: number } }> = {
  1:  { rashi: { x: 200, y: 155 }, planets: { x: 200, y: 180 } },
  2:  { rashi: { x: 120, y: 65 },  planets: { x: 120, y: 85 } },
  3:  { rashi: { x: 65,  y: 120 }, planets: { x: 85,  y: 120 } },
  4:  { rashi: { x: 155, y: 200 }, planets: { x: 180, y: 200 } },
  5:  { rashi: { x: 65,  y: 280 }, planets: { x: 85,  y: 280 } },
  6:  { rashi: { x: 120, y: 335 }, planets: { x: 120, y: 315 } },
  7:  { rashi: { x: 200, y: 245 }, planets: { x: 200, y: 220 } },
  8:  { rashi: { x: 280, y: 335 }, planets: { x: 280, y: 315 } },
  9:  { rashi: { x: 335, y: 280 }, planets: { x: 315, y: 280 } },
  10: { rashi: { x: 245, y: 200 }, planets: { x: 220, y: 200 } },
  11: { rashi: { x: 335, y: 120 }, planets: { x: 315, y: 120 } },
  12: { rashi: { x: 280, y: 65 },  planets: { x: 280, y: 85 } }
}

const HOUSE_POLYGONS: Record<number, string> = {
  1: "200,200 100,100 300,100",
  2: "0,0 200,0 100,100",
  3: "0,0 0,200 100,100",
  4: "200,200 100,100 100,300",
  5: "0,400 0,200 100,300",
  6: "0,400 200,400 100,300",
  7: "200,200 100,300 300,300",
  8: "400,400 200,400 300,300",
  9: "400,400 400,200 300,300",
  10: "200,200 300,100 300,300",
  11: "400,0 400,200 300,100",
  12: "400,0 200,0 300,100"
}

export default function KundliCard({ chart }: Props) {
  const { houseData } = chart
  const lagnaSignIndex = houseData.lagnaSignIndex

  return (
    <div className="pin-card bg-white border-2 border-espresso rounded-neoLg p-6 shadow-neo break-inside-avoid mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-display font-extrabold text-espresso text-base">Kundli Magic</h3>
        <span className="px-2.5 py-1 text-xs font-bold border-2 border-espresso bg-pastelOrange text-espresso rounded-neoSm shadow-neoSm">
          Lagna Rashi
        </span>
      </div>

      <h2 className="font-display text-2xl font-black text-espresso mb-4">My Vedic Chart</h2>

      <div className="flex flex-col gap-4 relative">
        {/* Wizard Cat Mascot */}
        <div className="flex justify-center -mb-2">
          <svg className="w-24 h-24 stroke-espresso fill-none stroke-[2.5]" viewBox="0 0 100 100">
            {/* Wizard Hat */}
            <polygon points="50,5 30,40 70,40" fill="var(--bright-purple)" stroke="var(--espresso)" strokeWidth="2.5" />
            {/* Stars on Hat */}
            <polygon points="50,15 48,22 55,18" fill="var(--bright-gold)" />
            <polygon points="42,28 40,32 45,30" fill="var(--bright-gold)" />
            {/* Hat Rim */}
            <ellipse cx="50" cy="40" rx="23" ry="5" fill="var(--espresso)" />
            <ellipse cx="50" cy="58" rx="24" ry="18" fill="var(--bright-gold)" stroke="var(--espresso)" strokeWidth="2.5" />
            {/* Eyes */}
            <circle cx="42" cy="55" r="3" fill="var(--espresso)" />
            <circle cx="58" cy="55" r="3" fill="var(--espresso)" />
            {/* Mouth and Nose */}
            <polygon points="50,60 48,58 52,58" fill="var(--bright-pink)" stroke="var(--espresso)" strokeWidth="1" />
            <path d="M47 63 Q50 66 53 63" fill="none" stroke="var(--espresso)" strokeWidth="2" />
            {/* Whiskers */}
            <line x1="20" y1="58" x2="10" y2="56" stroke="var(--espresso)" strokeWidth="1.5" />
            <line x1="20" y1="62" x2="8" y2="63" stroke="var(--espresso)" strokeWidth="1.5" />
            <line x1="80" y1="58" x2="90" y2="56" stroke="var(--espresso)" strokeWidth="1.5" />
            <line x1="80" y1="62" x2="92" y2="63" stroke="var(--espresso)" strokeWidth="1.5" />
          </svg>
        </div>

        {/* SVG Lagna Chart Canvas */}
        <div className="border-2 border-espresso rounded-neoSm bg-white p-2">
          <svg id="kundli-svg-canvas" viewBox="0 0 400 400" className="w-full h-auto">
            {/* Background Polygons for Hover Highlights */}
            {Object.entries(HOUSE_POLYGONS).map(([hStr, points]) => {
              const h = parseInt(hStr)
              return (
                <polygon
                  key={h}
                  id={`house-${h}`}
                  className="house-sector"
                  points={points}
                />
              )
            })}

            {/* Grid Border Lines */}
            <rect className="chart-grid-line" x="0" y="0" width="400" height="400" fill="none" strokeWidth="2.5" />
            <line className="chart-grid-line" x1="0" y1="0" x2="400" y2="400" />
            <line className="chart-grid-line" x1="400" y1="0" x2="0" y2="400" />
            <line className="chart-grid-line" x1="200" y1="0" x2="0" y2="200" />
            <line className="chart-grid-line" x1="0" y1="200" x2="200" y2="400" />
            <line className="chart-grid-line" x1="200" y1="400" x2="400" y2="200" />
            <line className="chart-grid-line" x1="400" y1="200" x2="200" y2="0" />

            {/* Labels and Planets */}
            {Array.from({ length: 12 }, (_, i) => {
              const h = i + 1
              const coord = HOUSE_CENTERS[h]
              const rashiSignNumber = ((lagnaSignIndex + (h - 1)) % 12) + 1
              const planetsInHouse = houseData.houses[h - 1] ?? []

              return (
                <g key={h}>
                  {/* Rashi sign number */}
                  <text
                    x={coord.rashi.x}
                    y={coord.rashi.y}
                    className="chart-text-rashi"
                    textAnchor="middle"
                  >
                    {rashiSignNumber}
                  </text>

                  {/* House number label */}
                  <text
                    x={coord.rashi.x}
                    y={coord.rashi.y - 12}
                    className="chart-text-house"
                    textAnchor="middle"
                  >
                    H{h}
                  </text>

                  {/* Planets */}
                  {planetsInHouse.length > 0 && (
                    <text
                      x={coord.planets.x}
                      y={coord.planets.y}
                      className="chart-text-planets"
                      textAnchor="middle"
                    >
                      {planetsInHouse.join(' ')}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
        </div>
      </div>

      <div className="flex gap-4 mt-4 border-t border-espresso/10 pt-4 text-xs font-bold text-textMuted justify-between">
        <span>📌 2.1k saves</span>
        <span>❤️ 840 likes</span>
      </div>
    </div>
  )
}
