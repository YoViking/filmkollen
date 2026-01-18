# Filmkollen AI Coding Instructions

## Project Overview
**Filmkollen** is a vanilla TypeScript + Vite movie watchlist web application with a Node.js/Express backend. Users browse movies from TMDB API, mark them as watched, and manage personal ratings and reviews via a SQLite database.

### Architecture
- **Frontend** (Vite + Vanilla TypeScript): Browse movies via HTML/CSS/TS, mark watched, view watchlist
- **Backend** (Express + SQLite): RESTful API persisting user movie data
- **External API**: TMDB (The Movie Database) for movie data
- **Data Flow**: TMDB → Frontend → Local Backend API → SQLite

## Key Tech Stack
- **Frontend**: Vanilla TypeScript 5.9, Vite, ESLint (no React/frameworks)
- **Backend**: Express, SQLite (via sql.js), TypeScript
- **Package Managers**: npm (both root and server/)

## Build & Run Commands
```bash
# Frontend
npm run dev      # Start Vite dev server (localhost:5173)
npm run build    # Build + type-check (tsc -b && vite build)
npm run lint     # Run ESLint

# Backend (cd server/)
npm run dev      # Start Express with tsx watch (localhost:3000)
npm run build    # TypeScript compile to dist/
npm run start    # Run compiled server
npm run reset-db # Reinitialize SQLite database from schema
```

## Critical Architecture Patterns

### Frontend-Backend Communication
- **Base URL**: `http://localhost:3000/api/movies`
- **Headers**: None required (no auth in current version)
- **Pattern**: Fetch with error handling via [src/services/movieApi.ts](src/services/movieApi.ts)
  - `getAllMovies(status?)` - GET with optional status filter
  - `addMovie(movieData)` - POST with CreateMovieBody
  - `updateMovie(id, updates)` - PUT
  - `deleteMovie(id)` - DELETE

### State Management
- Custom `Store<T>` class in [src/lib/store.ts](src/lib/store.ts) with pub-sub pattern
- No Redux/Zustand—use direct `setState()` and `subscribe()` pattern
- Initial state defined in main.ts, not in store.ts

### Type System
- **Two Movie Interfaces**: 
  - `TMDBMovie`: TMDB API response (from [src/services/tmdbApi.ts](src/services/tmdbApi.ts))
  - `Movie`: Backend DB model (from [src/types/index.ts](src/types/index.ts))
- **MovieStatus**: 'watchlist' | 'watched' enum
- Always type API responses and component props with these interfaces

### Component Pattern
- **Vanilla TS Web Components**: [src/components/moviecard.ts](src/components/moviecard.ts) - custom HTML elements
- **HTML Templates**: Files in `views/` directories like [src/views/watched/watched.html](src/views/watched/watched.html)
- **Event Listeners**: Attached in [main.ts](src/main.ts) with `attachBrowseListeners()` pattern
- **DOM Manipulation**: Direct DOM queries using IDs like `#browse-container`, no framework state binding
- **No JSX/TSX**: Pure TypeScript files (.ts) that manipulate the DOM

### Backend Database
- SQLite with sql.js (in-memory with file persistence)
- Movies table has `UNIQUE(tmdb_id)` constraint—duplicates create conflicts
- Schema: [src/database.ts](server/src/database.ts) runs on server startup
- `saveDatabase()` must be called after mutations or changes persist to file

### TMDB Integration
- API Key: hardcoded in [src/config/config.ts](src/config/config.ts)
- Endpoints: `/movie/popular` and `/search/movie`
- Base URL: `https://api.themoviedb.org/3`

## Common Tasks

### Adding Movie to Watched List
1. User clicks button → [main.ts](src/main.ts) event listener fires
2. Build `CreateMovieBody` from `TMDBMovie` + current date
3. Call `movieApi.addMovie(movieData)` (POST /api/movies)
4. Backend validates, inserts, returns `Movie` object
5. Update button UI: disable + set text "✓ Watched"

### Updating Personal Rating
1. Call `movieApi.updateMovie(movieId, { personal_rating: 5 })`
2. Only sends changed fields via `UpdateMovieBody` type
3. Backend patches, saves DB, returns updated `Movie`

### Database Issues
- **Connection fails**: Ensure backend running (`npm run dev` in server/)
- **Data lost**: Run `npm run reset-db` to reinitialize schema from code
- **Unique constraint violation**: Check TMDB ID isn't already in DB

## Project Structure Reference
```
src/
  main.ts                 # App entry, event listeners, view switching
  App.ts                  # Empty (legacy)
  types/index.ts          # All TS interfaces (TMDBMovie, Movie, etc.)
  services/
    tmdbApi.ts           # TMDB API client (getMovies, searchMovies)
    movieApi.ts          # Backend API client (getAllMovies, addMovie, etc.)
  lib/store.ts           # Global state manager (Store<T> class)
  components/moviecard.ts # Movie card Web Component
  views/watched/         # Watched list view
  config/config.ts       # TMDB key + image URL base

server/src/
  server.ts              # Express app setup, routes mounting
  database.ts            # SQLite init, table schema, save logic
  routes/movies.ts       # Movie CRUD endpoints
  types/index.ts         # Backend types (same as frontend)
```

## ESLint Configuration
- Config: [eslint.config.js](eslint.config.js)
- Includes React hooks rules (legacy from template, not used in vanilla TS code)
- Type-aware linting not yet enabled

## Team Notes
- Vanilla TypeScript team project at Chas Academy
- No React framework—pure TS + DOM manipulation
- Merge conflict in README-gammal.md (React template vs vanilla project)
- No authentication/user isolation yet—single shared database
- Recent fix: Converted all sql.js calls from broken better-sqlite3 API pattern to correct sql.js API
