'use client'

import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function AboutPage() {
  return (
    <main className="min-h-screen flex flex-col justify-between">
      <div>
        <Header />
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-10">
          <Link
            href="/"
            className="inline-block mb-6 font-display font-extrabold text-white hover:text-brightOrange transition-colors"
          >
            👈 Back to Board
          </Link>

          <div className="bg-cardBg border-2 border-espresso rounded-neoLg p-8 shadow-neoLg flex flex-col gap-6">
            <h1 className="font-display text-3xl md:text-4xl font-black text-white">
              About OyeAstro
            </h1>

            <p className="font-body text-sm font-semibold text-textSecondary leading-relaxed">
              Welcome to <strong>OyeAstro</strong>, your ultimate aesthetic hub for modern Vedic Astrology, cosmic calculations, and soul-alignment vibe checks. We built this platform for a new generation of stargazers, creators, and cosmic explorers who want accurate astrological insights without the clutter, logins, or paywalls.
            </p>

            <h2 className="font-display text-xl font-bold text-white border-b border-espresso/30 pb-1 mt-2">
              Our Mission
            </h2>
            <p className="font-body text-sm font-semibold text-textSecondary leading-relaxed">
              Astrology is more than just checking your weekly horoscope—it is a detailed planetary blueprint of your life journey. Our mission is to bridge traditional Vedic (Sidereal) calculations with modern Gen-Z visual culture. We believe your Kundli chart should look as beautiful as it is mathematically accurate, helping you check your "Big Three," navigate Mercury Retrogrades, and discover your running Dasha eras in a fun, shareable format.
            </p>

            <h2 className="font-display text-xl font-bold text-white border-b border-espresso/30 pb-1 mt-2">
              How Our Calculations Work
            </h2>
            <p className="font-body text-sm font-semibold text-textSecondary leading-relaxed">
              Unlike Western astrology, which relies on the fixed Tropical calendar established thousands of years ago, OyeAstro uses the <strong>Vedic (Sidereal) system</strong> utilizing the <strong>Lahiri Ayanamsa</strong>. This calculation accounts for the actual precession of the Earth's axis, matching the real astronomical positions of the stars as seen today. Our calculations are run deterministically server-side, ensuring absolute data privacy while maintaining high-fidelity accuracy for planets, houses, and dashas.
            </p>

            <h2 className="font-display text-xl font-bold text-white border-b border-espresso/30 pb-1 mt-2">
              AdSense & Quality Commitment
            </h2>
            <p className="font-body text-sm font-semibold text-textSecondary leading-relaxed">
              OyeAstro is dedicated to maintaining high-quality, plagiarism-free content and a clean user experience. We are fully compliant with programmatic advertising standards, ensuring our platform is educational, helpful, and safe for global audiences.
            </p>

            <p className="font-body text-sm font-semibold text-textSecondary leading-relaxed">
              Have questions, ideas, or just want to send us some good vibes? Reach out to our cosmic team directly at{' '}
              <a href="mailto:shivampandeyy97@gmail.com" className="text-brightOrange hover:underline">
                shivampandeyy97@gmail.com
              </a>
              .
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
