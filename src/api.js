

// ⚠️ IMPORTANT: Replace 'YOUR_API_KEY_HERE' with your actual OMDb API key
const API_KEY = '3d17ef76'
const API_BASE = 'https://www.omdbapi.com/';

/**
 * Fetches data from the OMDb API.
 * @param {string} params - The query parameters for the API call (e.g., "s=Batman&page=1").
 * @returns {Promise<object>} The JSON response from the API.
 */
async function fetchFromApi(params) {
    const url = `${API_BASE}?apikey=${API_KEY}&${params}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        if (data.Response === "False") {
            // OMDb returns a "False" response for errors like "Movie not found"
            throw new Error(data.Error || 'API returned an error.');
        }
        return data;
    } catch (error) {
        console.error("API Fetch Error:", error);
        throw error; // Re-throw the error to be caught by the caller
    }
}

/**
 * Searches for movies by a query string. Fetches up to 20 results by making two page requests.
 * @param {string} query The search term.
 * @param {number} limit The maximum number of results to return (max 20).
 * @returns {Promise<Array>} A list of movie results.
 */
export async function searchMovies(query, limit = 20) {
    if (!query) return [];

    // OMDb returns 10 results per page, so we fetch two pages to get up to 20
    const promise1 = fetchFromApi(`s=${encodeURIComponent(query)}&type=movie&page=1`);
    const promise2 = fetchFromApi(`s=${encodeURIComponent(query)}&type=movie&page=2`);

    const [page1, page2] = await Promise.all([
        promise1.catch(e => ({ Search: [] })), // Gracefully handle if a page fails
        promise2.catch(e => ({ Search: [] })),
    ]);

    const allMovies = [...(page1.Search || []), ...(page2.Search || [])];
    
    return allMovies.slice(0, limit);
}

/**
 * Fetches a list of popular movies by using a default search query.
 * @param {number} limit The maximum number of results to return.
 * @returns {Promise<Array>} A list of popular movies.
 */
export async function fetchPopular(limit = 20) {
    // OMDb does not have a "popular" endpoint, so we use a popular search term as a default.
    return searchMovies("Action", limit);
}