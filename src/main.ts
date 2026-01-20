import './index.css';
import { getMovies } from './services/tmdbApi';
import { createMovieCard } from './components/moviecard';
import App from './App';

import { initWatchedView } from './views/watched/watched';
import {
  initWatchlistView,
  addWatchlistMovie,
  removeWatchlistMovie,
} from './views/watchlist/watchlist';

import * as movieApi from './services/movieApi';
import { appStore } from './lib/store';
import config from './config/config';
import type { TMDBMovie, CreateMovieBody } from './types/index';

let currentView: 'browse' | 'watched' | 'watchlist' = 'browse';
let browseMovies: TMDBMovie[] = [];

const openMovieModal = (movie: TMDBMovie) => {
  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : 'N/A';

  const isInWatchlist =
    appStore.getState().watchlistMovies.has(movie.id) || movie.isWatchlist;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="movie-modal">
      <button class="movie-modal__close" aria-label="Close">×</button>
      <div class="movie-modal__body">
        <div class="movie-modal__poster">
          <img src="${
            movie.poster_path
              ? `${config.IMG_URL}${movie.poster_path}`
              : 'https://via.placeholder.com/200x300?text=No+Image'
          }" alt="${movie.title}" />
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
          </div>

          <p class="movie-modal__overview">
            ${movie.overview || 'No description available.'}
          </p>

          <button class="movie-modal__watchlist-btn ${
            isInWatchlist ? 'is-watchlisted' : ''
          }" data-movie-id="${movie.id}">
            ${isInWatchlist ? '✓ In Watchlist' : '+ Watchlist'}
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  overlay
    .querySelector('.movie-modal__close')
    ?.addEventListener('click', close);

  const watchlistBtn = overlay.querySelector(
    '.movie-modal__watchlist-btn'
  ) as HTMLButtonElement | null;

  if (watchlistBtn) {
    watchlistBtn.addEventListener('click', async () => {
      const isWatchlisted =
        watchlistBtn.classList.contains('is-watchlisted');

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
            return {
              ...prev,
              watchlistMovies: next,
            };
          });
          watchlistBtn.classList.remove('is-watchlisted');
          watchlistBtn.textContent = '+ Watchlist';
        }
      } catch (err) {
        console.error(err);
      }
    });
  }
};

const attachBrowseListeners = () => {
  const watchlistButtons = document.querySelectorAll(
    '#browse-container .movie-card__watchlist-btn'
  );
  const detailButtons = document.querySelectorAll(
    '#browse-container .movie-card__details-btn'
  );

  watchlistButtons.forEach((button) => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      const tmdbId = (button as HTMLButtonElement).dataset.movieId;
      if (!tmdbId) return;

      const movie = browseMovies.find((m) => m.id === Number(tmdbId));
      if (!movie) return;

      if ((button as HTMLButtonElement).classList.contains('is-watchlisted'))
        return;

      try {
        await addWatchlistMovie(movie);
        appStore.setState((prev) => ({
          ...prev,
          watchlistMovies: new Set(prev.watchlistMovies).add(movie.id),
        }));
        (button as HTMLButtonElement).classList.add('is-watchlisted');
      } catch (err) {
        console.error(err);
      }
    });
  });

  detailButtons.forEach((button) => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const tmdbId = (button as HTMLButtonElement).dataset.movieId;
      if (!tmdbId) return;
      const movie = browseMovies.find((m) => m.id === Number(tmdbId));
      if (!movie) return;
      openMovieModal(movie);
    });
  });
};

const renderBrowseView = async () => {
  try {
    browseMovies = await getMovies();
    appStore.setState({ movies: browseMovies });

    const root = document.getElementById('root');
    if (!root) return;

    root.innerHTML = `
      <div style="padding:20px;">
        <h1>Popular Movies</h1>
        <div id="browse-container">
          ${browseMovies.map((m) => createMovieCard(m)).join('')}
        </div>
      </div>
    `;
    root.appendChild(App());
    attachBrowseListeners();
  } catch (err) {
    console.error(err);
  }
};

const renderWatchedView = async () => {
  const root = document.getElementById('root');
  if (!root) return;
  root.innerHTML = `<h1>Watched Movies</h1>`;
  await initWatchedView();
};

const renderWatchlistView = async () => {
  const root = document.getElementById('root');
  if (!root) return;
  root.innerHTML = `<h1>Watchlist</h1>`;
  await initWatchlistView();
};

const setupNavigation = () => {
  document.getElementById('nav-browse')?.addEventListener('click', renderBrowseView);
  document.getElementById('nav-watched')?.addEventListener('click', renderWatchedView);
  document
    .getElementById('nav-watchlist')
    ?.addEventListener('click', renderWatchlistView);
};

setupNavigation();
renderBrowseView();
