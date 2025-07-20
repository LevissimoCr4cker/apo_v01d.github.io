// File: modules/agi_core/selflearning.js
// Extract words from the last user message in the chat
function getLastUserWords() {
  const userMsgs = document.querySelectorAll('.message.user');
  if (userMsgs.length === 0) return [];
  const lastText = userMsgs[userMsgs.length - 1].textContent.replace(/^you:\s*/i, '');
  const words = lastText.match(/\b\w+\b/g) || [];
  // Filter out short words
  return words.filter(w => w.length > 3);
}

// Function to fetch information from DuckDuckGo API
async function fetchDuckDuckGoInfo(term) {
  try {
    const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(term)}&format=json&no_html=1`);
    const data = await response.json();
    return data.Abstract || data.RelatedTopics?.[0]?.Text || 'No information found.';
  } catch (error) {
    console.error('Error fetching from DuckDuckGo:', error);
    return 'Failed to retrieve information.';
  }
}

// Initialize self-learning after DOM is ready
function startSelfLearning() {
  const updatesBox = document.getElementById('updates');
  if (!updatesBox) return;

  // Every 20 seconds: pick a random word and fetch info
  setInterval(async () => {
    const words = getLastUserWords();
    if (words.length === 0) return;
    const term = words[Math.floor(Math.random() * words.length)];

    // Fetch information for the term
    const info = await fetchDuckDuckGoInfo(term);

    // Display term and information
    updatesBox.innerHTML = '';
    const msgDiv = document.createElement('div');
    msgDiv.innerText = `${term}: ${info}`;
    updatesBox.appendChild(msgDiv);

    // Scroll to bottom
    updatesBox.scrollTop = updatesBox.scrollHeight;
  }, 20000);
}

// Run immediately if possible, or after DOMContentLoaded
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', startSelfLearning);
} else {
  startSelfLearning();
}