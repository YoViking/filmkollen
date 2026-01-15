// src/lib/actions.ts
import { appStore } from "./store";
import { fetchPopularMovies, searchMoviesTMDB } from "../services/tmdbApi";
import { getMovies, addMovie } from "../services/movieApi";
import type { TMDBMovie, DBMovie, CreateMovieBody } from "../types/index";

/**
 * Initialiserar appen genom att hämta både populära filmer (TMDB)
 * och användarens watchlist (Backend).
 */
export async function initApp() {
  appStore.setState({ isLoading: true, error: null });

  try {
    const [popular, watchlistData] = await Promise.all([
      fetchPopularMovies(),
      getMovies('watchlist')
    ]);

    // Vi mappar/bekräftar typen explicit för att undvika TS-felet
    const watchlist = watchlistData as DBMovie[];

    appStore.setState({ 
      movies: popular, 
      watchlist: watchlist,
      isLoading: false 
    });
  } catch (error) {
    appStore.setState({ 
      error: "Kunde inte ladda data vid start", 
      isLoading: false 
    });
  }
}

/**
 * Söker efter filmer via TMDB och uppdaterar store
 */
export async function handleSearch(query: string) {
  if (!query.trim()) return;
  
  appStore.setState({ isLoading: true, searchQuery: query });

  try {
    const results = await searchMoviesTMDB(query);
    appStore.setState({ movies: results, isLoading: false });
  } catch (error) {
    appStore.setState({ error: "Sökningen misslyckades", isLoading: false });
  }
}

/**
 * Sparar en film till backendens watchlist
 */
export async function handleAddToWatchlist(movie: TMDBMovie) {
  const movieData: CreateMovieBody = {
    tmdb_id: movie.id,
    title: movie.title,
    poster_path: movie.poster_path,
    release_date: movie.release_date,
    vote_average: movie.vote_average,
    overview: movie.overview,
    status: 'watchlist'
  };

  try {
    await addMovie(movieData);
    
    // Hämta den uppdaterade listan för att hålla UI i synk
    const updatedWatchlist = await getMovies('watchlist') as DBMovie[];
    appStore.setState({ watchlist: updatedWatchlist });
    
    console.log(`Lade till "${movie.title}" i watchlist`);
  } catch (error) {
    console.error("Kunde inte spara till watchlist:", error);
    appStore.setState({ error: "Kunde inte spara filmen" });
  }
}