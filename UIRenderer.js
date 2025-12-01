// UIRenderer.js - Pure rendering functions (no side effects)
// All functions here only transform data into HTML or state objects
// They NEVER directly manipulate the DOM - that's main.js's job

export class UIRenderer {
    /**
     * Renders a single card as HTML
     * @param {string} cardText - The text content of the card
     * @param {string} type - Either 'white' or 'black'
     * @returns {string} HTML string for the card
     * 
     * Why pure? This function has no side effects - same inputs always
     * produce the same output. Makes it easy to test and reason about.
     */
    static renderCard(cardText, type) {
        // Using template literals for clean HTML generation
        return `
            <div class="card card-${type}">
                ${cardText}
            </div>
        `;
    }
    
    /**
     * Renders the favorites list as HTML
     * @param {Array} favorites - Array of favorite objects with id, white, black properties
     * @returns {Object} Object with html string and isEmpty boolean
     * 
     * Why return an object? Allows caller to know if list is empty
     * without parsing HTML or checking length themselves
     */
    static renderFavoritesList(favorites) {
        // Handle empty state first
        if (favorites.length === 0) {
            return { html: '', isEmpty: true };
        }
        
        // Transform array of favorites into HTML string
        // Using map() to transform each favorite into HTML, then join() to concatenate
        const html = favorites
            .map(fav => `
                <div class="favorite-item">
                    <div class="favorite-cards">
                        <div class="card card-black">${fav.black}</div>
                        <div class="card card-white">${fav.white}</div>
                    </div>
                    <button class="remove-favorite-btn" data-id="${fav.id}">Remove</button>
                </div>
            `)
            .join('');
        
        return { html, isEmpty: false };
    }
    
    /**
     * Calculates what the favorite button state should be
     * Returns a state object instead of mutating DOM directly
     * @param {boolean} isVisible - Whether button should be shown
     * @param {boolean} isSaved - Whether current combo is saved
     * @returns {Object} State object describing button appearance
     * 
     * KEY CONCEPT: This is a pure function that calculates state.
     * The caller (main.js) applies this state to the DOM.
     * This separation makes testing easy and keeps concerns separated.
     */
    static getFavoriteButtonState(isVisible, isSaved) {
        return {
            containerDisplay: isVisible ? 'flex' : 'none',
            buttonText: isSaved ? '❤️ Saved!' : '🤍 Save to Favorites',
            isSaved: isSaved  // Used for CSS class toggling
        };
    }
}
