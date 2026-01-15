// src/views/browse/browse.ts
import { appStore } from "../../lib/store";
import { TMDB_IMAGE_BASE_URL } from "../../services/tmdbApi";
import type { TMDBMovie } from "../../types/index";

/**
 * Hjälpfunktion för att rita ett enskilt filmkort
 */
function renderMovieCard(movie: TMDBMovie): string {
    const { watchlist } = appStore.getState();
    
    // Kolla om filmen redan finns i användarens watchlist
    const isSaved = watchlist.some(m => m.tmdb_id === movie.id);

    return `
        <div class="movie-card" data-id="${movie.id}">
            <div class="movie-poster">
                <img src="${movie.poster_path ? TMDB_IMAGE_BASE_URL + movie.poster_path : 'https://via.placeholder.com/500x750?text=Ingen+bild'}" alt="${movie.title}" loading="lazy" />
                ${isSaved ? '<span class="saved-badge">I din lista</span>' : ''}
            </div>
            <div class="movie-info">
                <h3>${movie.title}</h3>
                <div class="movie-meta">
                    <span class="year">${movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}</span>
                    <span class="rating">⭐ ${movie.vote_average.toFixed(1)}</span>
                </div>
                <p class="overview">${movie.overview ? movie.overview.substring(0, 80) + '...' : 'Ingen beskrivning tillgänglig.'}</p>
                
                <button 
                    class="btn-add-watchlist" 
                    ${isSaved ? 'disabled' : ''}
                >
                    ${isSaved ? 'Sparad' : '➕ Watchlist'}
                </button>
            </div>
        </div>
    `;
}

/**
 * Huvudvyn för Browse-sidan
 */
export function browseView(): string {
    const { movies, isLoading, error, searchQuery } = appStore.getState();

    // 1. Om det laddar
    if (isLoading && movies.length === 0) {
        return `<div class="loader">Hämtar filmer...</div>`;
    }

    // 2. Om ett fel uppstått
    if (error) {
        return `<div class="error-message">⚠️ ${error}</div>`;
    }

    return `
        <section class="browse-page">
            <header class="browse-header">
                <h2>${searchQuery ? `Sökresultat för "${searchQuery}"` : 'Populära filmer'}</h2>
                <form id="search-form" class="search-container">
                    <input 
                        type="text" 
                        id="search-input" 
                        placeholder="Sök film..." 
                        value="${searchQuery}"
                        required 
                    />
                    <button type="submit">Sök</button>
                </form>
            </header>

            <div class="movie-grid">
                ${movies.length > 0 
                    ? movies.map(movie => renderMovieCard(movie)).join('') 
                    : '<p>Inga filmer hittades.</p>'
                }
            </div>
        </section>
    `;
}