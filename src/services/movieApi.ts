

export async function saveRating(movieId: number, rating: number) {
  
    const res = await fetch("http://localhost:3000/api/ratings", 
        {
            
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ movieId, rating })
        });
        
        if (!res.ok) {
            throw new Error("Failed to save rating");
        }
        
        return res.json();
}

import type { CreateMovieBody, UpdateMovieBody, Movie, StatsResponse } from "../types/index";

const API_BASE_URL = "http://localhost:3000/api/movies";

/**
 * Hämta alla filmer med valfri statusfilter
 */
export const getAllMovies = async (status?: "watchlist" | "watched"): Promise<Movie[]> => {
  try {
    const url = status ? `${API_BASE_URL}?status=${status}` : API_BASE_URL;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch movies");
    return await response.json();
  } catch (error) {
    console.error("Error fetching movies:", error);
    throw error;
  }
};

/**
 * Hämta en specifik film via ID
 */
export const getMovie = async (id: number): Promise<Movie> => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) throw new Error("Failed to fetch movie");
    return await response.json();
  } catch (error) {
    console.error("Error fetching movie:", error);
    throw error;
  }
};

/**
 * Addera en ny film (watchlist eller watched)
 */
export const addMovie = async (movieData: CreateMovieBody): Promise<Movie> => {
  try {
    console.log("Adding movie with data:", movieData);
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(movieData),
    });
    console.log("Add movie response status:", response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Add movie error response:", errorText);
      throw new Error(`Failed to add movie: ${response.status} ${errorText}`);
    }
    const result = await response.json();
    console.log("Movie added successfully:", result);
    return result;
  } catch (error) {
    console.error("Error adding movie:", error);
    throw error;
  }
};

/**
 * Uppdatera en film (ändra status, betyg, recension osv)
 */
export const updateMovie = async (
  id: number,
  updates: UpdateMovieBody
): Promise<Movie> => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error("Failed to update movie");
    return await response.json();
  } catch (error) {
    console.error("Error updating movie:", error);
    throw error;
  }
};

/**
 * Ta bort en film
 */
export const deleteMovie = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete movie");
  } catch (error) {
    console.error("Error deleting movie:", error);
    throw error;
  }
};

/**
 * Hämta statistik för alla sparade filmer
 */
export const getStats = async (): Promise<StatsResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/stats`);
    if (!response.ok) throw new Error("Failed to fetch stats");
    return await response.json();
  } catch (error) {
    console.error("Error fetching stats:", error);
    throw error;
  }
};

