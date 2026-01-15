// src/views/watchlist/watchlist.ts
import { appStore } from "../../lib/store";
import { TMDB_IMAGE_BASE_URL } from "../../services/tmdbApi";
import { deleteMovie } from "../../services/movieApi";
import { initApp } from "../../lib/actions";
import type { DBMovie } from "../../types/index";

/**
 * Hjälpfunktion för att rita ett sparat filmkort
 */
function renderWatchlistCard(movie: DBMovie): string {
    return `
        <div class="movie-card saved-card" data-db-id="${movie.id}">
            <div class="movie-poster">
                <img src="${movie.poster_path ? TMDB_IMAGE_BASE_URL + movie.poster_path : 'https://via.placeholder.com/500x750?text=Ingen+bild'}" alt="${movie.title}" />
                <span class="status-badge">${movie.status === 'watched' ? '✅ Sett' : '⏳ Att se'}</span>
            </div>
            <div class="movie-info">
                <h3>${movie.title}</h3>
                <p class="movie-date">Tillagd: ${new Date(movie.date_added || '').toLocaleDateString('sv-SE')}</p>
                
                <div class="watchlist-actions">
                    <button class="btn-delete" data-id="${movie.id}">Ta bort</button>
                    <button class="btn-status">${movie.status === 'watched' ? 'Se igen' : 'Markera som sett'}</button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Huvudvyn för Watchlist-sidan
 */
export function watchlistView(): string {
    const { watchlist, isLoading } = appStore.getState();

    if (isLoading) return `<div class="loader">Laddar din lista...</div>`;

    return `
        <section class="watchlist-page">
            <div class="container">
                <header class="page-header">
                    <h2>Min Watchlist (${watchlist.length})</h2>
                    <p>Här är filmerna du har sparat för att se senare.</p>
                </header>

                <div class="movie-grid">
                    ${watchlist.length > 0 
                        ? watchlist.map(movie => renderWatchlistCard(movie)).join('') 
                        : `
                            <div class="empty-state">
                                <p>Din lista är tom.</p>
                                <a href="/browse" class="btn-primary">Hitta filmer att lägga till</a>
                            </div>
                        `
                    }
                </div>
            </div>
        </section>
    `;
}