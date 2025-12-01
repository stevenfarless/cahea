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
    this.toggleFavoritesBtn = document.getElementById('toggleFavoritesBtn');

    // Setup event listeners
    this._setupEventListeners();
    
    // Initialize the deck (load cards from JSON)
    this._init();
  }

  // Private method to set up all event listeners
  _setupEventListeners() {
    this.drawBlackBtn.onclick = () => this.drawBlackCard();
    this.drawWhiteBtn.onclick = () => this.drawWhiteCard();
    this.favoriteBtn.onclick = () => this.toggleFavorite();
    this.toggleFavoritesBtn.onclick = () => this.toggleFavoritesView();
  }

  // Private initialization method to load the card deck
  async _init() {
    await this.cardManager.loadDeck();
    console.log('Deck loaded successfully');
  }

  // Toggle favorites section visibility
  toggleFavoritesView() {
    const isCollapsed = this.favoritesSection.classList.toggle('collapsed');
    this.toggleFavoritesBtn.textContent = isCollapsed ? 'Show Favorites' : 'Hide Favorites';
  }

  // Handle authentication state changes
  async handleAuthChange(user) {
    if (user) {
      // User is signed in - set up favorites manager
      this.favoritesManager = new FavoritesManager(user.uid);
      await this.favoritesManager.loadFavorites();
      this.favoritesSection.classList.add('show');
      this.favoritesSection.classList.add('collapsed'); // Start collapsed
      this.toggleFavoritesBtn.textContent = 'Show Favorites'; // Update button text
      this.renderFavorites();
    } else {
      // User is signed out - clean up favorites
      this.favoritesManager = null;
      this.favoritesSection.classList.remove('show');
      this.favoritesSection.classList.remove('collapsed');
    }
    
    this.updateFavoriteButton();
  }

  // Draw a black card from the deck
  drawBlackCard() {
    const card = this.cardManager.drawBlackCard();
    if (card) {
      this.drawBlackResult.innerHTML = UIRenderer.renderCard(card.text, 'black');
      this.updateFavoriteButton();
    }
  }

  // Draw a white card from the deck
  drawWhiteCard() {
    const card = this.cardManager.drawWhiteCard();
    if (card) {
      this.drawWhiteResult.innerHTML = UIRenderer.renderCard(card.text, 'white');
      this.updateFavoriteButton();
    }
  }

  // Update the favorite button's visibility and state
  updateFavoriteButton() {
    const combo = this.cardManager.getCurrentCombination();
    const isVisible = this.authManager.currentUser && this.cardManager.hasBothCards();
    const isSaved = isVisible && this.favoritesManager.isFavorited(combo.white, combo.black);
    UIRenderer.updateFavoriteButton(this.favoriteBtn, isVisible, isSaved);
  }

  // Toggle favorite state for current card combination
  async toggleFavorite() {
    const combo = this.cardManager.getCurrentCombination();
    const isFav = this.favoritesManager.isFavorited(combo.white, combo.black);
    
    if (isFav) {
      // Remove from favorites
      const favId = this.favoritesManager.getFavoriteId(combo.white, combo.black);
      await this.favoritesManager.removeFavoriteById(favId);
    } else {
      // Add to favorites
      await this.favoritesManager.addFavorite(combo.white, combo.black);
    }
    
    this.renderFavorites();
    this.updateFavoriteButton();
  }

  // Render the favorites list to the DOM
  renderFavorites() {
    if (!this.favoritesManager) return;
    
    const { html, isEmpty } = UIRenderer.renderFavoritesList(
      this.favoritesManager.favorites
    );
    
    this.favoritesContainer.innerHTML = html;
    this.noFavoritesMsg.style.display = isEmpty ? 'block' : 'none';
    
    // Attach remove handlers to each favorite item
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

// Initialize app when DOM is ready
new CAHEAApp();
