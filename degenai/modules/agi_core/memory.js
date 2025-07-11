// File: modules/agi_core/memory.js
import { db, collection, addDoc } from './firebase.js';

// ——— Estado em memória ———
let sessionHistory = [];
let wordCounts = {};
let profileId = null;
let topWordsArr = [];

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
    // escolhe a palavra mais frequente
    profileId = Object.entries(wordCounts)
      .sort(([,a],[,b]) => b - a)
      .map(([w]) => w)[0] || 'anonymous';
    await saveProfile();
  }

  // 4) Grava nos 4 gates
  await Promise.all([
    // Conversations (volátil)
    addDoc(collection(db, 'conversations'), {
      profileId, userText, botReply, timestamp
    }),
    // Corpus (médio prazo)
    addDoc(collection(db, 'corpus'), {
      profileId, userText, botReply, tokens, timestamp
    }),
    // Event Gates (timeline)
    addDoc(collection(db, 'event_gates'), {
      profileId,
      eventType: 'interaction',
      data: { userText, botReply },
      timestamp
    })
    // Profiles já foi criado em saveProfile, não precisa aqui
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

  await addDoc(collection(db, 'profiles'), {
    id: profileId,
    topWords: topWordsArr,
    createdAt: new Date()
  });

  // E salva imediatamente no localStorage
  exportProfileToLocalStorage();
}

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
  localStorage.setItem('userProfile', JSON.stringify({
    profileId,
    topWords: topWordsArr
  }));
}

export function loadProfileFromStorage() {
  const raw = localStorage.getItem('userProfile');
  if (!raw) return;
  const { profileId: id, topWords } = JSON.parse(raw);
  profileId = id;
  topWordsArr = topWords;
}

// ——— Acesso ao perfil na UI (opcional) ———
export function getUserProfile() {
  return { profileId, topWords: topWordsArr };
}
