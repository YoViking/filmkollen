import { createMovieCard } from "../../components/moviecard";
import * as movieApi from "../../services/movieApi";
import type { TMDBMovie, CreateMovieBody } from "../../types/index";

/**
 * Renderar listan över watched movies från databasen
 */
export const renderWatchedMovies = async (): Promise<void> => {
  const watchedContainer = document.getElementById("watched-container");
  
  if (!watchedContainer) {
    console.error("Watched container element not found");
    return;
  }

  try {
    console.log("Fetching watched movies...");
    // Hämta watched-filmer från API
    const watchedMovies = await movieApi.getAllMovies("watched");
    console.log("Watched movies fetched:", watchedMovies);

    if (watchedMovies.length === 0) {
      watchedContainer.innerHTML = `
        <div class="empty-state">
          <p>No watched movies yet. Start adding them!</p>
        </div>
      `;
      return;
    }

    // Konvertera Movie-typen till TMDBMovie för rendering
    const moviesHTML = watchedMovies
      .map((movie) => {
        const tmdbMovie: TMDBMovie = {
          id: movie.tmdb_id,
          title: movie.title,
          poster_path: movie.poster_path,
          release_date: movie.release_date || "",
          vote_average: movie.vote_average || 0,
          overview: movie.overview || "",
          isWatched: true,
        };
        return createMovieCard(tmdbMovie);
      })
      .join("");

    watchedContainer.innerHTML = `
      <div class="movies-grid">
        ${moviesHTML}
      </div>
    `;

    // Re-attach event listeners
    attachWatchedListeners();
  } catch (error) {
    console.error("Error rendering watched movies:", error);
    watchedContainer.innerHTML = `
      <div class="error-state">
        <p>Failed to load watched movies: ${error instanceof Error ? error.message : String(error)}</p>
      </div>
    `;
  }
};

/**
 * Adderar en film till watched i databasen
 */
export const addWatchedMovie = async (movie: TMDBMovie): Promise<void> => {
  try {
    const movieData: CreateMovieBody = {
      tmdb_id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      overview: movie.overview,
      status: "watched",
      date_watched: new Date().toISOString().split("T")[0], // Format: YYYY-MM-DD
    };

    await movieApi.addMovie(movieData);
    await renderWatchedMovies();
  } catch (error) {
    console.error("Error adding watched movie:", error);
    alert("Failed to add movie to watched list");
  }
};

/**
 * Tar bort en film från watched i databasen
 */
export const removeWatchedMovie = async (movieId: number): Promise<void> => {
  try {
    await movieApi.deleteMovie(movieId);
    await renderWatchedMovies();
  } catch (error) {
    console.error("Error removing watched movie:", error);
    alert("Failed to remove movie from watched list");
  }
};

/**
 * Sätter upp event-lyssnare för watched-knappar
 */
export const attachWatchedListeners = (): void => {
  const buttons = document.querySelectorAll(
    "#watched-container .movie-card__btn"
  );

  buttons.forEach((button) => {
    button.addEventListener("click", async (e) => {
      e.preventDefault();
      const movieId = (button as HTMLButtonElement).getAttribute("data-movie-id");
      if (movieId) {
        await removeWatchedMovie(parseInt(movieId));
      }
    });
  });
};

/**
 * Initialiserar watched-vyn
 */
export const initWatchedView = async (): Promise<void> => {
  await renderWatchedMovies();
};
