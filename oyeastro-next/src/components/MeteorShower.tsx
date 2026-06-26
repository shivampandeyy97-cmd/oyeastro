'use client'

import { useEffect, useState } from 'react'

interface StarData {
  top: number
  left?: number
  right?: number
  size: number
  delay: number
  duration: number
  width?: number
}

interface AsteroidData {
  top: number
  left: number
  size: number
  delay: number
  duration: number
}

export default function MeteorShower() {
  const [stars, setStars] = useState<StarData[]>([])
  const [meteors, setMeteors] = useState<StarData[]>([])
  const [asteroids, setAsteroids] = useState<AsteroidData[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Generate static random twinkling stars
    const starList: StarData[] = Array.from({ length: 45 }).map(() => ({
      top: Math.random() * 95,
      left: Math.random() * 95,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 5,
      duration: Math.random() * 4 + 2,
    }))

    // Generate randomized shooting stars (meteors)
    const meteorList: StarData[] = Array.from({ length: 5 }).map(() => ({
      top: Math.random() * 40,
      right: Math.random() * 50,
      size: 2,
      width: Math.random() * 80 + 60,
      delay: Math.random() * 15,
      duration: Math.random() * 3 + 4,
    }))

    // Generate randomized floating asteroids
    const asteroidList: AsteroidData[] = [
      { top: 15, left: 10, size: 45, delay: 0, duration: 12 },
      { top: 55, left: 85, size: 60, delay: 2, duration: 15 },
      { top: 75, left: 15, size: 35, delay: 4, duration: 10 },
      { top: 30, left: 75, size: 50, delay: 1, duration: 14 },
    ]

    setStars(starList)
    setMeteors(meteorList)
    setAsteroids(asteroidList)
  }, [])

  if (!mounted) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden opacity-0 dark:opacity-100 transition-opacity duration-1000 bg-[#060714]">
      {/* Background space nebula glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-purple-900/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/10 blur-[100px]" />

      {/* Twinkling Stars */}
      {stars.map((star, idx) => (
        <div
          key={`star-${idx}`}
          className="absolute rounded-full bg-white/80 animate-twinkle"
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
          }}
        />
      ))}

      {/* Floating Asteroids */}
      {asteroids.map((ast, idx) => (
        <svg
          key={`ast-${idx}`}
          viewBox="0 0 100 100"
          className="absolute animate-float animate-slow-spin text-purple-950/40 fill-current stroke-purple-500/10 stroke-[1.5]"
          style={{
            top: `${ast.top}%`,
            left: `${ast.left}%`,
            width: `${ast.size}px`,
            height: `${ast.size}px`,
            animationDelay: `${ast.delay}s`,
            animationDuration: `${ast.duration}s`,
          }}
        >
          {/* Custom jagged asteroid path */}
          <polygon points="50,15 70,20 85,35 90,60 75,80 50,85 25,80 10,55 20,30" />
        </svg>
      ))}

      {/* Showering Meteorites (Shooting Stars) */}
      {meteors.map((meteor, idx) => (
        <div
          key={`meteor-${idx}`}
          className="absolute bg-gradient-to-l from-brightCyan via-purple-500/30 to-transparent rounded-full animate-meteor"
          style={{
            top: `${meteor.top}%`,
            right: `${meteor.right}%`,
            width: `${meteor.width}px`,
            height: '1.5px',
            animationDelay: `${meteor.delay}s`,
            animationDuration: `${meteor.duration}s`,
          }}
        />
      ))}
    </div>
  )
}
