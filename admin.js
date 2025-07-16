// API base URL
const API_BASE = "https://random-winner-app-production.up.railway.app/users";

// State
let participants = [];

// DOM elements
const addParticipantsForm = document.getElementById("addParticipantsForm");
const participantsInput = document.getElementById("participantsInput");
const participantsList = document.getElementById("participantsList");
const participantsLoading = document.getElementById("participantsLoading");
const participantsError = document.getElementById("participantsError");
const removeAllBtn = document.getElementById("removeAllBtn");

// Fetch participants from API
async function fetchParticipants() {
  participantsLoading.style.display = "block";
  participantsError.style.display = "none";
  try {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error("Failed to fetch participants");
    const data = await res.json();
    participants = data;
    renderParticipants();
  } catch (err) {
    participantsError.textContent = err.message;
    participantsError.style.display = "block";
  } finally {
    participantsLoading.style.display = "none";
  }
}

// Add participants
async function addParticipants(names) {
  participantsLoading.style.display = "block";
  participantsError.style.display = "none";
  try {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ names }),
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Failed to add participants");
    }
    await fetchParticipants();
    participantsInput.value = "";
  } catch (err) {
    participantsError.textContent = err.message;
    participantsError.style.display = "block";
  } finally {
    participantsLoading.style.display = "none";
  }
}

// Remove a participant
async function removeParticipant(id) {
  participantsLoading.style.display = "block";
  participantsError.style.display = "none";
  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to remove participant");
    await fetchParticipants();
  } catch (err) {
    participantsError.textContent = err.message;
    participantsError.style.display = "block";
  } finally {
    participantsLoading.style.display = "none";
  }
}

// Remove all participants
async function removeAllParticipants() {
  if (!confirm("Are you sure you want to remove all participants?")) return;
  participantsLoading.style.display = "block";
  participantsError.style.display = "none";
  try {
    const res = await fetch(API_BASE, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to remove all participants");
    await fetchParticipants();
  } catch (err) {
    participantsError.textContent = err.message;
    participantsError.style.display = "block";
  } finally {
    participantsLoading.style.display = "none";
  }
}

// Render participants list
function renderParticipants() {
  participantsList.innerHTML = "";
  if (!participants.length) {
    participantsList.innerHTML =
      '<li class="participants-list__item">No participants yet.</li>';
    return;
  }
  participants.forEach((p) => {
    const li = document.createElement("li");
    li.className = "participants-list__item";
    li.innerHTML = `<span class="participants-list__name">${
      p.fullName || p.name
    }</span>
      <button class="participants-list__remove" title="Remove" data-id="${
        p._id || p.id
      }">&times;</button>`;
    participantsList.appendChild(li);
  });
}

// Event listeners
addParticipantsForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const names = participantsInput.value.trim();
  if (!names) return;
  addParticipants(names);
});

participantsList.addEventListener("click", (e) => {
  if (e.target.classList.contains("participants-list__remove")) {
    const id = e.target.getAttribute("data-id");
    removeParticipant(id);
  }
});

removeAllBtn.addEventListener("click", () => {
  removeAllParticipants();
});

// On DOMContentLoaded, fetch participants

document.addEventListener("DOMContentLoaded", () => {
  fetchParticipants();
});
