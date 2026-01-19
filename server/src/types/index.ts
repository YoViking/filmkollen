export type MovieStatus = 'watchlist' | 'watched';

export interface Movie {
  id: number;
  tmdb_id: number;
  title: string;
  poster_path: string | null;
  release_date: string | null;
  vote_average: number | null;
  overview: string | null;
  status: MovieStatus;
  personal_rating: number | null;
  review: string | null;
  is_favorite: number;
  date_added: string;
  date_watched: string | null;
}

export interface CreateMovieBody {
  tmdb_id: number;
  title: string;
  poster_path?: string | null;
  release_date?: string | null;
  vote_average?: number | null;
  overview?: string | null;
  status: MovieStatus;
  personal_rating?: number | null;
  review?: string | null;
  is_favorite?: boolean;
  date_watched?: string | null;
}

export interface UpdateMovieBody {
  status?: MovieStatus;
  personal_rating?: number | null;
  review?: string | null;
  is_favorite?: boolean;
  date_watched?: string | null;
}

export interface StatsResponse {
  totalMovies: number;
  watchlistCount: number;
  watchedCount: number;
  favoritesCount: number;
  averageRating: number;
}
