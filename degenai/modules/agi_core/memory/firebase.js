// File: modules/agi_core/memory/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getAnalytics } from 'firebase/analytics';
import { getStorage } from 'firebase/storage'; // Add Storage

const firebaseConfig = {
  apiKey: 'AIzaSyC5UwHcpJwQ8VxaSfOoQl2TxzC5ahN3NmU',
  authDomain: 'betocaino-c8553.firebaseapp.com',
  databaseURL: 'https://betocaino-c8553-default-rtdb.firebaseio.com',
  projectId: 'betocaino-c8553',
  storageBucket: 'betocaino-c8553.appspot.com',
  messagingSenderId: '509923845167',
  appId: '1:509923845167:web:9cb187aa52fbe367c892da',
  measurementId: 'G-7KV4X39C60',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Firestore for whole sentences
const rtdb = getDatabase(app); // Realtime Database for tokenized versions
const analytics = getAnalytics(app);
const storage = getStorage(app); // Storage for chat messages

export { db, rtdb, analytics, storage };