// File: modules/agi_core/memory.js

// Importe a instância 'db' do seu arquivo de inicialização do Firebase
import { db } from './firebase-init.js';
import { collection, addDoc, query, orderBy, getDocs, serverTimestamp } from "firebase/firestore";


const CHAT_COLLECTION = "chat_history"; // Nome da coleção no Firestore

/**
 * Salva uma nova mensagem no Firestore.
 * @param {string} sender - Quem enviou a mensagem ('user' ou 'ai').
 * @param {string} message - O conteúdo da mensagem.
 * @returns {Promise<void>} - Uma Promise que resolve quando a mensagem é salva.
 */
async function saveMessageToFirestore(sender, message) {
  try {
    // Use a função 'collection' para obter uma referência à coleção
    await addDoc(collection(db, CHAT_COLLECTION), {
      sender: sender,
      message: message,
      timestamp: serverTimestamp() // Use serverTimestamp() do Firestore
    });
    console.log("Mensagem salva no Firestore com sucesso!");
  } catch (error) {
    console.error("Erro ao salvar mensagem no Firestore: ", error);
  }
}

/**
 * Carrega as mensagens do Firestore e as retorna ordenadas por data.
 * @returns {Promise<Array<{sender: string, message: string, timestamp: object}>>} - Uma Promise que resolve com um array de mensagens.
 */
async function loadMessagesFromFirestore() {
  try {
    // Crie uma query para a coleção, ordenando por timestamp
    const q = query(collection(db, CHAT_COLLECTION), orderBy('timestamp', 'asc'));
    const querySnapshot = await getDocs(q); // Use getDocs para obter o snapshot

    const messages = [];
    querySnapshot.forEach(doc => {
      messages.push(doc.data());
    });
    console.log("Mensagens carregadas do Firestore:", messages);
    return messages;
  } catch (error) {
    console.error("Erro ao carregar mensagens do Firestore: ", error);
    return []; // Retorna um array vazio em caso de erro
  }
}

// Exporte as funções para que main.js possa usá-las
export { saveMessageToFirestore, loadMessagesFromFirestore };