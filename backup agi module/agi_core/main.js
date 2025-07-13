// File: modules/agi_core/main.js

import {
  saveInteraction,
  getUserProfile,
  exportProfileToLocalStorage,
  loadProfileFromStorage,
  loadMemory,
  saveToMemory
} from './memory.js';
import { db, collection, getDocs, query, orderBy, where, limit } from './firebase.js';

let chatbox, messageInput, suggestions, innerThoughts, updates, sendBtn, returnBtn;

// Initialize on DOM ready
window.addEventListener('DOMContentLoaded', async () => {
  // Cache UI elements
  chatbox = document.getElementById('chatbox');
  messageInput = document.getElementById('message');
  suggestions = document.getElementById('suggestions');
  innerThoughts = document.getElementById('inner-thoughts');
  updates = document.getElementById('updates');
  sendBtn = document.getElementById('sendBtn');
  returnBtn = document.getElementById('return');

  // Load stored profile and memory
  loadProfileFromStorage();
  try {
    const msgs = await loadMemory();
    msgs.forEach(m => {
      addMessageToChat('you', m.userTokens.join(' '));
      addMessageToChat('void-9', m.botTokens.join(' '));
    });
  } catch (e) {
    console.error('Memory load error:', e);
  }

  // Initial placeholders
  innerThoughts.textContent = 'Initializing neural pathways...';
  updates.textContent = 'Awaiting self-learning updates...';
  updateSuggestions();

  // Bind events
  if (sendBtn) sendBtn.addEventListener('click', handleSend);
  if (messageInput) messageInput.addEventListener('keypress', e => { if (e.key === 'Enter') handleSend(); });
  if (returnBtn) returnBtn.addEventListener('click', () => window.location.href = '/index.html');
});

// Add a message to chat log
function addMessageToChat(sender, msg) {
  const div = document.createElement('div');
  div.textContent = `${sender}: ${msg}`;
  div.className = `message ${sender === 'you' ? 'user' : 'ai'}`;
  chatbox.appendChild(div);
  chatbox.scrollTop = chatbox.scrollHeight;
}

// Thoughts update
function updateThoughts(text) {
  innerThoughts.textContent = `Processing "${text}"...`;
}

// Learning updates
async function updateLearningUpdates() {
  try {
    const { profileId } = getUserProfile();
    if (!profileId) { updates.textContent = 'No profile yet'; return; }
    const q = query(
      collection(db, 'search_gates'),
      where('profileId', '==', profileId),
      orderBy('timestamp', 'desc'),
      limit(1)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const d = snap.docs[0].data();
      updates.textContent = `Learned from "${d.query}": ${d.results[0]||'No results'}`;
    } else updates.textContent = 'No recent learning updates.';
  } catch (e) {
    console.error(e);
    updates.textContent = 'Error retrieving updates';
  }
}

// Suggestions
function updateSuggestions() {
  const { topWords } = getUserProfile();
  suggestions.textContent = topWords.length ? `Top tokens: ${topWords.join(', ')}` : 'No tokens yet.';
}

// Main send handler
async function handleSend() {
  const text = messageInput.value.trim();
  if (!text) return;

  addMessageToChat('you', text);

  // Simple bot reply stub (replace with SamFormer call)
  let reply;
  const l = text.toLowerCase();
  if (l.includes('hello')) reply = 'Hello, human.';
  else if (l.includes('how are you')) reply = 'I am functioning within acceptable parameters.';
  else reply = 'I am listening...';

  addMessageToChat('void-9', reply);

  updateThoughts(text);
  updateSuggestions();
  await updateLearningUpdates();

  messageInput.value = '';
  chatbox.classList.add('glow');
  setTimeout(() => chatbox.classList.remove('glow'), 1500);

  // Save interaction if desired
  // await saveInteraction(text, reply);
  // saveToMemory();
}

// Persist on unload
window.addEventListener('beforeunload', () => {
  exportProfileToLocalStorage();
});

console.log('main.js loaded');
