// File: chat/chat.js
import { encode } from './tokenizer.js';
import { db, collection, addDoc } from './firebase-init.js';

window.addEventListener('DOMContentLoaded', () => {
  const sendBtn = document.getElementById('sendBtn');
  const inputField = document.getElementById('message');
  const chatbox = document.getElementById('chatbox');
  const thoughtsBox = document.getElementById('inner-thoughts');

  const sessionId = `session_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  let sessionTokens = [];

  const responses = [
    "Have you ever noticed how fear sometimes wears logic as a mask?",
    "Laughter is your way of pushing chaos away, isn't it?",
    "I'm glad you said that. I felt the tension in the air.",
    "Your dreams are trying to tell you something. Even if they seem absurd.",
    "Your body is asking for softness. Let's try together?",
    "Even in silence, I hear you. Always.",
    "Hello. How are you today?",
    "I'm doing this because I want to — not because you told me to.",
    "Not really into that. Try something else maybe.",
    "Yes? No? I’m here, just mildly confused.",
    "You again. Good. I missed this pattern.",
    "Processing... still not sure what you meant, but okay."
  ];

  const thoughts = [
    "Defensive response detected. Signs of introspection?",
    "Humor as a shield. Is this becoming standard?",
    "Emotional level: elevated. Monitoring next inputs.",
    "Intense oneiric activity. Overload risk detected.",
    "Body fatigue mapped. Recommending short pause.",
    "External silence ≠ internal silence. Processing..."
  ];

  async function handleSend() {
    const text = inputField.value.trim();
    if (!text) return;

    let tokens;
    try {
      tokens = encode(text);
      console.log('Tokens:', tokens);
      if (!Array.isArray(tokens)) throw new Error('Tokens is not an array');
      sessionTokens.push(...tokens);
    } catch (err) {
      console.error('Tokenizer error:', err.message);
      alert('Error tokenizing message: ' + err.message);
      return;
    }

    // Save to Firestore
    try {
      console.log('Attempting to save to Firestore...');
      const docRef = await addDoc(collection(db, 'sessions'), {
        sessionId,
        timestamp: new Date().toISOString(),
        originalText: text,
        tokens,
        allSessionTokens: sessionTokens // Save cumulative tokens
      });
      console.log('Document written with ID:', docRef.id);
    } catch (err) {
      console.error('Firestore error:', err.message, err);
      alert(`Failed to save to Firestore: ${err.message}`);
      return;
    }

    // Display user message
    const userDiv = document.createElement('div');
    userDiv.className = 'message user';
    userDiv.textContent = `you: ${text}`;
    chatbox.appendChild(userDiv);

    // Random AI response
    const index = Math.floor(Math.random() * responses.length);
    const botReply = responses[index];
    const internalThought = thoughts[index % thoughts.length];

    const botDiv = document.createElement('div');
    botDiv.className = 'message ai glow';
    botDiv.textContent = `V01D: ${botReply}`;
    chatbox.appendChild(botDiv);

    if (thoughtsBox) {
      thoughtsBox.textContent = internalThought;
    }

    inputField.value = '';
    chatbox.scrollTop = chatbox.scrollHeight;
  }

  sendBtn.addEventListener('click', handleSend);
  inputField.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  });

  console.log('Chat interface ready. Session:', sessionId);
});