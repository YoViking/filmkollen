import './index.css';
import { getMovies } from './services/tmdbApi';
import { createMovieCard } from './components/moviecard';
import { initWatchedView } from './views/watched/watched';
import * as movieApi from './services/movieApi';
import type { TMDBMovie, CreateMovieBody } from './types/index';

let currentView: 'browse' | 'watched' = 'browse';
let browseMovies: TMDBMovie[] = [];

/**
 * Sätter upp event-lyssnare för movie cards i browse-vyn
 */
const attachBrowseListeners = async () => {
  const buttons = document.querySelectorAll(
    "#browse-container .movie-card__btn"
  );

  buttons.forEach((button) => {
    button.addEventListener("click", async (e) => {
      e.preventDefault();
      const tmdbId = (button as HTMLButtonElement).getAttribute("data-movie-id");
      if (!tmdbId) return;

      try {
        const movie = browseMovies.find((m) => m.id === Number(tmdbId));
        if (!movie) return;

        // Skapa watched-filmen
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
        (button as HTMLButtonElement).textContent = "✓ Watched";
        (button as HTMLButtonElement).disabled = true;
      } catch (error) {
        console.error("Error adding watched movie:", error);
        alert("Failed to add movie to watched list");
      }
    });
  });
};

/**
 * Renderar browse-vyn (populära filmer)
 */
const renderBrowseView = async () => {
  try {
    console.log('Fetching movies...');
    browseMovies = await getMovies();
    console.log('Movies fetched:', browseMovies);
    
    const root = document.getElementById('root');
    if (root && browseMovies.length > 0) {
      root.innerHTML = `
        <div style="padding: 20px;">
          <h1>Popular Movies</h1>
          <div id="browse-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
            ${browseMovies.map(movie => createMovieCard(movie)).join('')}
          </div>
        </div>
      `;
      await attachBrowseListeners();
    }
  } catch (error) {
    console.error('Error fetching movies:', error);
    const root = document.getElementById('root');
    if (root) {
      root.innerHTML = `<h1>Error: ${error}</h1>`;
    }
  }
};

/**
 * Rendererar watched-vyn
 */
const renderWatchedView = async () => {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="padding: 20px;">
        <h1>Watched Movies</h1>
        <div id="watched-container"></div>
      </div>
    `;
    await initWatchedView();
  }
};

/**
 * Hantera navigation mellan vyerna
 */
const setupNavigation = () => {
  const browseBtn = document.getElementById('nav-browse');
  const watchedBtn = document.getElementById('nav-watched');

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

  updateNavButtonStyles();
};

/**
 * Uppdatera nav-knapparnass stilar baserat på nuvarande vy
 */
const updateNavButtonStyles = () => {
  const browseBtn = document.getElementById('nav-browse') as HTMLButtonElement;
  const watchedBtn = document.getElementById('nav-watched') as HTMLButtonElement;

  if (browseBtn) {
    browseBtn.style.fontWeight = currentView === 'browse' ? 'bold' : 'normal';
  }
  if (watchedBtn) {
    watchedBtn.style.fontWeight = currentView === 'watched' ? 'bold' : 'normal';
  }
};

// Initialisera appen
setupNavigation();
renderBrowseView();