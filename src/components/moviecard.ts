

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
      <!-- Watchlist button as overlay -->
      <button class="movie-card__watchlist-btn ${movie.isWatchlist ? 'is-watchlisted' : ''}" data-movie-id="${movie.id}" title="${movie.isWatchlist ? 'In Watchlist' : 'Add to Watchlist'}">
        <span class="bookmark-icon">${movie.isWatchlist ? '✓' : '+'}</span>
      </button>

      <!-- Poster -->
      <div class="movie-card__poster">
        <img src="${posterUrl}" alt="${movie.title}" loading="lazy" />
      </div>

      <!-- Rating section -->
      <div class="movie-card__rating-section">
        <div class="movie-card__tmdb-rating">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#fbbf24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <span>${movie.vote_average.toFixed(1)}</span>
        </div>
        <button class="movie-card__rate-btn" data-movie-id="${movie.id}" title="Rate this movie">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <span>Rate</span>
        </button>
      </div>

      <!-- Title and year -->
      <h3 class="movie-card__title">${movie.title}</h3>
      <p class="movie-card__year">Release Year: ${releaseYear}</p>

      <!-- Details button -->
      <button class="movie-card__details-btn" data-movie-id="${movie.id}">
        Details
      </button>
    </div>
  `;
};
