// File: modules/agi_core/memory/memory.js
import { db, rtdb } from './firebase.js';
import { collection, addDoc } from 'firebase/firestore';
import { ref, push } from 'firebase/database';

// Save user message to Firestore and tokenized version to Realtime Database
async function saveUserMessage(text) {
  try {
    // Clean the message (remove "🧍 you: " prefix)
    const cleanText = text.replace(/^🧍 you:\s*/, '').trim();
    if (!cleanText) {
      console.warn('⚠️ Empty message after cleaning, not saving.');
      return;
    }

    // Tokenize the message (split into words)
    const tokens = cleanText.split(/\s+/).filter(word => word.length > 0);

    // Save full message to Firestore
    await addDoc(collection(db, 'short'), {
      message: cleanText,
      timestamp: Date.now(),
    });
    console.log('✅ Saved to Firestore /short:', cleanText);

    // Save tokenized version to Realtime Database
    await push(ref(rtdb, 'user_conversation'), {
      tokens: tokens,
      timestamp: Date.now(),
    });
    console.log('✅ Saved tokens to Realtime Database /user_conversation:', tokens);
  } catch (err) {
    console.error('❌ Error saving to databases:', err);
  }
}

// Observe chatbox for new user messages
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
          const el = /** @type {HTMLElement} */ (node);
          if (el.classList.contains('message') && el.classList.contains('user')) {
            const text = el.textContent || '';
            if (text.trim().length > 0) {
              saveUserMessage(text);
            }
          }
        }
      }
    }
  });

  observer.observe(chatbox, { childList: true, subtree: true });
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', observeChatbox);
} else {
  observeChatbox();
}