// firebase.js - Firebase configuration and database operations
// Centralizes all Firebase-related code

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';
import { getDatabase, ref, set, get, remove } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js';

/**
 * Firebase configuration object
 * These values come from Firebase Console > Project Settings
 * NOTE: For a production app, consider using environment variables
 */
const firebaseConfig = {
    apiKey: "AIzaSyA6AT8yOulXOncTX2qg4Z0-aq_1X3-ewK0",
    authDomain: "cahea-38948.firebaseapp.com",
    databaseURL: "https://cahea-38948-default-rtdb.firebaseio.com",
    projectId: "cahea-38948",
    storageBucket: "cahea-38948.firebasestorage.app",
    messagingSenderId: "703346033222",
    appId: "1:703346033222:web:ce1fc872e96491c5ab8047"
};

// Initialize Firebase services
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);

/**
 * Saves a favorite card combination to Firebase
 * Generates a unique ID using timestamp + random string
 * @param {string} userId - Firebase user ID
 * @param {Object} combination - Object with white, black, and timestamp properties
 * @returns {string} The generated favorite ID
 */
export async function saveFavorite(userId, combination) {
    // Generate unique ID: timestamp ensures uniqueness, random adds extra entropy
    const favoriteId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Build path: users/{userId}/favorites/{favoriteId}
    const favRef = ref(database, `users/${userId}/favorites/${favoriteId}`);
    
    // Save to Firebase Realtime Database
    await set(favRef, combination);
    
    return favoriteId;
}

/**
 * Removes a favorite from Firebase
 * @param {string} userId - Firebase user ID
 * @param {string} favoriteId - ID of the favorite to remove
 */
export async function removeFavorite(userId, favoriteId) {
    const favRef = ref(database, `users/${userId}/favorites/${favoriteId}`);
    await remove(favRef);
}

/**
 * Gets all favorites for a user from Firebase
 * @param {string} userId - Firebase user ID
 * @returns {Array} Array of favorite objects with id, white, black, timestamp
 */
export async function getFavorites(userId) {
    const favRef = ref(database, `users/${userId}/favorites`);
    const snapshot = await get(favRef);
    
    // Check if user has any favorites
    if (snapshot.exists()) {
        // Firebase stores data as object with IDs as keys
        // Object.entries() converts to array of [id, data] pairs
        // map() transforms into array of objects with id included
        return Object.entries(snapshot.val()).map(([id, data]) => ({ id, ...data }));
    }
    
    return []; // Return empty array if no favorites
}
