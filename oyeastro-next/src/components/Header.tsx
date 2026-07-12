'use client'

import Link from 'next/link'

export default function Header() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between padding-6 px-12 py-5 bg-ivory/90 backdrop-blur-md border-b-[0.5px] border-border">
      <Link href="/" className="font-display text-2xl font-medium text-ink tracking-tight">
        oyeastro<span className="text-coral">.</span>
      </Link>
      <ul className="hidden md:flex gap-10 list-none">
        <li>
          <Link href="/#match" className="text-xs text-ink-mid hover:text-ink transition-colors">
            Compatibility
          </Link>
        </li>
        <li>
          <Link href="/#pricing" className="text-xs text-ink-mid hover:text-ink transition-colors">
            Pricing
          </Link>
        </li>
      </ul>
      <Link 
        href="/"
        className="bg-ink text-ivory px-6 py-2.5 rounded-full text-xs font-medium hover:bg-coral hover:-translate-y-[1px] transition-all duration-200 border-none cursor-pointer font-body no-underline"
      >
        Try it free →
      </Link>
    </nav>
  )
}
