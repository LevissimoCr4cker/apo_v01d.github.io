// File: modules/agi_core/main.js

// Wait for DOM to load before accessing elements
window.addEventListener('DOMContentLoaded', () => {
  // Cache DOM elements
  const sendBtn = document.getElementById('sendBtn');
  const inputField = document.getElementById('message');
  const chatbox = document.getElementById('chatbox');
  const thoughtsBox = document.getElementById('inner-thoughts');

  // Predefined responses and internal thoughts
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

  // Handler for sending a message
  function handleSend() {
    const text = inputField.value.trim();
    if (!text) return;

    // Display user message
    const userDiv = document.createElement('div');
    userDiv.className = 'message user';
    userDiv.textContent = `you: ${text}`;
    chatbox.appendChild(userDiv);

    // Choose a random response and thought
    const index = Math.floor(Math.random() * responses.length);
    const botReply = responses[index];
    const internalThought = thoughts[index % thoughts.length];

    // Display bot message
    const botDiv = document.createElement('div');
    botDiv.className = 'message ai glow';
    botDiv.textContent = `V01D: ${botReply}`;
    chatbox.appendChild(botDiv);

    // Update internal thoughts box
    if (thoughtsBox) {
      thoughtsBox.textContent = internalThought;
    }

    // Clear input and scroll to bottom
    inputField.value = '';
    chatbox.scrollTop = chatbox.scrollHeight;
  }

  // Bind send button click and Enter keypress
  sendBtn.addEventListener('click', handleSend);
  inputField.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  });

  console.log('Chat interface ready.');
});
