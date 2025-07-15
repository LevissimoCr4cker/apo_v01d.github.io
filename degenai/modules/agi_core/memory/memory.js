import { db, rtdb } from './firebase.js';
import { getAuth } from 'firebase/auth';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { ref, push, set, onValue } from 'firebase/database';

const auth = getAuth();
const tokenize = (text) => text.toLowerCase().split(/\s+/).filter((word) => word);

async function storeMessage(message) {
  if (!message || typeof message !== 'string') {
    throw new Error('Invalid message: must be a non-empty string');
  }

  if (!auth.currentUser) {
    throw new Error('User not authenticated');
  }

  try {
    // Firestore: whole sentence
    await addDoc(collection(db, 'messages'), {
      text: message,
      uid: auth.currentUser.uid,
      timestamp: new Date().toISOString(),
    });
    console.log('Message stored in Firestore');

    // Realtime Database: tokenized
    const tokens = tokenize(message);
    const messageRef = push(ref(rtdb, 'tokenizedMessages'));
    await set(messageRef, {
      tokens,
      uid: auth.currentUser.uid,
      timestamp: new Date().toISOString(),
    });
    console.log('Tokenized message stored in Realtime Database');
  } catch (error) {
    console.error('Error storing message:', error);
    throw error;
  }
}

export { storeMessage };