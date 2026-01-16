

import './index.css';
import { getMovies } from './services/tmdbApi';
import { createMovieCard } from './components/moviecard';
import App from './App';

// Testa att hämta filmer och visa movie cards
const testAPI = async () => {
  try {
    console.log('Fetching movies...');
    const movies = await getMovies();
    console.log('Movies fetched:', movies);
    
    const root = document.getElementById('root');
    if (root && movies.length > 0) {
      // Visa de första 6 filmerna som cards
      root.innerHTML = `
        <div style="padding: 20px;">
          <h1>Movie Cards Test</h1>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
            ${movies.slice(0, 6).map(movie => createMovieCard(movie)).join('')}
          </div>
        </div>
      `;
      root.appendChild(App());
    }
  } catch (error) {
    console.error('Error fetching movies:', error);
    const root = document.getElementById('root');
    if (root) {
      root.innerHTML = `<h1>Error: ${error}</h1>`;
    }
  }
};

testAPI();
