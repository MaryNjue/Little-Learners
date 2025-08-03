import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

import { initializeApp } from 'firebase/app';
import firebaseConfig from './firebaseConfig'; // Your Firebase config

// Initialize Firebase App and EXPORT it
export const firebaseApp = initializeApp(firebaseConfig); // <-- Changed this line to export 'firebaseApp'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);