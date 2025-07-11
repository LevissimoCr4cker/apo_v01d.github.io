// File: modules/agi_core/main.js

import {
  saveInteraction,
  getUserProfile,
  exportProfileToLocalStorage,
  loadProfileFromStorage,
  loadMemory,
  saveToMemory
} from './memory.js'; // Corrigido caminho para './memory.js' (evite repetir 'modules/agi_core')

const chatbox = document.getElementById('chatbox');
const messageInput = document.getElementById('message');
const suggestions = document.getElementById('suggestions');

// Load profile and memory on start
loadProfileFromStorage();

window.addEventListener('DOMContentLoaded', async () => {
  const messages = await loadMemory();
  messages.forEach(m => {
    addMessageToChat(m.user, m.message);
  });
});

// Render function
function addMessageToChat(user, message) {
  const div = document.createElement('div');
  div.textContent = `${user}: ${message}`;
  div.style.color = user === 'you' ? '#0ff' : '#aaa';
  chatbox.appendChild(div);
  chatbox.scrollTop = chatbox.scrollHeight;
}

// Basic bot behavior (mocked)
function generateBotReply(userText) {
  const lower = userText.toLowerCase();
  if (lower.includes("hello") || lower.includes("hi")) return "Hello, human.";
  if (lower.includes("how are you")) return "I am functioning within acceptable parameters.";
  if (lower.includes("angry") || lower.includes("hate")) return "I detect emotional spikes. Noted.";
  return "I am listening...";
}

export function sendMessage() {
  const msg = messageInput.value.trim();
  if (!msg) return;

  addMessageToChat('you', msg);

  const botReply = generateBotReply(msg);
  addMessageToChat('void-9', botReply);

  messageInput.value = '';
  suggestions.textContent = `(last phrase: "${msg}")`;

  // Salva tudo: perfil, corpus, conversa
  saveInteraction(msg, botReply);
}


messageInput.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') sendMessage();
});

// Save profile summary when user leaves
window.onbeforeunload = () => {
  exportProfileToLocalStorage();
};
