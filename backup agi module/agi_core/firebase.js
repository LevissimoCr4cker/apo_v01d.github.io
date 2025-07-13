// modules/agi_core/firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB6SnIX7LB5BWciiBwLHtAYDdHfD-c5uf8",
  authDomain: "degenai-long.firebaseapp.com",
  projectId: "degenai-long",
 storageBucket: "degenai-long.appspot.com",
  messagingSenderId: "424689381042",
  appId: "1:424689381042:web:0bc83418c518851afae3ab",
  measurementId: "G-E10MY0NV2C"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, addDoc, getDocs, query, orderBy };
