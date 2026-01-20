
console.log("✅ ratings router loaded");


import { Router } from "express";
import getDatabase from "../database.js";

const ratingsRrouter = Router();

ratingsRrouter.post("/", (req, res) => {
  console.log("✅ ratings router loaded");
  const { movieId, rating } = req.body;

  // Validation
  if (!movieId || rating < 1 || rating > 10) {
    return res.status(400).json({ error: "Invalid rating data" });
  }

  // IMPORTANT: get the Database instance
  const db = getDatabase();

  const stmt = `
    INSERT INTO ratings (movie_id, rating, created_at)
    VALUES (?, ?, ?)
  `;

  try {
    db.run(stmt, [movieId, rating, new Date().toISOString()]);
    res.status(201).json({ movieId, rating });
  } 
  
  catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

export default ratingsRrouter;
