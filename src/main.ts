

import './index.css';
import { getMovies } from './services/tmdbApi';
import { createMovieCard } from './components/moviecard';
<<<<<<< HEAD
import App from './App';
=======
import { initWatchedView } from './views/watched/watched';
import { initWatchlistView, addWatchlistMovie, removeWatchlistMovie } from './views/watchlist/watchlist';
import * as movieApi from './services/movieApi';
import { appStore } from './lib/store';
import config from './config/config';
import type { TMDBMovie, CreateMovieBody } from './types/index';
>>>>>>> origin/dev

let currentView: 'browse' | 'watched' | 'watchlist' = 'browse';
let browseMovies: TMDBMovie[] = [];

const openMovieModal = (movie: TMDBMovie) => {
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A";
  const isInWatchlist = appStore.getState().watchlistMovies.has(movie.id) || movie.isWatchlist;

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="movie-modal">
      <button class="movie-modal__close" aria-label="Close">×</button>
      <div class="movie-modal__body">
        <div class="movie-modal__poster">
          <img src="${movie.poster_path ? `${config.IMG_URL}${movie.poster_path}` : "https://via.placeholder.com/200x300?text=No+Image"}" alt="${movie.title}" />
        </div>
        <div class="movie-modal__content">
          <h2 class="movie-modal__title">${movie.title}</h2>
          <p class="movie-modal__year">${releaseYear}</p>

          <div class="movie-modal__rating">
            <div class="movie-modal__tmdb">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#fbbf24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span>${movie.vote_average.toFixed(1)}</span>
            </div>
            <button class="movie-modal__rate-btn" data-movie-id="${movie.id}">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span>Rate</span>
            </button>
          </div>

          <p class="movie-modal__overview">${movie.overview || "No description available."}</p>

          <button class="movie-modal__watchlist-btn ${isInWatchlist ? "is-watchlisted" : ""}" data-movie-id="${movie.id}">
            ${isInWatchlist ? "✓ In Watchlist" : "+ Watchlist"}
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  overlay.querySelector(".movie-modal__close")?.addEventListener("click", close);

  const watchlistBtn = overlay.querySelector(".movie-modal__watchlist-btn") as HTMLButtonElement | null;
  if (watchlistBtn) {
    watchlistBtn.addEventListener("click", async () => {
      const isWatchlisted = watchlistBtn.classList.contains("is-watchlisted");
      try {
        if (!isWatchlisted) {
          await addWatchlistMovie(movie);
          appStore.setState((prev) => {
            const next = new Set(prev.watchlistMovies);
            next.add(movie.id);
            const nextMovies = prev.movies.map((m) =>
              m.id === movie.id ? { ...m, isWatchlist: true } : m
            );
            return { watchlistMovies: next, movies: nextMovies };
          });
          watchlistBtn.classList.add("is-watchlisted");
          watchlistBtn.textContent = "✓ In Watchlist";
        } else {
          await removeWatchlistMovie(movie.id);
          appStore.setState((prev) => {
            const next = new Set(prev.watchlistMovies);
            next.delete(movie.id);
            const nextMovies = prev.movies.map((m) =>
              m.id === movie.id ? { ...m, isWatchlist: false } : m
            );
            return { watchlistMovies: next, movies: nextMovies };
          });
          watchlistBtn.classList.remove("is-watchlisted");
          watchlistBtn.textContent = "+ Watchlist";
        }
      } catch (err) {
        console.error(err);
      }
    });
  }
};

/**
 * Attach buttons on movie cards in Browse view
 */
const attachBrowseListeners = () => {
  const watchlistButtons = document.querySelectorAll("#browse-container .movie-card__watchlist-btn");
  const detailButtons = document.querySelectorAll("#browse-container .movie-card__details-btn");

  // Watchlist add
  watchlistButtons.forEach((button) => {
    button.addEventListener("click", async (e) => {
      e.preventDefault();
      const tmdbId = (button as HTMLButtonElement).dataset.movieId;
      if (!tmdbId) return;

      const movie = browseMovies.find((m) => m.id === Number(tmdbId));
      if (!movie) return;

      const isWatchlisted = (button as HTMLButtonElement).classList.contains("is-watchlisted");
      if (isWatchlisted) return; // already watchlisted

      try {
        await addWatchlistMovie(movie);

        // Update global state
        appStore.setState((prev) => {
          const nextWatchlist = new Set(prev.watchlistMovies);
          nextWatchlist.add(Number(tmdbId));
          const nextMovies = prev.movies.map((m) =>
            m.id === Number(tmdbId) ? { ...m, isWatchlist: true } : m
          );
          return { watchlistMovies: nextWatchlist, movies: nextMovies };
        });

        // Update UI
        (button as HTMLButtonElement).classList.add("is-watchlisted");
        const icon = (button as HTMLButtonElement).querySelector(".bookmark-icon");
        if (icon) icon.textContent = "✓";
      } catch (err) {
        console.error(err);
      }
    });
  });

  // Details modal
  detailButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      const tmdbId = (button as HTMLButtonElement).dataset.movieId;
      if (!tmdbId) return;
      const movie = browseMovies.find((m) => m.id === Number(tmdbId));
      if (!movie) return;
      openMovieModal(movie);
    });
  });
};

/**
 * Render Browse view
 */
const renderBrowseView = async () => {
  try {
    browseMovies = await getMovies();
    console.log('Movies fetched:', browseMovies);
    
    // Markera vilka filmer som redan är watched / watchlist baserat på globalt state
    const watchedIds = appStore.getState().watchedMovies;
    const watchlistIds = appStore.getState().watchlistMovies;
    const mapped = browseMovies.map((m) => ({
      ...m,
      isWatched: watchedIds.has(m.id),
      isWatchlist: watchlistIds.has(m.id),
    }));
    // Uppdatera globalt state med nuvarande lista
    appStore.setState({ movies: mapped });

    const root = document.getElementById('root');
    if (root && mapped.length > 0) {
      root.innerHTML = `
        <div style="padding: 20px;">
          <h1>Popular Movies</h1>
          <div id="browse-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
            ${mapped.map(movie => createMovieCard(movie)).join('')}
          </div>
        </div>
      `;
      root.appendChild(App());
    }
    attachBrowseListeners();
  } catch (err) {
    console.error(err);
    const root = document.getElementById('root');
    if (root) root.innerHTML = `<h1>Error loading movies</h1>`;
  }
};

<<<<<<< HEAD
testAPI();
=======
/**
 * Render Watched view
 */
const renderWatchedView = async () => {
  const root = document.getElementById('root');
  if (!root) return;

  root.innerHTML = `
    <div style="padding:20px;">
      <h1>Watched Movies</h1>
      <div id="watched-container" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:24px;"></div>
    </div>
  `;
  await initWatchedView();
};

/**
 * Render Watchlist view
 */
const renderWatchlistView = async () => {
  const root = document.getElementById('root');
  if (!root) return;

  root.innerHTML = `
    <div style="padding:20px;">
      <h1>Watchlist</h1>
      <div id="watchlist-container" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:24px;"></div>
    </div>
  `;
  await initWatchlistView();
};

/**
 * Navigation setup
 */
const setupNavigation = () => {
  const browseBtn = document.getElementById('nav-browse');
  const watchedBtn = document.getElementById('nav-watched');
  const watchlistBtn = document.getElementById('nav-watchlist');

  browseBtn?.addEventListener('click', async () => {
    currentView = 'browse';
    await renderBrowseView();
    updateNavButtonStyles();
  });

  watchedBtn?.addEventListener('click', async () => {
    currentView = 'watched';
    await renderWatchedView();
    updateNavButtonStyles();
  });

  watchlistBtn?.addEventListener('click', async () => {
    currentView = 'watchlist';
    await renderWatchlistView();
    updateNavButtonStyles();
  });

  updateNavButtonStyles();
};

/**
 * Update nav button styles
 */
const updateNavButtonStyles = () => {
  const browseBtn = document.getElementById('nav-browse') as HTMLButtonElement;
  const watchedBtn = document.getElementById('nav-watched') as HTMLButtonElement;
  const watchlistBtn = document.getElementById('nav-watchlist') as HTMLButtonElement;

  browseBtn.style.fontWeight = currentView === 'browse' ? 'bold' : 'normal';
  watchedBtn.style.fontWeight = currentView === 'watched' ? 'bold' : 'normal';
  watchlistBtn.style.fontWeight = currentView === 'watchlist' ? 'bold' : 'normal';
};

// Init app
setupNavigation();
renderBrowseView();
>>>>>>> origin/dev
