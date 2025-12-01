// CardManager.js - Manages card deck and current combination
import { CAHDeck } from './CAHDeck.js';

export class CardManager {
    constructor(deckPath) {
        this.deckPath = deckPath;
        this.whiteCards = [];
        this.blackCards = [];
        this.currentCombination = { white: null, black: null };
    }
    
    async loadDeck() {
        const deck = await CAHDeck.fromCompact(this.deckPath);
        deck.deck.forEach((pack) => {
            this.whiteCards.push(...pack.white);
            this.blackCards.push(...pack.black);
        });
    }
    
    drawWhiteCard() {
        if (this.whiteCards.length === 0) return null;
        const card = this.whiteCards[Math.floor(Math.random() * this.whiteCards.length)];
        this.currentCombination.white = card.text;
        return card;
    }
    
    drawBlackCard() {
        if (this.blackCards.length === 0) return null;
        const card = this.blackCards[Math.floor(Math.random() * this.blackCards.length)];
        this.currentCombination.black = card.text;
        return card;
    }
    
    getCurrentCombination() {
        return this.currentCombination;
    }
    
    hasBothCards() {
        return this.currentCombination.white !== null && this.currentCombination.black !== null;
    }
    
    clearCombination() {
        this.currentCombination = { white: null, black: null };
    }
}
