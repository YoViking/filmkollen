import { createMovieCard } from "../../components/moviecard";
import * as movieApi from "../../services/movieApi";
import { appStore } from "../../lib/store";
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

    // Uppdatera globalt state med watchlist tmdb_ids
    const watchlistIds = new Set(watchlistMovies.map((m) => m.tmdb_id));
    appStore.setState({ watchlistMovies: watchlistIds });

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
          isWatchlist: true,
        };
        return createMovieCard(tmdbMovie);
      })
      .join("");

    watchlistContainer.innerHTML = moviesHTML;

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
  appStore.setState((prev) => {
    const next = new Set(prev.watchlistMovies);
    next.add(movie.id);
    const nextMovies = prev.movies.map((m) =>
      m.id === movie.id ? { ...m, isWatchlist: true } : m
    );
    return { watchlistMovies: next, movies: nextMovies };
  });
  await renderWatchlistMovies();
};

/**
 * Tar bort film från watchlist
 */
export const removeWatchlistMovie = async (tmdbId: number): Promise<void> => {
  // hitta backend-id
  const list = await movieApi.getAllMovies("watchlist");
  const match = list.find((m) => m.tmdb_id === tmdbId);
  if (match) {
    await movieApi.deleteMovie(match.id);
  } else {
    console.warn("Movie not found in watchlist", { tmdbId });
  }

  appStore.setState((prev) => {
    const next = new Set(prev.watchlistMovies);
    next.delete(tmdbId);
    const nextMovies = prev.movies.map((m) =>
      m.id === tmdbId ? { ...m, isWatchlist: false } : m
    );
    return { watchlistMovies: next, movies: nextMovies };
  });
  await renderWatchlistMovies();
};

/**
 * Event-lyssnare för watchlist-knappar
 */
export const attachWatchlistListeners = (): void => {
  const buttons = document.querySelectorAll(
    "#watchlist-container .movie-card__watchlist-btn"
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
