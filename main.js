// main.js - Application coordinator
// This is the "glue" that brings all managers together
// Handles DOM manipulation and coordinates between different modules

import { auth } from './firebase.js';
import { AuthManager } from './AuthManager.js';
import { CardManager } from './CardManager.js';
import { FavoritesManager } from './FavoritesManager.js';
import { UIRenderer } from './UIRenderer.js';

/**
 * Main application class
 * Coordinates all managers and handles user interactions
 * Follows the "Coordinator Pattern" - doesn't do much logic itself,
 * just delegates to the appropriate manager
 */
class CAHEAApp {
    constructor() {
        // Initialize all managers
        // Each manager handles its own domain (auth, cards, favorites)
        this.authManager = new AuthManager(auth, (user) => this.handleAuthChange(user));
        this.cardManager = new CardManager('cah-all-compact.json');
        this.favoritesManager = null; // Created when user logs in
        
        // Cache DOM element references
        // Doing this once in constructor is more efficient than
        // calling getElementById every time we need an element
        this.drawBlackBtn = document.getElementById('drawBlack');
        this.drawWhiteBtn = document.getElementById('drawWhite');
        this.drawBlackResult = document.getElementById('drawBlackResult');
        this.drawWhiteResult = document.getElementById('drawWhiteResult');
        this.favoriteBtn = document.getElementById('favoriteBtn');
        this.favoritesSection = document.getElementById('favoritesSection');
        this.favoritesContainer = document.getElementById('favoritesContainer');
        this.noFavoritesMsg = document.getElementById('noFavoritesMsg');
        this.toggleFavoritesBtn = document.getElementById('toggleFavoritesBtn');
        
        // Set up event listeners and load initial data
        this._setupEventListeners();
        this._init();
    }
    
    /**
     * Sets up all button click handlers
     * Using arrow functions to preserve 'this' context
     */
    _setupEventListeners() {
        this.drawBlackBtn.onclick = () => this.drawBlackCard();
        this.drawWhiteBtn.onclick = () => this.drawWhiteCard();
        this.favoriteBtn.onclick = () => this.toggleFavorite();
        this.toggleFavoritesBtn.onclick = () => this.toggleFavoritesView();
    }
    
    /**
     * Async initialization - loads the card deck
     * Using async/await makes asynchronous code read like synchronous code
     */
    async _init() {
        try {
            await this.cardManager.loadDeck();
            console.log('Deck loaded successfully');
        } catch (error) {
            console.error('Failed to load deck:', error);
            // Could show user-friendly error message here
        }
    }
    
    /**
     * Toggles the favorites section between collapsed and expanded
     * Updates button text to reflect current state
     */
    toggleFavoritesView() {
        const isCollapsed = this.favoritesSection.classList.toggle('collapsed');
        this.toggleFavoritesBtn.textContent = isCollapsed ? 'Show Favorites' : 'Hide Favorites';
    }
    
    /**
     * Handles authentication state changes
     * Called by AuthManager whenever user logs in/out
     * @param {Object|null} user - Firebase user object or null
     */
    async handleAuthChange(user) {
        if (user) {
            // User logged in - set up favorites functionality
            this.favoritesManager = new FavoritesManager(user.uid);
            await this.favoritesManager.loadFavorites();
            
            // Show favorites section (collapsed by default)
            this.favoritesSection.classList.add('show');
            this.favoritesSection.classList.add('collapsed');
            this.toggleFavoritesBtn.textContent = 'Show Favorites';
            
            this.renderFavorites();
        } else {
            // User logged out - clean up favorites
            this.favoritesManager = null;
            this.favoritesSection.classList.remove('show');
            this.favoritesSection.classList.remove('collapsed');
        }
        
        // Update favorite button visibility
        this.updateFavoriteButton();
    }
    
    /**
     * Draws a random black card and displays it
     * Updates favorite button state after drawing
     */
    drawBlackCard() {
        const card = this.cardManager.drawBlackCard();
        if (card) {
            // Get HTML from UIRenderer (pure function)
            // Then apply it to DOM (side effect, done here in main.js)
            this.drawBlackResult.innerHTML = UIRenderer.renderCard(card.text, 'black');
            this.updateFavoriteButton();
        }
    }
    
    /**
     * Draws a random white card and displays it
     * Updates favorite button state after drawing
     */
    drawWhiteCard() {
        const card = this.cardManager.drawWhiteCard();
        if (card) {
            this.drawWhiteResult.innerHTML = UIRenderer.renderCard(card.text, 'white');
            this.updateFavoriteButton();
        }
    }
    
    /**
     * Updates the favorite button's visibility and text
     * REFACTORED: Now uses pure function from UIRenderer
     * All DOM manipulation happens here, not in UIRenderer
     */
    updateFavoriteButton() {
        const combo = this.cardManager.getCurrentCombination();
        const isVisible = this.authManager.currentUser && this.cardManager.hasBothCards();
        const isSaved = isVisible && this.favoritesManager.isFavorited(combo.white, combo.black);
        
        // Get state from pure function (no side effects)
        const state = UIRenderer.getFavoriteButtonState(isVisible, isSaved);
        
        // Apply state to DOM (side effects isolated here)
        const buttonRow = this.favoriteBtn.parentElement;
        buttonRow.style.display = state.containerDisplay;
        this.favoriteBtn.textContent = state.buttonText;
        
        // Toggle CSS class for styling
        if (state.isSaved) {
            this.favoriteBtn.classList.add('saved');
        } else {
            this.favoriteBtn.classList.remove('saved');
        }
    }
    
    /**
     * Toggles favorite state for current card combination
     * Either adds or removes based on current state
     */
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
        
        // Update UI to reflect changes
        this.renderFavorites();
        this.updateFavoriteButton();
    }
    
    /**
     * Renders the favorites list to the DOM
     * Attaches event listeners to remove buttons
     */
    renderFavorites() {
        if (!this.favoritesManager) return;
        
        // Get HTML from UIRenderer
        const { html, isEmpty } = UIRenderer.renderFavoritesList(
            this.favoritesManager.favorites
        );
        
        // Apply to DOM
        this.favoritesContainer.innerHTML = html;
        this.noFavoritesMsg.style.display = isEmpty ? 'block' : 'none';
        
        // Attach event listeners to remove buttons
        // We do this here because innerHTML removes old listeners
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
// No need to wait for DOMContentLoaded since script is at bottom of HTML with type="module"
new CAHEAApp();
