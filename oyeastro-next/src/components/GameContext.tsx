'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { audioSystem } from '@/lib/audio'

export interface Quest {
  id: string
  title: string
  rewardXp: number
  rewardMult: number
  isCompleted: boolean
  description: string
  icon: string
}

interface GameContextProps {
  level: number
  xp: number
  xpNeeded: number
  multiplier: number
  selectedCharacter: string
  isMuted: boolean
  completedQuests: string[]
  unlockedBadges: string[]
  quests: Quest[]
  addXp: (amount: number) => void
  completeQuest: (questId: string) => void
  toggleMute: () => void
  selectCharacter: (charName: string) => void
  addBadge: (badge: string) => void
  resetGame: () => void
}

const GameContext = createContext<GameContextProps | undefined>(undefined)

const QUESTS_TEMPLATES = [
  { id: 'calculate_vibe', title: 'Reveal Vibe Chart', description: 'Submit details to calculate your cosmic chart', rewardXp: 100, rewardMult: 3, icon: '🔮' },
  { id: 'check_aura', title: 'Inspect Aura Alignment', description: 'Click/Inspect your Vibe Score Breakdown', rewardXp: 50, rewardMult: 2, icon: '⚡' },
  { id: 'open_chest', title: 'Open Mystery Chest', description: 'Unlock secret loot from a graffiti box', rewardXp: 100, rewardMult: 4, icon: '📦' },
  { id: 'play_playlist', title: 'Play Cosmic Vinyl', description: 'Press Play on the Dasha Playlist vinyl', rewardXp: 50, rewardMult: 2, icon: '🎵' },
  { id: 'check_compatibility', title: 'Match Astro Orbits', description: 'Calculate compatibility with a friend', rewardXp: 150, rewardMult: 5, icon: '💞' },
  { id: 'download_share', title: 'Download Share Card', description: 'Download a PNG compatibility share card', rewardXp: 100, rewardMult: 4, icon: '📥' },
]

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [level, setLevel] = useState(1)
  const [xp, setXp] = useState(0)
  const [multiplier, setMultiplier] = useState(1)
  const [selectedCharacter, setSelectedCharacter] = useState('Aries Surfer')
  const [isMuted, setIsMuted] = useState(false)
  const [completedQuests, setCompletedQuests] = useState<string[]>([])
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([])

  const xpNeeded = level * 300 // e.g. Level 1 needs 300xp, Level 2 needs 600xp, etc.

  // Load state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLevel = localStorage.getItem('oyeastro_game_level')
      const savedXp = localStorage.getItem('oyeastro_game_xp')
      const savedMult = localStorage.getItem('oyeastro_game_multiplier')
      const savedChar = localStorage.getItem('oyeastro_game_character')
      const savedMuted = localStorage.getItem('oyeastro_game_muted')
      const savedQuests = localStorage.getItem('oyeastro_game_quests')
      const savedBadges = localStorage.getItem('oyeastro_game_badges')

      if (savedLevel) setLevel(parseInt(savedLevel, 10))
      if (savedXp) setXp(parseInt(savedXp, 10))
      if (savedMult) setMultiplier(parseInt(savedMult, 10))
      if (savedChar) setSelectedCharacter(savedChar)
      if (savedMuted) {
        const muted = savedMuted === 'true'
        setIsMuted(muted)
        ;(window as any).__oyeastro_muted = muted
      }
      if (savedQuests) setCompletedQuests(JSON.parse(savedQuests))
      if (savedBadges) setUnlockedBadges(JSON.parse(savedBadges))
    }
  }, [])

  // Synced updates to local storage
  const saveItem = (key: string, value: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value)
    }
  }

  const addXp = (amount: number) => {
    // Apply score multiplier to coin/game XP
    const actualAmount = amount * multiplier
    setXp(prevXp => {
      let newXp = prevXp + actualAmount
      let currentLevel = level
      let currentXpNeeded = currentLevel * 300

      while (newXp >= currentXpNeeded) {
        newXp -= currentXpNeeded
        currentLevel += 1
        currentXpNeeded = currentLevel * 300
        
        // Level up trigger!
        setTimeout(() => {
          audioSystem.playLevelUp()
        }, 100)
      }

      setLevel(currentLevel)
      saveItem('oyeastro_game_level', currentLevel.toString())
      saveItem('oyeastro_game_xp', newXp.toString())
      return newXp
    })
  }

  const completeQuest = (questId: string) => {
    if (completedQuests.includes(questId)) return

    const questTemplate = QUESTS_TEMPLATES.find(q => q.id === questId)
    if (!questTemplate) return

    const newQuests = [...completedQuests, questId]
    setCompletedQuests(newQuests)
    saveItem('oyeastro_game_quests', JSON.stringify(newQuests))

    // Award rewards
    setMultiplier(prev => {
      const nextMult = prev + questTemplate.rewardMult
      saveItem('oyeastro_game_multiplier', nextMult.toString())
      return nextMult
    })

    // Award XP (Note: quest XP is NOT multiplied to avoid hyper-inflation)
    setXp(prevXp => {
      let newXp = prevXp + questTemplate.rewardXp
      let currentLevel = level
      let currentXpNeeded = currentLevel * 300

      while (newXp >= currentXpNeeded) {
        newXp -= currentXpNeeded
        currentLevel += 1
        currentXpNeeded = currentLevel * 300
        setTimeout(() => {
          audioSystem.playLevelUp()
        }, 100)
      }

      setLevel(currentLevel)
      saveItem('oyeastro_game_level', currentLevel.toString())
      saveItem('oyeastro_game_xp', newXp.toString())
      return newXp
    })

    // Sound cue
    setTimeout(() => {
      audioSystem.playUnlock()
    }, 50)
  }

  const toggleMute = () => {
    setIsMuted(prev => {
      const next = !prev
      saveItem('oyeastro_game_muted', next.toString())
      if (typeof window !== 'undefined') {
        ;(window as any).__oyeastro_muted = next
      }
      return next
    })
    // Quick click sound if we just unmuted
    setTimeout(() => {
      if (isMuted) {
        audioSystem.playClick()
      }
    }, 50)
  }

  const selectCharacter = (charName: string) => {
    setSelectedCharacter(charName)
    saveItem('oyeastro_game_character', charName)
    audioSystem.playClick()
  }

  const addBadge = (badge: string) => {
    if (unlockedBadges.includes(badge)) return
    const newBadges = [...unlockedBadges, badge]
    setUnlockedBadges(newBadges)
    saveItem('oyeastro_game_badges', JSON.stringify(newBadges))
  }

  const resetGame = () => {
    setLevel(1)
    setXp(0)
    setMultiplier(1)
    setSelectedCharacter('Aries Surfer')
    setCompletedQuests([])
    setUnlockedBadges([])
    if (typeof window !== 'undefined') {
      localStorage.removeItem('oyeastro_game_level')
      localStorage.removeItem('oyeastro_game_xp')
      localStorage.removeItem('oyeastro_game_multiplier')
      localStorage.removeItem('oyeastro_game_character')
      localStorage.removeItem('oyeastro_game_quests')
      localStorage.removeItem('oyeastro_game_badges')
    }
    audioSystem.playUnlock()
  }

  const quests = QUESTS_TEMPLATES.map(q => ({
    ...q,
    isCompleted: completedQuests.includes(q.id)
  }))

  return (
    <GameContext.Provider value={{
      level,
      xp,
      xpNeeded,
      multiplier,
      selectedCharacter,
      isMuted,
      completedQuests,
      unlockedBadges,
      quests,
      addXp,
      completeQuest,
      toggleMute,
      selectCharacter,
      addBadge,
      resetGame
    }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}
