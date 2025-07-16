// File: firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAB7LzrjmNv-M_VZfBBORm_WzVOOM-8RMg",
  authDomain: "deg2-329bc.firebaseapp.com",
  projectId: "deg2-329bc",
  storageBucket: "deg2-329bc.appspot.com", // corrigido aqui!
  messagingSenderId: "581941379393",
  appId: "1:581941379393:web:cbb90610c9a22e931d21c0",
  measurementId: "G-6W8WZYFH8X"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // 💾 Firestore habilitado

export { db };
