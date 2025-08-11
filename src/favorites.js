const FAVORITES_KEY = 'movie-favorites';

/**
 * Loads the list of favorite movies from localStorage.
 * @returns {Array} An array of movie objects.
 */
export function loadFavorites() {
    const favoritesJSON = localStorage.getItem(FAVORITES_KEY);
    if (!favoritesJSON) {
        return [];
    }
    try {
        return JSON.parse(favoritesJSON);
    } catch (e) {
        console.error("Failed to parse favorites from localStorage", e);
        return [];
    }
}

/**
 * Saves the list of favorite movies to localStorage.
 * @param {Array} favoritesList An array of movie objects.
 */
export function saveFavorites(favoritesList) {
    try {
        const favoritesJSON = JSON.stringify(favoritesList);
        localStorage.setItem(FAVORITES_KEY, favoritesJSON);
    } catch (e) {
        console.error("Failed to save favorites to localStorage", e);
    }
}

/**
 * Adds or removes a movie from the favorites list.
 * @param {Array} currentFavorites The current list of favorites.
 * @param {object} movie The movie object to add or remove (must have an imdbID).
 * @returns {Array} The updated array of favorites.
 */
export function toggleFavorite(currentFavorites, movie) {
    const isFavorite = currentFavorites.some(fav => fav.imdbID === movie.imdbID);
    let updatedFavorites;

    if (isFavorite) {
        // Remove from favorites
        updatedFavorites = currentFavorites.filter(fav => fav.imdbID !== movie.imdbID);
    } else {
        // Add to favorites
        updatedFavorites = [...currentFavorites, movie];
    }

    saveFavorites(updatedFavorites);
    return updatedFavorites;
}