// File: modules/agi_core/memory.js
import { db } from './firebase.js';
import { collection, addDoc } from 'firebase/firestore';

// ========== Save user message ==========
async function saveUserInput(text) {
  try {
    await addDoc(collection(db, 'short'), {
      message: text,
      timestamp: Date.now()
    });
    console.log('✅ Saved message to /short:', text);
  } catch (err) {
    console.error('❌ Error saving to Firestore:', err);
  }
}

// ========== Monitor chat for user messages ==========
function observeChatbox() {
  const chatbox = document.getElementById('chatbox');
  if (!chatbox) {
    console.warn('⚠️ chatbox not found.');
    return;
  }

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node;
          if (el.classList.contains('message') && el.classList.contains('user')) {
            const text = el.textContent.trim();
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

// ========== Start when ready ==========
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', observeChatbox);
} else {
  observeChatbox();
}
