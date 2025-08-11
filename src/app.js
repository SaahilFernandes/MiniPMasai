import { fetchPopular, searchMovies } from './api.js';
import { debounce } from './debounce.js';
import { loadFavorites, toggleFavorite } from './favorites.js';

const state = {
    status: "idle", // "idle" | "loading" | "success" | "empty" | "error"
    items: [],
    errorMessage: "",
    favorites: [],
    mode: "popular", // "popular" | "search"
    lastQuery: ""
};

const elements = {
    searchInput: document.getElementById('search-input'),
    resultsGrid: document.getElementById('results-grid'),
    favoritesGrid: document.getElementById('favorites-grid'),
    statusContainer: document.getElementById('status-container'),
    resultsHeading: document.getElementById('results-heading'),
};




function renderMovieCard(movie, isFavorite) {
    const poster = movie.Poster === 'N/A' ? 'https://via.placeholder.com/150x222.png?text=No+Image' : movie.Poster;
    const favoriteButtonText = isFavorite ? 'Remove Favorite' : 'Add Favorite';

    return `
        <div class="movie-card" data-imdbid="${movie.imdbID}">
            <img src="${poster}" alt="${movie.Title} Poster">
            <div class="movie-card-info">
                <h3>${movie.Title}</h3>
                <p>${movie.Year}</p>
                <button class="favorite-toggle">${favoriteButtonText}</button>
            </div>
        </div>
    `;
}


function render() {
    elements.statusContainer.innerHTML = '';
    elements.resultsGrid.innerHTML = '';

    switch (state.status) {
        case 'loading':
            elements.statusContainer.textContent = 'Loading...';
            break;
        case 'error':
            elements.statusContainer.textContent = `Error: ${state.errorMessage}`;
            break;
        case 'empty':
            elements.statusContainer.textContent = 'No movies found. Try another search.';
            break;
        case 'success':
            const isFavoriteById = new Set(state.favorites.map(fav => fav.imdbID));
            elements.resultsGrid.innerHTML = state.items
                .map(movie => renderMovieCard(movie, isFavoriteById.has(movie.imdbID)))
                .join('');
            break;
    }
    
    // Render Heading
    if (state.mode === 'search' && state.lastQuery) {
        elements.resultsHeading.textContent = `Results for: "${state.lastQuery}"`;
    } else {
        elements.resultsHeading.textContent = 'Popular Movies';
    }

    // Render Favorites
    if (state.favorites.length === 0) {
        elements.favoritesGrid.innerHTML = '<p>Your favorites list is empty.</p>';
    } else {
        elements.favoritesGrid.innerHTML = state.favorites
            .map(movie => renderMovieCard(movie, true))
            .join('');
    }

    addEventListenersToCards();
}



function handleFavoriteToggle(event) {
    const card = event.target.closest('.movie-card');
    if (!card) return;

    const imdbID = card.dataset.imdbid;
    // Find the movie from either the main items list or the favorites list
    const movie = state.items.find(m => m.imdbID === imdbID) || state.favorites.find(m => m.imdbID === imdbID);

    if (movie) {
        state.favorites = toggleFavorite(state.favorites, movie);
        render(); // Re-render to update both lists
    }
}


function addEventListenersToCards() {
    document.querySelectorAll('.favorite-toggle').forEach(button => {
        button.addEventListener('click', handleFavoriteToggle);
    });
}


async function performSearch(query) {
    if (!query) {
        showPopularMovies();
        return;
    }

    state.status = 'loading';
    state.mode = 'search';
    state.lastQuery = query;
    render();

    try {
        const movies = await searchMovies(query);
        state.items = movies;
        if (movies.length === 0) {
            state.status = 'empty';
        } else {
            state.status = 'success';
        }
    } catch (error) {
        state.status = 'error';
        state.errorMessage = error.message;
    }
    render();
}

/**
 * Fetches and displays the initial list of popular movies.
 */
async function showPopularMovies() {
    state.status = 'loading';
    state.mode = 'popular';
    state.lastQuery = '';
    render();
    
    try {
        const movies = await fetchPopular();
        state.items = movies;
        state.status = 'success';
    } catch (error) {
        state.status = 'error';
        state.errorMessage = error.message;
    }
    render();
}



function init() {
    const debouncedSearch = debounce(performSearch, 500);
    elements.searchInput.addEventListener('input', (e) => {
        debouncedSearch(e.target.value.trim());
    });

    document.getElementById('search-form').addEventListener('submit', (e) => e.preventDefault());
    
    state.favorites = loadFavorites();
    showPopularMovies();
}

init();