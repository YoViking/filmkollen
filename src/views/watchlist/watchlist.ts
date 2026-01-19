import { createMovieCard } from "../../components/moviecard";
import * as movieApi from "../../services/movieApi";
import type { TMDBMovie, CreateMovieBody } from "../../types/index";

/**
 * Renderar listan över watchlist-movies från databasen
 */
export const renderWatchlistMovies = async (): Promise<void> => {
  const watchlistContainer = document.getElementById("watchlist-container");

  if (!watchlistContainer) {
    console.error("Watchlist container element not found");
    return;
  }

  try {
    const watchlistMovies = await movieApi.getAllMovies("watchlist");

    if (watchlistMovies.length === 0) {
      watchlistContainer.innerHTML = `
        <div class="empty-state">
          <p>No movies in watchlist</p>
        </div>
      `;
      return;
    }

    const moviesHTML = watchlistMovies
      .map((movie) => {
        const tmdbMovie: TMDBMovie = {
          id: movie.tmdb_id,
          title: movie.title,
          poster_path: movie.poster_path,
          release_date: movie.release_date || "",
          vote_average: movie.vote_average || 0,
          overview: movie.overview || "",
          isWatched: false,
        };
        return createMovieCard(tmdbMovie);
      })
      .join("");

    watchlistContainer.innerHTML = `
      <div class="movies-grid">
        ${moviesHTML}
      </div>
    `;

    attachWatchlistListeners();
  } catch (error) {
    console.error("Error rendering watchlist movies:", error);
    watchlistContainer.innerHTML = `
      <div class="error-state">
        <p>Failed to load watchlist</p>
      </div>
    `;
  }
};

/**
 * Lägger till film i watchlist
 */
export const addWatchlistMovie = async (movie: TMDBMovie): Promise<void> => {
  const movieData: CreateMovieBody = {
    tmdb_id: movie.id,
    title: movie.title,
    poster_path: movie.poster_path,
    release_date: movie.release_date,
    vote_average: movie.vote_average,
    overview: movie.overview,
    status: "watchlist",
  };

  await movieApi.addMovie(movieData);
  await renderWatchlistMovies();
};

/**
 * Tar bort film från watchlist
 */
export const removeWatchlistMovie = async (movieId: number): Promise<void> => {
  await movieApi.deleteMovie(movieId);
  await renderWatchlistMovies();
};

/**
 * Event-lyssnare för watchlist-knappar
 */
export const attachWatchlistListeners = (): void => {
  const buttons = document.querySelectorAll(
    "#watchlist-container .movie-card__btn"
  );

  buttons.forEach((button) => {
    button.addEventListener("click", async (e) => {
      e.preventDefault();
      const movieId = (button as HTMLButtonElement).dataset.movieId;
      if (movieId) {
        await removeWatchlistMovie(parseInt(movieId));
      }
    });
  });
};

/**
 * Initierar watchlist-vyn
 */
export const initWatchlistView = async (): Promise<void> => {
  await renderWatchlistMovies();
};
