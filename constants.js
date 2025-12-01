// constants.js - Application configuration and constants
// Centralizing magic strings and configuration makes the app easier to maintain
// If you need to change text or configuration, you only change it here

/**
 * Application-wide constants
 * Exporting as named exports for clarity
 */

// Deck file path
export const DECK_PATH = 'cah-all-compact.json';

// UI text strings
// Using functions where dynamic content is needed
export const UI_TEXT = {
    SHOW_FAVORITES: 'Show Favorites',
    HIDE_FAVORITES: 'Hide Favorites',
    WELCOME_MESSAGE: (email) => `Welcome, ${email}`,
    NO_FAVORITES: 'No favorites yet. Click the heart icon on cards to save combinations!',
    DECK_LOADED: 'Deck loaded successfully',
    DECK_LOAD_ERROR: 'Failed to load deck'
};

// Firebase error messages
// Maps Firebase error codes to user-friendly messages
export const FIREBASE_ERRORS = {
    'auth/invalid-email': 'Invalid email address format.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/invalid-credential': 'Invalid email or password.'
};

// Default error message for unknown errors
export const DEFAULT_ERROR_MESSAGE = 'An error occurred. Please try again.';
