// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';

const firebaseConfig = {
  apiKey: "AIzaSyA6AT8yOulXOncTX2qg4Z0-aq_1X3-ewK0",
  authDomain: "cahea-38948.firebaseapp.com",
  databaseURL: "https://cahea-38948-default-rtdb.firebaseio.com",
  projectId: "cahea-38948",
  storageBucket: "cahea-38948.firebasestorage.app",
  messagingSenderId: "703346033222",
  appId: "1:703346033222:web:ce1fc872e96491c5ab8047"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase auth and export it
export const auth = getAuth(app);
