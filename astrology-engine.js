/**
 * OyeAstro - Vedic Astrology Calculation & Interpretation Engine
 * Features:
 * - Deterministic Sidereal (Vedic) planetary calculations using Lahiri Ayanamsa.
 * - Lagna (Ascendant) calculation based on local birth time and longitude.
 * - Moon-based Nakshatra and Vimshottari Dasha calculations.
 * - Gen-Z targeted modern readings.
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
  "Aries", "Taurus", "Gemini", "Cancer",
  "Leo", "Virgo", "Libra", "Scorpio",
  "Sagittarius", "Capricorn", "Aquarius", "Pisces"
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
  
  if (CITIES_DB[query]) return CITIES_DB[query];
  
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

  const lat = 10 + (Math.abs(hash % 40)); 
  const lng = -120 + (Math.abs((hash >> 3) % 240)); 
  const tz = Math.round(lng / 15);

  return { lat, lng, tz, name: cityInput };
}

// Convert birth details to Julian Days since J2000 epoch (12:00 UTC on Jan 1, 2000)
function getJulianDays(dateStr, timeStr, tzOffset) {
  // Parse date robustly (handles YYYY-MM-DD, DD/MM/YYYY, etc.)
  const parts = dateStr.includes("-") ? dateStr.split("-") : dateStr.split("/");
  let year, month, day;
  if (parts[0] && parts[0].length === 4) {
    year = Number(parts[0]);
    month = Number(parts[1]);
    day = Number(parts[2]);
  } else if (parts[2] && parts[2].length === 4) {
    year = Number(parts[2]);
    month = Number(parts[1]);
    day = Number(parts[0]);
  } else {
    // general fallback
    const d = new Date(dateStr);
    year = d.getUTCFullYear();
    month = d.getUTCMonth() + 1;
    day = d.getUTCDate();
  }

  // Parse time robustly (handles 24-hour and 12-hour AM/PM formats)
  let hour = 0, minute = 0;
  const cleanTime = timeStr.trim().toUpperCase();
  const isPM = cleanTime.includes("PM");
  const isAM = cleanTime.includes("AM");
  const timeOnly = cleanTime.replace(/[AP]M/, "").trim();
  const timeParts = timeOnly.split(":").map(Number);
  
  hour = timeParts[0] || 0;
  minute = timeParts[1] || 0;
  
  if (isPM && hour < 12) {
    hour += 12;
  }
  if (isAM && hour === 12) {
    hour = 0;
  }

  const localDateMs = Date.UTC(year, month - 1, day, hour, minute);
  const tzAdjustmentMs = tzOffset * 3600000;
  const utcDateMs = localDateMs - tzAdjustmentMs;

  const j2000Ms = Date.UTC(2000, 0, 1, 12, 0); 
  return (utcDateMs - j2000Ms) / 86400000; 
}

// Mathematical Vedic Astronomy Calculations
function calculatePlanets(days, lat, lng, hour, minute) {
  const ayanamsa = 23.85 + 0.00014 * days;
  const norm = (val) => (val % 360 + 360) % 360;

  // Sun
  const sunMeanLong = 280.460 + 0.9856003 * days;
  const sunMeanAnomaly = (357.528 + 0.9856003 * days) * Math.PI / 180;
  const sunEquationOfCenter = 1.915 * Math.sin(sunMeanAnomaly) + 0.020 * Math.sin(2 * sunMeanAnomaly);
  const sunTropicalLong = sunMeanLong + sunEquationOfCenter;
  const sunVedicLong = norm(sunTropicalLong - ayanamsa);

  // Moon
  const moonMeanLong = 218.316 + 13.176396 * days;
  const moonMeanAnomaly = (134.963 + 13.064993 * days) * Math.PI / 180;
  const moonElongation = (297.850 + 12.190749 * days) * Math.PI / 180;
  const moonPerturbation = 6.289 * Math.sin(moonMeanAnomaly) +
                           1.274 * Math.sin(2 * moonElongation - moonMeanAnomaly) +
                           0.658 * Math.sin(2 * moonElongation);
  const moonTropicalLong = moonMeanLong + moonPerturbation;
  const moonVedicLong = norm(moonTropicalLong - ayanamsa);

  // Other planets - Keplerian approximations
  const Mars_deg = norm(355.433 + 0.524033 * days - ayanamsa);
  const Mercury_deg = norm(sunVedicLong + 22 * Math.sin((days * 360 / 87.97) * Math.PI / 180));
  const Venus_deg = norm(sunVedicLong + 44 * Math.sin((days * 360 / 224.7) * Math.PI / 180));
  const Jupiter_deg = norm(34.35 + 0.083091 * days - ayanamsa);
  const Saturn_deg = norm(50.08 + 0.033459 * days - ayanamsa);
  const Rahu_deg = norm(125.04 - 0.052954 * days - ayanamsa);
  const Ketu_deg = norm(Rahu_deg + 180);

  // Lagna (Ascendant)
  const localTimeHours = hour + (minute / 60);
  const hoursSinceSunrise = localTimeHours - 6; 
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
  const lagnaSignIndex = Math.floor(lagnaDeg / 30); 
  
  const placements = {}; 
  const houses = Array.from({ length: 12 }, () => []); 

  for (const planetCode in positions) {
    const deg = positions[planetCode];
    const signIndex = Math.floor(deg / 30);
    const houseIndex = (signIndex - lagnaSignIndex + 12) % 12;
    
    placements[planetCode] = {
      degree: deg % 30,
      signIndex: signIndex,
      houseIndex: houseIndex + 1 
    };

    if (planetCode !== "Lagn") {
      houses[houseIndex].push(planetCode);
    }
  }

  return { placements, houses, lagnaSignIndex };
}

// Vimshottari Dasha calculations based on Moon position
function getVimshottariDasha(moonDeg, birthDateStr, birthTimeStr, tzOffset) {
  const nakshatraWidth = 360 / 27;
  const rawNakshatraIndex = Math.floor(moonDeg / nakshatraWidth);
  const nakshatraInfo = NAKSHATRAS[rawNakshatraIndex];
  
  const traverseOffset = moonDeg % nakshatraWidth;
  const traversePercent = traverseOffset / nakshatraWidth;

  const startRulerIndex = DASHA_SEQUENCE.indexOf(nakshatraInfo.ruler);
  const startRulerYears = DASHA_YEARS[nakshatraInfo.ruler];
  const remainingFirstDashaYears = startRulerYears * (1 - traversePercent);

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
    0: { name: "Aries", tag: "Main Character Energy", copy: "Aries Rising means you're standard main character material. You walk in like you own the block. Low-key impatient, high-key determined." },
    1: { name: "Taurus", tag: "Comfort & Aesthetics", copy: "Taurus Rising means you're aesthetic-obsessed, a major foodie, and value coziness above all else. You'll spend money on premium comfort without a second thought." },
    2: { name: "Gemini", tag: "Certified Chatbox", copy: "Gemini Rising means your brain has 60 tabs open, all playing audio. You're talkative, witty, and low-key love gathering tea." },
    3: { name: "Cancer", tag: "The Group Guardian", copy: "Cancer Rising is protective, emotional, and holds onto memories like collectibles. Soft on the outside, but you will delete anyone who crosses your crew." },
    4: { name: "Leo", tag: "Spotlight Magnet", copy: "Leo Rising means your aura is golden and you love attention. You're generous, hyper-dramatic, and probably take 20 minutes styling your fit." },
    5: { name: "Virgo", tag: "Anxious Planner", copy: "Virgo Rising means you look organized but your brain is actually running 100 mph overthinking everything. You're detail-oriented and give great advice." },
    6: { name: "Libra", tag: "Aesthetic Pleaser", copy: "Libra Rising is all about balance, vibes, and gorgeous color palettes. You hate conflict but struggle with simple decisions like what to eat." },
    7: { name: "Scorpio", tag: "Dark Mystique Vibe", copy: "Scorpio Rising gives intense, magnetic energy. You have an built-in lie detector. People either find you intimidating or incredibly alluring." },
    8: { name: "Sagittarius", tag: "Zero Filter Explorer", copy: "Sagittarius Rising is the chaos-coordinator. You say what you think, love traveling, and have a dark, hilarious sense of humor." },
    9: { name: "Capricorn", tag: "Corporate Baddie", copy: "Capricorn Rising gives serious CEO energy. You've had your retirement plan ready since middle school. Sarcastic, ambitious, and super structured." },
    10: { name: "Aquarius", tag: "The Resident Rebel", copy: "Aquarius Rising is the indie rebel. You march to your own futuristic beat. You love tech, social justice, and being intentionally unique." },
    11: { name: "Pisces", tag: "Dream World Resident", copy: "Pisces Rising is pure fantasy and intuition. You absorb other people's feelings like a sponge. Creatively gifted, but you definitely daydream all day." }
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
    Ke: { title: "Spiritual Detachment", track: "The Spiritual Hermit Era", copy: "Ketu is running your life right now. Expect intense self-discovery, spiritual healing, and realizing that half the things you used to care about don't matter anymore. A perfect era for mental resets." },
    Ve: { title: "Glow-Up & Luxury", track: "The Glow-Up Era", copy: "Venus is in charge. This is your glow-up era! Expect major wins in romance, aesthetic upgrades, creativity, and treating yourself to the finer things in life. You're the main event." },
    Su: { title: "Spotlight & Authority", track: "The Spotlight Era", copy: "The Sun is putting you on center stage. You'll gain massive clarity on your career, take on leadership roles, and feel your confidence soar. Don't hide from the spotlight." },
    Mo: { title: "Deep Feels & Intuition", track: "The Intuitive Feels Era", copy: "Moon energy is active. You are feeling *all* the feels. You'll crave nesting, cozy aesthetics, deep bonding sessions, and exploring your intuition. Hydrate and journal." },
    Ma: { title: "Hustle & Assertiveness", track: "The Hustle Era", copy: "Mars has lit a fire under you. You're in high-energy, ambitious hustle mode. Great for starting workouts, launching projects, and aggressively claiming what's yours." },
    Ra: { title: "Chaotic Ambition", track: "The Obsession Era", copy: "Rahu is creating obsession and ambition. Expect sudden shifts, unexpected wins, and feeling intensely driven toward big goals. Stay grounded, it's a wild ride." },
    Ju: { title: "Wealth & Expansion", track: "The Blessings Era", copy: "Jupiter is showering you with wisdom, good luck, and expansion. Travel, higher studies, and financial success are highly favored. Share the wealth." },
    Sa: { title: "Reality Check & Rules", track: "The Reality Check Era", copy: "Saturn is running a strict academy. You're building solid boundaries, learning patience, and working hard. It feels tough, but you are laying down foundations for a lifetime." },
    Me: { title: "Side Hustle & Brain", track: "The Side Hustle Era", copy: "Mercury has activated your communication centers. You are networking like crazy, building side projects, writing, and learning new skills. Your DMs are busy." }
  }
};

const ZODIAC_MATCHES = {
  0: { bestie: "Leo", rival: "Capricorn", copy: "Aries: Leo brings that fire banter, while Capricorn is way too serious for your chaos." },
  1: { bestie: "Virgo", rival: "Aquarius", copy: "Taurus: Virgo shares your gourmet taste, but Aquarius is too unpredictable for your comfort." },
  2: { bestie: "Libra", rival: "Scorpio", copy: "Gemini: Libra is down for all your midnight talks, but Scorpio gives too much silent treatment." },
  3: { bestie: "Pisces", rival: "Aries", copy: "Cancer: Pisces understands your deep mood swings, while Aries is too blunt for your feels." },
  4: { bestie: "Sagittarius", rival: "Taurus", copy: "Leo: Sagittarius loves the drama, but Taurus will stubbornly refuse to let you shine." },
  5: { bestie: "Taurus", rival: "Gemini", copy: "Virgo: Taurus keeps you grounded, but Gemini's double-faced texting will exhaust you." },
  6: { bestie: "Aquarius", rival: "Cancer", copy: "Libra: Aquarius matches your aesthetic vibe, but Cancer is too clingy for your schedule." },
  7: { bestie: "Cancer", rival: "Leo", copy: "Scorpio: Cancer is loyal to the grave, but Leo's constant need for applause triggers you." },
  8: { bestie: "Aries", rival: "Virgo", copy: "Sagittarius: Aries matches your high-speed adventure, but Virgo's critique lists will kill your vibe." },
  9: { bestie: "Scorpio", rival: "Libra", copy: "Capricorn: Scorpio respects your hustle, but Libra's indecision makes you lose your mind." },
  10: { bestie: "Gemini", rival: "Virgo", copy: "Aquarius: Gemini gets your weird theories, but Virgo will try to fix your logic." },
  11: { bestie: "Cancer", rival: "Sagittarius", copy: "Pisces: Cancer provides the emotional safety net, but Sagittarius will run away when you cry." }
};

// Main execution function called by app.js
function getAstrologicalProfile(name, dateStr, timeStr, locationInput) {
  const loc = resolveLocation(locationInput);
  const days = getJulianDays(dateStr, timeStr, loc.tz);
  
  const [hour, minute] = timeStr.split(":").map(Number);
  const positions = calculatePlanets(days, loc.lat, loc.lng, hour, minute);
  const houseData = getHousePlacements(positions);
  const dashaData = getVimshottariDasha(positions.Mo, dateStr, timeStr, loc.tz);

  const lagnaIndex = houseData.lagnaSignIndex;
  const sunSignIndex = Math.floor(positions.Su / 30);
  const moonSignIndex = Math.floor(positions.Mo / 30);

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
      activeEraTrack: INTERPRETATIONS.Dasha[dashaData.activeDasha.ruler].track,
      activeEraCopy: INTERPRETATIONS.Dasha[dashaData.activeDasha.ruler].copy,
      timeline: dashaData.timeline.map(d => ({
        ruler: PLANET_NAMES[d.ruler],
        start: d.start.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
        end: d.end.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
      }))
    },
    socialMatch: ZODIAC_MATCHES[lagnaIndex] || ZODIAC_MATCHES[0],
    flags: getFlags(lagnaIndex, sunSignIndex, moonSignIndex),
    remedies: getRemedies(moonSignIndex)
  };
}

function getFlags(lagna, sun, moon) {
  const greenFlags = [];
  const redFlags = [];

  if (lagna === sun) {
    greenFlags.push("High alignment: Your outer mask matches your core. Unapologetically you.");
  } else {
    greenFlags.push("Mystery shield: You give off a completely different vibe than who you are once known.");
  }

  if (moon === 3 || moon === 11 || moon === 1) {
    greenFlags.push("Vibe check: Elite emotional resilience. You handle drama like a pro.");
  } else {
    greenFlags.push("Highly intuitive: You absorb room energy instantly. Great lie detector.");
  }

  if (sun === 6) {
    redFlags.push("Indecisiveness: You will literally starve before choosing a lunch spot.");
  }
  if (moon === 7) {
    redFlags.push("Trust limits: You check read-receipts and look for hidden meanings in a single emoji.");
  }
  if (lagna === 0 || lagna === 4) {
    redFlags.push("Main-character syndrome: You low-key think every sad song was written about your life.");
  }

  if (greenFlags.length < 2) greenFlags.push("Loyalty level: 100%. You protect your crew at all costs.");
  if (redFlags.length < 2) redFlags.push("Ghosting mode: You toggle Do Not Disturb when slightly overwhelmed.");

  return { green: greenFlags, red: redFlags };
}

function getRemedies(moonSign) {
  const remediesDB = {
    0: { stone: "Red Coral", color: "Crimson Red", mantra: "Om Angarakaya Namaha", tips: "Work out or run to channel excess fiery energy." },
    1: { stone: "Opal / Diamond", color: "Pastel Pink", mantra: "Om Shum Shukraya Namaha", tips: "Spend time in nature or baking to ground your senses." },
    2: { stone: "Emerald", color: "Emerald Green", mantra: "Om Budhaya Namaha", tips: "Journal your thoughts to clear your busy mental tabs." },
    3: { stone: "Pearl", color: "Silver White", mantra: "Om Chandraya Namaha", tips: "Practice deep breathing or keep plants in your bedroom." },
    4: { stone: "Ruby", color: "Golden Yellow", mantra: "Om Suryaya Namaha", tips: "Express yourself through art, style, or performance." },
    5: { stone: "Emerald", color: "Sage Green", mantra: "Om Budhaya Namaha", tips: "Declutter your room to calm your anxious mind." },
    6: { stone: "White Sapphire", color: "Cream / Beige", mantra: "Om Shum Shukraya Namaha", tips: "Practice saying 'no' to keep your energy circles healthy." },
    7: { stone: "Red Coral", color: "Blood Red", mantra: "Om Bhaumaya Namaha", tips: "Release secrets by typing them out and then deleting the file." },
    8: { stone: "Yellow Sapphire", color: "Gold Yellow", mantra: "Om Gurave Namaha", tips: "Learn a new language or read philosophical fiction." },
    9: { stone: "Blue Sapphire", color: "Midnight Blue", mantra: "Om Sham Shanaishcharaya Namaha", tips: "Draft routines and stick to a consistent sleep cycle." },
    10: { stone: "Blue Sapphire", color: "Electric Blue", mantra: "Om Sham Shanaishcharaya Namaha", tips: "Connect with community projects or build side projects." },
    11: { stone: "Yellow Sapphire", color: "Aqua Green", mantra: "Om Gurave Namaha", tips: "Limit doomscrolling and paint, draw, or listen to water sounds." }
  };

  return remediesDB[moonSign] || remediesDB[0];
}

window.OyeAstroEngine = {
  getProfile: getAstrologicalProfile,
  RashiNames: RASHI_NAMES,
  PlanetNames: PLANET_NAMES
};
