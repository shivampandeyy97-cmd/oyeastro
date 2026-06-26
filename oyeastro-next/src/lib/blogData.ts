export interface BlogPost {
  slug: string
  title: string
  date: string
  category: string
  intro: string
  sections: { heading?: string; body: string; list?: string[] }[]
  outro?: string
}

export const BLOG_POSTS: Record<string, BlogPost> = {
  'big-three-explained': {
    slug: 'big-three-explained',
    title: 'The Big Three: What Your Sun, Moon, and Rising Signs Actually Say About You',
    date: 'June 14, 2026',
    category: 'Astrology Basics',
    intro: `If you have spent even five minutes on social media, you have probably run into the phrase "The Big Three." While traditional astrology historically grouped everyone under one of the twelve basic Sun signs, modern stargazers know that your true identity is a complex combination of astronomical positions. In Vedic and Western astrology, your Sun, Moon, and Rising (Lagna) signs represent the core pillars of your personality. Let's unpack the cosmic tea on what this trio actually says about you.`,
    sections: [
      {
        heading: '1. The Sun Sign: Your Core Ego & Motivation',
        body: `Your Sun sign represents the zodiac sector where the Sun was located at your exact moment of birth. In astrological terms, the Sun rules your core ego, vital energy, and active willpower. It is the answer to the question: "What drives you to get out of bed in the morning?"

If you are a Leo Sun, your drive is to express your creativity and protect your pride. If you are a Capricorn Sun, your motivation is to build structured structures, secure financial success, and earn respect. The Sun is your "active self," showing how you shine when you are fully self-aware and motivated. However, it is only one-third of the picture.`
      },
      {
        heading: '2. The Moon Sign: Your Inner Emotions & Hidden Mind',
        body: `If the Sun represents the day, your Moon sign represents the night. In Vedic astrology, the Moon is considered the most crucial placement of all, ruling the mind (Manas) and your emotional landscape.

Your Moon sign dictates how you react when you are startled, how you nurture others, and what makes you feel safe. A Scorpio Moon might struggle with trust issues, keeping their deepest feelings locked behind walls of mystery. Meanwhile, a Taurus Moon finds emotional peace in physical comforts, good food, and financial safety. Understanding your Moon sign is the key to mastering your self-care routines and understanding why you react emotionally to specific triggers.`
      },
      {
        heading: '3. The Rising Sign (Lagna): The Mask & The Vibe',
        body: `Your Rising sign, or Lagna, is the zodiac sign that was ascending on the Eastern horizon at your exact hour and minute of birth. Because the Earth rotates 360 degrees in 24 hours, the Rising sign shifts roughly every two hours, making it highly specific to your birth coordinates.

Your Rising sign represents the mask you wear in public, your physical body, and your immediate vibe when walking into a room. It is your "front door." If you are a Gemini Rising, people likely view you as chatty, funny, and highly social. If you are a Scorpio Rising, you might project a cool, mysterious aura that people find either intimidating or magnetic. The Rising sign is the lens through which you view the outer world, and it acts as the master key of your entire Vedic chart houses.`
      },
      {
        heading: 'How They Work Together',
        body: `Think of your Big Three as a movie production:`,
        list: [
          'The Rising Sign is the director, shaping the visual layout, theme, and first impressions.',
          'The Sun Sign is the main actor, representing the core dialogue, active goals, and driving plot.',
          'The Moon Sign is the soundtrack, setting the emotional mood, subtext, and underlying feelings.'
        ]
      }
    ],
    outro: `By checking your charts on OyeAstro, you can instantly see how these three signs coordinate in Vedic (Sidereal) degrees, helping you step into your full cosmic alignment. Go check your Big Three and share your cosmic profile card with your besties!`
  },
  'mercury-retrograde-survival': {
    slug: 'mercury-retrograde-survival',
    title: 'Mercury Retrograde Survival Guide: How to Keep Your Tech and Sanity Intact',
    date: 'June 14, 2026',
    category: 'Planetary Transits',
    intro: `Few astrological transits strike as much fear into the hearts of modern internet users as Mercury Retrograde. It has become the go-to excuse for every missed train, frozen laptop, and awkward text message. But what actually is this transit, and how can you survive it without throwing your phone into the nearest body of water? Let's break down the science, the myth, and the survival playbook for this notorious cosmic cycle.`,
    sections: [
      {
        heading: 'What is Mercury Retrograde, Actually?',
        body: `From a scientific standpoint, planets do not actually reverse their orbits. A retrograde is an optical illusion that occurs because of the differing orbital speeds of Earth and other planets. Think of it like passing a slower car on the highway: as you pass it, the other vehicle appears to drift backward relative to the background landscape. That is exactly what happens when Earth passes Mercury three to four times a year.

However, in astrology, the planet Mercury rules communication, travel, technology, reasoning, and contracts. When Mercury enters its retrograde shadow, the energetic nodes associated with these areas enter a phase of reflection and review. In short: things slow down, details get fuzzy, and glitches happen.`
      },
      {
        heading: 'The Golden Rules of Retrograde Survival',
        body: `You don't need to lock yourself in your room for three weeks. You just need to follow these practical cosmic hacks:`,
      },
      {
        heading: '1. Back Up Your Digital Life',
        body: `Since Mercury rules technology, this transit is notorious for sudden hard drive crashes, corrupted files, and screen breakages. Before the retrograde begins, back up your photos, cloud documents, and project databases. It takes five minutes and will save you hours of panic.`
      },
      {
        heading: '2. The "Double-Draft" Rule for Texts & DMs',
        body: `Miscommunication runs rampant during Mercury Retrograde. Sarcastic comments get taken seriously, and group chats can explode over simple misunderstandings. Read over your text messages and emails twice before hitting send. If you are angry, draft your response in a notes app first, sleep on it, and send it when the planetary heat cools down.`
      },
      {
        heading: '3. Do NOT Text Your Ex',
        body: `Retrogrades are famous for bringing people from the past back into your life. You might get a sudden, late-night text from an ex-partner or a friend you haven't spoken to in years. While it is tempting to reopen old tabs, remember that retrograde nostalgia is often a trick. Use this time to get closure, not to restart old cycles that didn't work in the first place.`
      },
      {
        heading: '4. Triple-Check Bookings & Flight Schedules',
        body: `If you are traveling, expect delays, missing luggage, or booking mistakes. Double-check your flight details, reservation dates, and hotel addresses. Give yourself an extra hour when commuting. Patience is your ultimate superpower during these transits.`
      }
    ],
    outro: `Mercury Retrograde isn't all bad. In Vedic astrology, retrograde periods are excellent for any activity starting with the prefix "re-": reviewing, realigning, researching, and relaxing. It is the universe's way of forcing you to take a breath, double-check your plans, and clean up lingering messes. By using OyeAstro to monitor your running charts, you can see how transits interact with your natal houses, helping you ride the retrograde waves like a pro. Stay calm, backup your files, and don't text the ex!`
  },
  'vedic-vs-western-chart': {
    slug: 'vedic-vs-western-chart',
    title: 'Vedic vs. Western Astrology: Why Your Sign Might Be Shifted',
    date: 'June 14, 2026',
    category: 'Systems Comparison',
    intro: `Have you ever calculated your birth chart on a Vedic astrology platform and felt an immediate identity crisis? "Wait, I've been a fiery Aries Sun my whole life, but this chart says I'm a dreamy Pisces Sun? Did the universe glitch?" Don't worry—the stars didn't change. You have just run into the fundamental difference between Western (Tropical) and Vedic (Sidereal) astrology. Let's explore why these two systems differ and why your Vedic sign represents the actual physical sky.`,
    sections: [
      {
        heading: '1. Western Astrology: The Tropical (Season-Based) Zodiac',
        body: `Western astrology uses the Tropical zodiac. This system was finalized around 2,000 years ago, anchoring the start of the astrological year (0 degrees Aries) to the Vernal Equinox (the start of spring in the Northern Hemisphere, around March 21).

Because it is tied to the seasons rather than the actual stars, Western astrology assumes the sun enters Aries on the same day every year. This creates a beautifully consistent calendar. However, it ignores a major astronomical fact: the Earth's wobble.`
      },
      {
        heading: '2. Vedic Astrology: The Sidereal (Star-Based) Zodiac',
        body: `Vedic astrology (also known as Jyotish) uses the Sidereal zodiac. This system calculates the positions of planets relative to the actual, visible constellations in the sky today.

Due to an astronomical phenomenon called the precession of the equinoxes, the Earth wobbles slowly on its axis like a spinning top. This wobble causes the background stars to shift by approximately 1 degree every 72 years. Over 2,000 years, this shift has accumulated to roughly 23 to 24 degrees.

To correct this difference, Vedic calculations apply an offset called the Ayanamsa (most commonly the Lahiri Ayanamsa). When you calculate your chart using OyeAstro, our engine automatically subtracts this offset from your Western positions. The result? Your planetary signs shift backward by nearly an entire zodiac sign.`
      },
      {
        heading: 'Tropical vs. Sidereal: Which is More Accurate?',
        body: `It depends on what you are looking for:`,
        list: [
          'Western (Tropical) represents your psychological cycles, seasonal archetypes, and ego personality. It is highly conceptual.',
          'Vedic (Sidereal) represents the actual physical coordinates of the cosmos. If a telescope points at your birth coordinates, the planets will be exactly where the Vedic chart says they are.'
        ]
      }
    ],
    outro: `Because Vedic astrology is anchored in the physical heavens, it also splits the sky into 27 lunar mansions called Nakshatras, allowing for highly specific character details and predictive timelines. Neither system is "wrong," but Vedic astrology offers a stellar level of mathematical accuracy that grounds your chart in actual celestial reality. Ready to see where the planets *actually* were when you arrived? Check your OyeAstro blueprint today!`
  },
  'dasha-eras-playlist': {
    slug: 'dasha-eras-playlist',
    title: 'Cosmic Eras: How Vimshottari Dashas Map Your Life Chapters',
    date: 'June 14, 2026',
    category: 'Vedic Systems',
    intro: `Have you ever looked back at a specific phase of your life and realized it had a completely distinct theme? Maybe you had a two-year stretch where all you did was hustle, study, and secure the bag. Or perhaps you had an era where romance, arts, and glow-ups were your main focus. In Vedic astrology, these distinct life phases are not random. They are ruled by the Vimshottari Dasha system—a highly sophisticated, 120-year planetary timeline that maps out your personal life chapters.`,
    sections: [
      {
        heading: 'What is the Vimshottari Dasha System?',
        body: `While Western astrology relies heavily on transits (where planets are currently moving in the sky), Vedic astrology adds a second, highly personalized layer: the Dasha system.
The word Dasha literally translates to "state of mind" or "period." The Vimshottari Dasha system maps out a 120-year planetary sequence. The planet ruling your life at any given moment acts as the cosmic director, coloring your thoughts, interests, opportunities, and challenges.`
      },
      {
        heading: 'How Your Cosmic Playlist is Structured',
        body: `Your timeline starts based on the exact degree of the Moon at your moment of birth. The Moon's position determines your birth constellation (Nakshatra), which in turn dictates which planet starts the cycle.

The sequence of the planetary eras is always the same: Ketu (7 years) ➔ Venus (20 years) ➔ Sun (6 years) ➔ Moon (10 years) ➔ Mars (7 years) ➔ Rahu (18 years) ➔ Jupiter (16 years) ➔ Saturn (19 years) ➔ Mercury (17 years). How much of the first period you experience at birth depends on how far the Moon had traveled through your birth Nakshatra.`
      },
      {
        heading: 'Unpacking the Major Eras',
        body: `Each planetary period has a unique energetic signature. Let's look at the vibes of the major eras:`,
        list: [
          'The Venus Era (20 years): The ultimate glow-up. This period brings romance, arts, luxury, comfort, and building your aesthetic. You feel like the main character.',
          'The Mars Era (7 years): High energy, ambition, and hustle. A time to build strength, take direct action, start projects, and assert boundaries.',
          'The Saturn Era (19 years): The reality check. Saturn teaches patience, discipline, and hard work. It feels challenging, but it builds the foundation for your lifetime.',
          'The Rahu Era (18 years): The obsession era. Rahu creates sudden changes, ambition, and intense focus on material success. It is full of unexpected shifts.',
          'The Jupiter Era (16 years): Blessings, study, wisdom, and expansions. You feel lucky, attract opportunities, and seek deeper meanings.'
        ]
      }
    ],
    outro: `At OyeAstro, we style your current Dasha era like a Spotify Playlist because it truly represents the underlying soundtrack of your current life chapter. If you are in a Saturn Dasha, the song might be a slow, rhythmic work beat. If you are in a Venus Dasha, it is pure upbeat pop. Check your dashboard to reveal your current active era, view your full lifetime timeline, and see what vibes are queued up next!`
  }
}
