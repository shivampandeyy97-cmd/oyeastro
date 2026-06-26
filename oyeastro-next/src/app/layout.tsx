import type { Metadata } from 'next'
import { Space_Grotesk, Syne } from 'next/font/google'
import Script from 'next/script'
import MeteorShower from '@/components/MeteorShower'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

const syne = Syne({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-syne',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'OyeAstro — Vedic Astrology Vibe Check',
  description: 'Real Vedic Kundli calculator for Gen Z. Get your Big Three, Dasha era, Ashtakoot compatibility, and cosmic vibe score — no signup, no paywall.',
  keywords: ['vedic astrology', 'kundli', 'birth chart', 'dasha', 'nakshatra', 'compatibility', 'gen z astrology'],
  openGraph: {
    title: 'OyeAstro — Aesthetic Vedic Astrology',
    description: 'Calculate your real Vedic chart, Dasha playlist, and cosmic vibe score.',
    url: 'https://oyeastro.com',
    siteName: 'OyeAstro',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OyeAstro — Vedic Astrology Vibe Check',
    description: 'Your real Vedic birth chart, Gen-Z style.',
  },
  metadataBase: new URL('https://oyeastro.com'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${spaceGrotesk.variable} ${syne.variable}`}>
      <head />
      <body className="font-body bg-bgWarm text-textPrimary min-h-screen overflow-x-hidden relative">
        <MeteorShower />
        {children}

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-4V01ML9C58"
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-4V01ML9C58');
          `}
        </Script>

        {/* Google AdSense */}
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1784776421772675"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />

        {/* Plausible.io Analytics */}
        <Script
          src="https://plausible.io/js/script.js"
          data-domain="oyeastro.com"
          strategy="afterInteractive"
          defer
        />

        {/* Razorpay Checkout SDK */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  )
}
