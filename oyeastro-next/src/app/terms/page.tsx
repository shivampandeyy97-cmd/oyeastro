'use client'

import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function TermsPage() {
  return (
    <main className="min-h-screen flex flex-col justify-between">
      <div>
        <Header />
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-10">
          <Link
            href="/"
            className="inline-block mb-6 font-display font-extrabold text-espresso hover:text-brightOrange transition-colors"
          >
            👈 Back to Board
          </Link>

          <div className="bg-white border-2 border-espresso rounded-neoLg p-8 shadow-neoLg flex flex-col gap-6">
            <h1 className="font-display text-3xl md:text-4xl font-black text-espresso">
              Terms & Conditions
            </h1>
            <p className="text-xs font-bold text-textMuted italic -mt-3">
              Last Updated: June 14, 2026
            </p>

            <p className="font-body text-sm font-semibold text-textSecondary leading-relaxed">
              Welcome to <strong>OyeAstro</strong>. By accessing or using our website, you agree to comply with and be bound by the following Terms & Conditions. Please read them carefully.
            </p>

            <h2 className="font-display text-xl font-bold text-espresso border-b border-espresso/10 pb-1 mt-2">
              1. Entertainment Purpose Only (Disclaimer)
            </h2>
            <p className="font-body text-sm font-extrabold text-brightOrange leading-relaxed">
              All calculations, profiles, timelines, and readings provided by OyeAstro are for entertainment, curiosity, and educational purposes only.
            </p>
            <p className="font-body text-sm font-semibold text-textSecondary leading-relaxed">
              Astrological readings do not constitute, and should not be used as a substitute for, professional medical, legal, financial, or career counseling. OyeAstro makes no guarantees, representations, or warranties about the absolute accuracy or applicability of its astronomical formulas to your personal life decisions.
            </p>

            <h2 className="font-display text-xl font-bold text-espresso border-b border-espresso/10 pb-1 mt-2">
              2. Use of Our Services
            </h2>
            <p className="font-body text-sm font-semibold text-textSecondary leading-relaxed">
              You agree to use OyeAstro solely for personal, non-commercial purposes. Automated scraping, data mining, or programmatic bulk calculations targeting our site are strictly prohibited without prior written consent.
            </p>

            <h2 className="font-display text-xl font-bold text-espresso border-b border-espresso/10 pb-1 mt-2">
              3. Intellectual Property
            </h2>
            <p className="font-body text-sm font-semibold text-textSecondary leading-relaxed">
              The layout, SVG design graphics, code logic, OyeAstro logo, and custom Gen-Z interpretation text databases are the exclusive intellectual property of OyeAstro. You may not copy, republish, or distribute our design files or calculations code without attribution or consent.
            </p>

            <h2 className="font-display text-xl font-bold text-espresso border-b border-espresso/10 pb-1 mt-2">
              4. Limitation of Liability
            </h2>
            <p className="font-body text-sm font-semibold text-textSecondary leading-relaxed">
              OyeAstro will not be liable for any direct, indirect, incidental, or consequential damages resulting from your use of, or inability to use, our calculations engine, charts, or blog content.
            </p>

            <h2 className="font-display text-xl font-bold text-espresso border-b border-espresso/10 pb-1 mt-2">
              5. Governing Law
            </h2>
            <p className="font-body text-sm font-semibold text-textSecondary leading-relaxed">
              These Terms & Conditions are governed by and construed in accordance with standard international web practices and regional guidelines. Any disputes arising out of your use of the website shall be resolved amicably.
            </p>

            <h2 className="font-display text-xl font-bold text-espresso border-b border-espresso/10 pb-1 mt-2">
              6. Contact & Queries
            </h2>
            <p className="font-body text-sm font-semibold text-textSecondary leading-relaxed">
              For inquiries, feedback, or clarifications regarding these terms, please contact us directly at{' '}
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
