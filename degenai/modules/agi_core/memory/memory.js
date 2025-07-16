import { db } from './firebase.js'; // ajuste o path se necessário
import { collection, addDoc } from 'firebase/firestore';

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (
        node.nodeType === 1 &&
        node.classList.contains('message') &&
        node.classList.contains('user')
      ) {
        const text = node.textContent.trim();
        if (text.startsWith("you:")) {
          const token = text.replace("you:", "").trim();
          saveTokenToFirestore(token);
        }
      }
    });
  });
});

async function saveTokenToFirestore(token) {
  try {
    await addDoc(collection(db, 'chat_log_user'), {
      token,
      timestamp: Date.now()
    });
    console.log(`[FIREBASE] Token saved: ${token}`);
  } catch (error) {
    console.error("[FIREBASE ERROR]", error);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const chatbox = document.getElementById("chatbox");
  if (chatbox) {
    observer.observe(chatbox, { childList: true, subtree: true });
    console.log("[MEMORY] Observer running.");
  } else {
    console.warn("[MEMORY] Chatbox not found.");
  }
});
