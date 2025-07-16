// API base URL (no longer used here)
// const API_BASE = "https://random-winner-app-production.up.railway.app/users";

// API base URL for fetching participants
const API_BASE = "https://random-winner-app-production.up.railway.app/users";

// State
let participants = [];
let selectionCount = 0;
let isSelecting = false;
let prizeAttempt = 0;

// Prize data (unchanged)
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
    icon: "🥇",
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

// Show prize section after winner is revealed
function showWinner(winner) {
  // Show winner content, hide placeholder
  showWinnerContent();
  const winnerContent = document.getElementById("winnerContent");
  if (winnerContent) {
    winnerContent.style.display = "block";
    winnerContent.style.opacity = 1;
    winnerContent.style.transform = "scale(1)";
  }

  // Add winner styling with enhanced effects
  winnerCard.classList.add("winner-card--selected");
  const winnerNameEl = document.getElementById("winnerName");
  if (winnerNameEl) winnerNameEl.classList.add("winner-name--visible");

  // Celebratory pop effect with anime.js
  anime({
    targets: winnerCard,
    scale: [1, 1.08, 1.04],
    boxShadow: [
      "0 0 0 0px #ffe06600, 0 0px 0px 0 #ffe06600, var(--shadow-xl)",
      "0 0 0 18px #ffe06644, 0 18px 60px 0 #ffe06633, var(--shadow-xl)",
      "0 0 0 12px #ffe06644, 0 12px 40px 0 #ffe06633, var(--shadow-xl)",
    ],
    duration: 700,
    easing: "easeInOutCubic",
    update: function (anim) {
      // anime.js doesn't animate boxShadow directly on CSS variables, so we set it manually
      if (anim.animations && anim.animations.length > 1) {
        winnerCard.style.boxShadow = anim.animations[1].currentValue;
      }
    },
  });

  // Enhanced winner reveal animation - work with existing transform
  winnerCard.style.setProperty("--scale", "1.08");
  setTimeout(() => {
    winnerCard.style.setProperty("--scale", "1.04");
  }, 500);

  // Play win sound when revealing the winner
  playWinSound();

  // Trigger confetti
  triggerConfetti();

  // Update stats
  updateSelectionCount();

  // Add a pulse effect to the winner name after reveal
  setTimeout(() => {
    if (winnerNameEl) {
      winnerNameEl.classList.add("winner-pulse");
      setTimeout(() => {
        winnerNameEl.classList.remove("winner-pulse");
      }, 2000);
    }
  }, 500);
}

// Hide prize section on reset
function resetDisplay() {
  showPlaceholder();
  // Reset winner styling
  winnerCard.classList.remove("winner-card--selected");
  const winnerNameEl = document.getElementById("winnerName");
  if (winnerNameEl) {
    winnerNameEl.classList.remove("winner-name--visible", "winner-pulse");
    winnerNameEl.textContent = "";
  }
  winnerCard.style.setProperty("--scale", "1");
  winnerCard.style.boxShadow = "";
}

// Enhanced button state management
const setButtonLoading = (loading) => {
  if (loading) {
    selectBtn.classList.add("btn--loading");
    selectBtn.disabled = true;
    // Use existing button transform, just slight adjustment
    selectBtn.style.transform = "scale(0.98)";
  } else {
    selectBtn.classList.remove("btn--loading");
    selectBtn.disabled = false;
    selectBtn.style.transform = "";
  }
};

// Main selection function
const selectWinner = async () => {
  if (isSelecting) return;
  if (!participants.length) return; // Guard: do nothing if no participants

  isSelecting = true;
  setButtonLoading(true);

  // Reset display
  resetDisplay();

  // Start drum sound immediately
  playDrumSound();

  try {
    // Start shuffling names with consistent speed
    const winner = await shuffleNames();
    if (!winner) throw new Error("No participants to select from");

    // Start fading out drum sound before showing final winner
    fadeOutDrumSound();

    // Small delay for dramatic effect
    await sleep(300);

    // Show winner with effects
    showWinner(winner);
  } catch (error) {
    console.error("Error during selection:", error);
    stopDrumSound();
  } finally {
    // Reset button state after a short delay
    setTimeout(() => {
      setButtonLoading(false);
      isSelecting = false;
    }, 1000);
  }
};

// Fetch participants for user view
async function fetchParticipants() {
  try {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error("Failed to fetch participants");
    const data = await res.json();
    participants = data;
    // Update total participants label if present
    const totalParticipantsEl = document.getElementById("totalParticipants");
    if (totalParticipantsEl) {
      totalParticipantsEl.textContent = participants.length;
    }
  } catch (err) {
    // Optionally show error in a placeholder or log
    console.error("Error fetching participants:", err);
    participants = [];
    const totalParticipantsEl = document.getElementById("totalParticipants");
    if (totalParticipantsEl) {
      totalParticipantsEl.textContent = 0;
    }
  }
}

// --- MISSING LOGIC IMPLEMENTATION START ---

// DOM references for winner and stats
const winnerCard = document.getElementById("winnerCard");
const selectBtn = document.getElementById("selectBtn");
const selectionCountEl = document.getElementById("selectionCount");

// Winner UI toggling
function showWinnerContent() {
  document.querySelector(".winner-placeholder").style.display = "none";
  const winnerContent = document.getElementById("winnerContent");
  winnerContent.style.display = "block";
  winnerContent.style.opacity = 1;
  winnerContent.style.transform = "scale(1)";
}
function showPlaceholder() {
  document.querySelector(".winner-placeholder").style.display = "block";
  const winnerContent = document.getElementById("winnerContent");
  winnerContent.style.display = "none";
  winnerContent.style.opacity = 0;
  winnerContent.style.transform = "scale(0.9)";
}

// Shuffle names animation and winner selection
async function shuffleNames() {
  if (!participants.length) return null;
  const winnerNameEl = document.getElementById("winnerName");
  // Ensure placeholder is hidden and winnerName is visible during shuffle
  showWinnerContent();
  winnerNameEl.style.opacity = 1;
  winnerNameEl.style.transform = "scale(1)";

  // Calculate timing to match 4-second drum sound
  const totalDuration = 4000; // 4 seconds
  const shuffleCount = 20; // Fixed number of shuffles
  const stepDuration = totalDuration / shuffleCount; // ~200ms per step

  let lastIdx = -1;
  for (let i = 0; i < shuffleCount; i++) {
    const idx = Math.floor(Math.random() * participants.length);
    if (idx === lastIdx && participants.length > 1) {
      i--;
      continue;
    }
    lastIdx = idx;
    // Animate out
    winnerNameEl.style.transition = "opacity 0.1s, transform 0.1s";
    winnerNameEl.style.opacity = 0;
    winnerNameEl.style.transform = "scale(0.92)";
    await sleep(50);
    // Change name and animate in
    winnerNameEl.textContent =
      participants[idx].fullName || participants[idx].name || participants[idx];
    winnerNameEl.classList.add("winner-name--visible");
    winnerNameEl.style.opacity = 1;
    winnerNameEl.style.transform = "scale(1.08)";
    await sleep(stepDuration - 50); // Account for the 50ms fade time
    winnerNameEl.style.transform = "scale(1)";
  }
  // Pick winner
  const winnerIdx = Math.floor(Math.random() * participants.length);
  const winner = participants[winnerIdx];
  winnerNameEl.textContent = winner.fullName || winner.name || winner;
  winnerNameEl.classList.add("winner-name--visible");
  winnerNameEl.style.opacity = 1;
  winnerNameEl.style.transform = "scale(1.12)";
  setTimeout(() => {
    winnerNameEl.style.transform = "scale(1)";
  }, 200);
  return winner;
}

// Sleep helper
function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

// Audio logic
let drumAudio, winAudio;
function initAudio() {
  drumAudio = new Audio("drum.mp3");
  drumAudio.loop = true;
  drumAudio.volume = 0.7;
  winAudio = new Audio("win.mp3");
  winAudio.volume = 1;
}
function playDrumSound() {
  if (drumAudio) {
    drumAudio.currentTime = 0;
    drumAudio.play();
  }
}
function fadeOutDrumSound() {
  if (!drumAudio) return;
  let fade = setInterval(() => {
    if (drumAudio.volume > 0.05) {
      drumAudio.volume -= 0.05;
    } else {
      drumAudio.pause();
      drumAudio.volume = 0.7;
      clearInterval(fade);
    }
  }, 40);
}
function stopDrumSound() {
  if (drumAudio) {
    drumAudio.pause();
    drumAudio.currentTime = 0;
    drumAudio.volume = 0.7;
  }
}
function playWinSound() {
  if (winAudio) {
    winAudio.currentTime = 0;
    winAudio.play();
  }
}

// Confetti
function triggerConfetti() {
  if (window.confetti) {
    window.confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
      zIndex: 9999,
      colors: ["#ffe066", "#1cb7bf", "#3ed5dd", "#25c2e6", "#fff"],
    });
  }
}

// Selection count
function updateSelectionCount() {
  selectionCount++;
  if (selectionCountEl) selectionCountEl.textContent = selectionCount;
}

// Prize selection DOM
const selectPrizeBtn = document.getElementById("selectPrizeBtn");
const prizeBtnLoading = document.getElementById("prizeBtnLoading");
const prizeCard = document.getElementById("prizeCard");
const prizePlaceholder = document.getElementById("prizePlaceholder");
const prizeContent = document.getElementById("prizeContent");
const prizeIcon = document.getElementById("prizeIcon");
const prizeName = document.getElementById("prizeName");
const prizeResult = document.getElementById("prizeResult");

function showPrizeContent() {
  prizePlaceholder.style.display = "none";
  prizeContent.style.display = "block";
  prizeContent.style.opacity = 1;
  prizeContent.style.transform = "scale(1)";
}
function showPrizePlaceholder() {
  prizePlaceholder.style.display = "block";
  prizeContent.style.display = "none";
  prizeContent.style.opacity = 0;
  prizeContent.style.transform = "scale(0.9)";
  prizeName.textContent = "";
  prizeIcon.textContent = "🎁";
  prizeResult.textContent = "";
}

function setPrizeBtnLoading(loading) {
  if (loading) {
    selectPrizeBtn.classList.add("btn--loading");
    selectPrizeBtn.disabled = true;
  } else {
    selectPrizeBtn.classList.remove("btn--loading");
    selectPrizeBtn.disabled = false;
  }
}

function getNextPrizeIdx() {
  // First prize is always Gold, second is always Dubai Flight
  if (prizeAttempt === 0) return prizes.findIndex((p) => p.id === "prizeGold");
  if (prizeAttempt === 1) return prizes.findIndex((p) => p.id === "prizeDubai");
  // After first two, pick random
  return Math.floor(Math.random() * prizes.length);
}

async function shufflePrizes() {
  showPrizeContent();
  prizeResult.textContent = "";
  // Play drum sound for 4s during shuffle
  if (window.drumAudio) {
    window.drumAudio.currentTime = 0;
    window.drumAudio.volume = 0.7;
    window.drumAudio.play();
  }
  // Animate shuffle for 2.5s, 18 steps (extend to 4s for drum sync)
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
    prizeName.style.transition = "opacity 0.1s, transform 0.1s";
    prizeName.style.opacity = 0;
    prizeName.style.transform = "scale(0.92)";
    prizeIcon.style.transition = "opacity 0.1s, transform 0.1s";
    prizeIcon.style.opacity = 0;
    prizeIcon.style.transform = "scale(0.92)";
    await sleep(50);
    // Animate in
    prizeName.textContent = prizes[idx].label;
    prizeIcon.textContent = prizes[idx].icon;
    prizeName.style.opacity = 1;
    prizeName.style.transform = "scale(1.08)";
    prizeIcon.style.opacity = 1;
    prizeIcon.style.transform = "scale(1.08)";
    await sleep(stepDuration - 50);
    prizeName.style.transform = "scale(1)";
    prizeIcon.style.transform = "scale(1)";
  }
  // Fade out drum sound
  if (window.drumAudio) {
    let fade = setInterval(() => {
      if (window.drumAudio.volume > 0.05) {
        window.drumAudio.volume -= 0.05;
      } else {
        window.drumAudio.pause();
        window.drumAudio.volume = 0.7;
        clearInterval(fade);
      }
    }, 40);
  }
  // Reveal selected prize
  const prizeIdx = getNextPrizeIdx();
  prizeName.textContent = prizes[prizeIdx].label;
  prizeIcon.textContent = prizes[prizeIdx].icon;
  prizeName.style.opacity = 1;
  prizeName.style.transform = "scale(1.12)";
  prizeIcon.style.opacity = 1;
  prizeIcon.style.transform = "scale(1.12)";
  setTimeout(() => {
    prizeName.style.transform = "scale(1)";
    prizeIcon.style.transform = "scale(1)";
  }, 200);
  prizeResult.textContent = prizes[prizeIdx].result;
  // Play win sound
  if (window.winAudio) {
    window.winAudio.currentTime = 0;
    window.winAudio.play();
  }
  // --- Fun celebratory animation ---
  anime({
    targets: prizeCard,
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
        prizeCard.style.boxShadow = anim.animations[1].currentValue;
      }
    },
  });
  anime({
    targets: [prizeName, prizeIcon],
    scale: [1, 1.18, 0.96, 1],
    duration: 700,
    easing: "easeOutElastic(1, .6)",
  });
  // Confetti burst
  if (window.confetti) {
    window.confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.7 },
      zIndex: 9999,
      colors: ["#ffe066", "#f5d76e", "#fff", "#2563eb"],
    });
  }
  // --- Emoji burst animation ---
  emojiBurst(prizes[prizeIdx].icon, prizeCard, 18);
  prizeAttempt++;
}

// Emoji burst animation
function emojiBurst(emoji, anchorEl, count = 16) {
  const rect = anchorEl.getBoundingClientRect();
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = rect.left + rect.width / 2 + "px";
  container.style.top = rect.top + rect.height / 2 + "px";
  container.style.pointerEvents = "none";
  container.style.zIndex = 9999;
  document.body.appendChild(container);
  const emojis = [];
  for (let i = 0; i < count; i++) {
    const span = document.createElement("span");
    span.textContent = emoji;
    span.style.position = "absolute";
    span.style.fontSize = "2.2rem";
    span.style.opacity = "0.92";
    span.style.left = "0px";
    span.style.top = "0px";
    container.appendChild(span);
    emojis.push(span);
  }
  emojis.forEach((el, i) => {
    const angle = (2 * Math.PI * i) / count;
    const distance = 120 + Math.random() * 60;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    anime({
      targets: el,
      translateX: x,
      translateY: y,
      scale: [1.2, 1.6 + Math.random() * 0.5],
      rotate: Math.random() * 360,
      opacity: [0.92, 0.1],
      duration: 1200 + Math.random() * 700,
      easing: "easeOutCubic",
      complete: () => {
        el.remove();
      },
    });
  });
  setTimeout(() => {
    container.remove();
  }, 2000);
}

// Audio setup for prize section
if (typeof window.drumAudio === "undefined") {
  window.drumAudio = new Audio("drum.mp3");
  window.drumAudio.loop = false;
  window.drumAudio.volume = 0.7;
}
if (typeof window.winAudio === "undefined") {
  window.winAudio = new Audio("win.mp3");
  window.winAudio.volume = 1;
}

selectPrizeBtn.addEventListener("click", async () => {
  setPrizeBtnLoading(true);
  showPrizeContent();
  await shufflePrizes();
  setPrizeBtnLoading(false);
});

// On load, show placeholder
showPrizePlaceholder();
// --- MISSING LOGIC IMPLEMENTATION END ---

document.addEventListener("DOMContentLoaded", () => {
  // Initialize audio
  initAudio();

  // Fetch participants for winner picking
  fetchParticipants();

  // Set initial stats (if present)
  const totalParticipantsEl = document.getElementById("totalParticipants");
  if (totalParticipantsEl) {
    totalParticipantsEl.textContent = participants.length;
  }
  if (selectionCountEl) selectionCountEl.textContent = selectionCount;

  // Enhanced initial styling - work with existing CSS
  if (selectionCountEl) selectionCountEl.style.transition = "all 0.2s ease";

  // Add support for CSS custom properties to winner card
  if (winnerCard) {
    winnerCard.style.transform = "scale(var(--scale, 1))";
    winnerCard.style.setProperty("--scale", "1");
  }

  // Add enhanced hover effects that work with existing styles
  if (selectBtn) {
    selectBtn.addEventListener("mouseenter", () => {
      if (!isSelecting && !selectBtn.disabled) {
        selectBtn.style.transform = "translateY(-3px) scale(1.02)";
      }
    });
    selectBtn.addEventListener("mouseleave", () => {
      if (!isSelecting && !selectBtn.disabled) {
        selectBtn.style.transform = "";
      }
    });
    // Winner selection
    selectBtn.addEventListener("click", selectWinner);
  }

  renderPrizeCards();
  resetPrizeCards();
});
