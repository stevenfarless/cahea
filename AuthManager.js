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
        
        this._setupEventListeners();
        this._setupAuthStateListener();
    }
    
    _setupEventListeners() {
        // Enter key handler
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
        } else {
            this.loginBtn.style.display = '';
            this.signupBtn.style.display = '';
            this.logoutBtn.style.display = 'none';
            this.userGreeting.textContent = '';
            this.emailInput.style.display = '';
            this.passwordInput.style.display = '';
        }
    }
    
    async login() {
        const email = this.emailInput.value.trim();
        const password = this.passwordInput.value;
        try {
            await signInWithEmailAndPassword(this.auth, email, password);
            alert('Logged in!');
        } catch (err) {
            alert('Login failed: ' + err.message);
        }
    }
    
    async signup() {
        const email = this.emailInput.value.trim();
        const password = this.passwordInput.value;
        try {
            await createUserWithEmailAndPassword(this.auth, email, password);
            alert('Sign up successful!');
        } catch (err) {
            alert('Sign up failed: ' + err.message);
        }
    }
    
    async logout() {
        await signOut(this.auth);
        alert('Logged out!');
    }
}