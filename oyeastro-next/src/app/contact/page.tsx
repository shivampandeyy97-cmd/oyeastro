'use client'

import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function ContactPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Message sent to the cosmos (and Shivam)! 💫')
    ;(e.target as HTMLFormElement).reset()
  }

  const inputClass = "w-full p-3.5 border-2 border-espresso rounded-neoSm font-body text-sm font-medium text-espresso bg-white neo-input focus:outline-none transition-all"

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
              Contact Our Cosmic Team
            </h1>

            <p className="font-body text-sm font-semibold text-textSecondary leading-relaxed">
              Need support with your chart calculations, spotted a planetary glitch, or interested in collaborating with OyeAstro? We are here to help align your questions!
            </p>

            <div className="bg-pastelOrange/20 border-2 border-espresso rounded-neoLg p-6 shadow-neoSm flex flex-col gap-2">
              <h3 className="font-display text-lg font-black text-espresso">Direct Inquiries</h3>
              <p className="font-body text-sm font-extrabold text-espresso mt-1">
                📧 Support Email:{' '}
                <a href="mailto:shivampandeyy97@gmail.com" className="text-brightOrange hover:underline">
                  shivampandeyy97@gmail.com
                </a>
              </p>
              <p className="text-xs font-semibold text-textMuted mt-1">
                We generally align and respond to all email messages within 24–48 hours (excluding Mercury Retrograde chaos).
              </p>
            </div>

            <h2 className="font-display text-xl font-bold text-espresso border-b border-espresso/10 pb-1 mt-4">
              Send Us a Message
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-textSecondary">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="What's your name, bestie?"
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-textSecondary">Your Email</label>
                <input
                  type="email"
                  required
                  placeholder="Where should we write back?"
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-textSecondary">Message</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Share your cosmic feedback or questions..."
                  className={`${inputClass} resize-y`}
                />
              </div>

              <button
                type="submit"
                className="self-start px-8 py-3 bg-brightOrange text-white font-display text-sm font-extrabold border-2 border-espresso rounded-neoSm shadow-neo hover:scale-[1.02] transition-transform cursor-pointer mt-2"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
