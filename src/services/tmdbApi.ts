import config from "../config/config";
import type { TMDBMovie, FilterOptions } from "../types/index.ts";

const get = async <T>(endpoint: string): Promise<T> => {
  try {
    const response = await fetch(`${config.BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error("Failed to fetch data:", error);
    throw error;
  }
};

export const getMovies = async (): Promise<TMDBMovie[]> => {
  const data = await get<{ results: TMDBMovie[] }>(
    `/movie/popular?api_key=${config.API_KEY}`
  );
  return data.results;
};

export const searchMovies = async (query: string): Promise<TMDBMovie[]> => {
  const data = await get<{ results: TMDBMovie[] }>(
    `/search/movie?api_key=${config.API_KEY}&query=${encodeURIComponent(query)}`
  );
  return data.results;
};

// Ny funktion för att filtrera filmer
export const discoverMovies = async (filters: FilterOptions): Promise<TMDBMovie[]> => {
  let endpoint = `/discover/movie?api_key=${config.API_KEY}&sort_by=popularity.desc`;

  if (filters.year) {
    if (filters.year.includes("-")) {
      const [start, end] = filters.year.split("-");
      endpoint += `&primary_release_date.gte=${start}-01-01&primary_release_date.lte=${end}-12-31`;
    } else {
      endpoint += `&primary_release_year=${filters.year}`;
    }
  }

  if (filters.genre) {
    endpoint += `&with_genres=${filters.genre}`;
  }

  if (filters.rating) {
    switch (filters.rating) {
      case "8-10": endpoint += "&vote_average.gte=8&vote_average.lte=10"; break;
      case "6-8":  endpoint += "&vote_average.gte=6&vote_average.lte=8"; break;
      case "4-6":  endpoint += "&vote_average.gte=4&vote_average.lte=6"; break;
      case "under4": endpoint += "&vote_average.lte=4"; break;
    }
  }

  const data = await get<{ results: TMDBMovie[] }>(endpoint);
  return data.results;
};

// Ny funktion för att hämta genrer till dropdown
export const getGenres = async (): Promise<{ id: number, name: string }[]> => {
  const data = await get<{ genres: { id: number, name: string }[] }>(
    `/genre/movie/list?api_key=${config.API_KEY}`
  );
  return data.genres;
};