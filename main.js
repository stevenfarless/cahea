import { app } from './firebase.js';
import { CAHDeck } from './CAHDeck.js';

const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userGreeting = document.getElementById('userGreeting');
const drawWhite = document.getElementById('drawWhite');
const drawBlack = document.getElementById('drawBlack');
const drawResult = document.getElementById('drawResult');

console.log('Firebase app:', app);

loginBtn.onclick = () => {
    alert('Connect this to Firebase Authentication!');
};

logoutBtn.onclick = () => {
    alert('Connect this to Firebase Authentication!');
};

let allWhiteCards = [];
let allBlackCards = [];

// Load all cards from all packs into flat arrays
async function loadAllCards() {
    const deck = await CAHDeck.fromCompact('cah-all-compact.json');
    deck.deck.forEach(pack => {
        allWhiteCards.push(...pack.white);
        allBlackCards.push(...pack.black);
    });
}

drawWhite.onclick = () => {
    if (allWhiteCards.length === 0) return;
    const card = allWhiteCards[Math.floor(Math.random() * allWhiteCards.length)];
    drawResult.innerHTML = `<div class="card white">${card.text}</div>`;
};

drawBlack.onclick = () => {
    if (allBlackCards.length === 0) return;
    const card = allBlackCards[Math.floor(Math.random() * allBlackCards.length)];
    drawResult.innerHTML = `<div class="card black">${card.text}</div>`;
};

// Load all cards when page loads
loadAllCards();
