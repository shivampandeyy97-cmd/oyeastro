// All lookup tables for Vedic astrology computation

export const RASHI_NAMES = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
]

export const VEDIC_RASHI_NAMES = [
  'Mesha', 'Vrishabha', 'Mithuna', 'Karka',
  'Simha', 'Kanya', 'Tula', 'Vrischika',
  'Dhanu', 'Makara', 'Kumbha', 'Meena',
]


export const RASHI_SYMBOLS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓']

export const PLANET_CODES = ['Su','Mo','Ma','Me','Ju','Ve','Sa','Ra','Ke','Lagn'] as const
export type PlanetCode = typeof PLANET_CODES[number]

export const PLANET_NAMES: Record<string, string> = {
  Lagn: 'Rising (Lagna)',
  Su: 'Sun (Surya)',
  Mo: 'Moon (Chandra)',
  Ma: 'Mars (Mangal)',
  Me: 'Mercury (Budha)',
  Ju: 'Jupiter (Guru)',
  Ve: 'Venus (Shukra)',
  Sa: 'Saturn (Shani)',
  Ra: 'Rahu (North Node)',
  Ke: 'Ketu (South Node)',
}

// 27 Nakshatras with full data for Ashtakoot
export const NAKSHATRAS = [
  { name: 'Ashwini',           ruler: 'Ke', gana: 'Deva',   nadi: 'Vata',   yoni: 'Horse' },
  { name: 'Bharani',           ruler: 'Ve', gana: 'Manushya', nadi: 'Pitta', yoni: 'Elephant' },
  { name: 'Krittika',          ruler: 'Su', gana: 'Rakshasa', nadi: 'Kapha', yoni: 'Goat' },
  { name: 'Rohini',            ruler: 'Mo', gana: 'Manushya', nadi: 'Kapha', yoni: 'Serpent' },
  { name: 'Mrigashira',        ruler: 'Ma', gana: 'Deva',   nadi: 'Pitta',  yoni: 'Serpent' },
  { name: 'Ardra',             ruler: 'Ra', gana: 'Manushya', nadi: 'Vata',  yoni: 'Dog' },
  { name: 'Punarvasu',         ruler: 'Ju', gana: 'Deva',   nadi: 'Vata',   yoni: 'Cat' },
  { name: 'Pushya',            ruler: 'Sa', gana: 'Deva',   nadi: 'Pitta',  yoni: 'Goat' },
  { name: 'Ashlesha',          ruler: 'Me', gana: 'Rakshasa', nadi: 'Kapha', yoni: 'Cat' },
  { name: 'Magha',             ruler: 'Ke', gana: 'Rakshasa', nadi: 'Kapha', yoni: 'Rat' },
  { name: 'Purva Phalguni',    ruler: 'Ve', gana: 'Manushya', nadi: 'Pitta', yoni: 'Rat' },
  { name: 'Uttara Phalguni',   ruler: 'Su', gana: 'Manushya', nadi: 'Vata',  yoni: 'Cow' },
  { name: 'Hasta',             ruler: 'Mo', gana: 'Deva',   nadi: 'Vata',   yoni: 'Buffalo' },
  { name: 'Chitra',            ruler: 'Ma', gana: 'Rakshasa', nadi: 'Pitta', yoni: 'Tiger' },
  { name: 'Swati',             ruler: 'Ra', gana: 'Deva',   nadi: 'Kapha',  yoni: 'Buffalo' },
  { name: 'Visakha',           ruler: 'Ju', gana: 'Rakshasa', nadi: 'Kapha', yoni: 'Tiger' },
  { name: 'Anuradha',          ruler: 'Sa', gana: 'Deva',   nadi: 'Pitta',  yoni: 'Rabbit' },
  { name: 'Jyeshtha',          ruler: 'Me', gana: 'Rakshasa', nadi: 'Vata',  yoni: 'Rabbit' },
  { name: 'Mula',              ruler: 'Ke', gana: 'Rakshasa', nadi: 'Vata',  yoni: 'Dog' },
  { name: 'Purva Ashadha',     ruler: 'Ve', gana: 'Manushya', nadi: 'Pitta', yoni: 'Monkey' },
  { name: 'Uttara Ashadha',    ruler: 'Su', gana: 'Manushya', nadi: 'Kapha', yoni: 'Mongoose' },
  { name: 'Shravana',          ruler: 'Mo', gana: 'Deva',   nadi: 'Kapha',  yoni: 'Monkey' },
  { name: 'Dhanishta',         ruler: 'Ma', gana: 'Rakshasa', nadi: 'Pitta', yoni: 'Lion' },
  { name: 'Shatabhisha',       ruler: 'Ra', gana: 'Rakshasa', nadi: 'Vata',  yoni: 'Horse' },
  { name: 'Purva Bhadrapada',  ruler: 'Ju', gana: 'Manushya', nadi: 'Vata',  yoni: 'Lion' },
  { name: 'Uttara Bhadrapada', ruler: 'Sa', gana: 'Manushya', nadi: 'Pitta', yoni: 'Cow' },
  { name: 'Revati',            ruler: 'Me', gana: 'Deva',   nadi: 'Kapha',  yoni: 'Elephant' },
]

export const DASHA_SEQUENCE = ['Ke','Ve','Su','Mo','Ma','Ra','Ju','Sa','Me'] as const
export const DASHA_YEARS: Record<string, number> = {
  Ke: 7, Ve: 20, Su: 6, Mo: 10, Ma: 7, Ra: 18, Ju: 16, Sa: 19, Me: 17,
}

// Planet friendship matrix for Graha Maitri kuta
// Values: 2 = friend, 1 = neutral, 0 = enemy
export const PLANET_FRIENDSHIP: Record<string, Record<string, number>> = {
  Su: { Su:1, Mo:2, Ma:2, Me:1, Ju:2, Ve:0, Sa:0, Ra:1, Ke:1 },
  Mo: { Su:2, Mo:1, Ma:1, Me:2, Ju:2, Ve:2, Sa:1, Ra:1, Ke:1 },
  Ma: { Su:2, Mo:1, Ma:1, Me:0, Ju:2, Ve:1, Sa:1, Ra:1, Ke:2 },
  Me: { Su:2, Mo:0, Ma:1, Me:1, Ju:1, Ve:2, Sa:2, Ra:2, Ke:1 },
  Ju: { Su:2, Mo:2, Ma:2, Me:0, Ju:1, Ve:0, Sa:1, Ra:1, Ke:1 },
  Ve: { Su:0, Mo:2, Ma:1, Me:2, Ju:1, Ve:1, Sa:2, Ra:2, Ke:1 },
  Sa: { Su:0, Mo:0, Ma:0, Me:2, Ju:0, Ve:2, Sa:1, Ra:2, Ke:1 },
}

// Rashi lords
export const RASHI_LORDS: Record<number, string> = {
  0:  'Ma', // Aries
  1:  'Ve', // Taurus
  2:  'Me', // Gemini
  3:  'Mo', // Cancer
  4:  'Su', // Leo
  5:  'Me', // Virgo
  6:  'Ve', // Libra
  7:  'Ma', // Scorpio
  8:  'Ju', // Sagittarius
  9:  'Sa', // Capricorn
  10: 'Sa', // Aquarius
  11: 'Ju', // Pisces
}

// Yoni compatibility (pairs that are friendly)
export const YONI_FRIENDLY: Record<string, string[]> = {
  Horse:    ['Horse', 'Deer'],
  Elephant: ['Elephant', 'Lion'],
  Goat:     ['Goat', 'Rat'],
  Serpent:  ['Serpent', 'Mongoose'],
  Dog:      ['Dog', 'Rabbit'],
  Cat:      ['Cat', 'Rat'],
  Rat:      ['Rat', 'Cat', 'Goat'],
  Cow:      ['Cow', 'Tiger', 'Buffalo'],
  Buffalo:  ['Buffalo', 'Cow'],
  Tiger:    ['Tiger', 'Cow'],
  Rabbit:   ['Rabbit', 'Dog', 'Deer'],
  Monkey:   ['Monkey', 'Mongoose'],
  Mongoose: ['Mongoose', 'Monkey'],
  Lion:     ['Lion', 'Elephant'],
  Deer:     ['Deer', 'Horse', 'Rabbit'],
}

// Interpretations (Gen-Z copy)
export const LAGNA_INTERPRETATIONS: Record<number, { tag: string; copy: string }> = {
  0:  { tag: 'Main Character Energy',     copy: 'Aries Rising means you\'re standard main character material. You walk in like you own the block. Low-key impatient, high-key determined.' },
  1:  { tag: 'Comfort & Aesthetics',      copy: 'Taurus Rising means you\'re aesthetic-obsessed, a major foodie, and value coziness above all else. You\'ll spend money on premium comfort without a second thought.' },
  2:  { tag: 'Certified Chatbox',         copy: 'Gemini Rising means your brain has 60 tabs open, all playing audio. You\'re talkative, witty, and low-key love gathering tea.' },
  3:  { tag: 'The Group Guardian',        copy: 'Cancer Rising is protective, emotional, and holds onto memories like collectibles. Soft on the outside, but you will delete anyone who crosses your crew.' },
  4:  { tag: 'Spotlight Magnet',          copy: 'Leo Rising means your aura is golden and you love attention. You\'re generous, hyper-dramatic, and probably take 20 minutes styling your fit.' },
  5:  { tag: 'Anxious Planner',           copy: 'Virgo Rising means you look organized but your brain is actually running 100 mph overthinking everything. You\'re detail-oriented and give great advice.' },
  6:  { tag: 'Aesthetic Pleaser',         copy: 'Libra Rising is all about balance, vibes, and gorgeous color palettes. You hate conflict but struggle with simple decisions like what to eat.' },
  7:  { tag: 'Dark Mystique Vibe',        copy: 'Scorpio Rising gives intense, magnetic energy. You have a built-in lie detector. People either find you intimidating or incredibly alluring.' },
  8:  { tag: 'Zero Filter Explorer',      copy: 'Sagittarius Rising is the chaos-coordinator. You say what you think, love traveling, and have a dark, hilarious sense of humor.' },
  9:  { tag: 'Corporate Baddie',          copy: 'Capricorn Rising gives serious CEO energy. You\'ve had your retirement plan ready since middle school. Sarcastic, ambitious, and super structured.' },
  10: { tag: 'The Resident Rebel',        copy: 'Aquarius Rising is the indie rebel. You march to your own futuristic beat. You love tech, social justice, and being intentionally unique.' },
  11: { tag: 'Dream World Resident',      copy: 'Pisces Rising is pure fantasy and intuition. You absorb other people\'s feelings like a sponge. Creatively gifted, but you definitely daydream all day.' },
}

export const SUN_INTERPRETATIONS: Record<number, string> = {
  0:  'Aries Sun: Passionate, active, gets bored quickly. Born to lead.',
  1:  'Taurus Sun: Stubborn, stable, loves good food and luxury. Hard worker.',
  2:  'Gemini Sun: Quick-witted, loves banter, has a dual personality. Never boring.',
  3:  'Cancer Sun: Intuitive, sensitive, family-first. Protects their inner circle.',
  4:  'Leo Sun: Creative, loyal, and proud. Loves to shine and lift others up.',
  5:  'Virgo Sun: Practical, analytical, highly organized. Loves helping out.',
  6:  'Libra Sun: Flirty, art-loving, appreciates harmony and fair play.',
  7:  'Scorpio Sun: Deep, secret-keeper, highly passionate, intensely loyal.',
  8:  'Sagittarius Sun: Optimist, truth-seeker, loves freedom and adventure.',
  9:  'Capricorn Sun: High discipline, money-minded, builder, dry humor.',
  10: 'Aquarius Sun: Intellectual, eccentric, progressive, values friendship.',
  11: 'Pisces Sun: Dreamer, spiritual, high empathy, artistic soul.',
}

export const MOON_INTERPRETATIONS: Record<number, string> = {
  0:  'Aries Moon: Explodes with emotion but cools down instantly. Impulsive feelings.',
  1:  'Taurus Moon: Feels safest with comfort food, stability, and money in the bank.',
  2:  'Gemini Moon: Needs to talk out their feelings or they\'ll go crazy. Chatty heart.',
  3:  'Cancer Moon: Deeply emotional, psychic instincts, heavily affected by environments.',
  4:  'Leo Moon: Needs to feel appreciated and adored. Generous, warm-hearted emotions.',
  5:  'Virgo Moon: Deals with anxiety by organizing, cleaning, or planning. Practical solver.',
  6:  'Libra Moon: Hates being alone. Craves peace, harmony, and beautiful relationships.',
  7:  'Scorpio Moon: Extremely private feelings, high intensity, takes time to build trust.',
  8:  'Sagittarius Moon: Uses humor to escape heavy emotions. Always seeks the fun side.',
  9:  'Capricorn Moon: Keeps emotions on lockdown. Solves sadness by working harder.',
  10: 'Aquarius Moon: Rationalizes feelings. Prefers being cool, detached, and independent.',
  11: 'Pisces Moon: Highly sensitive, absorbs vibes, gets lost in romantic dreams.',
}

export const DASHA_INTERPRETATIONS: Record<string, { title: string; track: string; copy: string }> = {
  Ke: { title: 'Spiritual Detachment',    track: 'The Spiritual Hermit Era',  copy: 'Ketu is running your life right now. Expect intense self-discovery, spiritual healing, and realizing that half the things you used to care about don\'t matter anymore. A perfect era for mental resets.' },
  Ve: { title: 'Glow-Up & Luxury',        track: 'The Glow-Up Era',           copy: 'Venus is in charge. This is your glow-up era! Expect major wins in romance, aesthetic upgrades, creativity, and treating yourself to the finer things in life. You\'re the main event.' },
  Su: { title: 'Spotlight & Authority',   track: 'The Spotlight Era',         copy: 'The Sun is putting you on center stage. You\'ll gain massive clarity on your career, take on leadership roles, and feel your confidence soar. Don\'t hide from the spotlight.' },
  Mo: { title: 'Deep Feels & Intuition',  track: 'The Intuitive Feels Era',   copy: 'Moon energy is active. You are feeling *all* the feels. You\'ll crave nesting, cozy aesthetics, deep bonding sessions, and exploring your intuition. Hydrate and journal.' },
  Ma: { title: 'Hustle & Assertiveness',  track: 'The Hustle Era',            copy: 'Mars has lit a fire under you. You\'re in high-energy, ambitious hustle mode. Great for starting workouts, launching projects, and aggressively claiming what\'s yours.' },
  Ra: { title: 'Chaotic Ambition',        track: 'The Obsession Era',         copy: 'Rahu is creating obsession and ambition. Expect sudden shifts, unexpected wins, and feeling intensely driven toward big goals. Stay grounded, it\'s a wild ride.' },
  Ju: { title: 'Wealth & Expansion',      track: 'The Blessings Era',         copy: 'Jupiter is showering you with wisdom, good luck, and expansion. Travel, higher studies, and financial success are highly favored. Share the wealth.' },
  Sa: { title: 'Reality Check & Rules',   track: 'The Reality Check Era',     copy: 'Saturn is running a strict academy. You\'re building solid boundaries, learning patience, and working hard. It feels tough, but you are laying down foundations for a lifetime.' },
  Me: { title: 'Side Hustle & Brain',     track: 'The Side Hustle Era',       copy: 'Mercury has activated your communication centers. You are networking like crazy, building side projects, writing, and learning new skills. Your DMs are busy.' },
}

export const ZODIAC_MATCHES: Record<number, { bestie: string; rival: string; copy: string }> = {
  0:  { bestie: 'Leo',         rival: 'Capricorn',  copy: 'Aries: Leo brings that fire banter, while Capricorn is way too serious for your chaos.' },
  1:  { bestie: 'Virgo',       rival: 'Aquarius',   copy: 'Taurus: Virgo shares your gourmet taste, but Aquarius is too unpredictable for your comfort.' },
  2:  { bestie: 'Libra',       rival: 'Scorpio',    copy: 'Gemini: Libra is down for all your midnight talks, but Scorpio gives too much silent treatment.' },
  3:  { bestie: 'Pisces',      rival: 'Aries',      copy: 'Cancer: Pisces understands your deep mood swings, while Aries is too blunt for your feels.' },
  4:  { bestie: 'Sagittarius', rival: 'Taurus',     copy: 'Leo: Sagittarius loves the drama, but Taurus will stubbornly refuse to let you shine.' },
  5:  { bestie: 'Taurus',      rival: 'Gemini',     copy: 'Virgo: Taurus keeps you grounded, but Gemini\'s double-faced texting will exhaust you.' },
  6:  { bestie: 'Aquarius',    rival: 'Cancer',     copy: 'Libra: Aquarius matches your aesthetic vibe, but Cancer is too clingy for your schedule.' },
  7:  { bestie: 'Cancer',      rival: 'Leo',        copy: 'Scorpio: Cancer is loyal to the grave, but Leo\'s constant need for applause triggers you.' },
  8:  { bestie: 'Aries',       rival: 'Virgo',      copy: 'Sagittarius: Aries matches your high-speed adventure, but Virgo\'s critique lists will kill your vibe.' },
  9:  { bestie: 'Scorpio',     rival: 'Libra',      copy: 'Capricorn: Scorpio respects your hustle, but Libra\'s indecision makes you lose your mind.' },
  10: { bestie: 'Gemini',      rival: 'Virgo',      copy: 'Aquarius: Gemini gets your weird theories, but Virgo will try to fix your logic.' },
  11: { bestie: 'Cancer',      rival: 'Sagittarius', copy: 'Pisces: Cancer provides the emotional safety net, but Sagittarius will run away when you cry.' },
}

export const HOROSCOPES: Record<number, string> = {
  0:  'Your boss/teacher is going to try your patience today. Do NOT send that email. Drink iced coffee and stay quiet. ☕️🤐',
  1:  'You will spend money you don\'t have on a sweet treat because \'you deserved it\'. Spoiler: you do deserve it, but your wallet doesn\'t. 🍰💸',
  2:  'You\'ll start 5 new conversations and ghost 4 of them. Your screen time is about to hit double digits. Go touch some grass. 📱🌾',
  3:  'You are taking things personally today. It was just a text without an exclamation mark, bestie. They don\'t hate you. 🥺💬',
  4:  'Someone is going to challenge your main character status today. Stand your ground, but make sure your outfit is fire first. 👑🔥',
  5:  'You are organizing a spreadsheet for something that could have been a post-it note. Take a breath and close some tabs. 📊💆',
  6:  'You will spend 45 minutes deciding what to watch on Netflix and then fall asleep 10 minutes in. Standard Libra behavior. 🍿😴',
  7:  'You are squinting at everyone suspiciously today. Not everyone is plotting against you, but keep your secrets safe anyway. 🕵️‍♂️🔒',
  8:  'You\'ll say something brutally honest and then have to do damage control. Tell them it was your chart\'s fault. 🤷‍♂️🏹',
  9:  'You\'re treating relaxation like a chore. You can\'t schedule \'unwinding time\' on Google Calendar, bestie. Relax. 🗓️🥱',
  10: 'You feel like nobody understands your vision today. That\'s fine, you\'re ahead of your time. Go listen to some indie music. 🎧🌌',
  11: 'You are daydreaming about a fake scenario that will never happen. Wake up, bestie, your iced matcha is getting warm. 🍵💭',
}

export const REMEDIES_DB: Record<number, { stone: string; color: string; mantra: string; tips: string }> = {
  0:  { stone: 'Red Coral',        color: 'Crimson Red',    mantra: 'Om Angarakaya Namaha',        tips: 'Work out or run to channel excess fiery energy.' },
  1:  { stone: 'Opal / Diamond',   color: 'Pastel Pink',    mantra: 'Om Shum Shukraya Namaha',     tips: 'Spend time in nature or baking to ground your senses.' },
  2:  { stone: 'Emerald',          color: 'Emerald Green',  mantra: 'Om Budhaya Namaha',           tips: 'Journal your thoughts to clear your busy mental tabs.' },
  3:  { stone: 'Pearl',            color: 'Silver White',   mantra: 'Om Chandraya Namaha',         tips: 'Practice deep breathing or keep plants in your bedroom.' },
  4:  { stone: 'Ruby',             color: 'Golden Yellow',  mantra: 'Om Suryaya Namaha',           tips: 'Express yourself through art, style, or performance.' },
  5:  { stone: 'Emerald',          color: 'Sage Green',     mantra: 'Om Budhaya Namaha',           tips: 'Declutter your room to calm your anxious mind.' },
  6:  { stone: 'White Sapphire',   color: 'Cream / Beige',  mantra: 'Om Shum Shukraya Namaha',     tips: 'Practice saying \'no\' to keep your energy circles healthy.' },
  7:  { stone: 'Red Coral',        color: 'Blood Red',      mantra: 'Om Bhaumaya Namaha',          tips: 'Release secrets by typing them out and then deleting the file.' },
  8:  { stone: 'Yellow Sapphire',  color: 'Gold Yellow',    mantra: 'Om Gurave Namaha',            tips: 'Learn a new language or read philosophical fiction.' },
  9:  { stone: 'Blue Sapphire',    color: 'Midnight Blue',  mantra: 'Om Sham Shanaishcharaya Namaha', tips: 'Draft routines and stick to a consistent sleep cycle.' },
  10: { stone: 'Blue Sapphire',    color: 'Electric Blue',  mantra: 'Om Sham Shanaishcharaya Namaha', tips: 'Connect with community projects or build side projects.' },
  11: { stone: 'Yellow Sapphire',  color: 'Aqua Green',     mantra: 'Om Gurave Namaha',            tips: 'Limit doomscrolling and paint, draw, or listen to water sounds.' },
}

// Nominatim fallback city DB (same as original, typed)
export const CITIES_DB: Record<string, { lat: number; lon: number; name: string; timezone: string }> = {
  'new york':     { lat: 40.7128, lon: -74.0060, name: 'New York, USA',      timezone: 'America/New_York' },
  'los angeles':  { lat: 34.0522, lon: -118.2437, name: 'Los Angeles, USA',  timezone: 'America/Los_Angeles' },
  'london':       { lat: 51.5074, lon: -0.1278,  name: 'London, UK',         timezone: 'Europe/London' },
  'mumbai':       { lat: 19.0760, lon: 72.8777,  name: 'Mumbai, India',      timezone: 'Asia/Kolkata' },
  'new delhi':    { lat: 28.6139, lon: 77.2090,  name: 'New Delhi, India',   timezone: 'Asia/Kolkata' },
  'delhi':        { lat: 28.6139, lon: 77.2090,  name: 'New Delhi, India',   timezone: 'Asia/Kolkata' },
  'bangalore':    { lat: 12.9716, lon: 77.5946,  name: 'Bangalore, India',   timezone: 'Asia/Kolkata' },
  'bengaluru':    { lat: 12.9716, lon: 77.5946,  name: 'Bengaluru, India',   timezone: 'Asia/Kolkata' },
  'hyderabad':    { lat: 17.3850, lon: 78.4867,  name: 'Hyderabad, India',   timezone: 'Asia/Kolkata' },
  'chennai':      { lat: 13.0827, lon: 80.2707,  name: 'Chennai, India',     timezone: 'Asia/Kolkata' },
  'kolkata':      { lat: 22.5726, lon: 88.3639,  name: 'Kolkata, India',     timezone: 'Asia/Kolkata' },
  'pune':         { lat: 18.5204, lon: 73.8567,  name: 'Pune, India',        timezone: 'Asia/Kolkata' },
  'jaipur':       { lat: 26.9124, lon: 75.7873,  name: 'Jaipur, India',      timezone: 'Asia/Kolkata' },
  'varanasi':     { lat: 25.3176, lon: 82.9739,  name: 'Varanasi, India',    timezone: 'Asia/Kolkata' },
  'sydney':       { lat: -33.8688, lon: 151.2093, name: 'Sydney, Australia', timezone: 'Australia/Sydney' },
  'melbourne':    { lat: -37.8136, lon: 144.9631, name: 'Melbourne, Australia', timezone: 'Australia/Melbourne' },
  'tokyo':        { lat: 35.6762, lon: 139.6503,  name: 'Tokyo, Japan',      timezone: 'Asia/Tokyo' },
  'dubai':        { lat: 25.2048, lon: 55.2708,   name: 'Dubai, UAE',        timezone: 'Asia/Dubai' },
  'toronto':      { lat: 43.6532, lon: -79.3832,  name: 'Toronto, Canada',   timezone: 'America/Toronto' },
  'singapore':    { lat: 1.3521,  lon: 103.8198,  name: 'Singapore',         timezone: 'Asia/Singapore' },
  'paris':        { lat: 48.8566, lon: 2.3522,    name: 'Paris, France',     timezone: 'Europe/Paris' },
  'berlin':       { lat: 52.5200, lon: 13.4050,   name: 'Berlin, Germany',   timezone: 'Europe/Berlin' },
  'moscow':       { lat: 55.7558, lon: 37.6173,   name: 'Moscow, Russia',    timezone: 'Europe/Moscow' },
  'beijing':      { lat: 39.9042, lon: 116.4074,  name: 'Beijing, China',    timezone: 'Asia/Shanghai' },
  'shanghai':     { lat: 31.2304, lon: 121.4737,  name: 'Shanghai, China',   timezone: 'Asia/Shanghai' },
  'karachi':      { lat: 24.8607, lon: 67.0011,   name: 'Karachi, Pakistan', timezone: 'Asia/Karachi' },
  'lahore':       { lat: 31.5497, lon: 74.3436,   name: 'Lahore, Pakistan',  timezone: 'Asia/Karachi' },
  'dhaka':        { lat: 23.8103, lon: 90.4125,   name: 'Dhaka, Bangladesh', timezone: 'Asia/Dhaka' },
  'kathmandu':    { lat: 27.7172, lon: 85.3240,   name: 'Kathmandu, Nepal',  timezone: 'Asia/Kathmandu' },
}
