// js/firebase-config.js - Firebase Initialization & Configuration for Lyallpur Bakers
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyABPrqj9FmX6S2AACVEVs-h2eUqE_KIXTM",
  authDomain: "laylpur-bakery.firebaseapp.com",
  projectId: "laylpur-bakery",
  storageBucket: "laylpur-bakery.firebasestorage.app",
  messagingSenderId: "160810168883",
  appId: "1:160810168883:web:3e5ce4b9458d1ae35aa946",
  measurementId: "G-J167W45SW0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
