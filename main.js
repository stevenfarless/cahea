const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const signupBtn = document.getElementById('signupBtn');
const userGreeting = document.getElementById('userGreeting');
const drawWhite = document.getElementById('drawWhite');
const drawBlack = document.getElementById('drawBlack');
const drawResult = document.getElementById('drawResult');

const auth = getAuth(app);

signupBtn.onclick = async () => {
    const email = prompt("Enter email for sign up:");
    const password = prompt("Choose a password:");
    try {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Sign up successful! You are now logged in.");
    } catch (err) {
        alert("Sign up failed: " + err.message);
    }
};

logoutBtn.onclick = async () => {
    await signOut(auth);
    alert("Logged out!");
};

// Track auth state and update UI
onAuthStateChanged(auth, user => {
    if (user) {
        loginBtn.style.display = "none";
        signupBtn.style.display = "none";
        logoutBtn.style.display = "";
        userGreeting.textContent = "Welcome, " + user.email;
    } else {
        loginBtn.style.display = "";
        signupBtn.style.display = "";
        logoutBtn.style.display = "none";
        userGreeting.textContent = "";
    }
});


console.log('Firebase app:', app);

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
