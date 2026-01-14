// rating, popularity, poster, release date, title, overview, id, isWatched

export interface TMDBMovie {
    id: number;
    title: string;
    overview: string;
    poster_path: string | null;
    release_date: string;
    vote_average: number;
    isWatched?: boolean;
  }

  // Interface för app state
export interface AppState {
  movies: TMDBMovie[];
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  watchedMovies: Set<number>;
}