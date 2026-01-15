// src/services/movieApi.ts
import type { TMDBMovie, CreateMovieBody, DBMovie } from "../types/index";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Hämta filmer (kan filtreras på 'watchlist' eller 'watched')
export async function getMovies(status?: string): Promise<DBMovie[]> {
  const url = status 
    ? `http://localhost:3000/api/movies?status=${status}` 
    : `http://localhost:3000/api/movies`;

  const response = await fetch(url);
  if (!response.ok) throw new Error("Kunde inte hämta data");
  
  return await response.json();
}

// Spara en ny film (t.ex. när man klickar på "Lägg till i Watchlist")
export async function addMovie(movieData: CreateMovieBody): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/movies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(movieData)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Kunde inte spara filmen');
    }
}

// Ta bort en film
export async function deleteMovie(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/movies/${id}`, {
        method: 'DELETE'
    });
    if (!response.ok) throw new Error('Kunde inte radera filmen');
}

export async function updateMovie(id: number, updates: Partial<DBMovie>): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/movies/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
    });

    if (!response.ok) {
        throw new Error('Kunde inte uppdatera filmen');
    }
}