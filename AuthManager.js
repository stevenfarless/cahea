// AuthManager.js - Handles all authentication UI and state
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';

export class AuthManager {
    constructor(auth, onAuthChange) {
        this.auth = auth;
        this.onAuthChange = onAuthChange;
        this.currentUser = null;
        
        // DOM elements
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
    
    _setupEventListeners() {
        // Enter key handler - allows login via Enter in either input field
        const handleEnter = (event) => {
            if (event.key === 'Enter' && this.emailInput.value.trim() && this.passwordInput.value) {
                this.login();
            }
        };
        this.emailInput.addEventListener('keypress', handleEnter);
        this.passwordInput.addEventListener('keypress', handleEnter);
        
        // Button handlers
        this.loginBtn.onclick = () => this.login();
        this.signupBtn.onclick = () => this.signup();
        this.logoutBtn.onclick = () => this.logout();
        
        // Clear error when user starts typing
        this.emailInput.addEventListener('input', () => this._clearError());
        this.passwordInput.addEventListener('input', () => this._clearError());
    }
    
    _setupAuthStateListener() {
        onAuthStateChanged(this.auth, (user) => {
            this.currentUser = user;
            this._updateUI();
            this.onAuthChange(user); // Callback to main app
        });
    }
    
    _updateUI() {
        if (this.currentUser) {
            this.loginBtn.style.display = 'none';
            this.signupBtn.style.display = 'none';
            this.logoutBtn.style.display = '';
            this.userGreeting.textContent = `Welcome, ${this.currentUser.email}`;
            this.emailInput.style.display = 'none';
            this.passwordInput.style.display = 'none';
            this._clearError(); // Clear any errors on successful login
        } else {
            this.loginBtn.style.display = '';
            this.signupBtn.style.display = '';
            this.logoutBtn.style.display = 'none';
            this.userGreeting.textContent = '';
            this.emailInput.style.display = '';
            this.passwordInput.style.display = '';
        }
    }
    
    // Show error message in DOM instead of alert
    _showError(message) {
        this.authError.textContent = message;
        this.authError.style.display = 'block';
    }
    
    // Clear error message from DOM
    _clearError() {
        this.authError.style.display = 'none';
        this.authError.textContent = '';
    }
    
    async login() {
        this._clearError();
        const email = this.emailInput.value.trim();
        const password = this.passwordInput.value;
        try {
            await signInWithEmailAndPassword(this.auth, email, password);
            // Silent success - no alert, just logs in
        } catch (err) {
            // Show error in DOM instead of alert
            this._showError(this._getFriendlyErrorMessage(err.code));
        }
    }
    
    async signup() {
        this._clearError();
        const email = this.emailInput.value.trim();
        const password = this.passwordInput.value;
        try {
            await createUserWithEmailAndPassword(this.auth, email, password);
            // Silent success - no alert, automatically logs in
        } catch (err) {
            this._showError(this._getFriendlyErrorMessage(err.code));
        }
    }
    
    async logout() {
        await signOut(this.auth);
        // Silent logout - no alert
    }
    
    // Convert Firebase error codes to user-friendly messages
    _getFriendlyErrorMessage(errorCode) {
        const errorMessages = {
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
        
        return errorMessages[errorCode] || 'An error occurred. Please try again.';
    }
}
