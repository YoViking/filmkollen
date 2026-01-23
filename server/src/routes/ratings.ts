


import { Router } from "express";
import getDatabase, { saveDatabase } from "../database.js";

const ratingsRrouter = Router();

ratingsRrouter.post("/", (req, res) => {
  const { movieId, rating } = req.body;

  // Validation
  if (!movieId || rating < 1 || rating > 10) {
    return res.status(400).json({ error: "Invalid rating data" });
  }

  // IMPORTANT: get the Database instance
  const db = getDatabase();

  const ratingStmt = `
    INSERT INTO ratings (movie_id, rating, created_at)
    VALUES (?, ?, ?)
  `;

  const updateMovieStmt = `
    UPDATE movies
    SET status = 'watched', personal_rating = ?, date_watched = ?
    WHERE id = ?
  `;

  try {
    const watchedDate = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
    
    // Insert rating using sql.js API
    const ratingInsert = db.prepare(ratingStmt);
    ratingInsert.bind([movieId, rating, watchedDate]);
    ratingInsert.step();
    ratingInsert.free();
    
    // Update movie status to watched and add personal rating using sql.js API
    const movieUpdate = db.prepare(updateMovieStmt);
    movieUpdate.bind([rating, watchedDate, movieId]);
    movieUpdate.step();
    movieUpdate.free();
    
    // CRITICAL: Save database to persist changes
    saveDatabase();
    
    res.status(201).json({ movieId, rating, status: 'watched' });
  } 
  
  catch (err) {
    console.error('Error in ratings endpoint:', err);
    res.status(500).json({ error: "Database error", message: (err as Error).message });
  }
});

export default ratingsRrouter;
