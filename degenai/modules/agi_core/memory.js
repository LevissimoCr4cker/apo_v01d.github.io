// File: modules/agi_core/memory.js
import { db, collection, addDoc } from './firebase.js';

// ——— Estado em memória ———
let sessionHistory = [];
let wordCounts = {};
let profileId = null;
let topWordsArr = [];
let processedQueries = new Set();

// Configura Self-Learning Updates (barra de rolagem, máximo 10 entries)
function setupUpdatesWindow() {
  document.addEventListener('DOMContentLoaded', () => {
    const updatesDiv = document.getElementById('updates');
    if (updatesDiv) {
      updatesDiv.style.maxHeight = '200px';
      updatesDiv.style.overflowY = 'auto';
      updatesDiv.style.display = 'flex';
      updatesDiv.style.flexDirection = 'column-reverse';
    }
  });
}
setupUpdatesWindow();

// ——— Função principal ———
export async function saveInteraction(userText, botReply) {
  const timestamp = new Date();

  // 1) Memória curta
  sessionHistory.push({ user: userText, bot: botReply, timestamp });

  // 2) Word counts
  const tokens = userText
    .toLowerCase()
    .split(/\W+/)
    .filter(Boolean);
  tokens.forEach(w => wordCounts[w] = (wordCounts[w]||0) + 1);

  // 3) Perfil (primeira vez somente)
  if (!profileId) {
    profileId = Object.entries(wordCounts)
      .sort(([,a],[,b]) => b - a)
      .map(([w]) => w)[0] || 'anonymous';
    await saveProfile();
  }

  // 4) Grava nos 4 gates
  await Promise.all([
    addDoc(collection(db, 'conversations'), { profileId, userText, botReply, timestamp }),
    addDoc(collection(db, 'corpus'),        { profileId, userText, botReply, tokens, timestamp }),
    addDoc(collection(db, 'event_gates'),   { profileId, eventType: 'interaction', data: { userText, botReply }, timestamp })
    // profiles já foi criado em saveProfile
  ]);

  // 5) Persiste localmente
  saveToMemory();
}

// ——— Cria o documento de perfil no Firestore ———
async function saveProfile() {
  topWordsArr = Object.entries(wordCounts)
    .sort(([,a],[,b]) => b - a)
    .slice(0,10)
    .map(([w]) => w);

  await addDoc(collection(db, 'profiles'), { id: profileId, topWords: topWordsArr, createdAt: new Date() });
  exportProfileToLocalStorage();
}

// ——— Fator Surpresa ———
async function runSurprise() {
  if (!sessionHistory.length) return;
  const idx = Math.floor(Math.random() * sessionHistory.length);
  const query = sessionHistory[idx].user;
  if (processedQueries.has(query)) return;
  processedQueries.add(query);

  try {
    const res = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`);
    const data = await res.json();
    const summary = data.AbstractText || (data.RelatedTopics[0] && data.RelatedTopics[0].Text) || '';
    if (!summary) return;

    const timestamp = new Date();
    // salva no corpus
    await addDoc(collection(db, 'corpus'), {
      profileId, userText: query, surpriseSummary: summary, source: 'duckduckgo', timestamp
    });

    // se contiver data, salva em event_gates
    const datePattern = /\d{4}-\d{2}-\d{2}/;
    const monthNames = /\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/;
    if (datePattern.test(summary) || monthNames.test(summary)) {
      await addDoc(collection(db, 'event_gates'), {
        profileId, eventType: 'surpriseEvent', data: { query, summary }, timestamp
      });
    }

    // Exibe no Self-Learning Updates
    const updatesDiv = document.getElementById('updates');
    if (updatesDiv) {
      const entry = document.createElement('div');
      entry.textContent = `Pesquisado: "${query}" → Aprendizado: ${summary}`;
      updatesDiv.prepend(entry);
      // Limita a 10 registros
      while (updatesDiv.children.length > 10) {
        updatesDiv.removeChild(updatesDiv.lastChild);
      }
    }
  } catch (err) {
    console.error('Surprise factor error:', err);
  }
}

// inicia o fator surpresa a cada 60s sem recarregar página
setInterval(runSurprise, 60_000);

// ——— Persistência local ———
export function saveToMemory() {
  localStorage.setItem('sessionHistory', JSON.stringify(sessionHistory));
}
export function loadMemory() {
  const raw = localStorage.getItem('sessionHistory');
  sessionHistory = raw ? JSON.parse(raw) : [];
  return sessionHistory;
}

export function exportProfileToLocalStorage() {
  if (!profileId) return;
  localStorage.setItem('userProfile', JSON.stringify({ profileId, topWords: topWordsArr }));
}
export function loadProfileFromStorage() {
  const raw = localStorage.getItem('userProfile');
  if (!raw) return;
  const { profileId: id, topWords } = JSON.parse(raw);
  profileId = id;
  topWordsArr = topWords;
}

export function getUserProfile() {
  return { profileId, topWords: topWordsArr };
}
