'use client'

import { motion } from 'framer-motion'

const PLANET_LABELS = ['☀️', '🌙', '♂', '☿', '♃', '♀', '♄', '☊']
const ORBITS = [60, 90, 120, 155]

export default function LoadingOrbit() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-24 gap-8"
    >
      {/* Orbit animation */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Center sun */}
        <div className="absolute z-10 w-12 h-12 rounded-full bg-brightGold border-2 border-espresso shadow-neo flex items-center justify-center text-2xl">
          ☀️
        </div>

        {/* Orbit rings */}
        {ORBITS.map((r, i) => (
          <div
            key={r}
            className="absolute rounded-full border border-espresso/20"
            style={{ width: r * 2, height: r * 2 }}
          />
        ))}

        {/* Orbiting planets */}
        {PLANET_LABELS.map((planet, i) => {
          const orbitR = ORBITS[i % ORBITS.length]
          const duration = [4, 7, 11, 6, 14, 9, 18, 5][i]
          return (
            <motion.div
              key={i}
              className="absolute"
              style={{
                width: orbitR * 2,
                height: orbitR * 2,
                top: `calc(50% - ${orbitR}px)`,
                left: `calc(50% - ${orbitR}px)`,
              }}
              animate={{ rotate: 360 }}
              transition={{ duration, repeat: Infinity, ease: 'linear' }}
            >
              <div
                className="absolute w-7 h-7 rounded-full bg-cardBg border-2 border-espresso shadow-neoSm flex items-center justify-center text-xs"
                style={{ top: -14, left: '50%', transform: 'translateX(-50%)' }}
              >
                {planet}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Loading text */}
      <motion.div
        className="text-center"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <p className="font-display text-xl font-bold text-espresso">Reading your cosmos...</p>
        <p className="text-textMuted text-sm mt-1">Swiss Ephemeris calculating planetary positions ✨</p>
      </motion.div>
    </motion.div>
  )
}
