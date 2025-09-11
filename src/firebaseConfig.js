// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBz7bDDdbNOdlQMw8KewSUhjGPduD9S9lY",
  authDomain: "little-learners-project.firebaseapp.com",
  projectId: "little-learners-project",
  storageBucket: "little-learners-project.appspot.com",
  messagingSenderId: "150194110716",
  appId: "1:150194110716:web:bfbcfb6f83e40a72ca9779",
  measurementId: "G-HLDEPQCCN5"
};

// Initialize the Firebase app
const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(firebaseApp);

// If you need the app elsewhere
export default firebaseApp;
