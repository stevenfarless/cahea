// FavoritesManager.js - Manages user's favorite card combinations
// Handles adding, removing, and checking favorites

import { saveFavorite, removeFavorite, getFavorites } from './firebase.js';

/**
 * Manages user's saved favorite card combinations
 * Maintains local cache of favorites for quick lookups
 */
export class FavoritesManager {
    /**
     * @param {string} userId - Firebase user ID
     */
    constructor(userId) {
        this.userId = userId;
        this.favorites = []; // Local cache of user's favorites
    }
    
    /**
     * Loads user's favorites from Firebase
     * Should be called immediately after creating FavoritesManager
     */
    async loadFavorites() {
        this.favorites = await getFavorites(this.userId);
    }
    
    /**
     * Adds a new favorite combination
     * Saves to Firebase and updates local cache
     * @param {string} whiteCombination - White card text
     * @param {string} blackCombination - Black card text
     * @returns {string} The ID of the newly created favorite
     */
    async addFavorite(whiteCombination, blackCombination) {
        const favorite = {
            white: whiteCombination,
            black: blackCombination,
            timestamp: Date.now() // For potential sorting by date
        };
        
        // Save to Firebase and get generated ID
        const id = await saveFavorite(this.userId, favorite);
        
        // Update local cache so we don't need to reload from Firebase
        this.favorites.push({ id, ...favorite });
        
        return id;
    }
    
    /**
     * Removes a favorite by its ID
     * Removes from Firebase and updates local cache
     * @param {string} favoriteId - The ID of the favorite to remove
     */
    async removeFavoriteById(favoriteId) {
        await removeFavorite(this.userId, favoriteId);
        
        // Update local cache using filter
        // filter() creates new array without the removed item
        this.favorites = this.favorites.filter(f => f.id !== favoriteId);
    }
    
    /**
     * Checks if a combination is in favorites
     * Uses some() which returns true if any element matches
     * @param {string} whiteCombination - White card text
     * @param {string} blackCombination - Black card text
     * @returns {boolean} True if combination is favorited
     */
    isFavorited(whiteCombination, blackCombination) {
        return this.favorites.some(fav =>
            fav.white === whiteCombination && fav.black === blackCombination
        );
    }
    
    /**
     * Gets the ID of a favorited combination
     * Used when removing a favorite
     * @param {string} whiteCombination - White card text
     * @param {string} blackCombination - Black card text
     * @returns {string|undefined} The favorite ID or undefined if not found
     */
    getFavoriteId(whiteCombination, blackCombination) {
        const fav = this.favorites.find(f =>
            f.white === whiteCombination && f.black === blackCombination
        );
        // Optional chaining (?.) returns undefined if fav is null
        return fav?.id;
    }
}
