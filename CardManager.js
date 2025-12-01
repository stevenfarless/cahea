// CardManager.js - Manages card deck and current card combination
// Handles loading the deck and drawing random cards

import { CAHDeck } from './CAHDeck.js';

/**
 * Manages the card deck and tracks current card combination
 * Separates card logic from UI and other concerns
 */
export class CardManager {
    /**
     * @param {string} deckPath - Path to the JSON deck file
     */
    constructor(deckPath) {
        this.deckPath = deckPath;
        this.whiteCards = [];
        this.blackCards = [];
        // Tracks currently displayed cards
        this.currentCombination = { white: null, black: null };
    }
    
    /**
     * Loads the card deck from JSON file
     * Flattens all packs into two arrays (white and black)
     * Async because it fetches from a file
     */
    async loadDeck() {
        const deck = await CAHDeck.fromCompact(this.deckPath);
        
        // Flatten all packs into single arrays for easy random access
        deck.deck.forEach((pack) => {
            this.whiteCards.push(...pack.white);
            this.blackCards.push(...pack.black);
        });
    }
    
    /**
     * Draws a random white card from the deck
     * Updates current combination with the drawn card
     * @returns {Object|null} Card object or null if deck is empty
     */
    drawWhiteCard() {
        if (this.whiteCards.length === 0) return null;
        
        // Math.random() generates 0-1, multiply by length for 0-length range
        // Math.floor() rounds down to get integer index
        const randomIndex = Math.floor(Math.random() * this.whiteCards.length);
        const card = this.whiteCards[randomIndex];
        
        // Update current combination for favorites feature
        this.currentCombination.white = card.text;
        return card;
    }
    
    /**
     * Draws a random black card from the deck
     * Updates current combination with the drawn card
     * @returns {Object|null} Card object or null if deck is empty
     */
    drawBlackCard() {
        if (this.blackCards.length === 0) return null;
        
        const randomIndex = Math.floor(Math.random() * this.blackCards.length);
        const card = this.blackCards[randomIndex];
        
        this.currentCombination.black = card.text;
        return card;
    }
    
    /**
     * Gets the current card combination
     * @returns {Object} Object with white and black properties
     */
    getCurrentCombination() {
        return this.currentCombination;
    }
    
    /**
     * Checks if both a white and black card have been drawn
     * Used to determine if favorite button should be shown
     * @returns {boolean} True if both cards are present
     */
    hasBothCards() {
        return this.currentCombination.white !== null && 
               this.currentCombination.black !== null;
    }
    
    /**
     * Clears the current combination
     * Useful for resetting state
     */
    clearCombination() {
        this.currentCombination = { white: null, black: null };
    }
}
