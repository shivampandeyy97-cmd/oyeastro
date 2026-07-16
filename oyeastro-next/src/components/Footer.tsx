'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Footer() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleOpenModal = () => {
    setIsModalOpen(true)
    setSubmitSuccess(false)
    setSubmitError('')
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setName('')
    setEmail('')
    setFeedback('')
  }

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !feedback) return

    setIsSubmitting(true)
    setSubmitError('')

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, feedback }),
      })

      if (res.ok) {
        setSubmitSuccess(true)
        setTimeout(() => {
          handleCloseModal()
        }, 2000)
      } else {
        const data = await res.json()
        setSubmitError(data.error || 'Failed to submit feedback. Please try again.')
      }
    } catch {
      setSubmitError('Something went wrong. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <footer className="bg-cream px-12 py-10 border-t-[0.5px] border-border mt-20">
        <div className="flex flex-col gap-5 md:flex-row md:justify-between md:items-center max-w-5xl mx-auto">
          <div className="flex flex-col gap-1 text-left">
            <div className="font-display text-lg font-medium text-ink">
              oyeastro<span className="text-coral">.</span>
            </div>
            <p className="text-xs text-ink-faint">
              Vedic astrology for people who don't call it astrology.
            </p>
          </div>
          <div className="flex flex-wrap gap-7 text-xs text-ink-faint items-center">
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
            <button
              onClick={handleOpenModal}
              className="bg-ink hover:bg-coral text-white text-xs px-4 py-2 rounded-full border-none cursor-pointer font-body font-semibold transition-all duration-200"
            >
              💬 Submit Feedback
            </button>
          </div>
        </div>
        <div className="text-center text-[10px] text-ink-faint mt-8 border-t border-border/40 pt-6">
          © 2026 OyeAstro. All cosmic rights reserved. Vedic Calculations under Lahiri Ayanamsa.
        </div>
      </footer>

      {/* Feedback Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div 
            className="bg-[#FEFCF7] border-4 border-black rounded-3xl p-6 md:p-8 max-w-[450px] w-full shadow-[6px_6px_0px_#8A5CF5] relative text-left transform-gpu transition-all animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
          >
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 bg-transparent border-none text-ink-faint hover:text-ink cursor-pointer text-lg font-bold"
              aria-label="Close modal"
            >
              ✕
            </button>

            <h3 className="font-display text-2xl font-black text-ink mb-2">Share Your Cosmic Feedback</h3>
            <p className="text-xs text-ink-mid font-light leading-relaxed mb-6">
              We want to make OyeAstro the best alignment guide possible. Tell us about your experience!
            </p>

            {submitSuccess ? (
              <div className="bg-[#EEF7F2] border-3 border-black text-[#0A5228] rounded-2xl p-5 text-center text-xs font-bold shadow-[3px_3px_0px_#000] rotate-[-1deg] animate-pulse">
                🎉 Feedback sent successfully! Thank you for helping us align our stars.
              </div>
            ) : (
              <form onSubmit={handleSubmitFeedback} className="flex flex-col gap-4">
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-ink-faint tracking-wider uppercase">Your Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Shivam..."
                    className="bg-cream border-2 border-black rounded-xl p-3 text-xs font-body text-ink outline-none focus:bg-white focus:shadow-[2px_2px_0px_#8A5CF5] transition-all"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-ink-faint tracking-wider uppercase">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="email@example.com"
                    className="bg-cream border-2 border-black rounded-xl p-3 text-xs font-body text-ink outline-none focus:bg-white focus:shadow-[2px_2px_0px_#8A5CF5] transition-all"
                  />
                </div>

                {/* Feedback */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-ink-faint tracking-wider uppercase">Your Feedback</label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    required
                    rows={4}
                    placeholder="How was the matching? What should we add next?"
                    className="bg-cream border-2 border-black rounded-xl p-3 text-xs font-body text-ink outline-none resize-none focus:bg-white focus:shadow-[2px_2px_0px_#8A5CF5] transition-all"
                  />
                </div>

                {submitError && (
                  <div className="text-coral text-xs font-bold text-center border-2 border-black bg-pastelPink/35 p-2 rounded-xl">
                    ⚠️ {submitError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-ink hover:bg-coral text-white rounded-xl p-3.5 font-bold text-xs transition-all duration-150 cursor-pointer border-2 border-black shadow-[3px_3px_0px_#000] hover:translate-y-[-1px] active:translate-y-[1px] disabled:opacity-50 mt-2"
                >
                  {isSubmitting ? 'Sending feedback...' : 'Send Feedback ✦'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
