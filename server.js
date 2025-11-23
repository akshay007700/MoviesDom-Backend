// server.js
// Secure backend proxy for TMDB – hides your API key

const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = process.env.TMDB_API_KEY;

// Simple check: API key must exist
if (!TMDB_API_KEY) {
  console.error("❌ TMDB_API_KEY missing in .env file");
  process.exit(1);
}

app.use(cors());

// Helper to call TMDB
async function proxyTmdb(res, tmdbPath) {
  try {
    const url = `${TMDB_BASE_URL}${tmdbPath}${
      tmdbPath.includes("?") ? "&" : "?"
    }api_key=${TMDB_API_KEY}&language=en-US`;

    const response = await fetch(url);
    if (!response.ok) {
      console.error("TMDB error:", response.status, response.statusText);
      return res.status(response.status).json({
        error: true,
        status: response.status,
        message: response.statusText,
      });
    }

    const data = await response.json();
    return res.json(data);
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({
      error: true,
      message: "Internal server error while calling TMDB",
    });
  }
}

// ✅ Popular movies
app.get("/api/movies/popular", (req, res) => {
  const page = req.query.page || 1;
  proxyTmdb(res, `/movie/popular?page=${page}`);
});

// ✅ Trending movies (day)
app.get("/api/movies/trending", (req, res) => {
  const page = req.query.page || 1;
  proxyTmdb(res, `/trending/movie/day?page=${page}`);
});

// ✅ Now playing
app.get("/api/movies/now-playing", (req, res) => {
  const page = req.query.page || 1;
  proxyTmdb(res, `/movie/now_playing?page=${page}`);
});

// ✅ Upcoming
app.get("/api/movies/upcoming", (req, res) => {
  const page = req.query.page || 1;
  proxyTmdb(res, `/movie/upcoming?page=${page}`);
});

// ✅ Movie details by ID
app.get("/api/movies/:id", (req, res) => {
  const movieId = req.params.id;
  proxyTmdb(res, `/movie/${movieId}`);
});

app.listen(PORT, () => {
  console.log(`✅ Backend server running on port ${PORT}`);
});
