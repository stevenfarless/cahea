import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyA6AT8yOulXOncTX2qg4Z0-aq_1X3-ewK0",
  authDomain: "cahea-38948.firebaseapp.com",
  projectId: "cahea-38948",
  storageBucket: "cahea-38948.firebasestorage.app",
  messagingSenderId: "703346033222",
  appId: "1:703346033222:web:ce1fc872e96491c5ab8047"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the Firebase app instance for use in other modules
export { app };
