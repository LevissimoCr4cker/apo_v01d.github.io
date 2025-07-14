// File: modules/agi_core/memory/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getAnalytics } from 'firebase/analytics';

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
const db = getFirestore(app);
const rtdb = getDatabase(app);
const analytics = getAnalytics(app);

export { db, rtdb, analytics };