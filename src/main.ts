import './index.css';
import { getMovies, searchMovies, discoverMovies } from './services/tmdbApi';
import { createMovieCard } from './components/moviecard';
import { initWatchedView } from './views/watched/watched';
import { renderFilterComponent } from './views/search/search';
import * as movieApi from './services/movieApi';
import { appStore } from './lib/store';
import type { TMDBMovie, CreateMovieBody, AppState } from './types/index';

const root = document.getElementById('root')!;
const globalSearchInput = document.getElementById('movie-search') as HTMLInputElement;
const filterBtn = document.getElementById('filter-open-btn');
let searchTimeout: number;

/**
 * Universal hjälpare för att rendera filmkort och binda klick-event
 */
const renderMoviesToContainer = (movies: TMDBMovie[], container: HTMLElement) => {
    const watchedIds = appStore.getState().watchedMovies;
    const mapped = movies.map(m => ({
        ...m,
        isWatched: watchedIds.has(m.id)
    }));

    container.innerHTML = mapped.map(movie => createMovieCard(movie)).join('');
    attachBrowseListeners(movies);
};

/**
 * Global söklogik i headern (Live search)
 */
globalSearchInput?.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = (e.target as HTMLInputElement).value;

    if (query.length === 0) {
        renderBrowseView();
        return;
    }

    if (query.length >= 2) {
        searchTimeout = window.setTimeout(async () => {
            const results = await searchMovies(query);
            root.innerHTML = `<div style="padding: 20px;"><h1>Sökresultat: "${query}"</h1><div id="browse-container" class="filter-results-grid"></div></div>`;
            const container = document.getElementById('browse-container');
            if (container) renderMoviesToContainer(results, container);
        }, 300);
    }
});

/**
 * Logik för Filter-knappen (Öppnar SPA-vyn i mitten)
 */
filterBtn?.addEventListener('click', async () => {
    root.innerHTML = '';
    
    const filterView = await renderFilterComponent(
        async (params) => {
            let results: TMDBMovie[] = [];
            
            if (params.title && params.title.length >= 2) {
                results = await searchMovies(params.title);
                
                // Manuell filtrering för kombinerad sökning
                if (params.year) {
                    results = results.filter(m => m.release_date?.startsWith(params.year));
                }
                if (params.genre) {
                    results = results.filter(m => (m as any).genre_ids?.includes(Number(params.genre)));
                }
                if (params.rating) {
                    const [min] = params.rating.split('-').map(Number);
                    results = results.filter(m => m.vote_average >= min);
                }
            } else {
                results = await discoverMovies({
                    year: params.year,
                    rating: params.rating,
                    genre: params.genre
                });
            }

            const resultsContainer = document.getElementById('filter-results-list');
            if (resultsContainer) {
                renderMoviesToContainer(results, resultsContainer);
            }
        },
        () => renderBrowseView()
    );
    
    root.appendChild(filterView);
});

/**
 * Landningsvy (Populära filmer)
 */
const renderBrowseView = async () => {
    root.innerHTML = `<div style="padding: 20px;"><h1>Popular Movies</h1><div id="browse-container" class="filter-results-grid"></div></div>`;
    try {
        const movies = await getMovies();
        const container = document.getElementById('browse-container');
        if (container) renderMoviesToContainer(movies, container);
    } catch (err) {
        root.innerHTML = `<h2>Kunde inte ladda filmer.</h2>`;
    }
};

/**
 * Event-lyssnare för "Add to Watched"-knappar
 */
const attachBrowseListeners = (currentMovies: TMDBMovie[]) => {
    const buttons = document.querySelectorAll(".movie-card__btn");
    buttons.forEach((button) => {
        button.addEventListener("click", async () => {
            const tmdbId = button.getAttribute("data-movie-id");
            if (!tmdbId) return;

            const movie = currentMovies.find((m) => m.id === Number(tmdbId));
            if (!movie) return;

            const movieData: CreateMovieBody = {
                tmdb_id: movie.id,
                title: movie.title,
                poster_path: movie.poster_path,
                release_date: movie.release_date,
                vote_average: movie.vote_average,
                overview: movie.overview,
                status: "watched",
                date_watched: new Date().toISOString().split("T")[0],
            };

            try {
                await movieApi.addMovie(movieData);
                
                // FIX: Spreada gamla statet så TS blir nöjd
                appStore.setState((prev: AppState) => {
                    const nextWatched = new Set(prev.watchedMovies);
                    nextWatched.add(Number(tmdbId));
                    return { 
                        ...prev, 
                        watchedMovies: nextWatched 
                    };
                });

                (button as HTMLButtonElement).textContent = "✓ Watched";
                (button as HTMLButtonElement).disabled = true;
            } catch (error) {
                console.error("Error adding movie:", error);
            }
        });
    });
};

const setupNavigation = () => {
    document.getElementById('nav-browse')?.addEventListener('click', () => renderBrowseView());
    document.getElementById('nav-watched')?.addEventListener('click', () => {
        root.innerHTML = `<div style="padding: 20px;"><h1>Watched Movies</h1><div id="watched-container"></div></div>`;
        initWatchedView();
    });
};

setupNavigation();
renderBrowseView();