// main.js - App coordinator (much cleaner!)
import { auth } from './firebase.js';
import { AuthManager } from './AuthManager.js';
import { CardManager } from './CardManager.js';
import { FavoritesManager } from './FavoritesManager.js';
import { UIRenderer } from './UIRenderer.js';

class CAHEAApp {
    constructor() {
        // Managers
        this.authManager = new AuthManager(auth, (user) => this.handleAuthChange(user));
        this.cardManager = new CardManager('cah-all-compact.json');
        this.favoritesManager = null;
        
        // DOM Elements
        this.drawBlackBtn = document.getElementById('drawBlack');
        this.drawWhiteBtn = document.getElementById('drawWhite');
        this.drawBlackResult = document.getElementById('drawBlackResult');
        this.drawWhiteResult = document.getElementById('drawWhiteResult');
        this.favoriteBtn = document.getElementById('favoriteBtn');
        this.favoritesSection = document.getElementById('favoritesSection');
        this.favoritesContainer = document.getElementById('favoritesContainer');
        this.noFavoritesMsg = document.getElementById('noFavoritesMsg');
        
        this._setupEventListeners();
        this._init();
    }
    
    async _init() {
        await this.cardManager.loadDeck();
    }
    
    _setupEventListeners() {
        this.drawBlackBtn.onclick = () => this.drawBlackCard();
        this.drawWhiteBtn.onclick = () => this.drawWhiteCard();
        this.favoriteBtn.onclick = () => this.toggleFavorite();
    }
    
    async handleAuthChange(user) {
        if (user) {
            this.favoritesManager = new FavoritesManager(user.uid);
            await this.favoritesManager.loadFavorites();
            this.favoritesSection.classList.add('show');
            this.renderFavorites();
        } else {
            this.favoritesManager = null;
            this.favoritesSection.classList.remove('show');
        }
        this.updateFavoriteButton();
    }
    
    drawBlackCard() {
        const card = this.cardManager.drawBlackCard();
        if (card) {
            this.drawBlackResult.innerHTML = UIRenderer.renderCard(card.text, 'black');
            this.updateFavoriteButton();
        }
    }
    
    drawWhiteCard() {
        const card = this.cardManager.drawWhiteCard();
        if (card) {
            this.drawWhiteResult.innerHTML = UIRenderer.renderCard(card.text, 'white');
            this.updateFavoriteButton();
        }
    }
    
    updateFavoriteButton() {
        const combo = this.cardManager.getCurrentCombination();
        const isVisible = this.authManager.currentUser && this.cardManager.hasBothCards();
        const isSaved = isVisible && this.favoritesManager.isFavorited(combo.white, combo.black);
        
        UIRenderer.updateFavoriteButton(this.favoriteBtn, isVisible, isSaved);
    }
    
    async toggleFavorite() {
        const combo = this.cardManager.getCurrentCombination();
        const isFav = this.favoritesManager.isFavorited(combo.white, combo.black);
        
        if (isFav) {
            const favId = this.favoritesManager.getFavoriteId(combo.white, combo.black);
            await this.favoritesManager.removeFavoriteById(favId);
        } else {
            await this.favoritesManager.addFavorite(combo.white, combo.black);
        }
        
        this.renderFavorites();
        this.updateFavoriteButton();
    }
    
    renderFavorites() {
        if (!this.favoritesManager) return;
        
        const { html, isEmpty } = UIRenderer.renderFavoritesList(
            this.favoritesManager.favorites
        );
        
        this.favoritesContainer.innerHTML = html;
        this.noFavoritesMsg.style.display = isEmpty ? 'block' : 'none';
        
        // Attach remove handlers
        if (!isEmpty) {
            this.favoritesContainer.querySelectorAll('.remove-favorite-btn').forEach(btn => {
                btn.onclick = async () => {
                    const favId = btn.getAttribute('data-id');
                    await this.favoritesManager.removeFavoriteById(favId);
                    this.renderFavorites();
                    this.updateFavoriteButton();
                };
            });
        }
    }
}

// Initialize app
new CAHEAApp();
