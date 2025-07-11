// File: modules/agi_core/main.js

import {
  saveInteraction,
  getUserProfile,
  exportProfileToLocalStorage,
  loadProfileFromStorage
} from './memory.js';

// DOM elements
const chatbox = document.getElementById('chatbox');
const messageInput = document.getElementById('message');
const suggestions = document.getElementById('suggestions');

// Load profile on start
loadProfileFromStorage();

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

  const userDiv = document.createElement('div');
  userDiv.textContent = 'you: ' + msg;
  userDiv.style.color = '#0ff';
  chatbox.appendChild(userDiv);

  const botReply = generateBotReply(msg);

  const botDiv = document.createElement('div');
  botDiv.textContent = 'void-9: ' + botReply;
  botDiv.style.color = '#aaa';
  chatbox.appendChild(botDiv);

  messageInput.value = '';
  chatbox.scrollTop = chatbox.scrollHeight;

  suggestions.textContent = `(last phrase: "${msg}")`;

  saveInteraction(msg, botReply);
}

messageInput.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') sendMessage();
});

// When user leaves the tab, save the profile summary
window.onbeforeunload = () => {
  exportProfileToLocalStorage();
};
