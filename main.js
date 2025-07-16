// API base URL for fetching participants
const API_BASE = "https://random-winner-app-production.up.railway.app/users";

// Application State
const appState = {
  participants: [],
  selectionCount: 0,
  isSelecting: false,
  prizeAttempt: 0,
  winnerRevealCount: 0,
  isPrizeSelecting: false,
};

// Prize data
const prizes = [
  {
    id: "prizeThailand",
    icon: "🏝️",
    label: "Thailand Trip",
    result: "🏝️ Thailand Trip! Pack your bags!",
  },
  {
    id: "prizeEDAV",
    icon: "🎓",
    label: "EDAV Sep 2025",
    result: "🎓 EDAV Sep 2025! See you there!",
  },
  {
    id: "prizeDubai",
    icon: "✈️",
    label: "Flight Ticket to Dubai Derma 2026",
    result: "✈️ Flight Ticket to Dubai Derma 2026! Congratulations!",
  },
  {
    id: "prizeGold",
    icon: '<img src="goldAlloy.png" alt="Gold" style="width:36px;height:36px;vertical-align:middle;display:inline;">',
    label: "Gold",
    result: "🥇 Gold! Congratulations!",
  },
  {
    id: "prizeIMICAS",
    icon: "🛫",
    label: "Flight Ticket IMICAS 2026",
    result: "🛫 Flight Ticket IMICAS 2026! Get ready!",
  },
];

// DOM Elements
const elements = {
  winnerCard: null,
  selectBtn: null,
  selectionCountEl: null,
  selectPrizeBtn: null,
  prizeCard: null,
  prizePlaceholder: null,
  prizeContent: null,
  prizeIcon: null,
  prizeName: null,
  prizeResult: null,
  winnerContent: null,
  winnerPlaceholder: null,
  winnerNameEl: null,
  totalParticipantsEl: null,
};

// Audio objects
let drumAudio, winAudio;

// Initialize DOM elements
function initializeElements() {
  elements.winnerCard = document.getElementById("winnerCard");
  elements.selectBtn = document.getElementById("selectBtn");
  elements.selectionCountEl = document.getElementById("selectionCount");
  elements.selectPrizeBtn = document.getElementById("selectPrizeBtn");
  elements.prizeCard = document.getElementById("prizeCard");
  elements.prizePlaceholder = document.getElementById("prizePlaceholder");
  elements.prizeContent = document.getElementById("prizeContent");
  elements.prizeIcon = document.getElementById("prizeIcon");
  elements.prizeName = document.getElementById("prizeName");
  elements.prizeResult = document.getElementById("prizeResult");
  elements.winnerContent = document.getElementById("winnerContent");
  elements.winnerPlaceholder = document.querySelector(".winner-placeholder");
  elements.winnerNameEl = document.getElementById("winnerName");
  elements.totalParticipantsEl = document.getElementById("totalParticipants");
}

// Initialize audio
function initAudio() {
  try {
    drumAudio = new Audio("drum.mp3");
    drumAudio.loop = false;
    drumAudio.volume = 0.7;

    winAudio = new Audio("win.mp3");
    winAudio.volume = 1;
  } catch (error) {
    console.warn("Audio initialization failed:", error);
  }
}

// Audio control functions
const audioControls = {
  playDrumSound() {
    if (drumAudio) {
      drumAudio.currentTime = 0;
      drumAudio.volume = 0.7;
      drumAudio
        .play()
        .catch((e) => console.warn("Could not play drum sound:", e));
    }
  },

  fadeOutDrumSound() {
    if (!drumAudio) return;

    const fade = setInterval(() => {
      if (drumAudio.volume > 0.05) {
        drumAudio.volume -= 0.05;
      } else {
        drumAudio.pause();
        drumAudio.volume = 0.7;
        clearInterval(fade);
      }
    }, 40);
  },

  stopDrumSound() {
    if (drumAudio) {
      drumAudio.pause();
      drumAudio.currentTime = 0;
      drumAudio.volume = 0.7;
    }
  },

  playWinSound() {
    if (winAudio) {
      winAudio.currentTime = 0;
      winAudio
        .play()
        .catch((e) => console.warn("Could not play win sound:", e));
    }
  },
};

// Fetch participants from API
async function fetchParticipants() {
  try {
    const response = await fetch(API_BASE);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    appState.participants = Array.isArray(data) ? data : [];

    updateTotalParticipantsDisplay();
  } catch (error) {
    console.error("Error fetching participants:", error);
    appState.participants = [];
    updateTotalParticipantsDisplay();
  }
}

// Update total participants display
function updateTotalParticipantsDisplay() {
  if (elements.totalParticipantsEl) {
    elements.totalParticipantsEl.textContent = appState.participants.length;
  }
}

// Prize button state management
const prizeButtonManager = {
  updateState() {
    if (!elements.selectPrizeBtn) return;

    const shouldEnable = this.shouldPrizeButtonBeEnabled();

    elements.selectPrizeBtn.disabled = !shouldEnable;

    if (shouldEnable) {
      elements.selectPrizeBtn.classList.remove("btn--loading");
    }
  },

  shouldPrizeButtonBeEnabled() {
    // Enable only if:
    // 1. We have revealed at least one winner
    // 2. We haven't exceeded the maximum allowed prize attempts (2)
    // 3. The number of prize attempts is less than the number of winner reveals
    return (
      appState.winnerRevealCount > 0 &&
      appState.prizeAttempt < 2 &&
      appState.prizeAttempt < appState.winnerRevealCount
    );
  },

  setLoading(loading) {
    if (!elements.selectPrizeBtn) return;

    if (loading) {
      elements.selectPrizeBtn.classList.add("btn--loading");
      elements.selectPrizeBtn.disabled = true;
    } else {
      elements.selectPrizeBtn.classList.remove("btn--loading");
      this.updateState();
    }
  },
};

// Winner UI management
const winnerUIManager = {
  showWinnerContent() {
    if (elements.winnerPlaceholder) {
      elements.winnerPlaceholder.style.display = "none";
    }

    if (elements.winnerContent) {
      elements.winnerContent.style.display = "block";
      elements.winnerContent.style.opacity = "1";
      elements.winnerContent.style.transform = "scale(1)";
    }
  },

  showPlaceholder() {
    if (elements.winnerPlaceholder) {
      elements.winnerPlaceholder.style.display = "block";
    }

    if (elements.winnerContent) {
      elements.winnerContent.style.display = "none";
      elements.winnerContent.style.opacity = "0";
      elements.winnerContent.style.transform = "scale(0.9)";
    }
  },

  resetWinnerDisplay() {
    this.showPlaceholder();

    if (elements.winnerCard) {
      elements.winnerCard.classList.remove("winner-card--selected");
      elements.winnerCard.style.setProperty("--scale", "1");
      elements.winnerCard.style.boxShadow = "";
    }

    if (elements.winnerNameEl) {
      elements.winnerNameEl.classList.remove(
        "winner-name--visible",
        "winner-pulse"
      );
      elements.winnerNameEl.textContent = "";
    }
  },

  showWinner(winner) {
    this.showWinnerContent();

    if (elements.winnerCard) {
      elements.winnerCard.classList.add("winner-card--selected");
    }

    if (elements.winnerNameEl) {
      elements.winnerNameEl.classList.add("winner-name--visible");
      elements.winnerNameEl.textContent =
        winner.fullName || winner.name || winner;
    }

    // Celebratory animation
    this.animateWinnerCard();

    // Play win sound and trigger confetti
    audioControls.playWinSound();
    this.triggerConfetti();

    // Update state and UI
    appState.winnerRevealCount++;
    this.updateSelectionCount();
    prizeButtonManager.updateState();

    // Add pulse effect
    this.addPulseEffect();
  },

  animateWinnerCard() {
    if (!elements.winnerCard || !window.anime) return;

    anime({
      targets: elements.winnerCard,
      scale: [1, 1.08, 1.04],
      boxShadow: [
        "0 0 0 0px #ffe06600, 0 0px 0px 0 #ffe06600, var(--shadow-xl)",
        "0 0 0 18px #ffe06644, 0 18px 60px 0 #ffe06633, var(--shadow-xl)",
        "0 0 0 12px #ffe06644, 0 12px 40px 0 #ffe06633, var(--shadow-xl)",
      ],
      duration: 700,
      easing: "easeInOutCubic",
      update: function (anim) {
        if (anim.animations && anim.animations.length > 1) {
          elements.winnerCard.style.boxShadow = anim.animations[1].currentValue;
        }
      },
    });
  },

  addPulseEffect() {
    setTimeout(() => {
      if (elements.winnerNameEl) {
        elements.winnerNameEl.classList.add("winner-pulse");
        setTimeout(() => {
          elements.winnerNameEl.classList.remove("winner-pulse");
        }, 2000);
      }
    }, 500);
  },

  triggerConfetti() {
    if (window.confetti) {
      window.confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 },
        zIndex: 9999,
        colors: ["#ffe066", "#1cb7bf", "#3ed5dd", "#25c2e6", "#fff"],
      });
    }
  },

  updateSelectionCount() {
    appState.selectionCount++;
    if (elements.selectionCountEl) {
      elements.selectionCountEl.textContent = appState.selectionCount;
    }
  },
};

// Winner selection logic
const winnerSelector = {
  async selectWinner() {
    if (appState.isSelecting || appState.participants.length === 0) return;

    appState.isSelecting = true;
    this.setButtonLoading(true);

    winnerUIManager.resetWinnerDisplay();
    audioControls.playDrumSound();

    try {
      const winner = await this.shuffleNames();
      if (!winner) throw new Error("No participants to select from");

      audioControls.fadeOutDrumSound();
      await this.sleep(300);

      winnerUIManager.showWinner(winner);
    } catch (error) {
      console.error("Error during selection:", error);
      audioControls.stopDrumSound();
    } finally {
      setTimeout(() => {
        this.setButtonLoading(false);
        appState.isSelecting = false;
      }, 1000);
    }
  },

  async shuffleNames() {
    if (appState.participants.length === 0) return null;

    winnerUIManager.showWinnerContent();

    if (elements.winnerNameEl) {
      elements.winnerNameEl.style.opacity = "1";
      elements.winnerNameEl.style.transform = "scale(1)";
    }

    const totalDuration = 4000;
    const shuffleCount = 20;
    const stepDuration = totalDuration / shuffleCount;

    let lastIdx = -1;

    for (let i = 0; i < shuffleCount; i++) {
      let idx = Math.floor(Math.random() * appState.participants.length);

      if (idx === lastIdx && appState.participants.length > 1) {
        i--;
        continue;
      }

      lastIdx = idx;

      // Animate out
      if (elements.winnerNameEl) {
        elements.winnerNameEl.style.transition = "opacity 0.1s, transform 0.1s";
        elements.winnerNameEl.style.opacity = "0";
        elements.winnerNameEl.style.transform = "scale(0.92)";
      }

      await this.sleep(50);

      // Animate in
      if (elements.winnerNameEl) {
        const participant = appState.participants[idx];
        elements.winnerNameEl.textContent =
          participant.fullName || participant.name || participant;
        elements.winnerNameEl.classList.add("winner-name--visible");
        elements.winnerNameEl.style.opacity = "1";
        elements.winnerNameEl.style.transform = "scale(1.08)";
      }

      await this.sleep(stepDuration - 50);

      if (elements.winnerNameEl) {
        elements.winnerNameEl.style.transform = "scale(1)";
      }
    }

    // Select final winner
    const winnerIdx = Math.floor(Math.random() * appState.participants.length);
    const winner = appState.participants[winnerIdx];

    if (elements.winnerNameEl) {
      elements.winnerNameEl.textContent =
        winner.fullName || winner.name || winner;
      elements.winnerNameEl.classList.add("winner-name--visible");
      elements.winnerNameEl.style.opacity = "1";
      elements.winnerNameEl.style.transform = "scale(1.12)";

      setTimeout(() => {
        elements.winnerNameEl.style.transform = "scale(1)";
      }, 200);
    }

    return winner;
  },

  setButtonLoading(loading) {
    if (!elements.selectBtn) return;

    if (loading) {
      elements.selectBtn.classList.add("btn--loading");
      elements.selectBtn.disabled = true;
      elements.selectBtn.style.transform = "scale(0.98)";
    } else {
      elements.selectBtn.classList.remove("btn--loading");
      elements.selectBtn.disabled = false;
      elements.selectBtn.style.transform = "";
    }
  },

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },
};

// Prize UI management
const prizeUIManager = {
  showPrizeContent() {
    if (elements.prizePlaceholder) {
      elements.prizePlaceholder.style.display = "none";
    }

    if (elements.prizeContent) {
      elements.prizeContent.style.display = "block";
      elements.prizeContent.style.opacity = "1";
      elements.prizeContent.style.transform = "scale(1)";
    }
  },

  showPrizePlaceholder() {
    if (elements.prizePlaceholder) {
      elements.prizePlaceholder.style.display = "block";
    }

    if (elements.prizeContent) {
      elements.prizeContent.style.display = "none";
      elements.prizeContent.style.opacity = "0";
      elements.prizeContent.style.transform = "scale(0.9)";
    }

    if (elements.prizeName) elements.prizeName.textContent = "";
    if (elements.prizeIcon) elements.prizeIcon.textContent = "🎁";
    if (elements.prizeResult) elements.prizeResult.textContent = "";
  },

  resetPrizeDisplay() {
    this.showPrizePlaceholder();

    if (elements.prizeCard) {
      elements.prizeCard.style.boxShadow = "";
      elements.prizeCard.style.transform = "scale(1)";

      // Remove background classes when resetting
      elements.prizeCard.classList.remove("prize-dubai", "prize-gold");
    }
  },
};

// Prize selection logic
const prizeSelector = {
  async selectPrize() {
    if (appState.isPrizeSelecting) return;

    appState.isPrizeSelecting = true;
    prizeButtonManager.setLoading(true);

    try {
      await this.shufflePrizes();
      appState.prizeAttempt++;
      prizeButtonManager.updateState();
    } catch (error) {
      console.error("Error during prize selection:", error);
    } finally {
      prizeButtonManager.setLoading(false);
      appState.isPrizeSelecting = false;
    }
  },

  async shufflePrizes() {
    prizeUIManager.showPrizeContent();

    if (elements.prizeResult) {
      elements.prizeResult.textContent = "";
    }

    // Remove any background image class before shuffling
    elements.prizeCard.classList.remove("prize-gold", "prize-dubai");

    // Play drum sound for 4s during shuffle
    audioControls.playDrumSound();

    // Animate shuffle for 4s, 28 steps
    const shuffleCount = 28;
    const totalDuration = 4000;
    const stepDuration = totalDuration / shuffleCount;
    let lastIdx = -1;
    for (let i = 0; i < shuffleCount; i++) {
      let idx = Math.floor(Math.random() * prizes.length);
      if (idx === lastIdx && prizes.length > 1) {
        i--;
        continue;
      }
      lastIdx = idx;
      // Animate out
      this.animateElementOut(elements.prizeName);
      this.animateElementOut(elements.prizeIcon);
      await winnerSelector.sleep(50);
      // Animate in
      if (elements.prizeName)
        elements.prizeName.textContent = prizes[idx].label;
      if (elements.prizeIcon) {
        if (prizes[idx].id === "prizeGold") {
          elements.prizeIcon.innerHTML = prizes[idx].icon;
        } else {
          elements.prizeIcon.textContent = prizes[idx].icon;
        }
      }
      this.animateElementIn(elements.prizeName);
      this.animateElementIn(elements.prizeIcon);
      await winnerSelector.sleep(stepDuration - 50);
      this.resetElementScale(elements.prizeName);
      this.resetElementScale(elements.prizeIcon);
    }
    // Fade out drum sound
    audioControls.fadeOutDrumSound();
    // Reveal selected prize
    const prizeIdx = this.getNextPrizeIndex();
    const selectedPrize = prizes[prizeIdx];
    if (elements.prizeName)
      elements.prizeName.textContent = selectedPrize.label;
    if (elements.prizeIcon) {
      if (selectedPrize.id === "prizeGold") {
        elements.prizeIcon.innerHTML = selectedPrize.icon;
      } else {
        elements.prizeIcon.textContent = selectedPrize.icon;
      }
    }
    if (elements.prizeResult)
      elements.prizeResult.textContent = selectedPrize.result;
    // Add background image class only after reveal
    if (selectedPrize.id === "prizeGold") {
      elements.prizeCard.classList.add("prize-gold");
    } else if (selectedPrize.id === "prizeDubai") {
      elements.prizeCard.classList.add("prize-dubai");
    }
    // Play win sound
    audioControls.playWinSound();
    // --- Fun celebratory animation ---
    this.animateFinalPrize();
    this.triggerPrizeEffects(selectedPrize);
  },

  getNextPrizeIndex() {
    // First prize is always Gold, second is always Dubai Flight
    if (appState.prizeAttempt === 0) {
      return prizes.findIndex((p) => p.id === "prizeGold");
    }
    if (appState.prizeAttempt === 1) {
      return prizes.findIndex((p) => p.id === "prizeDubai");
    }
    // After first two, pick random
    return Math.floor(Math.random() * prizes.length);
  },

  animateElementOut(element) {
    if (!element) return;

    element.style.transition = "opacity 0.1s, transform 0.1s";
    element.style.opacity = "0";
    element.style.transform = "scale(0.92)";
  },

  animateElementIn(element) {
    if (!element) return;

    element.style.opacity = "1";
    element.style.transform = "scale(1.08)";
  },

  resetElementScale(element) {
    if (!element) return;

    element.style.transform = "scale(1)";
  },

  animateFinalPrize() {
    if (elements.prizeName) {
      elements.prizeName.style.opacity = "1";
      elements.prizeName.style.transform = "scale(1.12)";
    }

    if (elements.prizeIcon) {
      elements.prizeIcon.style.opacity = "1";
      elements.prizeIcon.style.transform = "scale(1.12)";
    }

    setTimeout(() => {
      this.resetElementScale(elements.prizeName);
      this.resetElementScale(elements.prizeIcon);

      // Add the cool icon animation after initial reveal
      this.animatePrizeIcon();
    }, 200);
  },
  animatePrizeIcon() {
    if (!window.anime || !elements.prizeIcon) return;

    // Get the current prize to determine animation type
    const currentPrizeText = elements.prizeName?.textContent || "";

    // Different animations based on prize type
    if (
      currentPrizeText.includes("Thailand") ||
      currentPrizeText.includes("Dubai")
    ) {
      // Flying animation for travel prizes
      this.animateFlying();
    } else if (currentPrizeText.includes("Gold")) {
      // Shining/bouncing animation for gold
      this.animateShining();
    } else if (
      currentPrizeText.includes("EDAV") ||
      currentPrizeText.includes("IMICAS")
    ) {
      // Graduation cap wiggle for education prizes
      this.animateWiggle();
    } else {
      // Default funny bounce animation
      this.animateBounce();
    }
  },
  animateFlying() {
    const timeline = anime.timeline({
      easing: "easeInOutQuad",
      complete: () => {
        // Reset to original position
        elements.prizeIcon.style.transform = "scale(1)";
      },
    });

    timeline
      .add({
        targets: elements.prizeIcon,
        translateX: [0, 50, -30, 20, 0],
        translateY: [0, -20, -10, -15, 0],
        rotate: [0, 10, -5, 3, 0],
        scale: [1, 1.2, 0.9, 1.1, 1],
        duration: 2000,
      })
      .add(
        {
          targets: elements.prizeIcon,
          rotate: [0, 360],
          scale: [1, 1.3, 1],
          duration: 800,
        },
        "-=500"
      );
  },
  animateShining() {
    const timeline = anime.timeline({
      easing: "easeInOutSine",
      complete: () => {
        elements.prizeIcon.style.transform = "scale(1)";
        elements.prizeIcon.style.filter = "none";
      },
    });

    timeline
      .add({
        targets: elements.prizeIcon,
        scale: [1, 1.5, 1.2, 1.4, 1],
        rotate: [0, 15, -10, 5, 0],
        duration: 1500,
      })
      .add(
        {
          targets: elements.prizeIcon,
          filter: [
            "brightness(1) saturate(1)",
            "brightness(1.5) saturate(1.5)",
            "brightness(1.2) saturate(1.2)",
            "brightness(1.8) saturate(2)",
            "brightness(1) saturate(1)",
          ],
          duration: 1000,
        },
        "-=1000"
      )
      .add(
        {
          targets: elements.prizeIcon,
          scale: [1, 0.8, 1.2, 0.9, 1.1, 1],
          duration: 800,
        },
        "-=500"
      );
  },

  // Wiggle animation for education prizes (🎓, 🛫)
  animateWiggle() {
    const timeline = anime.timeline({
      easing: "easeInOutBounce",
      complete: () => {
        elements.prizeIcon.style.transform = "scale(1)";
      },
    });

    timeline
      .add({
        targets: elements.prizeIcon,
        rotate: [0, 25, -20, 15, -10, 5, 0],
        scale: [1, 1.3, 1.1, 1.2, 1.05, 1.15, 1],
        translateY: [0, -10, 5, -5, 0],
        duration: 1800,
      })
      .add(
        {
          targets: elements.prizeIcon,
          translateY: [0, -20, 0, -15, 0, -10, 0],
          scale: [1, 1.1, 1],
          duration: 1000,
        },
        "-=500"
      );
  },

  // Default funny bounce animation
  animateBounce() {
    const timeline = anime.timeline({
      easing: "easeOutElastic(1, .8)",
      complete: () => {
        elements.prizeIcon.style.transform = "scale(1)";
      },
    });

    timeline
      .add({
        targets: elements.prizeIcon,
        scale: [1, 2, 0.8, 1.5, 1.1, 1.3, 1],
        rotate: [0, 180, 360],
        duration: 2000,
      })
      .add(
        {
          targets: elements.prizeIcon,
          translateY: [0, -30, 0, -20, 0, -10, 0],
          scale: [1, 1.2, 1],
          duration: 1200,
        },
        "-=800"
      );
  },

  // Also add a pulse glow effect method for extra flair
  addPulseGlow() {
    if (!window.anime || !elements.prizeIcon) return;

    // Create a glowing pulse effect
    anime({
      targets: elements.prizeIcon,
      boxShadow: [
        "0 0 0 0 rgba(255, 224, 102, 0.7)",
        "0 0 0 20px rgba(255, 224, 102, 0)",
        "0 0 0 0 rgba(255, 224, 102, 0.7)",
        "0 0 0 20px rgba(255, 224, 102, 0)",
      ],
      duration: 1500,
      easing: "easeInOutQuad",
      loop: 2,
    });
  },

  triggerPrizeEffects(prize) {
    if (elements.prizeCard) {
      // Remove any existing background classes
      elements.prizeCard.classList.remove("prize-dubai", "prize-gold");

      // Add appropriate background class
      if (prize.id === "prizeDubai") {
        elements.prizeCard.classList.add("prize-dubai");
      } else if (prize.id === "prizeGold") {
        elements.prizeCard.classList.add("prize-gold");
      }
    }

    // Anime.js animation for the card
    if (window.anime && elements.prizeCard) {
      anime({
        targets: elements.prizeCard,
        scale: [1, 1.12, 1.06, 1],
        boxShadow: [
          "0 0 0 0px #ffe06600, 0 0px 0px 0 #ffe06600, var(--shadow-lg)",
          "0 0 0 24px #ffe06655, 0 24px 80px 0 #ffe06633, var(--shadow-lg)",
          "0 0 0 12px #ffe06633, 0 12px 40px 0 #ffe06622, var(--shadow-lg)",
        ],
        duration: 900,
        easing: "easeInOutCubic",
        update: function (anim) {
          if (anim.animations && anim.animations.length > 1) {
            elements.prizeCard.style.boxShadow =
              anim.animations[1].currentValue;
          }
        },
      });
    }

    // Add pulse glow effect to icon
    setTimeout(() => {
      this.addPulseGlow();
    }, 500);

    // Confetti
    if (window.confetti) {
      window.confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.7 },
        zIndex: 9999,
        colors: ["#ffe066", "#f5d76e", "#fff", "#2563eb"],
      });
    }
  },
};

// Event listeners setup
function setupEventListeners() {
  // Winner selection button
  if (elements.selectBtn) {
    elements.selectBtn.addEventListener("click", () => {
      winnerSelector.selectWinner();
    });

    // Enhanced hover effects
    elements.selectBtn.addEventListener("mouseenter", () => {
      if (!appState.isSelecting && !elements.selectBtn.disabled) {
        elements.selectBtn.style.transform = "translateY(-3px) scale(1.02)";
      }
    });

    elements.selectBtn.addEventListener("mouseleave", () => {
      if (!appState.isSelecting && !elements.selectBtn.disabled) {
        elements.selectBtn.style.transform = "";
      }
    });
  }

  // Prize selection button
  if (elements.selectPrizeBtn) {
    elements.selectPrizeBtn.addEventListener("click", () => {
      prizeSelector.selectPrize();
    });
  }
}

// Initialize application
function initializeApp() {
  initializeElements();
  initAudio();
  setupEventListeners();

  // Set initial state
  prizeUIManager.showPrizePlaceholder();
  winnerUIManager.showPlaceholder();

  // Initialize prize button state
  prizeButtonManager.updateState();

  // Enhanced initial styling
  if (elements.selectionCountEl) {
    elements.selectionCountEl.style.transition = "all 0.2s ease";
    elements.selectionCountEl.textContent = appState.selectionCount;
  }

  if (elements.winnerCard) {
    elements.winnerCard.style.transform = "scale(var(--scale, 1))";
    elements.winnerCard.style.setProperty("--scale", "1");
  }

  // Fetch participants
  fetchParticipants();
}

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", initializeApp);
