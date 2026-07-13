'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/connect-astrologer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, whatsapp }),
      })
      if (res.ok) {
        setSubmitted(true)
        setTimeout(() => {
          setIsOpen(false)
          setSubmitted(false)
          setName('')
          setEmail('')
          setWhatsapp('')
        }, 2500)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to submit details')
      }
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
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
        </ul>
        <div className="flex gap-3 items-center">
          <button 
            type="button"
            onClick={() => setIsOpen(true)}
            className="bg-coral text-white px-5 py-2.5 rounded-full text-xs font-semibold hover:bg-ink hover:-translate-y-[1px] transition-all duration-200 border-none cursor-pointer font-body"
          >
            💬 Talk to Astrologer
          </button>
          <Link 
            href="/"
            className="hidden sm:inline-block bg-ink text-ivory px-6 py-2.5 rounded-full text-xs font-medium hover:bg-coral hover:-translate-y-[1px] transition-all duration-200 border-none cursor-pointer font-body no-underline"
          >
            Try it free →
          </Link>
        </div>
      </nav>

      {/* Modal dialog for connect with astrologer */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-black/5 rounded-[28px] p-8 max-w-[400px] w-full shadow-2xl relative text-left">
            <button 
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 bg-transparent border-none text-ink-faint hover:text-ink cursor-pointer text-lg"
            >
              ✕
            </button>
            
            <h3 className="font-display text-xl font-medium text-ink mb-2">Connect with a Real Astrologer</h3>
            <p className="text-xs text-ink-mid font-light leading-relaxed mb-6">
              Fill in your details, and our premium certified astrologer will connect with you on WhatsApp shortly.
            </p>

            {submitted ? (
              <div className="bg-[#EEF7F2] border border-[#6DB88A]/30 text-[#6DB88A] rounded-2xl p-4 text-center text-xs font-semibold">
                🎉 Details submitted successfully! Astrologer will message you on WhatsApp shortly.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-ink-faint tracking-wider uppercase">Your name</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                    placeholder="Arjun, Riya..." 
                    className="bg-cream border-[1.5px] border-transparent outline-[1px] outline-border rounded-xl p-2.5 text-xs font-body text-ink focus:outline-none focus:border-coral focus:bg-white focus:ring-4 focus:ring-coral/10 transition-all duration-200"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-ink-faint tracking-wider uppercase">Email address</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    placeholder="email@example.com" 
                    className="bg-cream border-[1.5px] border-transparent outline-[1px] outline-border rounded-xl p-2.5 text-xs font-body text-ink focus:outline-none focus:border-coral focus:bg-white focus:ring-4 focus:ring-coral/10 transition-all duration-200"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-ink-faint tracking-wider uppercase">WhatsApp number</label>
                  <input 
                    type="tel" 
                    value={whatsapp} 
                    onChange={(e) => setWhatsapp(e.target.value)} 
                    required 
                    placeholder="+91 98765 43210" 
                    className="bg-cream border-[1.5px] border-transparent outline-[1px] outline-border rounded-xl p-2.5 text-xs font-body text-ink focus:outline-none focus:border-coral focus:bg-white focus:ring-4 focus:ring-coral/10 transition-all duration-200"
                  />
                </div>

                {error && (
                  <div className="text-coral text-xs font-semibold text-center">
                    ⚠️ {error}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-ink hover:bg-coral text-white rounded-xl p-3 font-semibold text-xs transition-all cursor-pointer border-none disabled:opacity-50 mt-2"
                >
                  {loading ? 'Submitting details...' : 'Submit details'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
