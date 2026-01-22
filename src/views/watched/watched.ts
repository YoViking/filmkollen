import { createMovieCard } from "../../components/moviecard";
import * as movieApi from "../../services/movieApi";
import { appStore } from "../../lib/store";
import { openMovieModal } from "../../main";
import type { TMDBMovie } from "../../types/index";

import App from "../../App";
const root = document.getElementById('root')!;

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

    // Uppdatera globalt state med aktuell lista av watched (tmdb_id)
    const watchedIds = new Set(watchedMovies.map((m) => m.tmdb_id));
    appStore.setState({ watchedMovies: watchedIds });

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
          personal_rating: movie.personal_rating || undefined,
        };
        return createMovieCard(tmdbMovie);
      })
      .join("");

    watchedContainer.innerHTML = moviesHTML;

    root.appendChild(App());
    
    // Re-attach event listeners
    attachWatchedListeners();
    attachWatchedDetailsListeners();
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
 * Tar bort en film från watched i databasen
 */
export const removeWatchedMovie = async (tmdbId: number): Promise<void> => {
  try {
    // Hitta backend-id för filmen baserat på tmdbId
    const watched = await movieApi.getAllMovies("watched");
    const match = watched.find((m) => m.tmdb_id === tmdbId);
    if (!match) {
      console.warn("Movie not found in watched list for deletion", { tmdbId });
    } else {
      await movieApi.deleteMovie(match.id);
    }

    // Uppdatera globalt state
    appStore.setState((prev) => {
      const nextWatched = new Set(prev.watchedMovies);
      nextWatched.delete(tmdbId);
      const nextMovies = prev.movies.map((m) =>
        m.id === tmdbId ? { ...m, isWatched: false } : m
      );
      return { watchedMovies: nextWatched, movies: nextMovies };
    });
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
 * Sätter upp event-lyssnare för watched-detaljer
 */
const attachWatchedDetailsListeners = (): void => {
  const watchedContainer = document.getElementById("watched-container");
  if (!watchedContainer) return;

  watchedContainer.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const button = target.closest<HTMLElement>(".movie-card__details-btn");

    if (button) {
      event.preventDefault();
      const tmdbId = button.dataset.movieId;
      if (!tmdbId) return;
      const movies = appStore.getState().movies;
      const movie = movies.find((m) => m.id === Number(tmdbId));
      if (!movie) return;
      openMovieModal(movie);
    }
  });
};

/**
 * Initialiserar watched-vyn
 */
export const initWatchedView = async (): Promise<void> => {
  await renderWatchedMovies();
};
