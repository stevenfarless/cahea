import { auth } from './firebase.js';
import { CAHDeck } from './CAHDeck.js';
import { FavoritesManager } from './FavoritesManager.js';
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';

// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userGreeting = document.getElementById('userGreeting');
const emailInput = document.getElementById('authEmail');
const passwordInput = document.getElementById('authPassword');
const drawWhite = document.getElementById('drawWhite');
const drawBlack = document.getElementById('drawBlack');
const drawWhiteResult = document.getElementById('drawWhiteResult');
const drawBlackResult = document.getElementById('drawBlackResult');
const favoriteBtn = document.getElementById('favoriteBtn');
const favoritesSection = document.getElementById('favoritesSection');
const favoritesContainer = document.getElementById('favoritesContainer');
const noFavoritesMsg = document.getElementById('noFavoritesMsg');

// Handle Enter keypress in auth inputs - triggers login if both fields filled
window.handleAuthEnter = function (event) {
    if (event.key === 'Enter') {
        if (emailInput.value.trim() && passwordInput.value) {
            loginBtn.click();
        }
    }
};

// Global state
let allWhiteCards = [];
let allBlackCards = [];
let currentUser = null;
let favoritesManager = null;

// Current combination being displayed
let currentCombination = {
    white: null,
    black: null
};

// Auth handlers
signupBtn.onclick = async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    try {
        await createUserWithEmailAndPassword(auth, email, password);
        alert('Sign up successful! You are now logged in.');
    } catch (err) {
        alert('Sign up failed: ' + err.message);
    }
};

loginBtn.onclick = async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert('Logged in!');
    } catch (err) {
        alert('Login failed: ' + err.message);
    }
};

logoutBtn.onclick = async () => {
    await signOut(auth);
    alert('Logged out!');
};

// Auth state listener
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        loginBtn.style.display = 'none';
        signupBtn.style.display = 'none';
        logoutBtn.style.display = '';
        userGreeting.textContent = `Welcome, ${user.email}`;
        emailInput.style.display = 'none';
        passwordInput.style.display = 'none';

        favoritesManager = new FavoritesManager(user.uid);
        await favoritesManager.loadFavorites();
        favoritesSection.classList.add('show');
        renderFavorites();
        updateFavoriteButton();
    } else {
        currentUser = null;
        favoritesManager = null;
        loginBtn.style.display = '';
        signupBtn.style.display = '';
        logoutBtn.style.display = 'none';
        userGreeting.textContent = '';
        emailInput.style.display = '';
        passwordInput.style.display = '';
        favoritesSection.classList.remove('show');
        updateFavoriteButton();
    }
});

// Load card data
async function loadAllCards() {
    const deck = await CAHDeck.fromCompact('cah-all-compact.json');
    deck.deck.forEach((pack) => {
        allWhiteCards.push(...pack.white);
        allBlackCards.push(...pack.black);
    });
}

// Single favorite button handler - only shows when both cards drawn
function updateFavoriteButton() {
    const favoriteBtnRow = document.querySelector('.favorite-btn-row');

    // Hide button if not logged in or if either card missing
    if (!currentUser || !currentCombination.white || !currentCombination.black) {
        favoriteBtnRow.style.display = 'none';
        return;
    }

    // Show button and update state
    favoriteBtnRow.style.display = 'flex';
    const isFav = favoritesManager.isFavorited(currentCombination.white, currentCombination.black);
    favoriteBtn.textContent = isFav ? '❤️ Saved!' : '🤍 Save to Favorites';
    favoriteBtn.className = `heart-icon ${isFav ? 'filled' : 'empty'}`;

    // Attach click handler
    favoriteBtn.onclick = async (e) => {
        e.stopPropagation();
        const isCurrentlyFav = favoritesManager.isFavorited(currentCombination.white, currentCombination.black);

        if (isCurrentlyFav) {
            const favId = favoritesManager.getFavoriteId(currentCombination.white, currentCombination.black);
            await favoritesManager.removeFavoriteById(favId);
        } else {
            await favoritesManager.addFavorite(currentCombination.white, currentCombination.black);
        }

        renderFavorites();
        updateFavoriteButton();
    };
}


// Draw handlers - clean cards, no buttons inside
drawWhite.onclick = () => {
    if (allWhiteCards.length === 0) return;
    const card = allWhiteCards[Math.floor(Math.random() * allWhiteCards.length)];
    currentCombination.white = card.text;
    drawWhiteResult.innerHTML = `
        <div class="card white">
            ${card.text}
        </div>
    `;
    updateFavoriteButton();
};

drawBlack.onclick = () => {
    if (allBlackCards.length === 0) return;
    const card = allBlackCards[Math.floor(Math.random() * allBlackCards.length)];
    currentCombination.black = card.text;
    drawBlackResult.innerHTML = `
        <div class="card black">
            ${card.text}
        </div>
    `;
    updateFavoriteButton();
};

// Render favorites list
function renderFavorites() {
    if (!favoritesManager || favoritesManager.favorites.length === 0) {
        favoritesContainer.innerHTML = '';
        noFavoritesMsg.style.display = 'block';
        return;
    }

    noFavoritesMsg.style.display = 'none';
    favoritesContainer.innerHTML = favoritesManager.favorites
        .map(fav => `
            <div class="favorite-item">
                <div class="favorite-cards">
                    <div class="favorite-card black">${fav.black}</div>
                    <div class="favorite-card white">${fav.white}</div>
                </div>
                <button class="remove-favorite-btn" data-id="${fav.id}">Remove</button>
            </div>
        `)
        .join('');

    document.querySelectorAll('.remove-favorite-btn').forEach(btn => {
        btn.onclick = async () => {
            const favId = btn.getAttribute('data-id');
            await favoritesManager.removeFavoriteById(favId);
            renderFavorites();
            updateFavoriteButton();
        };
    });
}

// Initialize app
loadAllCards();
