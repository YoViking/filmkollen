



import { Router } from "express";
import getDatabase from "../database.js";

const ratingsRouter = Router();

ratingsRouter.post("/", async (req, res) => {
  const { movieId, rating } = req.body;

  if (!movieId || rating < 1 || rating > 10) {
    return res.status(400).json({ error: "Invalid rating data" });
  }

  const db = await getDatabase();

  const stmt = `
    INSERT INTO ratings (movie_id, rating, created_at)
    VALUES (?, ?, ?)
  `;

  try {
    await db.run(stmt, [movieId, rating, new Date().toISOString()]);
    res.status(201).json({ movieId, rating });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

export default ratingsRouter;
