**Filmkollen u06 **

Joakim Viking

Garen Markarian

Housame Oueslati

Yousif Maqdasi

**<span style="text-decoration:underline;">Appens funktionalitet:</span>**

**Huvudflöden:**

TMDB API → Popular Movies → Renderas som kort → Användaren kan:

  - Söka filmer (globalt sökfält)

  - Filtrera (år/genre/betyg)

  - Lägga till i watchlist

  - Betygsätta → flyttas till "watched"

  - Se detaljer (modal)

**Watchlistvy:**

Backend API (/api/movies?status=watchlist) 

  → Renderar sparade filmer 

  → Användaren kan ta bort eller flytta till watched

**Watched-vy:**

Backend API (/api/movies?status=watched)

  → Visar betygsatta filmer med personligt betyg

  → Användaren kan ta bort filmer

**Global state:**

AppState {

  movies: TMDBMovie[]           // Aktuella visade filmer

  watchedMovies: Set&lt;number>    // TMDB IDs för watched

  watchlistMovies: Set&lt;number>  // TMDB IDs för watchlist

}

**Navigationsflöde:**

index.html (header + root-div)

    ↓

main.ts (setupNavigation)

    ↓

Knapptryck → Byter innerHTML i #root:

    - Browse: renderBrowseView()

    - Watched: initWatchedView()

    - Watchlist: initWatchlistView()

    - Search: renderFilterComponent()

**Dataflöde:**

1. Klick på watchlist-knapp (movie card)

2. addWatchlistMovie(movie) anropas

3. POST till /api/movies med CreateMovieBody

4. Backend validerar + INSERT INTO movies

5. saveDatabase() skriver till database.db

6. Uppdaterar appStore.setState({ watchlistMovies })

7. Re-renderar kort med is-watchlisted-klass

Efter att vi sett till att datainhämtning och back- och frontend fungerat som det ska och huvudfunktionerna som tex getMovies() varit på plats har vi delat upp kodningen i olika ansvarsområden:



* Implementera watchfunktion
* Ratingfunktion
* Sök- och filterfunktion
* Styling och CSS

Vi har jobbat mot en devbranch och individuella feature-braches. Det har varit en del mergekonflikter, förmodligen pga att arkitekturen skulle kunna vara mer uppdelad. Vi har inte riktigt kommunicerat logistiken och strukturen. Bara en person har tex använt [app.ts](app.ts) och [store.ts](store.ts) går inte igenom hela koden utan vissa delar. Appen är annars stabil förutom avsaknaden av ett meddelande om att du redan satt en rating på filmen. Vi har väl alla upplevt att det har varit ett stort projekt med mycket nytt, varför användning av ai har förekommit. 
