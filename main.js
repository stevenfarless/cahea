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
    }
});

let allWhiteCards = [];
let allBlackCards = [];

async function loadAllCards() {
    const deck = await CAHDeck.fromCompact('cah-all-compact.json');
    deck.deck.forEach((pack) => {
        allWhiteCards.push(...pack.white);
        allBlackCards.push(...pack.black);
    });
}

drawWhite.onclick = () => {
    if (allWhiteCards.length === 0) return;
    const card = allWhiteCards[Math.floor(Math.random() * allWhiteCards.length)];
    drawWhiteResult.innerHTML = `<div class="card white">${card.text}</div>`;
};

drawBlack.onclick = () => {
    if (allBlackCards.length === 0) return;
    const card = allBlackCards[Math.floor(Math.random() * allBlackCards.length)];
    drawBlackResult.innerHTML = `<div class="card black">${card.text}</div>`;
};

loadAllCards();
