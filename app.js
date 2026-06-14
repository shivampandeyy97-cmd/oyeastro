/**
 * OyeAstro - Client UI Controller
 * Integrates calculations, SVG rendering, and Pinterest layout event bindings.
 */

document.addEventListener("DOMContentLoaded", () => {
  const intakeForm = document.getElementById("intake-form");
  const boardSection = document.getElementById("masonry-board-container");
  
  let currentProfileData = null;
  let audioTimerInterval = null;
  let audioProgressSeconds = 0;
  let isPlaying = false;

  // Handle Intake Form Submission
  if (intakeForm) {
    intakeForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("user-name").value || "Bestie";
      const date = document.getElementById("birth-date").value;
      const time = document.getElementById("birth-time").value;
      const place = document.getElementById("birth-place").value || "New York";

      if (!date || !time) {
        alert("Please enter both Date and Time to fetch your stars!");
        return;
      }

      try {
        // 1. Calculate Astro Profile
        const profile = window.OyeAstroEngine.getProfile(name, date, time, place);
        
        // 2. Render Dashboard Elements
        renderAstroBoard(profile);

        // 3. Transition UI
        boardSection.style.display = "block";
        
        // Smooth scroll to results
        boardSection.scrollIntoView({ behavior: "smooth" });
      } catch (err) {
        console.error("Astro calculation failure:", err);
        alert("Alignment error. Check your dates!");
      }
    });
  }

  // Event Delegation for Pin Reactions (Likes/Saves)
  document.addEventListener("click", (e) => {
    const reactionBtn = e.target.closest(".pin-reaction-btn");
    if (!reactionBtn) return;

    const counterSpan = reactionBtn.querySelector(".count");
    if (!counterSpan) return;

    let currentVal = counterSpan.textContent.trim();
    let isSave = reactionBtn.classList.contains("save-btn");

    // Extract numerical count (e.g. "1.2k" or "843")
    let num = parseFloat(currentVal);
    let suffix = currentVal.replace(/[0-9.]/g, "");

    // Increment count
    num = (num + 0.1).toFixed(1);
    if (suffix === "") {
      num = Math.floor(parseFloat(num));
    }

    counterSpan.textContent = num + suffix;

    // Visual button bounce effect
    reactionBtn.style.transform = "scale(0.9)";
    setTimeout(() => {
      reactionBtn.style.transform = "scale(1.05)";
    }, 100);
    setTimeout(() => {
      reactionBtn.style.transform = "none";
    }, 200);

    // Disable multiple clicks gently
    reactionBtn.style.pointerEvents = "none";
    reactionBtn.style.opacity = "0.7";
  });

  // Event Delegation for Dialog Modals (Share popup)
  document.addEventListener("click", (e) => {
    const button = e.target.closest("button[commandfor]");
    if (!button) return;

    const targetId = button.getAttribute("commandfor");
    const targetElement = document.getElementById(targetId);
    const command = button.getAttribute("command");

    if (targetElement && command) {
      if (targetElement.tagName === "DIALOG") {
        if (command === "show-modal") {
          targetElement.showModal();
          populateShareCard();
        } else if (command === "close") {
          targetElement.close();
        }
      }
    }
  });

  // Render the Astro Dashboard
  function renderAstroBoard(profile) {
    currentProfileData = profile;

    // 1. User Info Avatar card
    const avatar = document.getElementById("user-avatar-text");
    if (avatar) avatar.textContent = profile.meta.name.trim().charAt(0).toUpperCase();

    const nameText = document.getElementById("user-name-title");
    if (nameText) nameText.textContent = `${profile.meta.name}'s Cosmos`;

    const metaText = document.getElementById("user-meta-sub");
    if (metaText) {
      metaText.textContent = `Born in ${profile.meta.location} | Coordinates: ${profile.meta.lat}°N, ${profile.meta.lng}°E`;
    }

    // 2. Big Three Polaroids
    const risingName = document.getElementById("polaroid-rising-name");
    const sunName = document.getElementById("polaroid-sun-name");
    const moonName = document.getElementById("polaroid-moon-name");

    const risingSignText = profile.bigThree.rising.sign.split(" ")[0];
    const sunSignText = profile.bigThree.sun.sign.split(" ")[0];
    const moonSignText = profile.bigThree.moon.sign.split(" ")[0];

    if (risingName) {
      risingName.innerHTML = `${risingSignText} <span>Rising (${profile.bigThree.rising.tag})</span>`;
    }
    if (sunName) {
      sunName.innerHTML = `${sunSignText} <span>Sun (Core Ego)</span>`;
    }
    if (moonName) {
      moonName.innerHTML = `${moonSignText} <span>Moon (Emotion)</span>`;
    }

    // Insert polaroid icons (simple inline graphics)
    setPolaroidIcons(profile.bigThree);

    // 3. Draw Vedic SVG Chart
    drawVedicKundliSVG(profile.houseData, profile.bigThree.rising.index);

    // 4. Spotify Player Configuration
    resetSpotifyPlayer(profile.dasha.activeEraTrack);

    // 5. Tinder Matches
    const matchBestie = document.getElementById("tinder-bestie-name");
    const matchBestieDesc = document.getElementById("tinder-bestie-desc");
    const matchRival = document.getElementById("tinder-rival-name");
    const matchRivalDesc = document.getElementById("tinder-rival-desc");

    if (matchBestie) matchBestie.textContent = `${profile.socialMatch.bestie} ✨`;
    if (matchBestieDesc) matchBestieDesc.textContent = `Vibe score: 98%. Excellent communication flow. Shared values, great chats.`;
    
    if (matchRival) matchRival.textContent = `${profile.socialMatch.rival} 🛑`;
    if (matchRivalDesc) matchRivalDesc.textContent = `Caution node. Keep your distances bestie, mismatching wavelengths here.`;

    // 6. Aura Energy Text
    const auraDesc = document.getElementById("aura-text-copy");
    if (auraDesc) {
      auraDesc.innerHTML = `
        Your Moon in <strong>${moonSignText}</strong> combined with <strong>${risingSignText} Rising</strong> means:
        <br>${profile.bigThree.moon.copy}
        <br><br>
        <strong>Cosmic energy check:</strong> ${profile.flags.green[0]}
      `;
    }

    // 7. Green / Red Flags
    const flagsList = document.getElementById("flags-boxes-container");
    if (flagsList) {
      flagsList.innerHTML = `
        <div class="flag-box green">🟩 <strong>Green Flag:</strong> ${profile.flags.green[1]}</div>
        <div class="flag-box red">🟥 <strong>Red Flag:</strong> ${profile.flags.red[0]}</div>
      `;
    }

    // 8. Remedies
    const remedyStone = document.getElementById("remedy-stone-text");
    const remedyColor = document.getElementById("remedy-color-text");
    const remedyMantra = document.getElementById("remedy-mantra-text");
    const remedyTip = document.getElementById("remedy-tip-text");

    if (remedyStone) remedyStone.textContent = profile.remedies.stone;
    if (remedyColor) remedyColor.textContent = profile.remedies.color;
    if (remedyMantra) remedyMantra.textContent = profile.remedies.mantra;
    if (remedyTip) remedyTip.textContent = `💡 Remedy Vibe: ${profile.remedies.tips}`;

    // 9. Retro Meme Card
    const memeText = document.getElementById("retro-meme-copy");
    if (memeText) {
      memeText.textContent = `A ${risingSignText} Rising choosing what outfit to wear: "I have 8 different options and none of them represent my current soul alignment."`;
    }
  }

  function setPolaroidIcons(bigThree) {
    const risingSVG = document.getElementById("polaroid-rising-svg");
    const sunSVG = document.getElementById("polaroid-sun-svg");
    const moonSVG = document.getElementById("polaroid-moon-svg");

    if (risingSVG) {
      risingSVG.innerHTML = `
        <circle cx="50" cy="50" r="25" fill="none" stroke="var(--espresso)" stroke-width="2.5" />
        <path d="M50 15 L50 85 M15 50 L85 50" stroke="var(--espresso)" stroke-width="1.5" />
        <polygon points="50,20 45,32 55,32" fill="var(--espresso)" />
      `;
    }
    if (sunSVG) {
      sunSVG.innerHTML = `
        <circle cx="50" cy="50" r="20" fill="none" stroke="var(--espresso)" stroke-width="3" />
        <circle cx="50" cy="50" r="5" fill="var(--espresso)" />
        <path d="M50 10 L50 16 M50 84 L50 90 M10 50 L16 50 M84 50 L90 50" stroke="var(--espresso)" stroke-width="2" />
      `;
    }
    if (moonSVG) {
      moonSVG.innerHTML = `
        <path d="M30 50 A 20 20 0 1 0 70 50 A 14 14 0 1 1 30 50 Z" fill="none" stroke="var(--espresso)" stroke-width="3" />
      `;
    }
  }

  // Draw Traditional North Indian Kundli inside SVG
  function drawVedicKundliSVG(houseData, risingSignIndex) {
    const svg = document.getElementById("kundli-svg-canvas");
    if (!svg) return;

    // Center coordinates for placing text inside the 12 houses of a North Indian style diamond chart
    const HOUSE_CENTERS = {
      1:  { rashi: { x: 200, y: 155 }, planets: { x: 200, y: 180 } },
      2:  { rashi: { x: 120, y: 65 },  planets: { x: 120, y: 85 } },
      3:  { rashi: { x: 65,  y: 120 }, planets: { x: 85,  y: 120 } },
      4:  { rashi: { x: 155, y: 200 }, planets: { x: 180, y: 200 } },
      5:  { rashi: { x: 65,  y: 280 }, planets: { x: 85,  y: 280 } },
      6:  { rashi: { x: 120, y: 335 }, planets: { x: 120, y: 315 } },
      7:  { rashi: { x: 200, y: 245 }, planets: { x: 200, y: 220 } },
      8:  { rashi: { x: 280, y: 335 }, planets: { x: 280, y: 315 } },
      9:  { rashi: { x: 335, y: 280 }, planets: { x: 315, y: 280 } },
      10: { rashi: { x: 245, y: 200 }, planets: { x: 220, y: 200 } },
      11: { rashi: { x: 335, y: 120 }, planets: { x: 315, y: 120 } },
      12: { rashi: { x: 280, y: 65 },  planets: { x: 280, y: 85 } }
    };

    // Remove any previously drawn texts (keeping grid lines & backgrounds)
    const elementsToRemove = svg.querySelectorAll("text");
    elementsToRemove.forEach(el => el.remove());

    // Place labels for each of the 12 houses
    for (let h = 1; h <= 12; h++) {
      const coord = HOUSE_CENTERS[h];
      const rashiSignNumber = ((risingSignIndex + (h - 1)) % 12) + 1;

      // 1. Create Rashi sign text
      const rashiText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      rashiText.setAttribute("x", coord.rashi.x);
      rashiText.setAttribute("y", coord.rashi.y);
      rashiText.setAttribute("class", "chart-text-rashi");
      rashiText.setAttribute("text-anchor", "middle");
      rashiText.textContent = rashiSignNumber;
      svg.appendChild(rashiText);

      // 2. Create House Number label (small indicators)
      const hText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      let hy = coord.rashi.y - 12;
      hText.setAttribute("x", coord.rashi.x);
      hText.setAttribute("y", hy);
      hText.setAttribute("class", "chart-text-house");
      hText.setAttribute("text-anchor", "middle");
      hText.textContent = `H${h}`;
      svg.appendChild(hText);

      // 3. Create Planets list
      const planetsInHouse = houseData.houses[h - 1]; 
      if (planetsInHouse && planetsInHouse.length > 0) {
        const planetsText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        planetsText.setAttribute("x", coord.planets.x);
        planetsText.setAttribute("y", coord.planets.y);
        planetsText.setAttribute("class", "chart-text-planets");
        planetsText.setAttribute("text-anchor", "middle");
        planetsText.textContent = planetsInHouse.join(" ");
        svg.appendChild(planetsText);
      }
    }
  }

  // Spotify Player Control Engine
  const playBtn = document.getElementById("spotify-play-btn");
  const playIcon = document.getElementById("spotify-play-icon");
  const vinylRecord = document.getElementById("spotify-vinyl");
  const progressFill = document.getElementById("spotify-progress-fill");
  const progressTime = document.getElementById("spotify-time-current");

  if (playBtn) {
    playBtn.addEventListener("click", () => {
      isPlaying = !isPlaying;
      
      if (isPlaying) {
        // Play
        playIcon.innerHTML = `<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>`; // Pause SVG icon
        vinylRecord.classList.add("playing");
        
        audioTimerInterval = setInterval(() => {
          audioProgressSeconds++;
          if (audioProgressSeconds >= 180) {
            audioProgressSeconds = 0; // loop
          }
          
          // Update visual progress
          const progressPercent = (audioProgressSeconds / 180) * 100;
          progressFill.style.width = `${progressPercent}%`;
          
          const mins = Math.floor(audioProgressSeconds / 60);
          const secs = (audioProgressSeconds % 60).toString().padStart(2, '0');
          progressTime.textContent = `${mins}:${secs}`;
        }, 1000);
      } else {
        // Pause
        playIcon.innerHTML = `<path d="M8 5v14l11-7z"/>`; // Play SVG icon
        vinylRecord.classList.remove("playing");
        clearInterval(audioTimerInterval);
      }
    });
  }

  function resetSpotifyPlayer(trackName) {
    isPlaying = false;
    clearInterval(audioTimerInterval);
    audioProgressSeconds = 0;
    
    if (playIcon) playIcon.innerHTML = `<path d="M8 5v14l11-7z"/>`;
    if (vinylRecord) vinylRecord.classList.remove("playing");
    if (progressFill) progressFill.style.width = "0%";
    if (progressTime) progressTime.textContent = "0:00";
    
    const trackNameEl = document.getElementById("spotify-track-name");
    if (trackNameEl) trackNameEl.textContent = trackName;
  }

  // Populate sharing popup details
  function populateShareCard() {
    if (!currentProfileData) return;

    const shareName = document.getElementById("polaroid-share-name");
    const shareRising = document.getElementById("polaroid-share-rising");
    const shareSun = document.getElementById("polaroid-share-sun");
    const shareMoon = document.getElementById("polaroid-share-moon");
    const shareEra = document.getElementById("polaroid-share-era");

    if (shareName) shareName.textContent = currentProfileData.meta.name.toUpperCase();
    if (shareRising) shareRising.textContent = currentProfileData.bigThree.rising.sign;
    if (shareSun) shareSun.textContent = currentProfileData.bigThree.sun.sign;
    if (shareMoon) shareMoon.textContent = currentProfileData.bigThree.moon.sign;
    if (shareEra) shareEra.textContent = currentProfileData.dasha.activeEraTrack;
  }

  // Copy share link triggers
  const copyBtn = document.getElementById("copy-link-btn");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      const shareUrl = window.location.href;
      navigator.clipboard.writeText(shareUrl).then(() => {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = "Copied link! 💅";
        setTimeout(() => {
          copyBtn.textContent = originalText;
        }, 2000);
      }).catch(err => {
        alert("Failed to copy link. Just screenshot this polaroid!");
      });
    });
  }
});
