import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// In-memory storage 
let movies = [];

// GET all movies, optional status filter
app.get("/api/movies", (req, res) => {
  const { status } = req.query;
  if (status) {
    res.json(movies.filter(movie => movie.status === status));
  } else {
    res.json(movies);
  }
});

// POST a new movie (watchlist or watched)
app.post("/api/movies", (req, res) => {
  const movie = req.body;
  movie.id = movies.length + 1; // simple id
  movies.push(movie);
  res.status(201).json(movie);
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
