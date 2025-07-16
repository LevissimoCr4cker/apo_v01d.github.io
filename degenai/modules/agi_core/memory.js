// modules/agi_core/memory.js
import { getDatabase, ref, set, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js';

// Gerar ID único para a sessão
const sessionId = `sessao_${Date.now()}`;
let sessionMessages = JSON.parse(localStorage.getItem(sessionId)) || [];

// Observ bumpingar o chatbox para novas mensagens
const chatbox = document.getElementById('chatbox');
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('message')) {
                    const text = node.textContent;
                    let sender = '';
                    if (node.classList.contains('user')) {
                        sender = 'user';
                    } else if (node.classList.contains('ai')) {
                        sender = 'bot';
                    }
                    // Extrair o texto da mensagem, removendo o prefixo "you: " ou "V01D: "
                    const messageText = text.replace(/^(you|V01D): /, '');
                    sessionMessages.push({
                        sender: sender,
                        text: messageText,
                        timestamp: new Date().toISOString()
                    });
                    // Salvar no localStorage
                    localStorage.setItem(sessionId, JSON.stringify(sessionMessages));
                }
            });
        }
    });
});

// Configurar o observador
observer.observe(chatbox, { childList: true });

// Função para tokenizar mensagens
function tokenizeMessage(text) {
    return text.toLowerCase().split(/\s+/).filter(word => word.length > 0);
}

// Função para salvar tokens no Firebase
async function saveTokensToFirebase() {
    const messages = JSON.parse(localStorage.getItem(sessionId)) || [];
    const userTokens = [];
    const botTokens = [];

    messages.forEach(msg => {
        const tokens = tokenizeMessage(msg.text);
        if (msg.sender === 'user') {
            userTokens.push(...tokens);
        } else if (msg.sender === 'bot') {
            botTokens.push(...tokens);
        }
    });

    const db = getDatabase();
    try {
        await set(ref(db, `chat_user/${sessionId}`), {
            tokens: userTokens,
            timestamp: serverTimestamp()
        });
        console.log('Tokens do usuário salvos com sucesso!');
        
        await set(ref(db, `chat_bot/${sessionId}`), {
            tokens: botTokens,
            timestamp: serverTimestamp()
        });
        console.log('Tokens do bot salvos com sucesso!');
        
        // Limpar localStorage
        localStorage.removeItem(sessionId);
    } catch (err) {
        console.error('Erro ao salvar tokens:', err);
    }
}

// Detectar fechamento do navegador
window.addEventListener('beforeunload', () => {
    saveTokensToFirebase();
});

// Expor a função para o botão manual
window.saveTokensToFirebase = saveTokensToFirebase;

console.log('Memory module initialized.');
