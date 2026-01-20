

// Hanterar global state
import type { AppState } from "../types/index";

type Listener = () => void;

export class Store<T> {
  private state: T;
  private listeners: Set<Listener> = new Set();

  constructor(initialState: T) {
    this.state = initialState;
  }

  // Hämta current state
  getState(): T {
    return this.state;
  }

  // Uppdatera state och notifiera alla lyssnare
  setState(newState: Partial<T> | ((prevState: T) => Partial<T>)): void {
    if (typeof newState === "function") {
      const partial = newState(this.state);
      this.state = { ...this.state, ...partial };
    } else {
      this.state = { ...this.state, ...newState };
    }
    this.notify();
  }

  // Prenumerera på state-ändringar
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    // Returnera unsubscribe-funktion
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Notifiera alla prenumeranter
  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }
}



// Initial state
const initialState: AppState = {
  movies: [],
  searchQuery: "",
  isLoading: false,
  error: null,
  watchedMovies: new Set(),
  watchlistMovies: new Set(),
};

// Global store instans
export const appStore = new Store<AppState>(initialState);