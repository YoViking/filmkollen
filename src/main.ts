// src/main.ts
import './index.css';
import { appStore } from "./lib/store";
import { browseView } from "./views/browse/browse";
import { watchlistView } from "./views/watchlist/watchlist"; // Din nya vy
import { initApp, handleSearch, handleAddToWatchlist } from "./lib/actions";
import { deleteMovie } from "./services/movieApi";

import headerHTML from "./views/static/header/index.html?raw";
import footerHTML from "./views/static/footer/index.html?raw";
import homeHTML from "./views/static/home/index.html?raw";

const app = document.querySelector("#app")!;

/**
 * Router som växlar mellan statiska och dynamiska vyer
 */
const currentPage = (): string => {
  const path = window.location.pathname;
  
  switch (path) {
    case "/":
      return homeHTML; // Statisk fil från läraren
    case "/browse":
      return browseView(); // Dynamisk vy vi byggt
    case "/watchlist":
      return watchlistView(); // Dynamisk vy vi byggt
    default:
      return `<div class="container"><h2>404</h2><p>Sidan hittades inte.</p></div>`;
  }
};

/**
 * Huvudrenderaren
 */
const renderApp = () => {
  app.innerHTML = `
    ${headerHTML}
    <main id="main-content">
      ${currentPage()}
    </main>
    ${footerHTML}
  `;
};

// --- EVENT LISTENERS (Hanterar allt klickbart i appen) ---

document.addEventListener("click", async (e) => {
  const target = e.target as HTMLElement;

  // 1. SPA-Navigation för länkar i Header/Footer
  const link = target.closest("a");
  if (link && link.href.startsWith(window.location.origin)) {
    e.preventDefault();
    const path = new URL(link.href).pathname;
    window.history.pushState({}, "", path);
    renderApp();
    return;
  }

  // 2. Lägg till i Watchlist (från Browse-vyn)
  if (target.classList.contains("btn-add-watchlist")) {
    const card = target.closest(".movie-card");
    const movieId = Number(card?.getAttribute("data-id"));
    const movie = appStore.getState().movies.find(m => m.id === movieId);
    if (movie) await handleAddToWatchlist(movie);
  }

  // 3. Ta bort från Watchlist (från Watchlist-vyn)
  if (target.classList.contains("btn-delete")) {
    const id = Number(target.getAttribute("data-id"));
    if (confirm("Vill du ta bort filmen?")) {
      await deleteMovie(id);
      await initApp(); // Uppdaterar listan och ritar om automatiskt via subscribe
    }
  }
});

// Hantera sökformuläret i Browse
document.addEventListener("submit", (e) => {
  const target = e.target as HTMLFormElement;
  if (target.id === "search-form") {
    e.preventDefault();
    const input = target.querySelector<HTMLInputElement>("#search-input");
    if (input) handleSearch(input.value);
  }
});

// Lyssna på store-ändringar och starta appen
appStore.subscribe(renderApp);
window.addEventListener("popstate", renderApp);

renderApp(); // Första ritningen
initApp();   // Hämta data