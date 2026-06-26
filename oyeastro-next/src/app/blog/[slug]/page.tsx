import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { BLOG_POSTS } from '@/lib/blogData'

interface Props {
  params: {
    slug: string
  }
}

export async function generateStaticParams() {
  return Object.keys(BLOG_POSTS).map(slug => ({
    slug,
  }))
}

export default function BlogPostPage({ params }: Props) {
  const post = BLOG_POSTS[params.slug]

  if (!post) {
    notFound()
  }

  return (
    <main className="min-h-screen flex flex-col justify-between">
      <div>
        <Header />
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-10">
          <Link
            href="/"
            className="inline-block mb-6 font-display font-extrabold text-white hover:text-brightOrange transition-colors"
          >
            👈 Back to Board
          </Link>

          <div className="bg-cardBg border-2 border-espresso rounded-neoLg p-8 shadow-neoLg flex flex-col gap-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brightOrange bg-pastelOrange px-2.5 py-0.5 border border-espresso rounded-full">
                {post.category}
              </span>
              <h1 className="font-display text-3xl md:text-4xl font-black text-white mt-3 leading-tight">
                {post.title}
              </h1>
              <p className="text-xs font-bold text-textMuted mt-2">
                Published: {post.date}
              </p>
            </div>

            {/* Intro */}
            <p className="font-body text-sm font-semibold text-white leading-relaxed border-l-4 border-l-brightOrange pl-4">
              {post.intro}
            </p>

            {/* Sections */}
            {post.sections.map((section, idx) => (
              <div key={idx} className="flex flex-col gap-3">
                {section.heading && (
                  <h2 className="font-display text-xl font-extrabold text-white mt-4 border-b border-espresso/30 pb-1">
                    {section.heading}
                  </h2>
                )}
                <p className="font-body text-sm font-semibold text-textSecondary leading-relaxed whitespace-pre-line">
                  {section.body}
                </p>
                {section.list && (
                  <ul className="list-disc list-inside pl-2 flex flex-col gap-2 font-body text-sm font-semibold text-textSecondary leading-relaxed">
                    {section.list.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}

            {/* Outro */}
            {post.outro && (
              <p className="font-body text-sm font-semibold text-white leading-relaxed border-t border-espresso/30 pt-4 italic">
                {post.outro}
              </p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
