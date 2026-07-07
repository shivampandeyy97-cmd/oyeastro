'use client'

import { useState } from 'react'
import { useGame } from '@/components/GameContext'
import { audioSystem } from '@/lib/audio'
import { motion, AnimatePresence } from 'framer-motion'

const REWARDS = [
  { type: 'badge', val: 'Neon Astro Racer 🏎️', desc: 'Skins unlocked: Neon board skins shine brighter.' },
  { type: 'badge', val: 'Galaxy Graffiti God 🎨', desc: 'Spray splatters added to your dashboard.' },
  { type: 'badge', val: 'Diamond Hoverboarder 💎', desc: 'Legendary board: Spark trails active.' },
  { type: 'fortune', val: 'Mantra Shield Active 🛡️', desc: 'Today\'s Lucky Number: 8. Shielded from negative comments.' },
  { type: 'fortune', val: 'Banter Engine Overdrive 📡', desc: 'Mercury is boosting your social charm. Slide into their DMs.' },
  { type: 'fortune', val: 'Cosmic Fuel Tank Full 🔋', desc: 'High vibes ahead. Take immediate action on your dreams.' },
]

export default function MysteryChest() {
  const { addXp, completeQuest, addBadge, unlockedBadges } = useGame()
  const [chestState, setChestState] = useState<'closed' | 'shaking' | 'open'>('closed')
  const [reward, setReward] = useState<{ type: string; val: string; desc: string } | null>(null)

  const handleOpenChest = () => {
    if (chestState !== 'closed') return

    // Trigger shaking and shake sound
    setChestState('shaking')
    audioSystem.playShake()

    let shakeCount = 0
    const interval = setInterval(() => {
      audioSystem.playShake()
      shakeCount++
      if (shakeCount >= 2) {
        clearInterval(interval)
        
        // Open chest and award reward
        setTimeout(() => {
          const randomReward = REWARDS[Math.floor(Math.random() * REWARDS.length)]
          setReward(randomReward)
          setChestState('open')
          audioSystem.playChestOpen()

          // Award badge to context
          if (randomReward.type === 'badge') {
            addBadge(randomReward.val)
          } else {
            // Also save fortune to badges just for display
            addBadge(randomReward.val)
          }

          // Complete quest and award base XP
          completeQuest('open_chest')
          addXp(50) // Bonus XP for opening box
        }, 300)
      }
    }, 300)
  }

  const handleReset = () => {
    audioSystem.playClick()
    setChestState('closed')
    setReward(null)
  }

  return (
    <div className="w-full bg-[#090a24] border-4 border-black rounded-3xl p-6 shadow-[6px_6px_0px_#000] mb-8 relative overflow-hidden flex flex-col items-center">
      {/* Background Graffiti Tags */}
      <span className="absolute -left-6 top-8 text-5xl select-none rotate-[-25deg] opacity-10">🎨</span>
      <span className="absolute -right-6 bottom-4 text-5xl select-none rotate-[20deg] opacity-10">🔥</span>

      <h3 className="font-graffiti text-brightPink text-xl md:text-2xl text-center mb-1">
        Cosmic Loot Box
      </h3>
      <p className="text-[10px] font-black text-textSecondary uppercase tracking-wider text-center mb-6">
        Unlock badges, secret fortunes and level up (+100 XP Quest)
      </p>

      {/* Interactive Chest Container */}
      <div className="relative h-44 flex items-center justify-center w-full max-w-[200px] mb-4">
        <AnimatePresence mode="wait">
          {chestState === 'closed' && (
            <motion.button
              key="closed"
              onClick={handleOpenChest}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-8xl focus:outline-none select-none filter drop-shadow-[0_6px_0px_#000] cursor-pointer"
            >
              📦
            </motion.button>
          )}

          {chestState === 'shaking' && (
            <motion.div
              key="shaking"
              className="text-8xl select-none animate-chest-shake filter drop-shadow-[0_6px_0px_#000]"
            >
              📦
            </motion.div>
          )}

          {chestState === 'open' && (
            <motion.div
              key="open"
              initial={{ scale: 0.4, rotate: -15, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: 'spring', damping: 10 }}
              className="flex flex-col items-center"
            >
              <div className="text-8xl select-none filter drop-shadow-[0_6px_0px_#000] mb-2">
                🔓
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Rewards Announcement */}
      {chestState === 'open' && reward && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full text-center flex flex-col items-center gap-3 bg-black/40 border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0_#000]"
        >
          <div className="text-xs font-black bg-brightGreen text-black px-2.5 py-0.5 border-2 border-black rounded-full shadow-[1.5px_1.5px_0_#000] uppercase tracking-wider">
            {reward.type === 'badge' ? 'Rare Decal Unlocked!' : 'Cosmic Shield Fortified!'}
          </div>
          
          <h4 className="font-display font-black text-lg text-white">
            {reward.val}
          </h4>
          <p className="text-xs font-semibold text-textMuted leading-relaxed max-w-xs -mt-1">
            {reward.desc}
          </p>

          <button
            onClick={handleReset}
            className="arcade-btn px-6 py-2.5 text-xs font-black mt-1"
          >
            Claim & Open Another
          </button>
        </motion.div>
      )}

      {chestState === 'closed' && (
        <button
          onClick={handleOpenChest}
          className="arcade-btn px-8 py-3 text-xs font-black"
        >
          Unlock Chest (Click me)
        </button>
      )}

      {/* Trophy Room Badge Collection */}
      <div className="w-full border-t border-black/30 mt-6 pt-4 flex flex-col gap-2">
        <div className="flex justify-between items-center text-[10px] font-black text-textMuted uppercase tracking-wider">
          <span>🏆 Badge Collection</span>
          <span>{unlockedBadges.length} unlocked</span>
        </div>

        {unlockedBadges.length === 0 ? (
          <div className="text-center py-3 text-xs font-semibold text-textMuted/60 bg-black/10 border-2 border-dashed border-black/35 rounded-xl italic">
            Trophy cabinet is empty... Open boxes to unlock!
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 justify-center">
            {unlockedBadges.map((badge, idx) => (
              <span
                key={idx}
                className="text-[10px] font-black bg-[#161a4f] text-brightCyan px-2.5 py-1 border-2 border-black rounded-xl shadow-[1.5px_1.5px_0_#000] rotate-[-2deg]"
              >
                🏅 {badge}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
