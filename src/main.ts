import './index.css';
import { getMovies } from './services/tmdbApi';
import { createMovieCard } from './components/moviecard';
import { initWatchedView } from './views/watched/watched';
import { initWatchlistView, addWatchlistMovie } from './views/watchlist/watchlist';
import * as movieApi from './services/movieApi';
import type { TMDBMovie, CreateMovieBody } from './types/index';

let currentView: 'browse' | 'watched' | 'watchlist' = 'browse';
let browseMovies: TMDBMovie[] = [];

/**
 * Attach buttons on movie cards in Browse view
 */
const attachBrowseListeners = () => {
  const buttons = document.querySelectorAll("#browse-container .movie-card__btn");

  buttons.forEach((button) => {
    button.addEventListener("click", async (e) => {
      e.preventDefault();
      const tmdbId = (button as HTMLButtonElement).dataset.movieId;
      if (!tmdbId) return;

      const movie = browseMovies.find((m) => m.id === Number(tmdbId));
      if (!movie) return;

      // Decide which button
      if ((button as HTMLButtonElement).classList.contains("movie-card__btn--watched")) {
        // Add to watched
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
          (button as HTMLButtonElement).textContent = "✓ Watched";
          (button as HTMLButtonElement).disabled = true;
        } catch (err) {
          console.error(err);
        }
      } else if ((button as HTMLButtonElement).classList.contains("movie-card__btn--watchlist")) {
        // Add to watchlist
        try {
          await addWatchlistMovie(movie);
          (button as HTMLButtonElement).textContent = "✓ Watchlist";
          (button as HTMLButtonElement).disabled = true;
        } catch (err) {
          console.error(err);
        }
      }
    });
  });
};

/**
 * Render Browse view
 */
const renderBrowseView = async () => {
  try {
    browseMovies = await getMovies();
    const root = document.getElementById('root');
    if (!root) return;

    root.innerHTML = `
      <div style="padding:20px;">
        <h1>Popular Movies</h1>
        <div id="browse-container" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:20px;">
          ${browseMovies.map(movie => createMovieCard(movie)).join('')}
        </div>
      </div>
    `;
    attachBrowseListeners();
  } catch (err) {
    console.error(err);
    const root = document.getElementById('root');
    if (root) root.innerHTML = `<h1>Error loading movies</h1>`;
  }
};

/**
 * Render Watched view
 */
const renderWatchedView = async () => {
  const root = document.getElementById('root');
  if (!root) return;

  root.innerHTML = `
    <div style="padding:20px;">
      <h1>Watched Movies</h1>
      <div id="watched-container"></div>
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
      <div id="watchlist-container"></div>
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
