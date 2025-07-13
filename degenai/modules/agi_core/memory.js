// File: modules/agi_core/memory.js
import { db, collection, addDoc } from './firebase.js';

// ========== Utility: Tokenize user input (optional enhancement) ==========
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);
}

// ========== Firebase: Save user input ==========
async function saveUserInput(text) {
  const shortRef = collection(db, 'short');
  try {
    await addDoc(shortRef, {
      original: text,
      tokens: tokenize(text),
      timestamp: Date.now()
    });
    console.log('🧠 Saved to /short:', text); // debug
  } catch (err) {
    console.error('❌ Error saving user input to Firebase:', err);
  }
}

// ========== Core: Watch Chatbox for User Inputs ==========
function observeChatbox() {
  const chatbox = document.getElementById('chatbox');
  if (!chatbox) {
    console.warn('⚠️ chatbox element not found.');
    return;
  }

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node;
          if (el.classList.contains('user')) {
            const text = el.textContent.replace(/^\s*🧍 you:\s*/, '').trim();
            if (text.length > 0) {
              saveUserInput(text);
            }
          }
        }
      }
    }
  });

  observer.observe(chatbox, { childList: true, subtree: true });
}

// ========== Start Listening on Page Load ==========
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', observeChatbox);
} else {
  observeChatbox();
}
