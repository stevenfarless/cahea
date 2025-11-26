
import { app } from './firebase.js';
import { CAHDeck } from './CAHDeck.js';

// Get references to UI elements
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userGreeting = document.getElementById('userGreeting');
const packList = document.getElementById('packList');
const cardArea = document.getElementById('cardArea');

// Placeholder for Firebase Auth integration
loginBtn.onclick = () => {
    alert('Connect this to Firebase Authentication!');
};

logoutBtn.onclick = () => {
    alert('Connect this to Firebase Authentication!');
};

// Loads all card packs from cah-all-compact.json
async function loadPacks() {
    const deck = await CAHDeck.fromCompact('cah-all-compact.json');
    const packs = deck.listPacks();

    // Add each available pack to the pack list
    packs.forEach((pack, idx) => {
        const li = document.createElement('li');
        li.textContent = `${pack.name} (${pack.counts.total} cards)`;
        li.onclick = () => showCards(deck, idx);
        packList.appendChild(li);
    });
}

// Display all cards from the selected pack
function showCards(deck, packIdx) {
    const pack = deck.getPack(packIdx);
    cardArea.innerHTML = '<h3>White Cards</h3>'
        + pack.white.map(card => `<div class="card white">${card.text}</div>`).join('')
        + '<h3>Black Cards</h3>'
        + pack.black.map(card => `<div class="card black">${card.text}</div>`).join('');
}

// Initial load of packs
loadPacks();
