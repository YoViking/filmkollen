import { createMovieCard } from "../../components/moviecard";
import * as movieApi from "../../services/movieApi";
import { appStore } from "../../lib/store";
import type { TMDBMovie, CreateMovieBody } from "../../types/index";

/**
 * Renderar browse-listan över sökta filmer
 */
export const renderBrowseMovies = (movies: TMDBMovie[]): void => {
  const browseContainer = document.getElementById("browse-container");
  
  if (!browseContainer) {
    console.error("Browse container element not found");
    return;
  }

  const moviesHTML = movies
    .map((movie) => createMovieCard(movie))
    .join("");

  browseContainer.innerHTML = moviesHTML;
  attachBrowseListeners();
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

    // Uppdatera globalt state
    appStore.setState((prev) => {
      const nextWatched = new Set(prev.watchedMovies);
      nextWatched.add(movie.id);
      const nextMovies = prev.movies.map((m) =>
        m.id === movie.id ? { ...m, isWatched: true } : m
      );
      return { watchedMovies: nextWatched, movies: nextMovies };
    });
  } catch (error) {
    console.error("Error adding watched movie:", error);
    alert("Failed to add movie to watched list");
  }
};

/**
 * Sätter upp event-lyssnare för browse-knappar
 */
export const attachBrowseListeners = (): void => {
  const buttons = document.querySelectorAll(
    "#browse-container .movie-card__btn"
  );

  buttons.forEach((button) => {
    button.addEventListener("click", async (e) => {
      e.preventDefault();
      const movieId = (button as HTMLButtonElement).getAttribute("data-movie-id");
      if (movieId) {
        const movie = appStore.getState().movies.find(m => m.id === parseInt(movieId));
        if (movie) {
          await addWatchedMovie(movie);
        }
      }
    });
  });
};
