// src/lib/store.ts
import type { TMDBMovie, DBMovie } from "../types/index";

export interface AppState {
    movies: TMDBMovie[];           // Filmer som visas i "Browse" (från TMDB)
    watchlist: DBMovie[];          // Filmer användaren vill se (från db)
    watchedMovies: DBMovie[];      // Filmer som har setts (från db)
    isLoading: boolean;
    error: string | null;
    searchQuery: string;
}

type Listener = () => void;

export class Store<T> {
    private state: T;
    private listeners: Set<Listener> = new Set();

    constructor(initialState: T) {
        this.state = initialState;
    }

    // Hämta aktuell data
    getState(): T {
        return this.state;
    }

    // Uppdatera state och notifiera alla lyssnare
    setState(newState: Partial<T> | ((prevState: T) => T)): void {
        if (typeof newState === "function") {
            this.state = newState(this.state);
        } else {
            this.state = { ...this.state, ...newState };
        }
        this.notify();
    }

    // Prenumerera på state-ändringar (t.ex. för att köra renderApp)
    subscribe(listener: Listener): () => void {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }

    // Notifiera alla prenumeranter
    private notify(): void {
        this.listeners.forEach((listener) => listener());
    }
}

// HÄR ÄR FIXEN: Vi använder tomma arrayer [] istället för att skriva namnet på typen
const initialState: AppState = {
    movies: [],
    watchlist: [],       // Var förut: DBMovie[] (vilket gav fel)
    watchedMovies: [],
    isLoading: false,
    error: null,
    searchQuery: "",
};

// Skapa den globala instansen
export const appStore = new Store<AppState>(initialState);