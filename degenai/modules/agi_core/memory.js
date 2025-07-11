import { db, collection, addDoc, getDocs } from './firebase.js';

// === SHORT-TERM MEMORY ===
let sessionHistory = [];
let wordCounts = {};
let profileId = null; // será nomeado após a primeira interação

// === FUNÇÃO PRINCIPAL ===
export async function saveInteraction(userText, botReply) {
  sessionHistory.push({ user: userText, bot: botReply });

  // === Atualizar contagem de palavras
  const words = userText.toLowerCase().split(/\W+/).filter(Boolean);
  for (const word of words) {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  }

  // === Gerar profileId se ainda não existir
  if (!profileId) {
    profileId = getTopWord();
    await saveProfile(); // salva o perfil só 1 vez por sessão
  }

  // === Salvar nas 3 coleções
  await Promise.allSettled([
    addDoc(collection(db, "conversations"), {
      user: userText,
      bot: botReply,
      timestamp: new Date()
    }),

    addDoc(collection(db, "corpus"), {
      userText,
      botReply,
      tokens: words,
      profileId,
      timestamp: new Date()
    })
  ]);
}

// === GERAR PERFIL
function getTopWord() {
  const sorted = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1]);

  return sorted.length > 0 ? sorted[0][0] : "anonymous";
}

async function saveProfile() {
  const topWords = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(e => e[0]);

  await addDoc(collection(db, "profiles"), {
    id: profileId,
    topWords,
    timestamp: new Date()
  });
}

// === UTILITÁRIOS
export function getSessionLog() {
  return sessionHistory;
}

export function getProfileId() {
  return profileId;
}
