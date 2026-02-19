import * as SecureStore from 'expo-secure-store';

const FAVORITES_KEY = 'user_favorites';

export default {
    /**
     * Get all favorite car IDs
     * @returns {Promise<string[]>}
     */
    getFavorites: async () => {
        try {
            const jsonValue = await SecureStore.getItemAsync(FAVORITES_KEY);
            return jsonValue != null ? JSON.parse(jsonValue) : [];
        } catch (e) {
            console.error("Error reading favorites:", e);
            return [];
        }
    },

    /**
     * Toggle a car as favorite
     * @param {string} carId 
     * @returns {Promise<boolean>} new favorite status (true = added, false = removed)
     */
    toggleFavorite: async (carId) => {
        try {
            const current = await SecureStore.getItemAsync(FAVORITES_KEY);
            let favorites = current ? JSON.parse(current) : [];

            const index = favorites.indexOf(carId);
            let isFavorite = false;

            if (index > -1) {
                // Remove
                favorites.splice(index, 1);
                isFavorite = false;
            } else {
                // Add
                favorites.push(carId);
                isFavorite = true;
            }

            await SecureStore.setItemAsync(FAVORITES_KEY, JSON.stringify(favorites));
            return isFavorite;
        } catch (e) {
            console.error("Error toggling favorite:", e);
            return false;
        }
    },

    /**
     * Check if a car is favorite
     * @param {string} carId 
     * @returns {Promise<boolean>}
     */
    isFavorite: async (carId) => {
        try {
            const current = await SecureStore.getItemAsync(FAVORITES_KEY);
            if (!current) return false;
            const favorites = JSON.parse(current);
            return favorites.includes(carId);
        } catch (e) {
            return false;
        }
    }
};
