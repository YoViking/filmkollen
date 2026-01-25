import './index.css';
import { getMovies, searchMovies, discoverMovies } from './services/tmdbApi';
import { createMovieCard } from './components/moviecard';
import App from './App'; // Behåller din App-komponent om den används för global UI
import { initWatchedView } from './views/watched/watched';
import {
  initWatchlistView,
  addWatchlistMovie,
  removeWatchlistMovie,
} from './views/watchlist/watchlist';
import { renderFilterComponent } from './views/search/search';
import { appStore } from './lib/store';
import config from './config/config';
import type { TMDBMovie } from './types/index';

// State variabler
let searchTimeout: number;

const root = document.getElementById('root')!;
const globalSearchInput = document.getElementById('movie-search') as HTMLInputElement;
const filterBtn = document.getElementById('filter-open-btn');

export const openMovieModal = (movie: TMDBMovie) => {
    const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
    const isInWatchlist = appStore.getState().watchlistMovies.has(movie.id);

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
    <div class="movie-modal">
      <button class="movie-modal__close" aria-label="Close">×</button>
      <div class="movie-modal__body">
        <div class="movie-modal__poster">
          <img src="${movie.poster_path ? `${config.IMG_URL}${movie.poster_path}` : 'https://via.placeholder.com/200x300?text=No+Image'}" alt="${movie.title}" />
        </div>
        <div class="movie-modal__content">
          <h2 class="movie-modal__title">${movie.title}</h2>
          <p class="movie-modal__year">${releaseYear}</p>
          <div class="movie-modal__rating">
            <span>⭐ ${movie.vote_average.toFixed(1)}</span>
          </div>
          <p class="movie-modal__overview">${movie.overview || 'No description available.'}</p>
          <button class="movie-modal__watchlist-btn ${isInWatchlist ? 'is-watchlisted' : ''}" data-movie-id="${movie.id}">
            ${isInWatchlist ? '✓ In Watchlist' : '+ Watchlist'}
          </button>
        </div>
      </div>
    </div>`;

    document.body.appendChild(overlay);

    const close = () => overlay.remove();
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    overlay.querySelector('.movie-modal__close')?.addEventListener('click', close);

    const watchlistBtn = overlay.querySelector('.movie-modal__watchlist-btn') as HTMLButtonElement | null;
    if (watchlistBtn) {
        watchlistBtn.addEventListener('click', async () => {
            if (!watchlistBtn.classList.contains('is-watchlisted')) {
                await addWatchlistMovie(movie);
                watchlistBtn.classList.add('is-watchlisted');
                watchlistBtn.textContent = '✓ In Watchlist';
            } else {
                await removeWatchlistMovie(movie.id);
                watchlistBtn.classList.remove('is-watchlisted');
                watchlistBtn.textContent = '+ Watchlist';
            }
        });
    }
};

const renderMoviesToContainer = (movies: TMDBMovie[], container: HTMLElement) => {
    const state = appStore.getState();
    const mapped = movies.map(m => ({
        ...m,
        isWatched: state.watchedMovies.has(m.id),
        isWatchlist: state.watchlistMovies.has(m.id)
    }));

    container.innerHTML = mapped.map(movie => createMovieCard(movie)).join('');
    attachBrowseListeners(movies);
};

/**
 * Sök och Filter 
 */
globalSearchInput?.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = (e.target as HTMLInputElement).value;
    if (query.length === 0) { renderBrowseView(); return; }
    if (query.length >= 2) {
        searchTimeout = window.setTimeout(async () => {
            const results = await searchMovies(query);
                        root.innerHTML = `
                            <div class="view-shell">
                                <h1>Sökresultat: "${query}"</h1>
                                <div id="browse-container"></div>
                            </div>
                        `;
            const container = document.getElementById('browse-container');
            if (container) renderMoviesToContainer(results, container);
        }, 300);
    }
});

filterBtn?.addEventListener('click', async () => {
    root.innerHTML = '';
    const filterView = await renderFilterComponent(
        async (params) => {
            let results: TMDBMovie[] = [];
            if (params.title && params.title.length >= 2) {
                results = await searchMovies(params.title);
                if (params.year) results = results.filter(m => m.release_date?.startsWith(params.year));
                if (params.genre) results = results.filter(m => (m as { genre_ids?: number[] }).genre_ids?.includes(Number(params.genre)));
                if (params.rating) {
                    const [min] = params.rating.split('-').map(Number);
                    results = results.filter(m => m.vote_average >= min);
                }
            } else {
                results = await discoverMovies({ year: params.year, rating: params.rating, genre: params.genre });
            }
            const resultsContainer = document.getElementById('filter-results-list');
            if (resultsContainer) renderMoviesToContainer(results, resultsContainer);
        },
        () => renderBrowseView()
    );
    root.appendChild(filterView);
});

const renderBrowseView = async () => {
    // 1. Förbered grundstrukturen
        root.innerHTML = `
            <div class="view-shell">
                <h1>Popular Movies</h1>
                <div id="browse-container"></div>
            </div>
        `;

    try {
        // 2. Hämta filmerna
        const movies = await getMovies();
        const container = document.getElementById('browse-container');

        // 3. Rendera filmerna (detta anropar även dina attachBrowseListeners via renderMoviesToContainer)
        if (container) {
            renderMoviesToContainer(movies, container);
        }

        // 4. FIXEN: Injicera App() (Rating-modalen) i root så den faktiskt existerar i DOM:en
        root.appendChild(App());

    } catch (err) {
        console.error(err);
        root.innerHTML = `<h2>Kunde inte ladda filmer.</h2>`;
    }
};

const attachBrowseListeners = (currentMovies: TMDBMovie[]) => {
    const watchedButtons = document.querySelectorAll(".movie-card__rate-btn");
    watchedButtons.forEach((button) => {
        button.addEventListener("click", async (e) => {
            e.stopPropagation(); 
            const tmdbId = button.getAttribute("data-movie-id");
            const movie = currentMovies.find((m) => m.id === Number(tmdbId));
            if (!movie) return;

            // TODO: Implementera backend-anrop
            // const movieData: CreateMovieBody = {
            //     tmdb_id: movie.id,
            //     title: movie.title,
            //     poster_path: movie.poster_path,
            //     release_date: movie.release_date,
            //     vote_average: movie.vote_average,
            //     overview: movie.overview,
            //     status: "watched",
            //     date_watched: new Date().toISOString().split("T")[0],
            // };

            // try {
            //     await movieApi.addMovie(movieData);
                appStore.setState((prev) => {
                    const nextWatched = new Set(prev.watchedMovies);
                    nextWatched.add(movie.id);
                    return { ...prev, watchedMovies: nextWatched };
                });
                (button as HTMLButtonElement).textContent = "✓ Watched";
                (button as HTMLButtonElement).disabled = true;
            // } catch (error) { console.error(error); }
        });
    });

    const browseContainer = document.getElementById('browse-container') || document.getElementById('filter-results-list');
    if (!browseContainer) return;

    browseContainer.addEventListener('click', async (event) => {
        const target = event.target as HTMLElement;
        const watchlistBtn = target.closest<HTMLElement>('.movie-card__watchlist-btn');
        const detailsBtn = target.closest<HTMLElement>('.movie-card__details-btn');

        if (watchlistBtn) {
            const tmdbId = watchlistBtn.dataset.movieId;
            const movie = currentMovies.find((m) => m.id === Number(tmdbId));
            if (movie && !watchlistBtn.classList.contains('is-watchlisted')) {
                await addWatchlistMovie(movie);
                watchlistBtn.classList.add('is-watchlisted');
            }
        }

        if (detailsBtn) {
            const tmdbId = detailsBtn.dataset.movieId;
            const movie = currentMovies.find((m) => m.id === Number(tmdbId));
            if (movie) openMovieModal(movie);
        }
    });
};

const setupNavigation = () => {
    document.getElementById('nav-browse')?.addEventListener('click', () => renderBrowseView());
        document.getElementById('nav-watched')?.addEventListener('click', () => {
                root.innerHTML = `
                    <div class="view-shell">
                        <h1>Watched Movies</h1>
                        <div id="watched-container"></div>
                    </div>`;
        initWatchedView();
    });
    document.getElementById('nav-watchlist')?.addEventListener('click', () => {
                root.innerHTML = `
                    <div class="view-shell">
                        <h1>Watchlist</h1>
                        <div id="watchlist-container"></div>
                    </div>`;
        initWatchlistView();
    });
};

setupNavigation();
renderBrowseView();