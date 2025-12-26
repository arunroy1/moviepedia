import React, { useState, useEffect } from "react";
import Card from "./Card";
import BackgroundMarquee from "./BackgroundMarquee";
import MovieDetail from "./MovieDetail";
import { Heart, X, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import "./App.css";
import "./glass-buttons.css";

// 1. Setup API Constants
const API_KEY = "d9c1d4362d918aad39b75b1d4d4df372"; // API Key from themoviedb
const BASE_URL = "https://api.themoviedb.org/3/discover/movie";
const IMAGE_URL = "https://image.tmdb.org/t/p/w500";

// 2. Define Regions with specific API filters
const regions = [
  { label: "Hollywood 🇺🇸", params: "&region=US&with_original_language=en" },
  { label: "K-Drama 🇰🇷", params: "&with_original_language=ko" },
  { label: "Spanish 🇪🇸", params: "&with_original_language=es" },
  { label: "Indian 🇮🇳", params: "&region=IN&with_original_language=hi|te|ta|ml" }, // Combined Indian languages
  { label: "Anime 🇯🇵", params: "&with_genres=16&with_original_language=ja" },
];

function App() {
  const [cards, setCards] = useState([]);
  const [activeRegion, setActiveRegion] = useState(regions[0]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("discover"); // "discover" or "likes"
  const [likedMovies, setLikedMovies] = useState([]);
  const [sortBy, setSortBy] = useState("popularity"); // "popularity", "rating", "random"
  const [showIntro, setShowIntro] = useState(true);
  const [expandedMovie, setExpandedMovie] = useState(null);

  // Auth State Removed
  // const [showAuthModal, setShowAuthModal] = useState(false);
  // const { currentUser, logout } = useAuth();

  // Helper to manage seen movies
  const getSeenMovies = () => JSON.parse(localStorage.getItem("seenMovies") || "[]");
  const getLikedMovies = () => JSON.parse(localStorage.getItem("likedMovies") || "[]");

  // Start app entry
  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  // Default to local storage
  useEffect(() => {
    setLikedMovies(getLikedMovies());
  }, []);

  const markMovieAsSeen = async (id) => {
    const seen = getSeenMovies();
    if (!seen.includes(id)) {
      seen.push(id);
      localStorage.setItem("seenMovies", JSON.stringify(seen));


    }
  };

  const saveLikedMovie = async (movie) => {
    const liked = getLikedMovies();
    if (!liked.some(m => m.id === movie.id)) {
      const movieWithRegion = { ...movie, regionParams: activeRegion.params, regionLabel: activeRegion.label };
      liked.push(movieWithRegion);
      localStorage.setItem("likedMovies", JSON.stringify(liked));
      setLikedMovies(liked);


    }
  };

  // 3. Fetch Movies function
  const fetchMovies = async (regionParams, sortOption = sortBy) => {
    setLoading(true);
    try {
      let sortParams = "&sort_by=popularity.desc&page=1"; // Default

      if (sortOption === "rating") {
        sortParams = "&sort_by=vote_average.desc&vote_count.gte=300&page=1";
      } else if (sortOption === "random") {
        const randomPage = Math.floor(Math.random() * 20) + 1;
        sortParams = `&sort_by=popularity.desc&page=${randomPage}`;
      }

      const response = await fetch(
        `${BASE_URL}?api_key=${API_KEY}${regionParams}${sortParams}&include_adult=false&certification_country=US&certification.lte=R`
      );
      const data = await response.json();

      const seen = getSeenMovies();

      // Transform API data to match our Card format
      const formattedMovies = data.results
        .filter((movie) => !seen.includes(movie.id)) // Filter out seen movies
        .map((movie) => ({
          id: movie.id,
          title: movie.title,
          genre: `Rating: ${movie.vote_average}/10`,
          desc: movie.overview,
          img: movie.poster_path
            ? `${IMAGE_URL}${movie.poster_path}`
            : "https://via.placeholder.com/500x750?text=No+Image",
        }));

      setCards(formattedMovies);
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setLoading(false);
    }
  };

  // Run this when the app starts or region changes
  useEffect(() => {
    // Fetch implicitly whenever region or sort changes, regardless of view
    fetchMovies(activeRegion.params, sortBy);
  }, [activeRegion, sortBy]);

  const removeCard = (id, liked) => {
    markMovieAsSeen(id);
    if (liked) {
      const movie = cards.find(c => c.id === id);
      if (movie) saveLikedMovie(movie);
    }
    setCards((prev) => prev.filter((card) => card.id !== id));
  };

  const filteredLikedMovies = likedMovies.filter(movie =>
    // Filter by exact region params match to group correctly
    movie.regionParams === activeRegion.params
  );

  const handleExpand = (movie) => {
    setExpandedMovie(movie);
  };

  const handleCloseExpand = () => {
    setExpandedMovie(null);
  };

  return (
    <>
      {/* Intro Curtain - covers everything during intro */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            className="intro-curtain"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 1.2,
              ease: [0.4, 0, 0.2, 1]
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: '#0a0a0b',
              zIndex: 3000,
              pointerEvents: 'none',
              willChange: 'opacity',
              transform: 'translateZ(0)'
            }}
          />
        )}
      </AnimatePresence>

      {/* Movie Detail Modal */}
      <AnimatePresence>
        {expandedMovie && (
          <MovieDetail
            key="movie-detail"
            movie={expandedMovie}
            onClose={handleCloseExpand}
          />
        )}
      </AnimatePresence>

      {/* Background Title - unified animation from intro to background */}
      <motion.div
        className="background-title"
        initial={{
          opacity: 0,
          scale: 1.02,
          filter: "blur(0px)",
        }}
        animate={{
          opacity: showIntro ? 1 : 0.12,
          scale: 1,
          filter: showIntro ? "blur(0px)" : "blur(6px)",
        }}
        transition={{
          duration: 2,
          ease: [0.4, 0, 0.2, 1]
        }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3001,
          willChange: 'opacity, filter',
        }}
      >
        Movie Pedia
      </motion.div>

      <BackgroundMarquee paused={!!expandedMovie} />

      <div className="app-container">
        <motion.div
          className="header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.5, duration: 0.8 }}
        >
          <div className="auth-controls" style={{ position: 'absolute', top: 20, right: 20, zIndex: 100 }}>
            {/* Auth Removed */}
          </div>

          <div className="view-toggle">
            <button
              className={`toggle-btn ${view === "discover" ? "active" : ""}`}
              onClick={() => setView("discover")}
            >
              Discover
            </button>
            <button
              className={`toggle-btn ${view === "likes" ? "active" : ""}`}
              onClick={() => setView("likes")}
            >
              Liked
            </button>
          </div>
        </motion.div>

        <motion.div
          className="controls-bar"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.7, duration: 0.8 }}
        >
          {/* Region Selector Buttons */}
          <div className="region-selector">
            {regions.map((region) => (
              <button
                key={region.label}
                className={`chip ${activeRegion.label === region.label ? "active" : ""}`}
                onClick={() => setActiveRegion(region)}
              >
                {region.label}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          {view === "discover" && (
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="popularity">🔥 Popular</option>
              <option value="rating">⭐ Top Rated</option>
              <option value="random">🎲 Random</option>
            </select>
          )}
        </motion.div>

        {view === "discover" ? (
          <>
            <div className="stack-container" style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <motion.div
                key={`${activeRegion.label}-${view}-${sortBy}`}
                className="card-stack"
                initial={{ opacity: 0, scale: 0.5, rotateY: -540, x: -50, y: 50 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0, x: 0, y: 0 }}
                transition={{ delay: showIntro ? 3.2 : 0.2, duration: 1.5, ease: [0.34, 1.56, 0.64, 1] }}
              >
                {loading ? (
                  <div className="loading"><Loader2 className="spin" size={48} /></div>
                ) : cards.length > 0 ? (
                  cards.slice(-3).map((movie) => (
                    <div key={movie.id} className="card-wrapper">
                      <Card movie={movie} removeCard={removeCard} onExpand={handleExpand} />
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <h2>No more movies in this region!</h2>
                    <button onClick={() => fetchMovies(activeRegion.params)}>Reload</button>
                  </div>
                )}
              </motion.div>

              {/* Only show buttons if we have cards */}
              {!loading && cards.length > 0 && (
                <>
                  {/* Dislike - Left */}
                  <motion.button
                    className="glass-btn glass-btn-left"
                    onClick={() => removeCard(cards[cards.length - 1].id, false)}
                    // Initial: Shifted RIGHT towards center, centered vertically
                    initial={{ opacity: 0, x: 100, y: "-50%", scale: 0.8, rotate: 0 }}
                    // Animate: To natural CSS position (x:0), centered vertically, rotated out
                    animate={{ opacity: 1, x: 0, y: "-50%", scale: 1, rotate: -12 }}
                    // Exit: Fade out
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    transition={{ delay: showIntro ? 3.8 : 0.2, duration: 0.8, type: "spring", bounce: 0.4 }}
                    whileHover={{ scale: 1.05, rotate: -15 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X />
                  </motion.button>

                  {/* Like - Right */}
                  <motion.button
                    className="glass-btn glass-btn-right"
                    onClick={() => removeCard(cards[cards.length - 1].id, true)}
                    // Initial: Shifted LEFT towards center, centered vertically
                    initial={{ opacity: 0, x: -100, y: "-50%", scale: 0.8, rotate: 0 }}
                    // Animate: To natural CSS position (x:0), centered vertically, rotated out
                    animate={{ opacity: 1, x: 0, y: "-50%", scale: 1, rotate: 12 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    transition={{ delay: showIntro ? 3.8 : 0.2, duration: 0.8, type: "spring", bounce: 0.4 }}
                    whileHover={{ scale: 1.05, rotate: 15 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Heart fill="currentColor" />
                  </motion.button>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="liked-grid">
            {filteredLikedMovies.length > 0 ? (
              filteredLikedMovies.map(movie => (
                <div key={movie.id} className="liked-card" onClick={() => handleExpand(movie)}>
                  <img src={movie.img} alt={movie.title} />
                  <div className="liked-info">
                    <h3>{movie.title}</h3>
                    <span>{movie.genre}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <h2>No liked movies in {activeRegion.label} yet!</h2>
              </div>
            )}
          </div>
        )}
      </div>


    </>
  );
}

export default App;