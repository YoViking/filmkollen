


import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import moviesRouter from './routes/movies.js';
import ratingsRouter from './routes/ratings.js';



// Läs in miljövariabler från .env
dotenv.config();

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept']
}));
app.options('*', cors());
app.use(express.json());



app.use('/api/movies', moviesRouter);
app.use('/api/ratings', ratingsRouter);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Movie API is running',
    timestamp: new Date().toISOString()
  });
});



// Root-endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Movie Watchlist API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      movies: {
        getAll: 'GET /api/movies',
        getFiltered: 'GET /api/movies?status=watchlist|watched',
        getOne: 'GET /api/movies/:id',
        create: 'POST /api/movies',
        update: 'PUT /api/movies/:id',
        delete: 'DELETE /api/movies/:id',
        stats: 'GET /api/movies/user/stats',
        ratings: 'POST /api/ratings'
      }
    }
  });
});




app.post('/api/ratings', (req: Request, res: Response) => {
  const { movieId, rating } = req.body;

  // Very simple validation
  if (!movieId || !rating) {
    return res.status(400).json({
      message: 'movieId and rating are required'
    });
  }

  console.log('Rating received:', movieId, rating);

  // For now, just confirm success
  res.status(201).json({
    message: 'Rating saved',
    movieId,
    rating
  });
});



app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`
  });
});


app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});


app.use("/api/ratings", ratingsRouter);


// Starta servern
app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ Health check: http://localhost:${PORT}/api/health`);
});







