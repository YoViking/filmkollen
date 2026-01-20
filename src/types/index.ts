export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  isWatched?: boolean;
}

export interface FilterOptions {
  year?: string;
  rating?: string; 
  genre?: string;
}

export interface AppState {
  movies: TMDBMovie[];
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  watchedMovies: Set<number>;
  currentFilters: FilterOptions; // Nytt: håller koll på valda filter
}

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