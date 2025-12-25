// server.js
// Secure Movie Backend API
// Supports: TMDB + OMDB + TRAKT
// Render + GitHub Pages SAFE

const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

/* ===============================
   ✅ CORS FIX (IMPORTANT)
================================ */
app.use(
  cors({
    origin: [
      "https://akshay007700.github.io",
      "http://localhost:5500",
      "http://127.0.0.1:5500"
    ],
    methods: ["GET"],
    allowedHeaders: ["Content-Type"]
  })
);

app.use(express.json());

/* ===============================
   ENV VARIABLES
================================ */
const TMDB_KEY = process.env.TMDB_API_KEY;
const OMDB_KEY = process.env.OMDB_API_KEY; // optional
const TRAKT_ID = process.env.TRAKT_CLIENT_ID; // optional

if (!TMDB_KEY) {
  console.error("❌ Missing TMDB_API_KEY");
  process.exit(1);
}

/* ===============================
   HELPERS
================================ */
async function fetchJSON(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// TMDB helper
async function tmdb(path) {
  const joiner = path.includes("?") ? "&" : "?";
  const url = `https://api.themoviedb.org/3${path}${joiner}api_key=${TMDB_KEY}&language=en-US`;
  return fetchJSON(url);
}

// TRAKT trending helper (safe)
async function traktTrending() {
  if (!TRAKT_ID) {
    throw new Error("TRAKT_CLIENT_ID missing");
  }

  return fetchJSON(`https://api.trakt.tv/movies/trending`, {
    headers: {
      "Content-Type": "application/json",
      "trakt-api-version": "2",
      "trakt-api-key": TRAKT_ID
    }
  });
}

/* ===============================
   ROUTES
================================ */

// Health check (IMPORTANT for Render)
app.get("/", (req, res) => {
  res.json({ status: "MoviesDom backend running ✅" });
});

// Popular movies
app.get("/api/movies/popular", async (req, res) => {
  try {
    const page = req.query.page || 1;
    res.json(await tmdb(`/movie/popular?page=${page}`));
  } catch (e) {
    res.status(500).json({ error: true, message: e.message });
  }
});

// Now Playing
app.get("/api/movies/now-playing", async (req, res) => {
  try {
    res.json(await tmdb(`/movie/now_playing?page=1`));
  } catch (e) {
    res.status(500).json({ error: true, message: e.message });
  }
});

// Upcoming
app.get("/api/movies/upcoming", async (req, res) => {
  try {
    res.json(await tmdb(`/movie/upcoming?page=1`));
  } catch (e) {
    res.status(500).json({ error: true, message: e.message });
  }
});

// ⭐ Trending (TRAKT preferred → fallback TMDB)
app.get("/api/movies/trending", async (req, res) => {
  try {
    if (TRAKT_ID) {
      res.json(await traktTrending());
    } else {
      // fallback so frontend never breaks
      res.json(await tmdb("/trending/movie/day"));
    }
  } catch (e) {
    res.status(500).json({ error: true, message: e.message });
  }
});

// Movie Details
app.get("/api/movies/:id", async (req, res) => {
  try {
    res.json(await tmdb(`/movie/${req.params.id}`));
  } catch (e) {
    res.status(500).json({ error: true, message: e.message });
  }
});

/* ===============================
   START SERVER
================================ */
app.listen(PORT, () => {
  console.log(`🔥 MoviesDom backend running on port ${PORT}`);
});
