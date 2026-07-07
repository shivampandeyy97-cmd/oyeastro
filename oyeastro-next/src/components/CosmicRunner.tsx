'use client'

import { useRef, useEffect, useState } from 'react'
import { useGame } from '@/components/GameContext'
import { audioSystem } from '@/lib/audio'

interface Obstacle {
  x: number
  y: number
  lane: number
  type: 'meteor' | 'barrier'
  width: number
  height: number
  speed: number
}

interface Coin {
  x: number
  y: number
  lane: number
  width: number
  height: number
  speed: number
  collected: boolean
}

export default function CosmicRunner() {
  const { addXp, selectedCharacter, multiplier } = useGame()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  
  // Game states
  const [isPlaying, setIsPlaying] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [highScore, setHighScore] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)

  // Player Lane: 0 (Left), 1 (Middle), 2 (Right)
  const playerLaneRef = useRef(1)
  const isJumpingRef = useRef(false)
  const jumpProgressRef = useRef(0) // 0 to 1

  // Save/load High Score
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('oyeastro_runner_highscore')
      if (saved) setHighScore(parseInt(saved, 10))
    }
  }, [])

  const startGame = () => {
    audioSystem.playChestOpen()
    setIsPlaying(true)
    setGameOver(false)
    setScore(0)
    setLives(3)
    playerLaneRef.current = 1
    isJumpingRef.current = false
    jumpProgressRef.current = 0
  }

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || gameOver) return

      if (e.key === 'ArrowLeft' || e.key === 'a') {
        e.preventDefault()
        if (playerLaneRef.current > 0) {
          playerLaneRef.current -= 1
          audioSystem.playClick()
        }
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        e.preventDefault()
        if (playerLaneRef.current < 2) {
          playerLaneRef.current += 1
          audioSystem.playClick()
        }
      } else if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'w') {
        e.preventDefault()
        if (!isJumpingRef.current) {
          isJumpingRef.current = true
          jumpProgressRef.current = 0
          audioSystem.playClick()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPlaying, gameOver])

  // Canvas loop
  useEffect(() => {
    if (!isPlaying || gameOver) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let obstacles: Obstacle[] = []
    let coins: Coin[] = []
    let trackOffset = 0
    let lastSpawnTime = 0
    let gameSpeed = 5

    // Game loop
    const update = (timestamp: number) => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Resize canvas if container size changed
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr
        canvas.height = rect.height * dpr
        ctx.scale(dpr, dpr)
      }

      const w = canvas.width / dpr
      const h = canvas.height / dpr

      // 1. Draw Space background grid
      ctx.strokeStyle = '#1b1a42'
      ctx.lineWidth = 1
      trackOffset = (trackOffset + gameSpeed) % 40
      
      // Moving background horizontal lines
      for (let y = trackOffset; y < h; y += 40) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.stroke()
      }

      // Draw Perspective Track lines
      const horizonY = h * 0.2
      const laneWidths = w / 3
      ctx.strokeStyle = '#00f5d4'
      ctx.lineWidth = 3
      ctx.shadowColor = '#00f5d4'
      ctx.shadowBlur = 6

      // Lanes tracks
      for (let i = 0; i <= 3; i++) {
        const xStart = i * (w / 3)
        ctx.beginPath()
        ctx.moveTo(xStart, horizonY)
        ctx.lineTo(xStart, h)
        ctx.stroke()
      }
      ctx.shadowBlur = 0 // Reset shadow

      // Draw Rails sleepers (train tracks effect)
      ctx.strokeStyle = '#ff007f'
      ctx.lineWidth = 2
      for (let y = horizonY + ((trackOffset * 1.5) % 30); y < h; y += 30) {
        const perspectiveRatio = (y - horizonY) / (h - horizonY)
        const currentSleepersSpacing = w * perspectiveRatio
        
        ctx.beginPath()
        ctx.moveTo(w/2 - currentSleepersSpacing/2, y)
        ctx.lineTo(w/2 + currentSleepersSpacing/2, y)
        ctx.stroke()
      }

      // Spawn items
      if (timestamp - lastSpawnTime > 1200) {
        const lane = Math.floor(Math.random() * 3)
        const spawnType = Math.random() > 0.4 ? 'coin' : 'obstacle'

        if (spawnType === 'coin') {
          coins.push({
            lane,
            x: (lane * laneWidths) + laneWidths / 2,
            y: horizonY,
            width: 16,
            height: 16,
            speed: gameSpeed,
            collected: false
          })
        } else {
          obstacles.push({
            lane,
            x: (lane * laneWidths) + laneWidths / 2,
            y: horizonY,
            type: Math.random() > 0.5 ? 'meteor' : 'barrier',
            width: 32,
            height: 32,
            speed: gameSpeed
          })
        }
        lastSpawnTime = timestamp
        gameSpeed = Math.min(10, 5 + score / 150) // Speed up slightly over time
      }

      // 2. Handle jumping
      let playerY = h - 55
      if (isJumpingRef.current) {
        jumpProgressRef.current += 0.05
        const jumpHeight = 50 * Math.sin(Math.PI * jumpProgressRef.current)
        playerY -= jumpHeight

        if (jumpProgressRef.current >= 1) {
          isJumpingRef.current = false
          jumpProgressRef.current = 0
        }
      }

      // 3. Draw and Update Coins
      coins.forEach(coin => {
        coin.y += coin.speed
        
        // Draw coin: Spin effect
        if (!coin.collected && coin.y < h + 50) {
          const coinX = (coin.lane * laneWidths) + laneWidths / 2
          ctx.beginPath()
          ctx.arc(coinX, coin.y, 8 + Math.sin(timestamp / 100) * 2, 0, Math.PI * 2)
          ctx.fillStyle = '#fee440'
          ctx.fill()
          ctx.strokeStyle = '#000'
          ctx.lineWidth = 1.5
          ctx.stroke()

          // Draw inner star/dollar symbol
          ctx.fillStyle = '#000'
          ctx.font = 'bold 8px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText('$', coinX, coin.y)

          // Collision detection with player
          const playerX = (playerLaneRef.current * laneWidths) + laneWidths / 2
          const playerYCenter = h - 35
          const dist = Math.hypot(coinX - playerX, coin.y - playerY)
          
          if (dist < 25 && !coin.collected) {
            coin.collected = true
            setScore(s => {
              const next = s + 10
              // Check high score
              if (next > highScore) {
                setHighScore(next)
                localStorage.setItem('oyeastro_runner_highscore', next.toString())
              }
              return next
            })
            // Award XP
            addXp(1)
            audioSystem.playCoin()
          }
        }
      })

      // 4. Draw and Update Obstacles
      obstacles.forEach(obs => {
        obs.y += obs.speed

        if (obs.y < h + 50) {
          const obsX = (obs.lane * laneWidths) + laneWidths / 2
          
          if (obs.type === 'meteor') {
            // Draw Meteor
            ctx.beginPath()
            ctx.arc(obsX, obs.y, 14, 0, Math.PI * 2)
            ctx.fillStyle = '#ff7000'
            ctx.fill()
            ctx.strokeStyle = '#000'
            ctx.lineWidth = 2
            ctx.stroke()
            // Flames trail
            ctx.fillStyle = 'rgba(255, 0, 127, 0.4)'
            ctx.beginPath()
            ctx.moveTo(obsX - 10, obs.y - 12)
            ctx.lineTo(obsX, obs.y - 30)
            ctx.lineTo(obsX + 10, obs.y - 12)
            ctx.fill()
          } else {
            // Draw Barrier
            ctx.fillStyle = '#ff007f'
            ctx.fillRect(obsX - 16, obs.y - 8, 32, 16)
            ctx.strokeStyle = '#000'
            ctx.lineWidth = 2
            ctx.strokeRect(obsX - 16, obs.y - 8, 32, 16)
            
            // Neon caution stripes
            ctx.strokeStyle = '#fee440'
            ctx.lineWidth = 3
            ctx.beginPath()
            ctx.moveTo(obsX - 10, obs.y - 8)
            ctx.lineTo(obsX - 2, obs.y + 8)
            ctx.moveTo(obsX + 2, obs.y - 8)
            ctx.lineTo(obsX + 10, obs.y + 8)
            ctx.stroke()
          }

          // Collision detection with player
          const playerX = (playerLaneRef.current * laneWidths) + laneWidths / 2
          const isIntersectingX = Math.abs(obsX - playerX) < 20
          const isIntersectingY = Math.abs(obs.y - playerY) < 18

          // JUMP over barrier bypasses collision
          const isJumpingOverBarrier = obs.type === 'barrier' && isJumpingRef.current && (playerY < obs.y - 20)

          if (isIntersectingX && isIntersectingY && !isJumpingOverBarrier) {
            // Remove obstacle to avoid multiple hits
            obstacles = obstacles.filter(o => o !== obs)
            audioSystem.playShake()
            
            // Screen flash effect
            ctx.fillStyle = 'rgba(255, 0, 127, 0.3)'
            ctx.fillRect(0, 0, w, h)

            setLives(l => {
              const nextLives = l - 1
              if (nextLives <= 0) {
                setGameOver(true)
                setIsPlaying(false)
              }
              return nextLives
            })
          }
        }
      })

      // Clean up off-screen entities
      coins = coins.filter(c => c.y < h + 50 && !c.collected)
      obstacles = obstacles.filter(o => o.y < h + 50)

      // 5. Draw Player Hoverboard Surfer
      const playerX = (playerLaneRef.current * laneWidths) + laneWidths / 2
      
      // Select surfer color based on selected character skin
      let characterColor = '#ff007f' // Aries (Default)
      if (selectedCharacter === 'Leo Gold') characterColor = '#fee440'
      else if (selectedCharacter === 'Gemini Jets') characterColor = '#9d4edd'
      else if (selectedCharacter === 'Pisces Rocket') characterColor = '#00f5d4'

      // Draw hoverboard sparks / shadow
      ctx.fillStyle = 'rgba(0, 245, 212, 0.2)'
      ctx.beginPath()
      ctx.ellipse(playerX, h - 22, 14, 5, 0, 0, Math.PI * 2)
      ctx.fill()

      // Draw Surfboard board
      ctx.fillStyle = characterColor
      ctx.beginPath()
      ctx.ellipse(playerX, playerY + 12, 18, 5, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 2.5
      ctx.stroke()

      // Draw Character (stick-figure cartoon with cool retro glasses!)
      ctx.fillStyle = '#ffffff'
      ctx.lineWidth = 2.5
      ctx.strokeStyle = '#ffffff'

      // Body (suit)
      ctx.fillStyle = '#1b1642'
      ctx.strokeStyle = '#000000'
      ctx.beginPath()
      ctx.arc(playerX, playerY - 8, 8, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      // Legs/knees
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(playerX - 4, playerY + 4)
      ctx.lineTo(playerX - 6, playerY + 10)
      ctx.moveTo(playerX + 4, playerY + 4)
      ctx.lineTo(playerX + 6, playerY + 10)
      ctx.stroke()

      // Head
      ctx.fillStyle = '#fee440'
      ctx.beginPath()
      ctx.arc(playerX, playerY - 22, 6, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      // Cool Retro Neon Shades
      ctx.fillStyle = characterColor
      ctx.fillRect(playerX - 5, playerY - 24, 10, 3)
      ctx.fillStyle = '#000'
      ctx.fillRect(playerX - 4, playerY - 23, 3, 2)
      ctx.fillRect(playerX + 1, playerY - 23, 3, 2)

      // Arms surfing
      ctx.strokeStyle = '#fee440'
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.moveTo(playerX - 8, playerY - 8)
      ctx.lineTo(playerX - 15, playerY - 14)
      ctx.moveTo(playerX + 8, playerY - 8)
      ctx.lineTo(playerX + 15, playerY - 4)
      ctx.stroke()

      animationFrameId = requestAnimationFrame(update)
    }

    animationFrameId = requestAnimationFrame(update)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [isPlaying, gameOver, score, selectedCharacter])

  // Lane touch selector
  const handleTouch = (lane: number) => {
    if (!isPlaying || gameOver) return
    playerLaneRef.current = lane
    audioSystem.playClick()
  }

  // Double click or swipe for Jump
  const handleJumpTap = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!isPlaying || gameOver) return
    if (!isJumpingRef.current) {
      isJumpingRef.current = true
      jumpProgressRef.current = 0
      audioSystem.playClick()
    }
  }

  return (
    <div className="w-full bg-[#090a24] border-4 border-black rounded-3xl overflow-hidden shadow-[6px_6px_0px_#000] mb-8 relative flex flex-col">
      {/* Header Bar */}
      <div 
        onClick={() => { audioSystem.playClick(); setIsExpanded(!isExpanded) }}
        className="px-6 py-4 bg-black/40 border-b-4 border-black flex justify-between items-center cursor-pointer select-none hover:bg-black/60 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎮</span>
          <div className="flex flex-col">
            <h3 className="font-graffiti text-brightPink text-lg leading-tight">
              Cosmic Surf Runner
            </h3>
            <p className="text-[10px] font-bold text-textSecondary uppercase tracking-wider">
              Collect Stars for direct XP boost (x{multiplier} active)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {isPlaying && (
            <div className="flex items-center gap-3 font-display font-black text-xs bg-black/60 border-2 border-black rounded-xl px-2.5 py-1">
              <span className="text-brightGold">Score: {score}</span>
              <span className="text-brightPink">Lives: {'❤️'.repeat(lives)}</span>
            </div>
          )}
          <span className="text-xs font-black bg-brightCyan text-black px-2.5 py-1 border-2 border-black rounded-xl shadow-[2px_2px_0_#000]">
            {isExpanded ? 'Collapse ▲' : 'PLAY Runner ▼'}
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="flex flex-col items-center p-4 bg-gradient-to-b from-transparent to-[#0d0e3d]">
          {!isPlaying && !gameOver && (
            <div className="py-12 px-6 text-center flex flex-col items-center gap-4">
              <span className="text-4xl animate-bounce">🛹</span>
              <h4 className="font-display font-black text-xl text-white">
                Ready to Surf the Stars?
              </h4>
              <p className="text-xs text-textMuted max-w-sm">
                Control with <kbd className="px-1.5 py-0.5 bg-black border border-white/20 rounded">A</kbd>/<kbd className="px-1.5 py-0.5 bg-black border border-white/20 rounded">D</kbd> or <kbd className="px-1.5 py-0.5 bg-black border border-white/20 rounded">←</kbd>/<kbd className="px-1.5 py-0.5 bg-black border border-white/20 rounded">→</kbd> to shift lanes. Press <kbd className="px-1.5 py-0.5 bg-black border border-white/20 rounded">Space</kbd> or <kbd className="px-1.5 py-0.5 bg-black border border-white/20 rounded">W</kbd> to JUMP over barriers. Grabbing stars triggers XP payouts!
              </p>
              <button
                onClick={startGame}
                className="arcade-btn px-8 py-3.5 text-sm"
              >
                Insert Coin & Play
              </button>
              <div className="text-[10px] font-bold text-brightGold mt-2">
                🏆 Top Score: {highScore} pts
              </div>
            </div>
          )}

          {gameOver && (
            <div className="py-12 px-6 text-center flex flex-col items-center gap-4">
              <span className="text-4xl animate-wiggle">💥</span>
              <h4 className="font-graffiti font-black text-2xl text-brightPink">
                Wasted! (Game Over)
              </h4>
              <p className="text-sm font-display font-bold text-white">
                Final Score: <span className="text-brightGold">{score} pts</span>
              </p>
              <button
                onClick={startGame}
                className="arcade-btn px-8 py-3.5 text-sm"
              >
                Run Again ⟳
              </button>
              <div className="text-[10px] font-bold text-textMuted">
                High Score: {highScore} pts
              </div>
            </div>
          )}

          {isPlaying && (
            <div className="w-full max-w-md relative flex flex-col items-center">
              {/* Game Controls Canvas */}
              <canvas
                ref={canvasRef}
                onClick={handleJumpTap}
                className="w-full h-[250px] bg-[#03040e] border-2 border-black rounded-2xl cursor-pointer"
                style={{ touchAction: 'none' }}
              />

              {/* Lane Click/Touch Overlays (Mobile Helper) */}
              <div className="absolute inset-0 grid grid-cols-3 pointer-events-none">
                <div 
                  className="pointer-events-auto cursor-pointer h-full" 
                  onClick={(e) => { e.stopPropagation(); handleTouch(0) }} 
                  title="Shift Left"
                />
                <div 
                  className="pointer-events-auto cursor-pointer h-full" 
                  onClick={handleJumpTap}
                  title="Jump"
                />
                <div 
                  className="pointer-events-auto cursor-pointer h-full" 
                  onClick={(e) => { e.stopPropagation(); handleTouch(2) }}
                  title="Shift Right"
                />
              </div>

              {/* Jump button helper (for touch devices) */}
              <div className="flex gap-2 w-full mt-3 justify-between items-center px-1">
                <div className="flex gap-1.5">
                  <button 
                    onClick={() => handleTouch(0)}
                    className="px-3 py-2 bg-black/40 text-xs border border-black rounded-xl font-bold text-white hover:bg-black/60"
                  >
                    ◀ Left
                  </button>
                  <button 
                    onClick={() => handleTouch(2)}
                    className="px-3 py-2 bg-black/40 text-xs border border-black rounded-xl font-bold text-white hover:bg-black/60"
                  >
                    Right ▶
                  </button>
                </div>
                <button
                  onClick={handleJumpTap}
                  className="px-5 py-2.5 bg-brightPurple text-white text-xs border-2 border-black rounded-xl font-black shadow-[2px_2px_0_#000] active:translate-y-0.5 active:shadow-[1px_1px_0_#000]"
                >
                  🚀 JUMP (Space)
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
