'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CompatibilityPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/#match')
  }, [router])

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center font-display text-ink text-sm">
      Connecting to the cosmos...
    </div>
  )
}
