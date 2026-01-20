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
import * as movieApi from './services/movieApi';
import { appStore } from './lib/store';
import config from './config/config';
import type { TMDBMovie, CreateMovieBody, AppState } from './types/index';

// State variabler
let browseMovies: TMDBMovie[] = [];
let currentView: 'browse' | 'watched' | 'watchlist' | 'filter' = 'browse';
let searchTimeout: number;

const root = document.getElementById('root')!;
const globalSearchInput = document.getElementById('movie-search') as HTMLInputElement;
const filterBtn = document.getElementById('filter-open-btn');

/**
 * MODAL LOGIK (Från Dev Branch)
 */
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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#fbbf24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span>${movie.vote_average.toFixed(1)}</span>
          </div>
          <p class="movie-modal__overview">${movie.overview || 'No description available.'}</p>
          <button class="movie-modal__watchlist-btn ${isInWatchlist ? 'is-watchlisted' : ''}" data-movie-id="${movie.id}">
            ${isInWatchlist ? '✓ In Watchlist' : '+ Watchlist'}
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  overlay.querySelector('.movie-modal__close')?.addEventListener('click', close);

  const watchlistBtn = overlay.querySelector('.movie-modal__watchlist-btn') as HTMLButtonElement | null;
  if (watchlistBtn) {
    watchlistBtn.addEventListener('click', async () => {
      const isWatchlisted = watchlistBtn.classList.contains('is-watchlisted');
      try {
        if (!isWatchlisted) {
          await addWatchlistMovie(movie);
          appStore.setState((prev) => ({
            ...prev,
            watchlistMovies: new Set(prev.watchlistMovies).add(movie.id),
          }));
          watchlistBtn.classList.add('is-watchlisted');
          watchlistBtn.textContent = '✓ In Watchlist';
        } else {
          await removeWatchlistMovie(movie.id);
          appStore.setState((prev) => {
            const next = new Set(prev.watchlistMovies);
            next.delete(movie.id);
            return { ...prev, watchlistMovies: next };
          });
          watchlistBtn.classList.remove('is-watchlisted');
          watchlistBtn.textContent = '+ Watchlist';
        }
      } catch (err) { console.error(err); }
    });
  }
};

/**
 * HÄNDELSEDELEGERING (Från Dev Branch + din Logik för Watched)
 */
const attachEventListeners = (containerId: string, movies: TMDBMovie[]) => {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.addEventListener('click', async (event) => {
    const target = event.target as HTMLElement;
    
    // 1. Watchlist-knapp
    const watchlistBtn = target.closest<HTMLElement>('.movie-card__watchlist-btn');
    // 2. Detaljer/Modal-knapp
    const detailsBtn = target.closest<HTMLElement>('.movie-card__details-btn');
    // 3. Watched-knapp (Din specifika knapp)
    const watchedBtn = target.closest<HTMLButtonElement>('.movie-card__btn');

    const tmdbId = watchlistBtn?.dataset.movieId || detailsBtn?.dataset.movieId || watchedBtn?.dataset.movieId;
    if (!tmdbId) return;
    const movie = movies.find((m) => m.id === Number(tmdbId));
    if (!movie) return;

    if (watchlistBtn) {
      event.preventDefault();
      if (watchlistBtn.classList.contains('is-watchlisted')) return;
      try {
        await addWatchlistMovie(movie);
        appStore.setState((prev) => ({
          ...prev,
          watchlistMovies: new Set(prev.watchlistMovies).add(movie.id),
        }));
        watchlistBtn.classList.add('is-watchlisted');
      } catch (err) { console.error(err); }
    }

    if (detailsBtn) {
      event.preventDefault();
      openMovieModal(movie);
    }

    if (watchedBtn) {
      event.preventDefault();
      try {
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
        await movieApi.addMovie(movieData);
        appStore.setState((prev: AppState) => {
          const nextWatched = new Set(prev.watchedMovies);
          nextWatched.add(Number(tmdbId));
          return { ...prev, watchedMovies: nextWatched };
        });
        watchedBtn.textContent = "✓ Watched";
        watchedBtn.disabled = true;
      } catch (err) { console.error(err); }
    }
  });
};

/**
 * RENDER-FUNKTIONER (Kombinerade)
 */
const renderBrowseView = async () => {
  currentView = 'browse';
  try {
    browseMovies = await getMovies();
    const watchedIds = appStore.getState().watchedMovies;
    const watchlistIds = appStore.getState().watchlistMovies;

    const mapped = browseMovies.map(m => ({
      ...m,
      isWatched: watchedIds.has(m.id),
      isWatchlist: watchlistIds.has(m.id)
    }));

    root.innerHTML = `
      <div class="view-shell" style="padding: 20px;">
        <h1 class="view-title">Popular Movies</h1>
        <div id="browse-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
          ${mapped.map((m) => createMovieCard(m)).join('')}
        </div>
      </div>
    `;
    attachEventListeners('browse-container', browseMovies);
    updateNavButtonStyles();
  } catch (err) { console.error(err); }
};

/**
 * SÖK & FILTER (Din kod)
 */
globalSearchInput?.addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  const query = (e.target as HTMLInputElement).value;
  if (query.length === 0) { renderBrowseView(); return; }
  if (query.length >= 2) {
    searchTimeout = window.setTimeout(async () => {
      const results = await searchMovies(query);
      root.innerHTML = `<div style="padding: 20px;"><h1>Sökresultat: "${query}"</h1><div id="search-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;"></div></div>`;
      const container = document.getElementById('search-container');
      if (container) {
        container.innerHTML = results.map(m => createMovieCard(m)).join('');
        attachEventListeners('search-container', results);
      }
    }, 300);
  }
});

filterBtn?.addEventListener('click', async () => {
  currentView = 'filter';
  root.innerHTML = '';
  const filterView = await renderFilterComponent(
    async (params) => {
      let results = params.title && params.title.length >= 2 
        ? await searchMovies(params.title) 
        : await discoverMovies({ year: params.year, rating: params.rating, genre: params.genre });
      
      const resultsContainer = document.getElementById('filter-results-list');
      if (resultsContainer) {
        resultsContainer.innerHTML = results.map(m => createMovieCard(m)).join('');
        attachEventListeners('filter-results-list', results);
      }
    },
    () => renderBrowseView()
  );
  root.appendChild(filterView);
});

const renderWatchedView = async () => {
  currentView = 'watched';
  root.innerHTML = `<div class="view-shell" style="padding: 20px;"><h1 class="view-title">Watched Movies</h1><div id="watched-container"></div></div>`;
  await initWatchedView();
  updateNavButtonStyles();
};

const renderWatchlistView = async () => {
  currentView = 'watchlist';
  root.innerHTML = `<div class="view-shell" style="padding: 20px;"><h1 class="view-title">Watchlist</h1><div id="watchlist-container"></div></div>`;
  await initWatchlistView();
  updateNavButtonStyles();
};

const updateNavButtonStyles = () => {
  const btns = { browse: 'nav-browse', watched: 'nav-watched', watchlist: 'nav-watchlist' };
  Object.entries(btns).forEach(([view, id]) => {
    const el = document.getElementById(id);
    if (el) el.style.fontWeight = currentView === view ? 'bold' : 'normal';
  });
};

const setupNavigation = () => {
  document.getElementById('nav-browse')?.addEventListener('click', renderBrowseView);
  document.getElementById('nav-watched')?.addEventListener('click', renderWatchedView);
  document.getElementById('nav-watchlist')?.addEventListener('click', renderWatchlistView);
};

setupNavigation();
renderBrowseView();