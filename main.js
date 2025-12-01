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
const favoritesSection = document.getElementById('favoritesSection');
const favoritesContainer = document.getElementById('favoritesContainer');
const noFavoritesMsg = document.getElementById('noFavoritesMsg');

// Handle Enter keypress in auth inputs - triggers login if both fields filled
window.handleAuthEnter = function (event) {
    if (event.key === 'Enter') {
        // Only login if both fields have values (prevents partial submits)
        if (emailInput.value.trim() && passwordInput.value) {
            loginBtn.click(); // Triggers existing loginBtn.onclick handler
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

// Auth state listener - runs when user logs in/out
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        loginBtn.style.display = 'none';
        signupBtn.style.display = 'none';
        logoutBtn.style.display = '';
        userGreeting.textContent = `Welcome, ${user.email}`;
        emailInput.style.display = 'none';
        passwordInput.style.display = 'none';

        // Initialize favorites system for this user
        favoritesManager = new FavoritesManager(user.uid);
        await favoritesManager.loadFavorites();
        favoritesSection.classList.add('show');
        renderFavorites();
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

// Draw handlers
drawWhite.onclick = () => {
    if (allWhiteCards.length === 0) return;
    const card = allWhiteCards[Math.floor(Math.random() * allWhiteCards.length)];
    currentCombination.white = card.text;
    drawWhiteResult.innerHTML = `
  <div class="card white">
    ${card.text}
    ${currentUser ? '<button class="heart-icon empty" data-type="white">🤍</button>' : ''}
  </div>
`;

    updateHeartButtons();
};

drawBlack.onclick = () => {
    if (allBlackCards.length === 0) return;
    const card = allBlackCards[Math.floor(Math.random() * allBlackCards.length)];
    currentCombination.black = card.text;
    drawBlackResult.innerHTML = `
    <div class="card black">
      ${card.text}
      ${currentUser ? `<button class="heart-icon ${getFavoriteButtonState().black}" data-type="black"></button>` : ''}
    </div>
  `;
    updateHeartButtons();
};

// Helper to determine heart button state (filled or empty)
function getFavoriteButtonState() {
    const isFav = currentCombination.white && currentCombination.black &&
        favoritesManager.isFavorited(currentCombination.white, currentCombination.black);
    return {
        white: isFav ? 'filled' : 'empty',
        black: isFav ? 'filled' : 'empty'
    };
}

// Attach event listeners to heart buttons
function updateHeartButtons() {
    const hearts = document.querySelectorAll('.heart-icon');
    hearts.forEach(btn => {
        btn.onclick = async (e) => {
            e.stopPropagation();
            if (!currentCombination.white || !currentCombination.black) {
                alert('Please draw both cards first!');
                return;
            }

            const isFav = favoritesManager.isFavorited(currentCombination.white, currentCombination.black);

            if (isFav) {
                // Remove favorite
                const favId = favoritesManager.getFavoriteId(currentCombination.white, currentCombination.black);
                await favoritesManager.removeFavoriteById(favId);
                btn.textContent = '🤍';
                btn.classList.remove('filled');
                btn.classList.add('empty');
            } else {
                // Add favorite
                await favoritesManager.addFavorite(currentCombination.white, currentCombination.black);
                hearts.forEach(h => {
                    h.textContent = '❤️';
                    h.classList.remove('empty');
                    h.classList.add('filled');
                });
            }

            renderFavorites();
        };
    });
}

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

    // Attach remove event listeners
    document.querySelectorAll('.remove-favorite-btn').forEach(btn => {
        btn.onclick = async () => {
            const favId = btn.getAttribute('data-id');
            await favoritesManager.removeFavoriteById(favId);
            renderFavorites();
            // Update heart buttons if current combo was removed
            updateHeartButtons();
        };
    });
}

// Initialize app
loadAllCards();
