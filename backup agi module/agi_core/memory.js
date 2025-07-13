// File: modules/agi_core/memory.js
import { db, collection, addDoc, getDocs } from './firebase.js';
import { trainSamFormer, querySamFormer } from './samformer.js';

// Hypothetical DuckDuckGo search function (replace with actual API)
async function duckduckgoSearch(query) {
  try {
    // Example: Use axios or fetch to call a DuckDuckGo API
    // const response = await axios.get(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`);
    // return response.data.results || [];
    return [`Mock search result for "${query}"`]; // Placeholder
  } catch (err) {
    console.error('DuckDuckGo search error:', err);
    return [];
  }
}

// ——— Estado em memória ———
let sessionHistory = []; // Stores tokenized interactions
let wordCounts = {}; // Token frequency
let profileId = null; // Most frequent word
let topWordsArr = []; // Top 10 words
let processedQueries = new Set(); // Tracks processed search queries

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

// ——— Tokenization Function ———
function tokenize(text) {
  return text
    .toLowerCase()
    .split(/\W+/)
    .filter(Boolean); // Remove empty tokens
}

// ——— Inicializa Treino Periódico ———
async function periodicTraining() {
  try {
    const snap = await getDocs(collection(db, 'corpus'));
    const trainingData = [];
    snap.forEach(doc => {
      const d = doc.data();
      trainingData.push({
        input: d.userTokens.join(' '), // Reconstruct for training
        output: d.botTokens.join(' ')
      });
    });
    if (trainingData.length) {
      await trainSamFormer(trainingData, profileId);
    }
  } catch (err) {
    console.error('Erro no treino periódico:', err);
  }
}
periodicTraining();
setInterval(periodicTraining, 5 * 60_000); // Every 5 minutes

// ——— DuckDuckGo Search Every Minute ———
async function periodicSearch() {
  try {
    // Find the most frequent token
    const mostFrequent = Object.entries(wordCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0];
    if (!mostFrequent || processedQueries.has(mostFrequent)) return;

    // Perform DuckDuckGo search
    const results = await duckduckgoSearch(mostFrequent);
    processedQueries.add(mostFrequent);

    // Save to search_gates
    await addDoc(collection(db, 'search_gates'), {
      profileId,
      query: mostFrequent,
      results,
      timestamp: new Date()
    });

    // Optionally, append search results to corpus for training
    await addDoc(collection(db, 'corpus'), {
      profileId,
      userTokens: [mostFrequent],
      botTokens: results,
      timestamp: new Date()
    });
  } catch (err) {
    console.error('Erro na busca periódica:', err);
  }
}
setInterval(periodicSearch, 60_000); // Every minute

// ——— Função principal ———
export async function saveInteraction(userText, botReply) {
  const timestamp = new Date();

  // Tokenize input and output
  const userTokens = tokenize(userText);
  const botTokens = tokenize(botReply);

  // 1) Memória curta (sessionHistory)
  sessionHistory.push({ userTokens, botTokens, timestamp });

  // 2) Word counts
  userTokens.forEach(w => (wordCounts[w] = (wordCounts[w] || 0) + 1));

  // 3) Perfil (primeira vez somente)
  if (!profileId) {
    profileId = Object.entries(wordCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([w]) => w)[0] || 'anonymous';
    await saveProfile();
  }

  // 4) Grava nos 4 gates
  await Promise.all([
    addDoc(collection(db, 'conversations'), {
      profileId,
      userTokens,
      botTokens,
      timestamp
    }),
    addDoc(collection(db, 'corpus'), {
      profileId,
      userTokens,
      botTokens,
      timestamp
    }),
    addDoc(collection(db, 'event_gates'), {
      profileId,
      eventType: 'interaction',
      data: { userTokens, botTokens },
      timestamp
    })
    // profiles criado em saveProfile
  ]);

  // 5) Atualiza respostas via SamFormer e exibe
  const learnedReply = await querySamFormer(userTokens.join(' '), profileId);
  return learnedReply;
}

// ——— Cria o documento de perfil no Firestore ———
async function saveProfile() {
  topWordsArr = Object.entries(wordCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([w]) => w);

  await addDoc(collection(db, 'profiles'), {
    id: profileId,
    topWords: topWordsArr,
    createdAt: new Date()
  });
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