'use client'

import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function PrivacyPage() {
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
              Privacy Policy
            </h1>
            <p className="text-xs font-bold text-textMuted italic -mt-3">
              Effective Date: June 14, 2026
            </p>

            <p className="font-body text-sm font-semibold text-textSecondary leading-relaxed">
              At <strong>OyeAstro</strong>, we value the privacy of our stargazing community. This Privacy Policy details how we handle information when you interact with our website (oyeastro.com), ensuring full transparency and compliance with global privacy standards.
            </p>

            <h2 className="font-display text-xl font-bold text-espresso border-b border-espresso/10 pb-1 mt-2">
              1. Information We Do NOT Collect
            </h2>
            <p className="font-body text-sm font-semibold text-textSecondary leading-relaxed">
              OyeAstro is designed to be a frictionless, no-login platform.{' '}
              <strong>We do not collect, store, or transmit your birth details.</strong>{' '}
              All calculations for your Vedic Kundli, Ascendant, and Vimshottari Dashas are run directly in your local browser using client-side JavaScript. Once you close or reload the website tab, the input data (Name, Date, Time, Place of Birth) is completely wiped from memory. No database logs are created.
            </p>

            <h2 className="font-display text-xl font-bold text-espresso border-b border-espresso/10 pb-1 mt-2">
              2. Third-Party Advertisers & Cookies
            </h2>
            <p className="font-body text-sm font-semibold text-textSecondary leading-relaxed">
              We may serve third-party ads (such as Google AdSense) on OyeAstro to help keep this platform free. Google and other vendors use cookies (such as the DoubleClick DART cookie) to serve ads based on your visit to our website and other sites on the internet.
            </p>
            <ul className="list-disc list-inside font-body text-sm font-semibold text-textSecondary flex flex-col gap-1.5 pl-2">
              <li>Users may opt out of personalized advertising by visiting Google's Ads Settings page.</li>
              <li>You can also adjust your web browser settings to block or delete cookies entirely if you prefer.</li>
            </ul>

            <h2 className="font-display text-xl font-bold text-espresso border-b border-espresso/10 pb-1 mt-2">
              3. Web Analytics
            </h2>
            <p className="font-body text-sm font-semibold text-textSecondary leading-relaxed">
              We may collect basic, anonymous traffic analytics (such as page views, device types, and browser agents) using lightweight privacy-centric analytics platforms to optimize our responsive layout designs. This data contains no personally identifiable information (PII).
            </p>

            <h2 className="font-display text-xl font-bold text-espresso border-b border-espresso/10 pb-1 mt-2">
              4. External Links
            </h2>
            <p className="font-body text-sm font-semibold text-textSecondary leading-relaxed">
              Our website may contain links to other websites or blogs. If you click on a third-party link, you will be directed to that site. Note that these external sites are not operated by us, and we strongly advise you to review the Privacy Policy of those platforms.
            </p>

            <h2 className="font-display text-xl font-bold text-espresso border-b border-espresso/10 pb-1 mt-2">
              5. Compliance Updates
            </h2>
            <p className="font-body text-sm font-semibold text-textSecondary leading-relaxed">
              We reserve the right to modify this Privacy Policy at any time. Changes will take effect immediately upon being posted on this page.
            </p>

            <h2 className="font-display text-xl font-bold text-espresso border-b border-espresso/10 pb-1 mt-2">
              6. Contact Us
            </h2>
            <p className="font-body text-sm font-semibold text-textSecondary leading-relaxed">
              If you have any questions about this Privacy Policy or how your data is handled, feel free to reach out to us at{' '}
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
