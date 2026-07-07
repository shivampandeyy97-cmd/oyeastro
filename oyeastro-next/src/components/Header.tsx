'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useGame } from '@/components/GameContext'
import { audioSystem } from '@/lib/audio'

export default function Header() {
  const {
    level,
    xp,
    xpNeeded,
    multiplier,
    selectedCharacter,
    isMuted,
    toggleMute,
    selectCharacter
  } = useGame()

  const [showBoards, setShowBoards] = useState(false)

  const boardsList = [
    { name: 'Aries Surfer', emoji: '🛹', color: 'text-brightPink' },
    { name: 'Leo Gold', emoji: '🛹', color: 'text-brightGold' },
    { name: 'Gemini Jets', emoji: '🛹', color: 'text-brightPurple' },
    { name: 'Pisces Rocket', emoji: '🛹', color: 'text-brightCyan' },
  ]

  // Play audio on normal navigation links click
  const handleNavClick = () => {
    audioSystem.playClick()
  }

  return (
    <header className="sticky top-0 z-50 px-4 py-3 md:px-8 flex flex-col gap-3 md:flex-row md:justify-between md:items-center border-b-4 border-black bg-cardBg shadow-[0_4px_0_#000]">
      {/* Brand Logo - Graffiti Style */}
      <div className="flex justify-between items-center w-full md:w-auto">
        <Link 
          href="/" 
          onClick={handleNavClick}
          className="flex items-center gap-2 text-2xl font-black text-white hover:scale-105 active:scale-95 transition-transform"
        >
          <span className="font-graffiti text-brightPink text-3xl tracking-wider select-none rotate-[-4deg] inline-block mr-1">
            OyeAstro
          </span>
          <span className="text-xs font-black bg-brightGreen text-black px-2 py-0.5 border-2 border-black rounded-neoSm shadow-[1.5px_1.5px_0_#000] rotate-[6deg]">
            V2
          </span>
        </Link>

        {/* Mobile controls: Volume Mute */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleMute}
            className="w-10 h-10 border-2 border-black rounded-xl bg-[#181a4a] hover:bg-brightPink/20 text-lg shadow-[2px_2px_0_#000] active:translate-y-0.5 active:shadow-[1px_1px_0_#000] transition-all flex items-center justify-center"
            title={isMuted ? 'Unmute game sounds' : 'Mute game sounds'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>
      </div>

      {/* Gamification Dashboard */}
      <div className="flex items-center gap-3 bg-[#0d0f30] border-2 border-black rounded-2xl px-3 py-2 w-full md:w-auto justify-between md:justify-start">
        {/* Level Indicator */}
        <div className="flex flex-col items-start leading-none pr-3 border-r-2 border-black/40">
          <span className="text-[10px] font-black text-textMuted uppercase tracking-wider">Runner</span>
          <div className="flex items-center gap-1 mt-1">
            <span className="font-display font-black text-brightGreen text-lg">LVL {level}</span>
          </div>
        </div>

        {/* XP Bar */}
        <div className="flex-1 md:w-36 flex flex-col justify-center gap-1 px-1">
          <div className="flex justify-between text-[9px] font-black text-textMuted uppercase tracking-wider leading-none">
            <span>XP Boost</span>
            <span>{Math.round(xp)} / {xpNeeded}</span>
          </div>
          <div className="w-full h-3.5 bg-black/60 rounded-full border border-black/30 overflow-hidden relative">
            <div 
              className="h-full bg-gradient-to-r from-brightGreen to-[#00f5d4] rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (xp / xpNeeded) * 100)}%` }}
            />
          </div>
        </div>

        {/* Multiplier Badge */}
        <div 
          className="flex items-center gap-1 bg-brightGold border-2 border-black px-2.5 py-1 rounded-xl shadow-[2px_2px_0_#000] animate-bounce shrink-0 cursor-help"
          title="Multiplier: Completed quests boost your coin gains!"
        >
          <span className="text-black font-display font-black text-sm md:text-base leading-none">
            x{multiplier}
          </span>
        </div>

        {/* Character/Board Switcher */}
        <div className="relative shrink-0">
          <button
            onClick={() => { audioSystem.playClick(); setShowBoards(!showBoards) }}
            className="flex items-center gap-1 bg-brightCyan text-black border-2 border-black px-2 py-1 rounded-xl text-xs font-black shadow-[2px_2px_0_#000] hover:translate-y-[-1px] active:translate-y-[1px]"
          >
            🛹 Board
          </button>
          
          {showBoards && (
            <div className="absolute right-0 top-full mt-2 bg-[#090a24] border-2 border-black rounded-xl p-2 w-48 shadow-[4px_4px_0_#000] z-50">
              <div className="text-[10px] font-black text-textMuted uppercase tracking-wider mb-1.5 border-b border-black pb-1">
                Select Your Board
              </div>
              <div className="flex flex-col gap-1">
                {boardsList.map((b) => (
                  <button
                    key={b.name}
                    onClick={() => {
                      selectCharacter(b.name)
                      setShowBoards(false)
                    }}
                    className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${
                      selectedCharacter === b.name
                        ? 'bg-brightPink border-black text-white'
                        : 'bg-black/30 border-transparent hover:border-black/50 text-white'
                    }`}
                  >
                    <span>{b.emoji} {b.name}</span>
                    {selectedCharacter === b.name && <span className="text-[10px]">✔</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation and Audio Control */}
      <nav className="flex items-center gap-3 text-sm font-bold w-full md:w-auto justify-end">
        <Link
          href="/compatibility"
          onClick={handleNavClick}
          className="px-4 py-2 rounded-xl border-2 border-black bg-brightPink text-white shadow-[3px_3px_0_#000] hover:translate-y-[-2px] hover:shadow-[5px_5px_0_#000] active:translate-y-[2px] active:shadow-[1px_1px_0_#000] transition-all text-xs md:text-sm"
        >
          💞 Matcher
        </Link>
        <Link
          href="/"
          onClick={handleNavClick}
          className="px-4 py-2 rounded-xl border-2 border-black bg-pastelPurple text-white shadow-[3px_3px_0_#000] hover:translate-y-[-2px] hover:shadow-[5px_5px_0_#000] active:translate-y-[2px] active:shadow-[1px_1px_0_#000] transition-all text-xs md:text-sm"
        >
          🔮 Vibe Check
        </Link>
        
        {/* Desktop volume control */}
        <button
          onClick={toggleMute}
          className="hidden md:flex w-10 h-10 border-2 border-black rounded-xl bg-[#181a4a] hover:bg-brightPink/20 text-lg shadow-[2px_2px_0_#000] active:translate-y-0.5 active:shadow-[1px_1px_0_#000] transition-all items-center justify-center cursor-pointer"
          title={isMuted ? 'Unmute game sounds' : 'Mute game sounds'}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      </nav>
    </header>
  )
}


