// src/services/tmdbApi.ts
import type { TMDBMovie } from "../types/index";

// Hämta API-nyckeln från din .env-fil
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

/**
 * Hämtar populära filmer (förstasidan på Browse)
 */
export async function fetchPopularMovies(): Promise<TMDBMovie[]> {
    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=sv-SE&page=1`
        );
        if (!response.ok) throw new Error("Kunde inte hämta populära filmer");
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error(error);
        return [];
    }
}

/**
 * Söker efter filmer baserat på en textsträng
 */
export async function searchMoviesTMDB(query: string): Promise<TMDBMovie[]> {
    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=sv-SE`
        );
        if (!response.ok) throw new Error("Sökningen misslyckades");
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error("Fel vid TMDB-sökning:", error);
        return [];
    }
}