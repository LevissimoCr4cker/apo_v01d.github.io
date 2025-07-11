// File: modules/agi_core/memory.js

// === SHORT-TERM MEMORY (PER TAB) ===
let sessionHistory = [];

// === PROFILE OBJECT ===
let userProfile = {
  traits: {},
  log: []
};

// === CORE FUNCTION: SAVE MESSAGE ===
export function saveInteraction(userText, botReply) {
  sessionHistory.push({ user: userText, bot: botReply });
  userProfile.log.push(userText);
  extractTraits(userText);
}

// === EXTRACT TRAITS ===
function extractTraits(text) {
  const lower = text.toLowerCase();
  const words = lower.split(/\W+/);

  for (const word of words) {
    if (!word) continue;
    userProfile.traits[word] = (userProfile.traits[word] || 0) + 1;
  }
}

// === GET PROFILE SUMMARY ===
export function getUserProfile() {
  return userProfile;
}

// === GET SESSION HISTORY ===
export function getSessionLog() {
  return sessionHistory;
}

// === FINALIZE PROFILE ON TAB CLOSE ===
export function exportProfileToLocalStorage() {
  const profileSummary = summarizeProfile();
  localStorage.setItem("void9_user_profile", JSON.stringify(profileSummary));
}

function summarizeProfile() {
  // Get top keywords
  const sorted = Object.entries(userProfile.traits)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(e => e[0]);

  return {
    topWords: sorted,
    traits: userProfile.traits,
    timestamp: Date.now()
  };
}

// === LOAD PROFILE FROM PREVIOUS SESSION ===
export function loadProfileFromStorage() {
  const raw = localStorage.getItem("void9_user_profile");
  if (raw) {
    const parsed = JSON.parse(raw);
    userProfile.traits = parsed.traits || {};
  }
}
