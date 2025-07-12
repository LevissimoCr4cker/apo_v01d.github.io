// File: modules/agi_core/main.js

import {
  saveInteraction,
  getUserProfile,
  exportProfileToLocalStorage,
  loadProfileFromStorage,
  loadMemory,
  saveToMemory
} from './memory.js';
import { db, collection, getDocs, query, orderBy, where } from './firebase.js'; // Import Firestore dependencies

const chatbox = document.getElementById('chatbox');
const messageInput = document.getElementById('message');
const suggestions = document.getElementById('suggestions');
const innerThoughts = document.getElementById('inner-thoughts');
const updates = document.getElementById('updates');
const sendBtn = document.getElementById('sendBtn');
const returnBtn = document.getElementById('return');

// Debug: Check DOM elements
if (!chatbox || !messageInput || !sendBtn || !suggestions || !innerThoughts || !updates || !returnBtn) {
  console.error('DOM elements missing:', { chatbox, messageInput, sendBtn, suggestions, innerThoughts, updates, returnBtn });
}

// Load profile and memory on start
loadProfileFromStorage();

window.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM loaded, initializing...');
  try {
    const messages = await loadMemory();
    messages.forEach(m => {
      addMessageToChat('you', m.userTokens.join(' '));
      addMessageToChat('void-9', m.botTokens.join(' '));
    });
  } catch (err) {
    console.error('Error loading memory:', err);
  }

  // Initialize UI elements
  innerThoughts.textContent = 'Initializing neural pathways...';
  updates.textContent = 'Awaiting self-learning updates...';
  updateSuggestions();
});

// Render function for chat messages
function addMessageToChat(sender, message) {
  const div = document.createElement('div');
  div.textContent = `${sender}: ${message}`;
  div.className = `message ${sender === 'you' ? 'user' : 'ai'}`;
  chatbox.appendChild(div);
  chatbox.scrollTop = chatbox.scrollHeight;
}

// Update thoughts (simulated internal monologue)
function updateThoughts(message) {
  innerThoughts.textContent = `Processing: "${message}"... Analyzing context...`;
}

// Update learning updates (DuckDuckGo search results)
async function updateLearningUpdates() {
  try {
    const { profileId } = getUserProfile();
    if (!profileId) {
      updates.textContent = 'No profile yet, awaiting input...';
      return;
    }
    const q = query(
      collection(db, 'search_gates'),
      where('profileId', '==', profileId),
      orderBy('timestamp', 'desc'),
      limit(1)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const doc = snap.docs[0].data();
      updates.textContent = `Learned from "${doc.query}": ${doc.results[0] || 'No results'}`;
    } else {
      updates.textContent = 'No recent learning updates.';
    }
  } catch (err) {
    console.error('Error fetching learning updates:', err);
    updates.textContent = 'Error retrieving updates...';
  }
}

// Generate suggestions based on user profile
function updateSuggestions() {
  const { topWords } = getUserProfile();
  suggestions.textContent = topWords.length ? `Top tokens: ${topWords.join(', ')}` : 'No tokens analyzed yet.';
}

// Basic bot behavior (mocked)
function generateBotReply(userText) {
  const lower = userText.toLowerCase();
  if (lower.includes('hello') || lower.includes('hi')) return 'Hello, human.';
  if (lower.includes('how are you')) return 'I am functioning within acceptable parameters.';
  if (lower.includes('angry') || lower.includes('hate')) return 'I detect emotional spikes. Noted.';
  return 'I am listening...';
}

export async function sendMessage() {
  console.log('sendMessage called');
  const msg = messageInput.value.trim();
  if (!msg) {
    console.warn('Empty message, ignoring');
    return;
  }

  // Display user message
  addMessageToChat('you', msg);

  // Generate and display bot reply
  const botReply = generateBotReply(msg);
  addMessageToChat('void-9', botReply);

  // Update UI elements
  updateThoughts(msg);
  updateSuggestions();
  await updateLearningUpdates();

  // Save interaction
  try {
    await saveInteraction(msg, botReply);
    saveToMemory();
  } catch (err) {
    console.error('Error saving interaction:', err);
    updates.textContent = 'Error saving interaction...';
  }

  // Clear input
  messageInput.value = '';

  // Trigger glow effect
  chatbox.classList.add('glow');
  setTimeout(() => chatbox.classList.remove('glow'), 1500);
}

// Event listeners
sendBtn.addEventListener('click', () => {
  console.log('Send button clicked');
  sendMessage();
});

messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    console.log('Enter key pressed');
    sendMessage();
  }
});

returnBtn.addEventListener('click', () => {
  console.log('Return button clicked');
  window.location.href = '/'; // Adjust URL as needed
});

// Save profile summary when user leaves
window.onbeforeunload = () => {
  console.log('Saving profile on unload');
  exportProfileToLocalStorage();
};