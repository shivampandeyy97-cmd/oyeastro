import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="mt-24 py-10 px-6 border-t-2 border-espresso bg-cardBg text-center flex flex-col gap-4">
      <div className="flex justify-center gap-6 text-sm font-bold flex-wrap">
        <Link href="/about"   className="text-textSecondary hover:text-espresso transition-colors">About Us</Link>
        <Link href="/contact" className="text-textSecondary hover:text-espresso transition-colors">Contact Us</Link>
        <Link href="/privacy" className="text-textSecondary hover:text-espresso transition-colors">Privacy Policy</Link>
        <Link href="/terms"   className="text-textSecondary hover:text-espresso transition-colors">Terms & Conditions</Link>
        <Link href="/blog/big-three" className="text-textSecondary hover:text-espresso transition-colors">Blog</Link>
      </div>
      <div className="text-textMuted text-sm">
        © 2026 OyeAstro. All cosmic rights reserved.{' '}
        <br className="md:hidden" />
        Help &amp; inquiries:{' '}
        <a href="mailto:shivampandeyy97@gmail.com" className="underline underline-offset-2 hover:text-espresso transition-colors">
          shivampandeyy97@gmail.com
        </a>
      </div>
      <p className="text-xs text-textMuted max-w-lg mx-auto">
        OyeAstro uses the Vedic (Sidereal) system with Lahiri Ayanamsa and Swiss Ephemeris.
        For entertainment purposes. Not a substitute for professional guidance.
      </p>
    </footer>
  )
}
