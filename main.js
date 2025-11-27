import { db, doc, getDoc, setDoc } from './firebase.js';
import { auth } from './firebase.js';
import { CAHDeck } from './CAHDeck.js';
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';

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
const favoritesList = document.getElementById('favoritesList');
let currentCombo = null;  // {black: "...", white: "..."}
let userFavorites = [];   // Array of saved combos

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

onAuthStateChanged(auth, (user) => {
    if (user) {
        loginBtn.style.display = 'none';
        signupBtn.style.display = 'none';
        logoutBtn.style.display = '';
        userGreeting.textContent = `Welcome, ${user.email}`;
        emailInput.style.display = 'none';
        passwordInput.style.display = 'none';
    } else {
        loginBtn.style.display = '';
        signupBtn.style.display = '';
        logoutBtn.style.display = 'none';
        userGreeting.textContent = '';
        emailInput.style.display = '';
        passwordInput.style.display = '';
        if (user) {
        loadFavorites();  // Load user's favorites
    } else {
        userFavorites = [];
        displayFavorites();
        favoritesList.innerHTML = '<div style="color: var(--dracula-comment);">Log in to save favorites</div>';
    }
});

let allWhiteCards = [];
let allBlackCards = [];

drawWhite.onclick = () => {
    if (allWhiteCards.length === 0) return;
    const card = allWhiteCards[Math.floor(Math.random() * allWhiteCards.length)];
    drawWhiteResult.innerHTML = `<div class="card white">${card.text}</div>`;
    
    const blackCard = drawBlackResult.querySelector('.card.black');
    if (blackCard) {
        currentCombo = {
            black: blackCard.textContent.trim(),
            white: card.text
        };
        favoriteBtn.disabled = false;
    }
};

drawBlack.onclick = () => {
    if (allBlackCards.length === 0) return;
    const card = allBlackCards[Math.floor(Math.random() * allBlackCards.length)];
    drawBlackResult.innerHTML = `<div class="card black">${card.text}</div>`;
    const whiteCard = drawWhiteResult.querySelector('.card.white');
    if (whiteCard) {
        currentCombo = {
            black: card.text,
            white: whiteCard.textContent.trim()
        };
        favoriteBtn.disabled = false;
    }
};

loadAllCards();

// Load/save favorites to user's Firebase document
async function loadFavorites() {
    if (!auth.currentUser) return;
    try {
        const userId = auth.currentUser.uid;
        const doc = await getDoc(doc(db, 'favorites', userId));
        if (doc.exists()) {
            userFavorites = doc.data().combos || [];
            displayFavorites();
        }
    } catch (err) {
        console.error('Failed to load favorites:', err);
    }
}

async function saveFavorite() {
    if (!currentCombo || !auth.currentUser) return;

    const userId = auth.currentUser.uid;
    userFavorites.unshift(currentCombo);  // Add to front
    if (userFavorites.length > 20) userFavorites = userFavorites.slice(0, 20);  // Max 20

    try {
        await setDoc(doc(db, 'favorites', userId), { combos: userFavorites }, { merge: true });
        displayFavorites();
        alert('⭐ Combo saved!');
    } catch (err) {
        console.error('Failed to save favorite:', err);
        alert('Failed to save - check console');
    }
}

function displayFavorites() {
    favoritesList.innerHTML = '';
    userFavorites.forEach((combo, index) => {
        const div = document.createElement('div');
        div.className = 'fav-combo';
        div.innerHTML = `<strong>${combo.black}</strong><br>${combo.white}`;
        div.onclick = () => restoreCombo(combo);
        favoritesList.appendChild(div);
    });
}

function restoreCombo(combo) {
    drawBlackResult.innerHTML = `<div class="card black">${combo.black}</div>`;
    drawWhiteResult.innerHTML = `<div class="card white">${combo.white}</div>`;
    currentCombo = combo;
    favoriteBtn.disabled = false;
}
