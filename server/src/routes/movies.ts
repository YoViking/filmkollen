import express, { Request, Response } from 'express';
import db, { saveDatabase } from '../database.js';
import type { Movie, CreateMovieBody, UpdateMovieBody, StatsResponse, MovieStatus } from '../types/index.js';

const router = express.Router();

/**
 * Hjälpfunktion för att köra SELECT-frågor och få tillbaka objekt (eftersom sql.js returnerar rå data)
 */
const queryAll = (sql: string, params: any[] = []): any[] => {
  const stmt = db().prepare(sql);
  stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
};

const queryOne = (sql: string, params: any[] = []): any | undefined => {
  const results = queryAll(sql, params);
  return results[0];
};

/**
 * GET /api/movies
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const { status } = req.query as { status?: MovieStatus };
    let sql = 'SELECT * FROM movies';
    const params: any[] = [];

    if (status) {
      sql += ' WHERE status = ?';
      params.push(status);
    }
    sql += ' ORDER BY date_added DESC';

    // Här använder vi vår hjälpfunktion istället för .all()
    const movies = queryAll(sql, params) as Movie[];
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * POST /api/movies
 */
router.post('/', (req: Request<unknown, unknown, CreateMovieBody>, res: Response) => {
  try {
    const movieData = req.body;
    
    // sql.js använder .run() för INSERT
    db().run(`
      INSERT INTO movies (
        tmdb_id, title, poster_path, release_date,
        vote_average, overview, status, personal_rating,
        review, is_favorite, date_watched
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      movieData.tmdb_id, movieData.title, movieData.poster_path, movieData.release_date,
      movieData.vote_average, movieData.overview, movieData.status,
      movieData.personal_rating, movieData.review, movieData.is_favorite ? 1 : 0,
      movieData.date_watched
    ]);

    saveDatabase();

    // Hämta den senast tillagda filmen
    const movie = queryOne('SELECT * FROM movies WHERE tmdb_id = ?', [movieData.tmdb_id]);
    res.status(201).json(movie);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * DELETE /api/movies/:id
 */
router.delete('/:id', (req: Request<{ id: string }>, res: Response) => {
  try {
    db().run('DELETE FROM movies WHERE id = ?', [req.params.id]);
    saveDatabase();
    res.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * GET /api/movies/user/stats
 */
router.get('/user/stats', (req: Request, res: Response) => {
  try {
    const total = queryOne('SELECT COUNT(*) as count FROM movies');
    const watchlist = queryOne('SELECT COUNT(*) as count FROM movies WHERE status = "watchlist"');
    const watched = queryOne('SELECT COUNT(*) as count FROM movies WHERE status = "watched"');

    const response: StatsResponse = {
      totalMovies: total?.count || 0,
      watchlistCount: watchlist?.count || 0,
      watchedCount: watched?.count || 0,
      favoritesCount: 0,
      averageRating: 0
    };
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;