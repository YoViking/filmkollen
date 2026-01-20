import './index.css';
import { getMovies, searchMovies, discoverMovies, getGenres } from './services/tmdbApi';
import { createMovieCard } from './components/moviecard';
import { initWatchedView } from './views/watched/watched';
import * as movieApi from './services/movieApi';
import { appStore } from './lib/store';
import type { TMDBMovie, CreateMovieBody, FilterOptions } from './types/index';

let currentView: 'browse' | 'watched' | 'filter' = 'browse';
let browseMovies: TMDBMovie[] = [];
let searchTimeout: number;

/**
 * Hjälpfunktion för att generera år/årtionden dropdown
 */
const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  let options = `<option value="">Välj år/period</option>`;
  
  // Enskilda år ner till 2010
  for (let y = currentYear; y >= 2010; y--) {
    options += `<option value="${y}">${y}</option>`;
  }
  // Årtionden ner till 1930
  for (let y = 2000; y >= 1930; y -= 10) {
    options += `<option value="${y}-${y + 10}">${y}-${y + 10}</option>`;
  }
  return options;
};

/**
 * Renderar Filter-vyn
 */
const renderFilterView = async () => {
  currentView = 'filter';
  const root = document.getElementById('root');
  if (!root) return;

  const genres = await getGenres();

  root.innerHTML = `
    <div style="padding: 20px;">
      <h2>Filtrera filmer</h2>
      <div style="display: flex; gap: 10px; margin-bottom: 20px; align-items: center;">
        <select id="filter-category">
          <option value="">Välj kategori</option>
          <option value="year">Release Year</option>
          <option value="popularity">Popularitet (Rating)</option>
          <option value="genre">Genre</option>
        </select>

        <select id="filter-sub-value" disabled>
          <option value="">Välj huvudkategori först</option>
        </select>

        <button id="btn-cancel-filter">Avbryt</button>
      </div>
      <div id="filter-results" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
        </div>
    </div>
  `;

  const categorySelect = document.getElementById('filter-category') as HTMLSelectElement;
  const subSelect = document.getElementById('filter-sub-value') as HTMLSelectElement;
  const cancelBtn = document.getElementById('btn-cancel-filter');

  categorySelect.addEventListener('change', () => {
    subSelect.disabled = false;
    if (categorySelect.value === 'year') {
      subSelect.innerHTML = generateYearOptions();
    } else if (categorySelect.value === 'popularity') {
      subSelect.innerHTML = `
        <option value="">Välj betyg</option>
        <option value="8-10">8-10 Stjärnor</option>
        <option value="6-8">6-8 Stjärnor</option>
        <option value="4-6">4-6 Stjärnor</option>
        <option value="under4">Under 4 Stjärnor</option>
      `;
    } else if (categorySelect.value === 'genre') {
      subSelect.innerHTML = `<option value="">Välj genre</option>` + 
        genres.map(g => `<option value="${g.id}">${g.name}</option>`).join('');
    } else {
      subSelect.disabled = true;
    }
  });

  subSelect.addEventListener('change', async () => {
    const category = categorySelect.value;
    const value = subSelect.value;
    if (!value) return;

    const filters: FilterOptions = {};
    if (category === 'year') filters.year = value;
    if (category === 'popularity') filters.rating = value;
    if (category === 'genre') filters.genre = value;

    const results = await discoverMovies(filters);
    renderResults(results, 'filter-results');
  });

  cancelBtn?.addEventListener('click', () => renderBrowseView());
};

/**
 * Renderar filmer till en specifik container
 */
const renderResults = (movies: TMDBMovie[], containerId: string) => {
  const container = document.getElementById(containerId);
  if (!container) return;

  const watchedIds = appStore.getState().watchedMovies;
  const mapped = movies.map(m => ({ ...m, isWatched: watchedIds.has(m.id) }));

  container.innerHTML = mapped.map(movie => createMovieCard(movie)).join('');
  attachBrowseListeners(movies);
};

/**
 * Söklogik med Debounce
 */
const setupSearch = () => {
  const searchInput = document.getElementById('movie-search') as HTMLInputElement;
  const filterBtn = document.getElementById('filter-open-btn');

  searchInput?.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = (e.target as HTMLInputElement).value;

    if (query.length === 0) {
      renderBrowseView(); // Återställ till landningsvy
      return;
    }

    if (query.length >= 2) {
      searchTimeout = window.setTimeout(async () => {
        const results = await searchMovies(query);
        // Om vi inte är i filtervyn, rensa root och visa sökresultat
        const root = document.getElementById('root');
        if (root) {
          root.innerHTML = `<div style="padding: 20px;"><h1>Sökresultat: "${query}"</h1><div id="browse-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;"></div></div>`;
          renderResults(results, 'browse-container');
        }
      }, 300);
    }
  });

  filterBtn?.addEventListener('click', () => renderFilterView());
};

/**
 * Befintlig logik för Movie Cards (uppdaterad för att ta emot lista)
 */
const attachBrowseListeners = async (currentMovies: TMDBMovie[]) => {
  const buttons = document.querySelectorAll(".movie-card__btn");

  buttons.forEach((button) => {
    button.addEventListener("click", async (e) => {
      e.preventDefault();
      const tmdbId = (button as HTMLButtonElement).getAttribute("data-movie-id");
      if (!tmdbId) return;

      try {
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

        await movieApi.addMovie(movieData);

        appStore.setState((prev) => {
          const nextWatched = new Set(prev.watchedMovies);
          nextWatched.add(Number(tmdbId));
          return { watchedMovies: nextWatched };
        });

        (button as HTMLButtonElement).textContent = "✓ Watched";
        (button as HTMLButtonElement).disabled = true;
      } catch (error) {
        console.error("Error adding watched movie:", error);
      }
    });
  });
};

const renderBrowseView = async () => {
  currentView = 'browse';
  try {
    browseMovies = await getMovies();
    const root = document.getElementById('root');
    if (root) {
      root.innerHTML = `
        <div style="padding: 20px;">
          <h1>Popular Movies</h1>
          <div id="browse-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;"></div>
        </div>
      `;
      renderResults(browseMovies, 'browse-container');
    }
  } catch (error) {
    console.error(error);
  }
};

const renderWatchedView = async () => {
  currentView = 'watched';
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `<div style="padding: 20px;"><h1>Watched Movies</h1><div id="watched-container"></div></div>`;
    await initWatchedView();
  }
};

const setupNavigation = () => {
  document.getElementById('nav-browse')?.addEventListener('click', () => renderBrowseView());
  document.getElementById('nav-watched')?.addEventListener('click', () => renderWatchedView());
};

// Starta appen
setupNavigation();
setupSearch();
renderBrowseView();