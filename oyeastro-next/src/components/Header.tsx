'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Header() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (saved) {
      setTheme(saved)
      if (saved === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark')
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem('theme', next)
    if (next === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  return (
    <header className="sticky top-0 z-50 px-6 py-4 md:px-12 flex justify-between items-center border-b-2 border-espresso bg-cardBg shadow-neo">
      <Link href="/" className="flex items-center gap-3 font-display text-2xl font-extrabold text-white hover:opacity-80 transition-opacity">
        <svg viewBox="0 0 24 24" className="w-9 h-9 stroke-white fill-none stroke-[2.5]">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          <path d="M2 12h20" />
        </svg>
        OyeAstro
      </Link>

      <nav className="flex items-center gap-4 text-sm font-bold">
        <Link
          href="/compatibility"
          className="px-4 py-2 rounded-neoSm border-2 border-espresso bg-pastelPurple text-white shadow-neoSm hover:-translate-y-0.5 hover:shadow-neo transition-all"
        >
          💞 Compatibility
        </Link>
        <Link
          href="/blog/big-three"
          className="hidden md:block text-textSecondary hover:text-white transition-colors"
        >
          Blog
        </Link>
        <Link
          href="/about"
          className="hidden md:block text-textSecondary hover:text-white transition-colors"
        >
          About
        </Link>
        
        {/* Theme Switcher Button */}
        <button
          onClick={toggleTheme}
          className="p-2 border-2 border-espresso rounded-neoSm bg-cardBg text-white shadow-neoSm hover:bg-pastelOrange/20 transition-all flex items-center justify-center w-9 h-9 text-base active:scale-90"
          aria-label="Toggle theme"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </nav>
    </header>
  )
}

