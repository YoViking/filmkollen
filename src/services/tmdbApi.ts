

import config from "../config/config";
import type { TMDBMovie } from "../types/index.ts";

// Hämtar data från TMDB API
const get = async <T>(endpoint: string): Promise<T> => {
  try {
    const response = await fetch(`${config.BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(data);
    return data as T;
  } catch (error) {
    console.error("Failed to fetch data:", error);
    throw error;
  }
};

// Hämtar populära filmer från TMDB API
export const getMovies = async (): Promise<TMDBMovie[]> => {
  const data = await get<{ results: TMDBMovie[] }>(
    `/movie/popular?api_key=${config.API_KEY}`
  );
  return data.results;
};

// Söker efter filmer från TMDB API
export const searchMovies = async (query: string): Promise<TMDBMovie[]> => {
  const data = await get<{ results: TMDBMovie[] }>(
    `/search/movie?api_key=${config.API_KEY}&query=${encodeURIComponent(query)}`
  );
  return data.results;
};