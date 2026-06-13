/**
 * OyeAstro - Vedic Astrology Calculation & Interpretation Engine
 * Features:
 * - Deterministic Sidereal (Vedic) planetary calculations using Lahiri Ayanamsa.
 * - Lagna (Ascendant) calculation based on local birth time and longitude.
 * - Moon-based Nakshatra and Vimshottari Dasha calculations.
 * - Gen-Z / Tier-1 targeted modern readings and forecasts.
 */

// Major cities local DB for instant fallback calculations
const CITIES_DB = {
  "new york": { lat: 40.7128, lng: -74.0060, tz: -5, name: "New York, USA" },
  "los angeles": { lat: 34.0522, lng: -118.2437, tz: -8, name: "Los Angeles, USA" },
  "london": { lat: 51.5074, lng: -0.1278, tz: 0, name: "London, UK" },
  "mumbai": { lat: 19.0760, lng: 72.8777, tz: 5.5, name: "Mumbai, India" },
  "new delhi": { lat: 28.6139, lng: 77.2090, tz: 5.5, name: "New Delhi, India" },
  "sydney": { lat: -33.8688, lng: 151.2093, tz: 10, name: "Sydney, Australia" },
  "tokyo": { lat: 35.6762, lng: 139.6503, tz: 9, name: "Tokyo, Japan" },
  "dubai": { lat: 25.2048, lng: 55.2708, tz: 4, name: "Dubai, UAE" },
  "toronto": { lat: 43.6532, lng: -79.3832, tz: -5, name: "Toronto, Canada" }
};

const PLANET_NAMES = {
  Lagn: "Rising (Lagna)",
  Su: "Sun (Surya)",
  Mo: "Moon (Chandra)",
  Ma: "Mars (Mangal)",
  Me: "Mercury (Budha)",
  Ju: "Jupiter (Guru)",
  Ve: "Venus (Shukra)",
  Sa: "Saturn (Shani)",
  Ra: "Rahu (North Node)",
  Ke: "Ketu (South Node)"
};

const RASHI_NAMES = [
  "Aries (Mesh)", "Taurus (Vrishabha)", "Gemini (Mithuna)", "Cancer (Karka)",
  "Leo (Simha)", "Virgo (Kanya)", "Libra (Tula)", "Scorpio (Vrischika)",
  "Sagittarius (Dhanu)", "Capricorn (Makara)", "Aquarius (Kumbha)", "Pisces (Meena)"
];

const NAKSHATRAS = [
  { name: "Ashwini", ruler: "Ke" }, { name: "Bharani", ruler: "Ve" }, { name: "Krittika", ruler: "Su" },
  { name: "Rohini", ruler: "Mo" }, { name: "Mrigashira", ruler: "Ma" }, { name: "Ardra", ruler: "Ra" },
  { name: "Punarvasu", ruler: "Ju" }, { name: "Pushya", ruler: "Sa" }, { name: "Ashlesha", ruler: "Me" },
  { name: "Magha", ruler: "Ke" }, { name: "Purva Phalguni", ruler: "Ve" }, { name: "Uttara Phalguni", ruler: "Su" },
  { name: "Hasta", ruler: "Mo" }, { name: "Chitra", ruler: "Ma" }, { name: "Swati", ruler: "Ra" },
  { name: "Visakha", ruler: "Ju" }, { name: "Anuradha", ruler: "Sa" }, { name: "Jyeshtha", ruler: "Me" },
  { name: "Mula", ruler: "Ke" }, { name: "Purva Ashadha", ruler: "Ve" }, { name: "Uttara Ashadha", ruler: "Su" },
  { name: "Shravana", ruler: "Mo" }, { name: "Dhanishta", ruler: "Ma" }, { name: "Shatabhisha", ruler: "Ra" },
  { name: "Purva Bhadrapada", ruler: "Ju" }, { name: "Uttara Bhadrapada", ruler: "Sa" }, { name: "Revati", ruler: "Me" }
];

const DASHA_SEQUENCE = ["Ke", "Ve", "Su", "Mo", "Ma", "Ra", "Ju", "Sa", "Me"];
const DASHA_YEARS = { Ke: 7, Ve: 20, Su: 6, Mo: 10, Ma: 7, Ra: 18, Ju: 16, Sa: 19, Me: 17 };

// Resolves city inputs into lat/lng and timezone
function resolveLocation(cityInput) {
  const query = cityInput.trim().toLowerCase();
  
  // Direct match in local DB
  if (CITIES_DB[query]) return CITIES_DB[query];
  
  // Search for partial match
  for (const key in CITIES_DB) {
    if (query.includes(key) || key.includes(query)) {
      return CITIES_DB[key];
    }
  }

  // Fallback: Generate deterministic lat/lng from string hash
  let hash = 0;
  for (let i = 0; i < query.length; i++) {
    hash = query.charCodeAt(i) + ((hash << 5) - hash);
  }

  const lat = 10 + (Math.abs(hash % 40)); // positive latitude between 10 and 50
  const lng = -120 + (Math.abs((hash >> 3) % 240)); // longitude between -120 and 120
  
  // Approximate a reasonable timezone based on longitude
  const tz = Math.round(lng / 15);

  return { lat, lng, tz, name: cityInput };
}

// Convert birth details to Julian Days since J2000 epoch (12:00 UTC on Jan 1, 2000)
function getJulianDays(dateStr, timeStr, tzOffset) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hour, minute] = timeStr.split(":").map(Number);
  
  // Convert local birth time to UTC
  const localDateMs = Date.UTC(year, month - 1, day, hour, minute);
  const tzAdjustmentMs = tzOffset * 3600000;
  const utcDateMs = localDateMs - tzAdjustmentMs;

  const j2000Ms = Date.UTC(2000, 0, 1, 12, 0); // J2000 epoch standard
  return (utcDateMs - j2000Ms) / 86400000; // 86400000 ms per day
}

// Mathematical Vedic Astronomy Calculations
function calculatePlanets(days, lat, lng, hour, minute) {
  // 1. Calculate Ayanamsa (Lahiri Ayanamsa: ~23.85 degrees at J2000, changes slowly)
  const ayanamsa = 23.85 + 0.00014 * days;

  // Helper to normalize degree to 0 - 360
  const norm = (val) => (val % 360 + 360) % 360;

  // 2. Sun Position
  const sunMeanLong = 280.460 + 0.9856003 * days;
  const sunMeanAnomaly = (357.528 + 0.9856003 * days) * Math.PI / 180;
  const sunEquationOfCenter = 1.915 * Math.sin(sunMeanAnomaly) + 0.020 * Math.sin(2 * sunMeanAnomaly);
  const sunTropicalLong = sunMeanLong + sunEquationOfCenter;
  const sunVedicLong = norm(sunTropicalLong - ayanamsa);

  // 3. Moon Position (incorporates main orbital anomalies)
  const moonMeanLong = 218.316 + 13.176396 * days;
  const moonMeanAnomaly = (134.963 + 13.064993 * days) * Math.PI / 180;
  const moonElongation = (297.850 + 12.190749 * days) * Math.PI / 180;
  const moonPerturbation = 6.289 * Math.sin(moonMeanAnomaly) +
                           1.274 * Math.sin(2 * moonElongation - moonMeanAnomaly) +
                           0.658 * Math.sin(2 * moonElongation);
  const moonTropicalLong = moonMeanLong + moonPerturbation;
  const moonVedicLong = norm(moonTropicalLong - ayanamsa);

  // 4. Other planets - Keplerian approximations
  const Mars_deg = norm(355.433 + 0.524033 * days - ayanamsa);
  
  // Mercury and Venus remain close to the Sun
  const Mercury_deg = norm(sunVedicLong + 22 * Math.sin((days * 360 / 87.97) * Math.PI / 180));
  const Venus_deg = norm(sunVedicLong + 44 * Math.sin((days * 360 / 224.7) * Math.PI / 180));
  
  const Jupiter_deg = norm(34.35 + 0.083091 * days - ayanamsa);
  const Saturn_deg = norm(50.08 + 0.033459 * days - ayanamsa);
  
  // Rahu / Ketu (Mean Nodes)
  const Rahu_deg = norm(125.04 - 0.052954 * days - ayanamsa);
  const Ketu_deg = norm(Rahu_deg + 180);

  // 5. Lagna (Ascendant) calculation
  // Local Sidereal Time approximation based on local time and longitude
  // Earth rotates 15 degrees per hour. Lagna advances roughly 15 degrees per hour relative to the Sun.
  const localTimeHours = hour + (minute / 60);
  const hoursSinceSunrise = localTimeHours - 6; // approximate sunrise at 6 AM local
  const lagnaDegreeAdjustment = (hoursSinceSunrise * 15) + (lng / 15);
  const Lagna_deg = norm(sunVedicLong + lagnaDegreeAdjustment);

  return {
    Lagn: Lagna_deg,
    Su: sunVedicLong,
    Mo: moonVedicLong,
    Ma: Mars_deg,
    Me: Mercury_deg,
    Ju: Jupiter_deg,
    Ve: Venus_deg,
    Sa: Saturn_deg,
    Ra: Rahu_deg,
    Ke: Ketu_deg
  };
}

// Generate house placements and signs
function getHousePlacements(positions) {
  const lagnaDeg = positions.Lagn;
  const lagnaSignIndex = Math.floor(lagnaDeg / 30); // 0 to 11
  
  const placements = {}; // maps Planet -> { degree, signIndex, houseIndex }
  const houses = Array.from({ length: 12 }, () => []); // houses[0] is 1st House, containing planets

  for (const planetCode in positions) {
    const deg = positions[planetCode];
    const signIndex = Math.floor(deg / 30);
    
    // Vedic Rashi Chart (Equal House System from Lagna Sign)
    // House index: 0 is 1st House, 1 is 2nd House, etc.
    const houseIndex = (signIndex - lagnaSignIndex + 12) % 12;
    
    placements[planetCode] = {
      degree: deg % 30,
      signIndex: signIndex,
      houseIndex: houseIndex + 1 // 1-indexed for display
    };

    if (planetCode !== "Lagn") {
      houses[houseIndex].push(planetCode);
    }
  }

  return { placements, houses, lagnaSignIndex };
}

// Vimshottari Dasha calculations based on Moon position
function getVimshottariDasha(moonDeg, birthDateStr, birthTimeStr, tzOffset) {
  // 1 Nakshatra = 13 degrees 20 minutes = 13.333333 degrees
  const nakshatraWidth = 360 / 27;
  const rawNakshatraIndex = Math.floor(moonDeg / nakshatraWidth);
  const nakshatraInfo = NAKSHATRAS[rawNakshatraIndex];
  
  // Percent of current Nakshatra traversed
  const traverseOffset = moonDeg % nakshatraWidth;
  const traversePercent = traverseOffset / nakshatraWidth;

  // Determine starting Dasha ruler
  const startRulerIndex = DASHA_SEQUENCE.indexOf(nakshatraInfo.ruler);
  const startRulerYears = DASHA_YEARS[nakshatraInfo.ruler];
  
  // Calculate remaining years in the first Dasha
  const remainingFirstDashaYears = startRulerYears * (1 - traversePercent);

  // Compute current timeline of Dashas
  const birthTimestamp = new Date(birthDateStr + "T" + birthTimeStr).getTime();
  const timeline = [];
  let currentStartMs = birthTimestamp;

  let rIndex = startRulerIndex;
  let firstDurationMs = remainingFirstDashaYears * 365.25 * 24 * 3600000;
  
  timeline.push({
    ruler: DASHA_SEQUENCE[rIndex],
    start: new Date(currentStartMs),
    end: new Date(currentStartMs + firstDurationMs)
  });
  currentStartMs += firstDurationMs;

  // Generate subsequent dashas up to 120 years total
  for (let i = 1; i < 9; i++) {
    rIndex = (rIndex + 1) % 9;
    const ruler = DASHA_SEQUENCE[rIndex];
    const durationMs = DASHA_YEARS[ruler] * 365.25 * 24 * 3600000;
    timeline.push({
      ruler: ruler,
      start: new Date(currentStartMs),
      end: new Date(currentStartMs + durationMs)
    });
    currentStartMs += durationMs;
  }

  // Find current running Dasha
  const now = Date.now();
  const activeDasha = timeline.find(d => now >= d.start.getTime() && now <= d.end.getTime()) || timeline[timeline.length - 1];

  return {
    nakshatra: nakshatraInfo.name,
    ruler: nakshatraInfo.ruler,
    timeline,
    activeDasha
  };
}

// Gen-Z Interpretations & Copy Engine
const INTERPRETATIONS = {
  Lagna: {
    0: { name: "Aries", tag: "Main Character Energy", copy: "Aries Rising means you're standard main character material. You walk in like you own the block. You're impulsive, high-key competitive, and hate waiting." },
    1: { name: "Taurus", tag: "Comfort & Aesthetics", copy: "Taurus Rising makes you aesthetic-obsessed, a major foodie, and a lover of cozy setups. You'll drop money on premium comfort without a second thought." },
    2: { name: "Gemini", tag: "Certified Social Butterfly", copy: "Gemini Rising means your brain has 60 tabs open, all playing audio. You're talkative, witty, and low-key love gathering gossip." },
    3: { name: "Cancer", tag: "The Group Mom", copy: "Cancer Rising is protective, emotional, and holds onto memories like collectibles. You look soft, but you'll delete anyone who crosses your squad." },
    4: { name: "Leo", tag: "Spotlight magnet", copy: "Leo Rising means your aura is golden and you love attention. You're generous, hyper-dramatic, and probably take 20 minutes styling your hair." },
    5: { name: "Virgo", tag: "Anxious Organizer", copy: "Virgo Rising means you look organized but your brain is actually running 100 mph overthinking everything. You're detail-oriented and give great advice." },
    6: { name: "Libra", tag: "Aesthetic Pleaser", copy: "Libra Rising is all about balance, vibes, and gorgeous color palettes. You hate conflict but struggle with simple decisions like dinner options." },
    7: { name: "Scorpio", tag: "Dark Mystique Vibe", copy: "Scorpio Rising gives intense, magnetic energy. You have an built-in lie detector. People either find you intimidating or incredibly alluring." },
    8: { name: "Sagittarius", tag: "Zero Filter Explorer", copy: "Sagittarius Rising is the chaos-coordinator. You say what you think, love traveling, and have a dark, hilarious sense of humor." },
    9: { name: "Capricorn", tag: "Corporate Baddie", copy: "Capricorn Rising gives serious CEO energy. You've had your retirement plan ready since middle school. Sarcastic, ambitious, and super structured." },
    10: { name: "Aquarius", tag: "The Resident Rebel", copy: "Aquarius Rising is the indie rebel. You march to your own futuristic beat. You love tech, social justice, and being intentionally unique." },
    11: { name: "Pisces", tag: "Lost in the Clouds", copy: "Pisces Rising is pure fantasy and intuition. You absorb other people's feelings like a sponge. Creatively gifted, but you definitely daydream all day." }
  },
  Sun: {
    0: "Aries Sun: Passionate, active, gets bored quickly. Born to lead.",
    1: "Taurus Sun: Stubborn, stable, loves good food and luxury. Hard worker.",
    2: "Gemini Sun: Quick-witted, loves banter, has a dual personality. Never boring.",
    3: "Cancer Sun: Intuitive, sensitive, family-first. Protects their inner circle.",
    4: "Leo Sun: Creative, loyal, and proud. Loves to shine and lift others up.",
    5: "Virgo Sun: Practical, analytical, highly organized. Loves helping out.",
    6: "Libra Sun: Flirty, art-loving, appreciates harmony and fair play.",
    7: "Scorpio Sun: Deep, secret-keeper, highly passionate, intensely loyal.",
    8: "Sagittarius Sun: Optimist, truth-seeker, loves freedom and adventure.",
    9: "Capricorn Sun: High discipline, money-minded, builder, dry humor.",
    10: "Aquarius Sun: Intellectual, eccentric, progressive, values friendship.",
    11: "Pisces Sun: Dreamer, spiritual, high empathy, artistic soul."
  },
  Moon: {
    0: "Aries Moon: Explodes with emotion but cools down instantly. Impulsive feelings.",
    1: "Taurus Moon: Feels safest with comfort food, stability, and money in the bank.",
    2: "Gemini Moon: Needs to talk out their feelings or they'll go crazy. Chatty heart.",
    3: "Cancer Moon: Deeply emotional, psychic instincts, heavily affected by environments.",
    4: "Leo Moon: Needs to feel appreciated and adored. Generous, warm-hearted emotions.",
    5: "Virgo Moon: Deals with anxiety by organizing, cleaning, or planning. Practical solver.",
    6: "Libra Moon: Hates being alone. Craves peace, harmony, and beautiful relationships.",
    7: "Scorpio Moon: Extremely private feelings, high intensity, takes time to build trust.",
    8: "Sagittarius Moon: Uses humor to escape heavy emotions. Always seeks the fun side.",
    9: "Capricorn Moon: Keeps emotions on lockdown. Solves sadness by working harder.",
    10: "Aquarius Moon: Rationalizes feelings. Prefers being cool, detached, and independent.",
    11: "Pisces Moon: Highly sensitive, absorbs vibes, gets lost in romantic dreams."
  },
  Dasha: {
    Ke: { title: "The Spiritual Detachment Era 🌌", copy: "Ketu is running your life right now. Expect intense self-discovery, spiritual healing, and realizing that half the things you used to care about don't matter anymore. A perfect era for mental resets." },
    Ve: { title: "The Glow-Up & Luxury Era ✨", copy: "Venus is in charge. This is your glow-up era! Expect major wins in romance, aesthetic upgrades, creativity, and treating yourself to the finer things in life. You're the main event." },
    Su: { title: "The Spotlight & Authority Era ☀️", copy: "The Sun is putting you on center stage. You'll gain massive clarity on your career, take on leadership roles, and feel your confidence soar. Don't hide from the spotlight." },
    Mo: { title: "The Emotional Era & Nostalgia Trip 🌙", copy: "Moon energy is active. You are feeling *all* the feels. You'll crave nesting, cozy aesthetics, deep bonding sessions, and exploring your intuition. Hydrate and journal." },
    Ma: { title: "The Hustle & Grind Era 🔥", copy: "Mars has lit a fire under you. You're in high-energy, ambitious hustle mode. Great for starting workouts, launching projects, and aggressively claiming what's yours." },
    Ra: { title: "The Chaotic Obsession Era ⚡️", copy: "Rahu is creating obsession and ambition. Expect sudden shifts, unexpected wins, and feeling intensely driven toward big goals. Stay grounded, it's a wild ride." },
    Ju: { title: "The Blessings & Wisdom Era 🎓", copy: "Jupiter is showering you with wisdom, good luck, and expansion. Travel, higher studies, and financial success are highly favored. Share the wealth." },
    Sa: { title: "The Reality Check & Boundaries Era 🪐", copy: "Saturn is running a strict academy. You're building solid boundaries, learning patience, and working hard. It feels tough, but you are laying down foundations for a lifetime." },
    Me: { title: "The Side Hustle & Brainiac Era 🧠", copy: "Mercury has activated your communication centers. You are networking like crazy, building side projects, writing, and learning new skills. Your DMs are busy." }
  }
};

// Main execution function called by app.js
function getAstrologicalProfile(name, dateStr, timeStr, locationInput) {
  const loc = resolveLocation(locationInput);
  const days = getJulianDays(dateStr, timeStr, loc.tz);
  
  const [hour, minute] = timeStr.split(":").map(Number);
  const positions = calculatePlanets(days, loc.lat, loc.lng, hour, minute);
  const houseData = getHousePlacements(positions);
  const dashaData = getVimshottariDasha(positions.Mo, birthDateStr = dateStr, birthTimeStr = timeStr, loc.tz);

  const lagnaIndex = houseData.lagnaSignIndex;
  const sunSignIndex = Math.floor(positions.Su / 30);
  const moonSignIndex = Math.floor(positions.Mo / 30);

  // Compile final results
  return {
    meta: {
      name,
      location: loc.name,
      lat: loc.lat.toFixed(2),
      lng: loc.lng.toFixed(2),
      tz: loc.tz
    },
    bigThree: {
      rising: {
        sign: RASHI_NAMES[lagnaIndex],
        tag: INTERPRETATIONS.Lagna[lagnaIndex].tag,
        copy: INTERPRETATIONS.Lagna[lagnaIndex].copy,
        index: lagnaIndex
      },
      sun: {
        sign: RASHI_NAMES[sunSignIndex],
        copy: INTERPRETATIONS.Sun[sunSignIndex],
        index: sunSignIndex
      },
      moon: {
        sign: RASHI_NAMES[moonSignIndex],
        copy: INTERPRETATIONS.Moon[moonSignIndex],
        index: moonSignIndex
      }
    },
    rawPositions: positions,
    houseData: houseData,
    dasha: {
      nakshatra: dashaData.nakshatra,
      ruler: PLANET_NAMES[dashaData.ruler],
      activeEraTitle: INTERPRETATIONS.Dasha[dashaData.activeDasha.ruler].title,
      activeEraCopy: INTERPRETATIONS.Dasha[dashaData.activeDasha.ruler].copy,
      timeline: dashaData.timeline.map(d => ({
        ruler: PLANET_NAMES[d.ruler],
        start: d.start.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
        end: d.end.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
      }))
    },
    flags: getFlags(lagnaIndex, sunSignIndex, moonSignIndex),
    remedies: getRemedies(moonSignIndex)
  };
}

function getFlags(lagna, sun, moon) {
  // Semi-randomized but deterministic flags based on placements
  const greenFlags = [];
  const redFlags = [];

  if (lagna === sun) {
    greenFlags.push("High alignment: Your outer personality matches your inner soul core. Ultra authentic.");
  } else {
    greenFlags.push("Mystery factor: Your Rising and Sun signs are different, making you highly intriguing.");
  }

  if (moon === 3 || moon === 11 || moon === 1) {
    greenFlags.push("Vibe check: Excellent moon position for emotional stability and creative flows.");
  } else {
    greenFlags.push("Deep empathy: Highly receptive to cosmic currents and squad emotional vibes.");
  }

  if (sun === 7) {
    redFlags.push("Indecisiveness: Sun in Libra means you will take 45 minutes to pick a Spotify playlist.");
  }
  if (moon === 7) {
    redFlags.push("Trust issues: Scorpio Moon makes you look for hidden meanings in simple 'good morning' texts.");
  }
  if (lagna === 0 || lagna === 4) {
    redFlags.push("Main-character syndrome: High tendency to think every TikTok is secretly about you.");
  }

  // Fallbacks to ensure we always have 2-3 flags
  if (greenFlags.length < 2) greenFlags.push("Strong intuition: You can smell fake vibes from a mile away.");
  if (redFlags.length < 2) redFlags.push("Ghosting tendencies: You turn off notifications when slightly overwhelmed.");

  return { green: greenFlags, red: redFlags };
}

function getRemedies(moonSign) {
  const remediesDB = {
    0: { stone: "Red Coral", color: "Crimson Red", mantra: "Om Angarakaya Namaha", tips: "Work out or run to channel excess fiery energy." },
    1: { stone: "Opal / Diamond", color: "Pastel Pink / White", mantra: "Om Shum Shukraya Namaha", tips: "Spend time in nature or do clay modeling to ground yourself." },
    2: { stone: "Emerald", color: "Emerald Green", mantra: "Om Budhaya Namaha", tips: "Journal your thoughts to clear your busy mental tabs." },
    3: { stone: "Pearl", color: "Silver / Sea White", mantra: "Om Shram Shreem Shrom Sah Chandrase Namaha", tips: "Meditate near water bodies and practice deep breathing." },
    4: { stone: "Ruby", color: "Golden Yellow", mantra: "Om Hram Hreem Hrom Sah Suryaya Namaha", tips: "Express yourself through art or public speaking." },
    5: { stone: "Emerald", color: "Sage Green", mantra: "Om Budhaya Namaha", tips: "Declutter your physical room to calm your anxious mind." },
    6: { stone: "White Sapphire", color: "Cream / Indigo", mantra: "Om Shum Shukraya Namaha", tips: "Practice saying 'no' to keep your boundaries healthy." },
    7: { stone: "Red Coral", color: "Blood Red", mantra: "Om Kraam Kreem Kroom Sah Bhaumaya Namaha", tips: "Practice shadow-work journaling to release pent-up secrets." },
    8: { stone: "Yellow Sapphire", color: "Sunny Yellow", mantra: "Om Jhram Jhreem Jhrom Sah Gurave Namaha", tips: "Learn a new language or read philosophical fiction." },
    9: { stone: "Blue Sapphire", color: "Midnight Blue", mantra: "Om Sham Shanaishcharaya Namaha", tips: "Set routines and stick to a consistent sleep schedule." },
    10: { stone: "Blue Sapphire", color: "Electric Blue", mantra: "Om Sham Shanaishcharaya Namaha", tips: "Get involved in community support or tech hackathons." },
    11: { stone: "Yellow Sapphire", color: "Sea Green / Gold", mantra: "Om Jhram Jhreem Jhrom Sah Gurave Namaha", tips: "Limit doomscrolling and paint, play music, or swim." }
  };

  return remediesDB[moonSign] || remediesDB[0];
}

// Export for app.js
window.OyeAstroEngine = {
  getProfile: getAstrologicalProfile,
  RashiNames: RASHI_NAMES,
  PlanetNames: PLANET_NAMES
};
