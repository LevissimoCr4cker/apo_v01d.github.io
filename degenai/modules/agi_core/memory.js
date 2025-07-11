import { db, collection, addDoc, getDocs, query, orderBy } from './firebase.js';

// === SHORT-TERM MEMORY (PER TAB) ===
let sessionHistory = [];

// === PROFILE OBJECT (LONG-TERM) ===
let userProfile = {
  traits: {},
  log: [],
  lastSavedId: null
};

// === SAVE INTERACTION ===
export async function saveInteraction(userText, botReply) {
  // Curto prazo
  sessionHistory.push({ user: userText, bot: botReply });
  userProfile.log.push(userText);
  extractTraits(userText);

  // Resumo do perfil atual
  const summary = summarizeProfile();
  const profileId = summary.id;

  await Promise.allSettled([
    saveCorpus(userText, botReply, profileId),
    saveToProfile(summary),
    addDoc(collection(db, "conversations"), {
      user: userText,
      bot: botReply,
      timestamp: new Date()
    })
  ]);
}

// === LOAD MEMORY FROM FIREBASE ===
export async function loadMemory() {
  const q = query(collection(db, "conversations"), orderBy("timestamp"));
  const snapshot = await getDocs(q);
  const allMessages = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    allMessages.push(data);
    sessionHistory.push({ user: data.user, bot: data.bot });
  });
  return allMessages;
}

// === CORPUS GLOBAL ===
async function saveCorpus(user, bot, profileId) {
  const tokens = user.toLowerCase().split(/\W+/).filter(Boolean);
  await addDoc(collection(db, "corpus"), {
    userText: user,
    botReply: bot,
    tokens,
    profileId,
    timestamp: Date.now()
  });
}

// === LONG-TERM PROFILE STORAGE ===
async function saveToProfile(summary) {
  if (summary.id === userProfile.lastSavedId) return;
  userProfile.lastSavedId = summary.id;

  await addDoc(collection(db, "profiles"), summary);
}

// === EXTRACT TRAITS FROM TEXT ===
function extractTraits(text) {
  const lower = text.toLowerCase();
  const words = lower.split(/\W+/);
  for (const word of words) {
    if (!word) continue;
    userProfile.traits[word] = (userProfile.traits[word] || 0) + 1;
  }
}

// === SUMMARIZE PROFILE ===
function summarizeProfile() {
  const sorted = Object.entries(userProfile.traits)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50);

  const topWords = sorted.map(e => e[0]);
  const id = sorted.length > 0 ? sorted[0][0] : "anonymous";

  return {
    id,
    topWords,
    traits: userProfile.traits,
    timestamp: Date.now()
  };
}

// === MATCH PROFILE FROM INPUT ===
export async function matchProfile(text) {
  const inputWords = text.toLowerCase().split(/\W+/).filter(Boolean);

  const snapshot = await getDocs(collection(db, "profiles"));
  let bestMatch = null;
  let maxMatches = 0;

  snapshot.forEach(doc => {
    const profile = doc.data();
    const overlap = profile.topWords.filter(w => inputWords.includes(w));
    if (overlap.length >= 10 && overlap.length > maxMatches) {
      maxMatches = overlap.length;
      bestMatch = profile.id;
    }
  });

  return bestMatch || "anonymous";
}

// === GETTERS ===
export function getUserProfile() {
  return userProfile;
}

export function getSessionLog() {
  return sessionHistory;
}

// === LOCAL STORAGE ===
export function exportProfileToLocalStorage() {
  const profileSummary = summarizeProfile();
  localStorage.setItem("void9_user_profile", JSON.stringify(profileSummary));
}

export function loadProfileFromStorage() {
  const raw = localStorage.getItem("void9_user_profile");
  if (raw) {
    const parsed = JSON.parse(raw);
    userProfile.traits = parsed.traits || {};
  }
}
