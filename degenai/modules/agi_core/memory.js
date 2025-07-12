// File: modules/agi_core/memory.js
import { db, collection, addDoc, getDocs } from './firebase.js';
import { trainSamFormer, querySamFormer } from './samformer.js';

// ——— Estado em memória ———
let sessionHistory = [];
let wordCounts = {};
let profileId = null;
let topWordsArr = [];
let processedQueries = new Set();

// Configura Self-Learning Updates
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

// ——— Inicializa Treino Periódico ———
// A cada X interações ou intervalo, re-treina o modelo com os dados do corpus
async function periodicTraining() {
  try {
    // obtém todos os documentos do corpus
    const snap = await getDocs(collection(db, 'corpus'));
    const trainingData = [];
    snap.forEach(doc => {
      const d = doc.data();
      trainingData.push({
        input: d.userText || d.surpriseSummary,
        output: d.botReply || d.surpriseSummary
      });
    });
    if (trainingData.length) {
      await trainSamFormer(trainingData, profileId);
    }
  } catch (err) {
    console.error('Erro no treino periódico:', err);
  }
}
// treina inicialmente e depois a cada 5 min
periodicTraining();
setInterval(periodicTraining, 5 * 60_000);

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
    addDoc(collection(db, 'conversations'),    { profileId, userText, botReply, timestamp }),
    addDoc(collection(db, 'corpus'),             { profileId, userText, botReply, tokens, timestamp }),
    addDoc(collection(db, 'event_gates'),        { profileId, eventType: 'interaction', data: { userText, botReply }, timestamp })
    // profiles criado em saveProfile
  ]);

  // 5) Atualiza respostas via SamFormer e exibe
  const learnedReply = await querySamFormer(userText, profileId);
  return learnedReply;
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
