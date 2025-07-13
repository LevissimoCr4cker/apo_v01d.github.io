// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB6SnIX7LB5BWciiBwLHtAYDdHfD-c5uf8",
  authDomain: "degenai-long.firebaseapp.com",
  projectId: "degenai-long",
  storageBucket: "degenai-long.firebasestorage.app",
  messagingSenderId: "424689381042",
  appId: "1:424689381042:web:60bfebcf72b3e576fae3ab",
  measurementId: "G-0S1PXB2CB6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
