import type { Metadata } from 'next'
import { Fraunces, DM_Sans } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-fraunces',
  style: ['normal', 'italic'],
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'OyeAstro — Your Cosmic Vibe Check',
  description: 'Enter your birth details. Get a deeply personal read on today, your week, and what\'s coming — backed by 5000 years of Vedic astrology, written for right now.',
  keywords: ['vedic astrology', 'kundli', 'birth chart', 'dasha', 'nakshatra', 'compatibility', 'gen z astrology'],
  openGraph: {
    title: 'OyeAstro — Your Cosmic Vibe Check',
    description: 'Enter your birth details. Get a deeply personal read on today, your week, and what\'s coming — backed by 5000 years of Vedic astrology, written for right now.',
    url: 'https://oyeastro.com',
    siteName: 'OyeAstro',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OyeAstro — Your Cosmic Vibe Check',
    description: 'Your real Vedic birth chart, written for right now.',
  },
  metadataBase: new URL('https://oyeastro.com'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${dmSans.variable}`}>
      <head />
      <body className="font-body bg-ivory text-ink min-h-screen overflow-x-hidden relative">
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
