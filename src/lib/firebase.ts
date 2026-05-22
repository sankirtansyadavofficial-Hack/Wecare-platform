import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCnqr2OqLuygqYY-m3nmZzW9RC9dEvACJw",
  authDomain: "wecare-platform-782e5.firebaseapp.com",
  projectId: "wecare-platform-782e5",
  storageBucket: "wecare-platform-782e5.firebasestorage.app",
  messagingSenderId: "868947682064",
  appId: "1:868947682064:web:789bf5b5f8fe5457983b95"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
