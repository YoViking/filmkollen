

import type { TMDBMovie } from "../types/index";
import config from "../config/config";

export const createMovieCard = (movie: TMDBMovie): string => {
  const posterUrl = movie.poster_path
    ? `${config.IMG_URL}${movie.poster_path}`
    : "https://via.placeholder.com/500x750?text=No+Image";

  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : "N/A";

  return `
    <div class="movie-card" data-movie-id="${movie.id}">
      <div class="movie-card__poster">
        <img src="${posterUrl}" alt="${movie.title}" loading="lazy" />
      </div>
      <div class="movie-card__content">
        <h3 class="movie-card__title">${movie.title}</h3>
        <div class="movie-card__meta">
          <span class="movie-card__year">${releaseYear}</span>
          <span class="movie-card__rating">⭐ ${movie.vote_average.toFixed(1)}</span>
        </div>
        <p class="movie-card__overview">${movie.overview || "No description available."}</p>
        <button class="movie-card__btn" data-movie-id="${movie.id}">
          ${movie.isWatched ? "✓ Watched" : "+ Add to Watched"}
        </button>
      </div>
    </div>
  `;
};