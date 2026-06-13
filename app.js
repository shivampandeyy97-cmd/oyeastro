/**
 * OyeAstro - Client UI Controller
 * Integrates calculations, SVG rendering, and dashboard layout transitions.
 */

document.addEventListener("DOMContentLoaded", () => {
  const intakeForm = document.getElementById("intake-form");
  const intakeScreen = document.getElementById("intake-screen");
  const dashboardScreen = document.getElementById("dashboard-screen");

  // Major cities default data suggestion helpers
  const cityInput = document.getElementById("birth-place");
  if (cityInput) {
    cityInput.setAttribute("placeholder", "e.g., New York, London, Mumbai...");
  }

  // Handle Form Submission
  if (intakeForm) {
    intakeForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("user-name").value || "Stargazer";
      const date = document.getElementById("birth-date").value;
      const time = document.getElementById("birth-time").value;
      const place = document.getElementById("birth-place").value || "New York";

      if (!date || !time) {
        alert("Please drop your complete cosmic coordinates (date and time)!");
        return;
      }

      // 1. Calculate Astrological Profile
      try {
        const profile = window.OyeAstroEngine.getProfile(name, date, time, place);
        
        // 2. Populate UI elements
        renderDashboard(profile);

        // 3. Transition UI Screens
        intakeScreen.style.display = "none";
        dashboardScreen.style.display = "grid";
      } catch (err) {
        console.error("Cosmic alignment error:", err);
        alert("Could not align stars. Please check your inputs.");
      }
    });
  }

  // Unified Event Delegation for Command Triggers (Modal Open/Close)
  // Replaces traditional inline onClick and supports modern invoker fallback
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

  // State storage for last calculated profile to assist sharing/copying
  let currentProfileData = null;

  function renderDashboard(profile) {
    currentProfileData = profile;

    // 1. User Header profile
    const avatar = document.getElementById("user-avatar-initial");
    if (avatar) avatar.textContent = profile.meta.name.trim().charAt(0).toUpperCase();

    const nameText = document.getElementById("user-display-name");
    if (nameText) nameText.textContent = `Hey, ${profile.meta.name}! 💫`;

    const metaText = document.getElementById("user-meta-details");
    if (metaText) {
      metaText.textContent = `Born in ${profile.meta.location} | Coordinates: ${profile.meta.lat}°N, ${profile.meta.lng}°E`;
    }

    // 2. Render Big Three Cards
    // Rising Sign
    const risingSign = document.getElementById("rising-sign-name");
    const risingTag = document.getElementById("rising-sign-tag");
    const risingCopy = document.getElementById("rising-sign-copy");
    if (risingSign) risingSign.textContent = profile.bigThree.rising.sign;
    if (risingTag) risingTag.textContent = `“${profile.bigThree.rising.tag}”`;
    if (risingCopy) risingCopy.textContent = profile.bigThree.rising.copy;

    // Sun Sign
    const sunSign = document.getElementById("sun-sign-name");
    const sunCopy = document.getElementById("sun-sign-copy");
    if (sunSign) sunSign.textContent = profile.bigThree.sun.sign;
    if (sunCopy) sunCopy.textContent = profile.bigThree.sun.copy;

    // Moon Sign
    const moonSign = document.getElementById("moon-sign-name");
    const moonCopy = document.getElementById("moon-sign-copy");
    if (moonSign) moonSign.textContent = profile.bigThree.moon.sign;
    if (moonCopy) moonCopy.textContent = profile.bigThree.moon.copy;

    // 3. Render SVG Kundli Chart
    drawKundliSVG(profile.houseData, profile.bigThree.rising.index);

    // 4. Render Cosmic Tea (Green/Red Flags)
    const flagsContainer = document.getElementById("cosmic-tea-content");
    if (flagsContainer) {
      flagsContainer.innerHTML = `
        <div class="tea-item">
          <div class="tea-item-title green">🟩 Green Flags</div>
          <p>${profile.flags.green[0]}</p>
          <p style="margin-top: 0.5rem;">${profile.flags.green[1]}</p>
        </div>
        <div class="tea-item">
          <div class="tea-item-title red">🟥 Red Flags</div>
          <p>${profile.flags.red[0]}</p>
          <p style="margin-top: 0.5rem;">${profile.flags.red[1]}</p>
        </div>
      `;
    }

    // 5. Render Current Era (Dasha Timeline)
    const eraTitle = document.getElementById("current-era-title");
    const eraCopy = document.getElementById("current-era-copy");
    if (eraTitle) eraTitle.textContent = profile.dasha.activeEraTitle;
    if (eraCopy) eraCopy.textContent = profile.dasha.activeEraCopy;

    const timelineContainer = document.getElementById("dasha-timeline-list");
    if (timelineContainer) {
      timelineContainer.innerHTML = profile.dasha.timeline.map((item, idx) => {
        const isActive = item.ruler === profile.dasha.ruler;
        return `
          <div class="timeline-row ${isActive ? 'active' : ''}">
            <span class="ruler">${item.ruler} Period ${isActive ? '👉' : ''}</span>
            <span class="dates">${item.start} - ${item.end}</span>
          </div>
        `;
      }).join("");
    }

    // 6. Remedies grid
    const remedyStone = document.getElementById("remedy-stone");
    const remedyColor = document.getElementById("remedy-color");
    const remedyMantra = document.getElementById("remedy-mantra");
    const remedyTip = document.getElementById("remedy-tip");

    if (remedyStone) remedyStone.textContent = profile.remedies.stone;
    if (remedyColor) remedyColor.textContent = profile.remedies.color;
    if (remedyMantra) remedyMantra.textContent = profile.remedies.mantra;
    if (remedyTip) remedyTip.textContent = `💡 Remedy Vibe: ${profile.remedies.tips}`;
  }

  // Draw Traditional North Indian Kundli Chart in SVG
  function drawKundliSVG(houseData, risingSignIndex) {
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

    // Remove any previously drawn texts (keeping grid lines)
    const elementsToRemove = svg.querySelectorAll("text");
    elementsToRemove.forEach(el => el.remove());

    // Place labels for each of the 12 houses
    for (let h = 1; h <= 12; h++) {
      const coord = HOUSE_CENTERS[h];
      
      // 1. Calculate Sign (Rashi) index in this house
      // House 1 has rising sign, House 2 has (rising+1), etc. (1-indexed zodiac numbers)
      const rashiSignNumber = ((risingSignIndex + (h - 1)) % 12) + 1;

      // 2. Create Rashi sign text element
      const rashiText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      rashiText.setAttribute("x", coord.rashi.x);
      rashiText.setAttribute("y", coord.rashi.y);
      rashiText.setAttribute("class", "rashi-number");
      rashiText.setAttribute("text-anchor", "middle");
      rashiText.textContent = rashiSignNumber;
      svg.appendChild(rashiText);

      // 3. Create House Number label (small indicators in corner)
      const hText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      // offset slightly based on house location
      let hx = coord.rashi.x;
      let hy = coord.rashi.y - 12;
      hText.setAttribute("x", hx);
      hText.setAttribute("y", hy);
      hText.setAttribute("class", "house-number-label");
      hText.setAttribute("text-anchor", "middle");
      hText.textContent = `H${h}`;
      svg.appendChild(hText);

      // 4. Create Planets list text element
      const planetsInHouse = houseData.houses[h - 1]; // 0-indexed array
      if (planetsInHouse && planetsInHouse.length > 0) {
        const planetsText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        planetsText.setAttribute("x", coord.planets.x);
        planetsText.setAttribute("y", coord.planets.y);
        planetsText.setAttribute("class", "planet-symbol");
        planetsText.setAttribute("text-anchor", "middle");
        planetsText.textContent = planetsInHouse.join(" ");
        svg.appendChild(planetsText);
      }
    }
  }

  // Populate Shareable Social Card in Modal
  function populateShareCard() {
    if (!currentProfileData) return;

    const shareName = document.getElementById("share-name");
    const shareRising = document.getElementById("share-rising");
    const shareSun = document.getElementById("share-sun");
    const shareMoon = document.getElementById("share-moon");
    const shareEra = document.getElementById("share-era");

    if (shareName) shareName.textContent = currentProfileData.meta.name.toUpperCase();
    if (shareRising) shareRising.textContent = currentProfileData.bigThree.rising.sign.split(" ")[0];
    if (shareSun) shareSun.textContent = currentProfileData.bigThree.sun.sign.split(" ")[0];
    if (shareMoon) shareMoon.textContent = currentProfileData.bigThree.moon.sign.split(" ")[0];
    if (shareEra) shareEra.textContent = currentProfileData.dasha.ruler;
  }

  // Share Actions triggers
  const copyBtn = document.getElementById("copy-link-btn");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      // Simulate copy url with share link containing basic data or prompt success
      const shareUrl = window.location.href;
      navigator.clipboard.writeText(shareUrl).then(() => {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = "Copied! 💅";
        setTimeout(() => {
          copyBtn.textContent = originalText;
        }, 2000);
      }).catch(err => {
        alert("Failed to copy link. Just screenshot this card!");
      });
    });
  }

  // Reset button to go back to intake screen
  const restartBtn = document.getElementById("restart-btn");
  if (restartBtn) {
    restartBtn.addEventListener("click", () => {
      if (intakeForm) intakeForm.reset();
      dashboardScreen.style.display = "none";
      intakeScreen.style.display = "flex";
    });
  }
});
