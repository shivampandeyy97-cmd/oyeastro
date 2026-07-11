/**
 * OyeAstro - Client UI Controller
 * Handles form bindings, Vedic calculations, dynamic tab-switching, and compatibility matching.
 */

document.addEventListener("DOMContentLoaded", () => {
  const intakeForm = document.getElementById("intake-form");
  const resultsVibeCard = document.getElementById("results-vibe-card");
  
  // Compatibility elements
  const compatFormContainer = document.getElementById("compat-form-container");
  const compatResultsContainer = document.getElementById("compat-results-container");
  const compatSubmitBtn = document.getElementById("compat-submit-btn");
  const compatResetBtn = document.getElementById("compat-reset-btn");
  
  let currentProfile = null;
  let activeTab = "today";

  // Tab switching state definitions
  const getTabVibeData = (profile, tab) => {
    const rashiIndex = profile.bigThree.rising.index;
    const moonIndex = profile.bigThree.moon.index;
    
    // Deterministic metrics based on signs & tabs
    const metricsMap = {
      today: {
        love: { label: ["Chill", "Sweet", "Tender", "Intense", "Quiet"][moonIndex % 5], color: "#FF7A45" },
        money: { label: ["Flowing", "Saving", "Tending", "Prudent", "Steady"][rashiIndex % 5], color: "#6DB88A" },
        energy: { label: ["Chaotic", "Focused", "Resting", "Electric", "Dreamy"][(moonIndex + rashiIndex) % 5], color: "#D4A800" }
      },
      week: {
        love: { label: ["Electric", "Steady", "Quiet", "Sparky", "Drama-free"][rashiIndex % 5], color: "#FF7A45" },
        money: { label: ["Growing", "Stable", "Spend-y", "Flowing", "Balanced"][moonIndex % 5], color: "#6DB88A" },
        energy: { label: ["High-Key", "Solitary", "Balanced", "Hyperactive", "Recharged"][(rashiIndex + 2) % 5], color: "#D4A800" }
      },
      month: {
        love: { label: ["Lover Era", "Solo Era", "Healing Era", "Intimate Era", "Banter Era"][(moonIndex + 1) % 5], color: "#FF7A45" },
        money: { label: ["Abundant", "Building", "Learning", "Frugal", "Expanding"][(rashiIndex + 1) % 5], color: "#6DB88A" },
        energy: { label: ["Transformative", "Disciplined", "Expressive", "Calm", "Driven"][(moonIndex + rashiIndex + 1) % 5], color: "#D4A800" }
      }
    };

    const copyMap = {
      today: profile.horoscope,
      week: profile.bigThree.rising.copy + " Focus on grounding your daily energy and aligning with your " + profile.bigThree.sun.sign + " core identity.",
      month: profile.dasha.activeEraCopy
    };

    return {
      metrics: metricsMap[tab],
      insight: copyMap[tab]
    };
  };

  // Switch tabs function
  const updateVibeCardTab = (tab) => {
    if (!currentProfile) return;
    activeTab = tab;
    
    // Toggle class list
    document.querySelectorAll(".vc-tab").forEach(t => {
      if (t.getAttribute("data-tab") === tab) {
        t.className = "vc-tab on";
      } else {
        t.className = "vc-tab off";
      }
    });

    const data = getTabVibeData(currentProfile, tab);
    
    // Update metrics
    const loveVal = document.getElementById("metric-love-val");
    const moneyVal = document.getElementById("metric-money-val");
    const energyVal = document.getElementById("metric-energy-val");
    
    if (loveVal) {
      loveVal.textContent = data.metrics.love.label;
      loveVal.style.color = data.metrics.love.color;
    }
    if (moneyVal) {
      moneyVal.textContent = data.metrics.money.label;
      moneyVal.style.color = data.metrics.money.color;
    }
    if (energyVal) {
      energyVal.textContent = data.metrics.energy.label;
      energyVal.style.color = data.metrics.energy.color;
    }

    // Update insight
    const insightVal = document.getElementById("card-insight-val");
    if (insightVal) {
      insightVal.textContent = `"${data.insight}"`;
    }
  };

  // Wire up tabs click events
  document.querySelectorAll(".vc-tab").forEach(tabBtn => {
    tabBtn.addEventListener("click", function() {
      const tabName = this.getAttribute("data-tab");
      updateVibeCardTab(tabName);
    });
  });

  // Handle Birth intake form submission
  if (intakeForm) {
    intakeForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const name = document.getElementById("user-name").value.trim() || "Bestie";
      const place = document.getElementById("birth-place").value.trim() || "Mumbai";
      const date = document.getElementById("birth-date").value;
      const time = document.getElementById("birth-time").value;

      if (!date || !time) {
        alert("Please enter your birth date and time!");
        return;
      }

      try {
        // Calculate Astro Profile
        currentProfile = window.OyeAstroEngine.getProfile(name, date, time, place);

        // Update vibe card layout
        const cardNameTitle = document.getElementById("card-name-title");
        const cardLagnaVal = document.getElementById("card-lagna-val");
        const cardNakshDashaVal = document.getElementById("card-naksh-dasha-val");
        const resultsLabelText = document.getElementById("results-label-text");
        const resultsHeadingText = document.getElementById("results-heading-text");

        if (cardNameTitle) cardNameTitle.textContent = `${currentProfile.meta.name}'s Cosmic Vibe ✦`;
        if (cardLagnaVal) cardLagnaVal.textContent = `${currentProfile.bigThree.rising.sign} Lagna`;
        if (cardNakshDashaVal) {
          cardNakshDashaVal.textContent = `${currentProfile.dasha.nakshatra} Nakshatra · ${currentProfile.dasha.ruler} Mahadasha`;
        }

        if (resultsLabelText) resultsLabelText.textContent = "Your vibe card";
        if (resultsHeadingText) {
          resultsHeadingText.innerHTML = `${name}'s Cosmos is <em>aligned.</em><br>Check your vibes below.`;
        }

        // Render active tab contents
        updateVibeCardTab("today");

        // Scroll to results section
        document.getElementById("results").scrollIntoView({ behavior: "smooth" });

      } catch (err) {
        console.error("Astro calculation failure:", err);
        alert("Cosmic error. Please check your dates and times.");
      }
    });
  }

  // Copy Vibe Card to clipboard
  const cardShareBtn = document.getElementById("card-share-btn");
  if (cardShareBtn) {
    cardShareBtn.addEventListener("click", () => {
      if (!currentProfile) {
        alert("Calculate your chart first to share!");
        return;
      }
      
      const tabData = getTabVibeData(currentProfile, activeTab);
      const textToCopy = `✨ My OyeAstro Cosmic Vibe check [${activeTab.toUpperCase()}] ✨\n` +
        `👤 Name: ${currentProfile.meta.name}\n` +
        `🌅 Rising: ${currentProfile.bigThree.rising.sign} Lagna\n` +
        `🌙 Moon Nakshatra: ${currentProfile.dasha.nakshatra}\n` +
        `💌 Love: ${tabData.metrics.love.label}\n` +
        `💸 Money: ${tabData.metrics.money.label}\n` +
        `⚡ Energy: ${tabData.metrics.energy.label}\n` +
        `Insight: "${tabData.insight}"\n` +
        `Find your alignment at: oyeastro.com`;

      navigator.clipboard.writeText(textToCopy).then(() => {
        const originalText = cardShareBtn.textContent;
        cardShareBtn.textContent = "Copied! 💅";
        setTimeout(() => {
          cardShareBtn.textContent = originalText;
        }, 2000);
      }).catch(err => {
        console.error("Copy failed", err);
      });
    });
  }

  // Helper hash function for deterministic values
  const hashCode = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  };

  // Compatibility Submission
  if (compatSubmitBtn) {
    compatSubmitBtn.addEventListener("click", () => {
      const name1 = document.getElementById("c-name1").value.trim();
      const name2 = document.getElementById("c-name2").value.trim();

      if (!name1 || !name2) {
        alert("Please enter names for both partners!");
        return;
      }

      // Perform compatibility check
      const compat = window.OyeAstroEngine.getLoveCompatibility(name1, name2);
      
      // Deterministic signs and details
      const rashis = window.OyeAstroEngine.RashiNames;
      const nakshatras = ["Ashwini", "Krittika", "Rohini", "Ardra", "Pushya", "Magha", "Hasta", "Swati", "Anuradha", "Jyeshtha", "Purva Ashadha", "Revati"];
      
      const hash1 = hashCode(name1);
      const hash2 = hashCode(name2);
      
      const rashi1 = rashis[hash1 % rashis.length];
      const rashi2 = rashis[hash2 % rashis.length];
      const naksh1 = nakshatras[hash1 % nakshatras.length];
      const naksh2 = nakshatras[hash2 % nakshatras.length];

      // Update Compatibility Card results
      document.getElementById("cc-p1-name").textContent = name1;
      document.getElementById("cc-p1-sign").textContent = `${rashi1} · ${naksh1}`;
      document.getElementById("cc-p2-name").textContent = name2;
      document.getElementById("cc-p2-sign").textContent = `${rashi2} · ${naksh2}`;
      
      document.getElementById("cc-match-pct").textContent = `${compat.score}%`;
      
      // Update bars
      const barTemp = document.getElementById("cc-bar-temp");
      const barHeart = document.getElementById("cc-bar-heart");
      const barDestiny = document.getElementById("cc-bar-destiny");
      const barTrust = document.getElementById("cc-bar-trust");

      const scoreTemp = (hash1 % 25) + 75; // 75-99
      const scoreHeart = (hash2 % 30) + 65; // 65-95
      const scoreDest = ((hash1 + hash2) % 40) + 55; // 55-95
      const scoreTrust = ((hash1 * hash2) % 25) + 75; // 75-99

      if (barTemp) barTemp.style.width = `${scoreTemp}%`;
      if (barHeart) barHeart.style.width = `${scoreHeart}%`;
      if (barDestiny) barDestiny.style.width = `${scoreDest}%`;
      if (barTrust) barTrust.style.width = `${scoreTrust}%`;

      document.getElementById("cc-insight-text").textContent = `"${compat.text}"`;

      // Toggle views
      compatFormContainer.style.display = "none";
      compatResultsContainer.style.display = "block";
    });
  }

  // Reset compatibility checker
  if (compatResetBtn) {
    compatResetBtn.addEventListener("click", () => {
      document.getElementById("c-name1").value = "";
      document.getElementById("c-name2").value = "";
      
      compatFormContainer.style.display = "block";
      compatResultsContainer.style.display = "none";
    });
  }

  // Copy Compatibility Card to clipboard
  const compatShareBtn = document.getElementById("compat-share-btn");
  if (compatShareBtn) {
    compatShareBtn.addEventListener("click", () => {
      const name1 = document.getElementById("cc-p1-name").textContent;
      const name2 = document.getElementById("cc-p2-name").textContent;
      const score = document.getElementById("cc-match-pct").textContent;
      const insight = document.getElementById("cc-insight-text").textContent;

      const textToCopy = `✨ Cosmic Compatibility Vibe Match ✨\n` +
        `💖 ${name1} ⟷ ${name2}\n` +
        `📊 Match Score: ${score}\n` +
        `Insight: ${insight}\n` +
        `Find your alignment at: ${window.location.origin}`;

      navigator.clipboard.writeText(textToCopy).then(() => {
        const originalText = compatShareBtn.textContent;
        compatShareBtn.textContent = "Copied! 💅";
        setTimeout(() => {
          compatShareBtn.textContent = originalText;
        }, 2000);
      }).catch(err => {
        console.error("Copy failed", err);
      });
    });
  }

  // Scroll reveal animation handler
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.animation = 'fadeUp .65s ease forwards';
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.feat, .step, .testi-card, .why-card').forEach(el => {
    el.classList.add('fade-up');
    io.observe(el);
  });
});
