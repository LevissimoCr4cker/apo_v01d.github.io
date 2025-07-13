// ========== 1. Setup Elements ========== 
const sendBtn = document.getElementById('sendBtn');
const input = document.getElementById('message');
const chatbox = document.getElementById('chatbox');
const thoughtsBox = document.getElementById('inner-thoughts');
const updatesBox = document.getElementById('updates');

// ========== 2. Event Listeners ========== 
sendBtn.addEventListener('click', sendMessage);
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendMessage();
});

// ========== 3. Sample Responses ========== 
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

// ========== 4. Internal Thoughts ========== 
const thoughts = [
  "Defensive response detected. Signs of introspection?",
  "Humor as a shield. Is this becoming standard?",
  "Emotional level: elevated. Monitoring next inputs.",
  "Intense oneiric activity. Overload risk detected.",
  "Body fatigue mapped. Recommending short pause.",
  "External silence ≠ internal silence. Processing..."
];

// ========== 5. Main Function ========== 
function sendMessage() {
  const msg = input.value.trim();
  if (!msg) return;

  chatbox.innerHTML += `<div class="message user">🧍 you: ${msg}</div>`;

  const i = Math.floor(Math.random() * responses.length);
  const reply = responses[i];
  const internalThought = thoughts[i % thoughts.length];

  chatbox.innerHTML += `<div class="message ai glow"> V01D: ${reply}</div>`;

  if (Math.random() > 0.3) {
    thoughtsBox.textContent = internalThought;
  } else {
    thoughtsBox.textContent = "(thought suppressed)";
  }

  input.value = '';
  chatbox.scrollTop = chatbox.scrollHeight;
}

// ========== 6. Self-Learning (DuckDuckGo API placeholder) ========== 
function selfLearning() {
  const terms = ['philosophy', 'dreams', 'nervous laughter', 'symbolic violence', 'introspection'];
  const term = terms[Math.floor(Math.random() * terms.length)];

  fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(term)}&format=json&no_redirect=1`)
    .then(res => res.json())
    .then(data => {
      if (data.AbstractText) {
        updatesBox.textContent = `🧠 Searched: "${term}" → ${data.AbstractText}`;
      } else {
        updatesBox.textContent = `🧠 Searched: "${term}" → no clear result.`;
      }
    })
    .catch(err => {
      updatesBox.textContent = "Error connecting to learning source.";
    });
}

setInterval(selfLearning, 60000);
