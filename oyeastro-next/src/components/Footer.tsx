import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-cream px-12 py-10 border-t-[0.5px] border-border mt-20">
      <div className="flex flex-col gap-5 md:flex-row md:justify-between md:items-center max-w-5xl mx-auto">
        <div className="flex flex-col gap-1 text-left">
          <div className="font-display text-lg font-medium text-ink">
            nakshatra<span className="text-coral">.</span>
          </div>
          <p className="text-xs text-ink-faint">
            Vedic astrology for people who don't call it astrology.
          </p>
        </div>
        <div className="flex flex-wrap gap-7 text-xs text-ink-faint">
          <Link href="/about" className="hover:text-ink transition-colors">
            About Us
          </Link>
          <Link href="/contact" className="hover:text-ink transition-colors">
            Contact Us
          </Link>
          <Link href="/privacy" className="hover:text-ink transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-ink transition-colors">
            Terms &amp; Conditions
          </Link>
        </div>
      </div>
      <div className="text-center text-[10px] text-ink-faint mt-8 border-t border-border/40 pt-6">
        © 2026 Nakshatra. All cosmic rights reserved. Vedic Calculations under Lahiri Ayanamsa.
      </div>
    </footer>
  )
}
