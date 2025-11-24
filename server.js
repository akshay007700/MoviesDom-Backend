// server.js
// Secure Movie Backend API
// Supports: TMDB + OMDB + TRAKT

const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

const TMDB_KEY = process.env.TMDB_API_KEY;
const OMDB_KEY = process.env.OMDB_API_KEY;
const TRAKT_ID = process.env.TRAKT_CLIENT_ID;

if (!TMDB_KEY) {
    console.error("❌ Missing TMDB_API_KEY");
    process.exit(1);
}

async function fetchJSON(url, options = {}) {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

// TMDB basic fetch
async function tmdb(path) {
    const joiner = path.includes("?") ? "&" : "?";
    const url = `https://api.themoviedb.org/3${path}${joiner}api_key=${TMDB_KEY}&language=en-US`;
    return fetchJSON(url);
}

// TRAKT trending fetch
async function traktTrending() {
    return fetchJSON(`https://api.trakt.tv/movies/trending`, {
        headers: {
            "Content-Type": "application/json",
            "trakt-api-version": 2,
            "trakt-api-key": TRAKT_ID
        }
    });
}

// Popular
app.get("/api/movies/popular", async (req, res) => {
    try {
        res.json(await tmdb(`/movie/popular?page=1`));
    } catch {
        res.status(500).json({ error: true });
    }
});

// Now Playing
app.get("/api/movies/now-playing", async (req, res) => {
    try {
        res.json(await tmdb(`/movie/now_playing?page=1`));
    } catch {
        res.status(500).json({ error: true });
    }
});

// Upcoming
app.get("/api/movies/upcoming", async (req, res) => {
    try {
        res.json(await tmdb(`/movie/upcoming?page=1`));
    } catch {
        res.status(500).json({ error: true });
    }
});

// ⭐ Trending → TRAKT powered
app.get("/api/movies/trending", async (req, res) => {
    try {
        res.json(await traktTrending());
    } catch {
        res.status(500).json({ error: true });
    }
});

// Details
app.get("/api/movies/:id", async (req, res) => {
    try {
        res.json(await tmdb(`/movie/${req.params.id}`));
    } catch {
        res.status(500).json({ error: true });
    }
});

app.listen(PORT, () =>
    console.log(`🔥 Backend running on port ${PORT}`)
);
