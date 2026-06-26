'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CompatibilityBoard from '@/components/CompatibilityBoard'

export default function CompatibilityPage() {
  return (
    <main className="min-h-screen flex flex-col justify-between">
      <div>
        <Header />
        <CompatibilityBoard />
      </div>
      <Footer />
    </main>
  )
}
