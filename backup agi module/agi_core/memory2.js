// File: modules/agi_core/memory.js
import { db, collection, addDoc, getDocs, query, where, deleteDoc } from './firebase.js';

// ——— State memory ———
let sessionHistory = [];
let wordCounts = {};
let profileId = null;
let processedQueries = new Set();

// ——— Tokenization ———
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);
}

// ——— Save unique token ———
export async function saveUniqueToken(gate, text) {
  const tokens = tokenize(text);
  const gateRef = collection(db, gate);

  for (let token of tokens) {
    const existing = await getDocs(query(gateRef, where('token', '==', token)));
    if (existing.empty) {
      await addDoc(gateRef, { token, timestamp: Date.now(), validation: true });
    }
  }
}

// ——— Validate token with external source ———
export async function validateAndUpdateKnowledge(gate, claim, validateFn) {
  const isValid = await validateFn(claim);
  const tokens = tokenize(claim);
  const gateRef = collection(db, gate);

  if (!isValid) {
    const existing = await getDocs(query(gateRef, where('token', 'in', tokens)));
    existing.forEach(doc => deleteDoc(doc.ref));
  } else {
    await saveUniqueToken(gate, claim);
  }
}

// ——— Placeholder External Validator (customize) ———
export async function validateElectionClaim(claim) {
  const lower = claim.toLowerCase();
  return !lower.includes("july 10") && lower.includes("october");
}

// ——— Session memory (for thoughts/conversation) ———
export function addToSessionHistory(message) {
  sessionHistory.push(message);
}

export function getSessionHistory() {
  return sessionHistory;
}

// ——— Export profile ———
export function getUserProfile() {
  return { sessionHistory, wordCounts, profileId };
}

export function exportProfileToLocalStorage() {
  const profile = getUserProfile();
  localStorage.setItem('agi_profile', JSON.stringify(profile));
}

export function loadProfileFromStorage() {
  const stored = localStorage.getItem('agi_profile');
  if (stored) {
    const profile = JSON.parse(stored);
    sessionHistory = profile.sessionHistory || [];
    wordCounts = profile.wordCounts || {};
    profileId = profile.profileId || null;
  }
}

// ——— Save DuckDuckGo search result (for self-learning) ———
export async function saveDuckDuckGoResearch(term, resultText) {
  const tokens = tokenize(term + ' ' + resultText);
  const gateRef = collection(db, 'research');

  for (let token of tokens) {
    const existing = await getDocs(query(gateRef, where('token', '==', token)));
    if (existing.empty) {
      await addDoc(gateRef, { token, source: term, timestamp: Date.now(), validation: true });
    }
  }
}
