// AuthManager.js - Handles all authentication UI and state
// Manages user login, signup, logout, and UI updates

import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';
import { FIREBASE_ERRORS, DEFAULT_ERROR_MESSAGE, UI_TEXT } from './constants.js';

/**
 * Manages all authentication-related functionality
 * Handles both authentication logic and auth UI
 */
export class AuthManager {
    /**
     * @param {Object} auth - Firebase auth instance
     * @param {Function} onAuthChange - Callback function when auth state changes
     */
    constructor(auth, onAuthChange) {
        this.auth = auth;
        this.onAuthChange = onAuthChange;
        this.currentUser = null;
        
        // Cache DOM element references
        this.loginBtn = document.getElementById('loginBtn');
        this.signupBtn = document.getElementById('signupBtn');
        this.logoutBtn = document.getElementById('logoutBtn');
        this.emailInput = document.getElementById('authEmail');
        this.passwordInput = document.getElementById('authPassword');
        this.userGreeting = document.getElementById('userGreeting');
        this.authError = document.getElementById('authError');
        
        this._setupEventListeners();
        this._setupAuthStateListener();
    }
    
    /**
     * Sets up event listeners for auth form
     * Includes Enter key handling for better UX
     */
    _setupEventListeners() {
        // Enter key handler - allows login via Enter in either input field
        const handleEnter = (event) => {
            if (event.key === 'Enter' && this.emailInput.value.trim() && this.passwordInput.value) {
                this.login();
            }
        };
        
        this.emailInput.addEventListener('keypress', handleEnter);
        this.passwordInput.addEventListener('keypress', handleEnter);
        
        // Button click handlers
        this.loginBtn.onclick = () => this.login();
        this.signupBtn.onclick = () => this.signup();
        this.logoutBtn.onclick = () => this.logout();
        
        // Clear error message when user starts typing
        // Provides immediate feedback that input is being processed
        this.emailInput.addEventListener('input', () => this._clearError());
        this.passwordInput.addEventListener('input', () => this._clearError());
    }
    
    /**
     * Sets up Firebase auth state listener
     * This fires whenever user logs in or out
     */
    _setupAuthStateListener() {
        onAuthStateChanged(this.auth, (user) => {
            this.currentUser = user;
            this._updateUI();
            this.onAuthChange(user); // Notify main app
        });
    }
    
    /**
     * Updates UI based on authentication state
     * Shows/hides appropriate elements for logged in/out state
     */
    _updateUI() {
        if (this.currentUser) {
            // User is logged in
            this.loginBtn.style.display = 'none';
            this.signupBtn.style.display = 'none';
            this.logoutBtn.style.display = '';
            this.userGreeting.textContent = UI_TEXT.WELCOME_MESSAGE(this.currentUser.email);
            this.emailInput.style.display = 'none';
            this.passwordInput.style.display = 'none';
            this._clearError();
        } else {
            // User is logged out
            this.loginBtn.style.display = '';
            this.signupBtn.style.display = '';
            this.logoutBtn.style.display = 'none';
            this.userGreeting.textContent = '';
            this.emailInput.style.display = '';
            this.passwordInput.style.display = '';
        }
    }
    
    /**
     * Shows error message in the DOM
     * Better UX than alert() - doesn't block user interaction
     * @param {string} message - Error message to display
     */
    _showError(message) {
        this.authError.textContent = message;
        this.authError.style.display = 'block';
    }
    
    /**
     * Clears error message from the DOM
     */
    _clearError() {
        this.authError.style.display = 'none';
        this.authError.textContent = '';
    }
    
    /**
     * Attempts to log in user with email and password
     * Async function - uses await to handle Promise from Firebase
     */
    async login() {
        this._clearError();
        const email = this.emailInput.value.trim();
        const password = this.passwordInput.value;
        
        try {
            await signInWithEmailAndPassword(this.auth, email, password);
            // Success - auth state listener will update UI
        } catch (err) {
            this._showError(this._getFriendlyErrorMessage(err.code));
        }
    }
    
    /**
     * Creates new user account with email and password
     * Automatically logs in after successful account creation
     */
    async signup() {
        this._clearError();
        const email = this.emailInput.value.trim();
        const password = this.passwordInput.value;
        
        try {
            await createUserWithEmailAndPassword(this.auth, email, password);
            // Success - auth state listener will update UI
        } catch (err) {
            this._showError(this._getFriendlyErrorMessage(err.code));
        }
    }
    
    /**
     * Logs out current user
     */
    async logout() {
        await signOut(this.auth);
        // Auth state listener will update UI
    }
    
    /**
     * Converts Firebase error codes to user-friendly messages
     * Uses constants from constants.js for maintainability
     * @param {string} errorCode - Firebase error code
     * @returns {string} User-friendly error message
     */
    _getFriendlyErrorMessage(errorCode) {
        return FIREBASE_ERRORS[errorCode] || DEFAULT_ERROR_MESSAGE;
    }
}
