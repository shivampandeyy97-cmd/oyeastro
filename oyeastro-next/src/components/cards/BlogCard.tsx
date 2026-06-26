'use client'

import Link from 'next/link'

export default function BlogCard() {
  const posts = [
    { title: '🪐 The Big Three Explained 👉', slug: 'big-three-explained' },
    { title: '☄️ Mercury Retrograde Survival 👉', slug: 'mercury-retrograde-survival' },
    { title: '📡 Vedic vs. Western Chart 👉', slug: 'vedic-vs-western-chart' },
    { title: '🎵 Dasha Eras Playlist 👉', slug: 'dasha-eras-playlist' },
  ]

  return (
    <div className="pin-card bg-pastelBlue border-2 border-espresso rounded-neoLg p-6 shadow-neo break-inside-avoid mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-display font-extrabold text-espresso text-base">Astro Blog Room</h3>
        <span className="px-2.5 py-1 text-xs font-bold border-2 border-espresso bg-white text-espresso rounded-neoSm shadow-neoSm">
          Daily Reads
        </span>
      </div>

      <div className="flex flex-col gap-3 my-2 font-display text-sm font-extrabold">
        {posts.map((post, idx) => (
          <Link
            key={idx}
            href={`/blog/${post.slug}`}
            className="text-espresso hover:text-brightOrange transition-colors flex items-center justify-between border-b-2 border-dashed border-espresso/20 pb-2 last:border-0 last:pb-0"
          >
            {post.title}
          </Link>
        ))}
      </div>
    </div>
  )
}
