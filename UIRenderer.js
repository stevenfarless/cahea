// UIRenderer.js - Pure rendering functions (no side effects)
export class UIRenderer {
    static renderCard(cardText, type) {
        // type is 'white' or 'black'
        return `
            <div class="card ${type}">
                ${cardText}
            </div>
        `;
    }
    
    static renderFavoritesList(favorites, onRemove) {
        if (favorites.length === 0) {
            return { html: '', isEmpty: true };
        }
        
        const html = favorites
            .map(fav => `
                <div class="favorite-item">
                    <div class="favorite-cards">
                        <div class="favorite-card black">${fav.black}</div>
                        <div class="favorite-card white">${fav.white}</div>
                    </div>
                    <button class="remove-favorite-btn" data-id="${fav.id}">Remove</button>
                </div>
            `)
            .join('');
        
        return { html, isEmpty: false };
    }
    
    static updateFavoriteButton(button, isVisible, isSaved) {
        const buttonRow = button.parentElement;
        buttonRow.style.display = isVisible ? 'flex' : 'none';
        if (isVisible) {
            button.textContent = isSaved ? '❤️ Saved!' : '🤍 Save to Favorites';
        }
    }
}
