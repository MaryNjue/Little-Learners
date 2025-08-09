// src/firebaseConfig.js
import { initializeApp } from "firebase/app";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBz7bDDdbNOdlQMw8KewSUhjGPduD9S9lY",
  authDomain: "little-learners-project.firebaseapp.com",
  projectId: "little-learners-project",
  storageBucket: "little-learners-project.firebasestorage.app",
  messagingSenderId: "150194110716",
  appId: "1:150194110716:web:bfbcfb6f83e40a72ca9779",
  measurementId: "G-HLDEPQCCN5"
};

// Initialize and export the Firebase app instance
const firebaseApp = initializeApp(firebaseConfig);
export default firebaseApp;
