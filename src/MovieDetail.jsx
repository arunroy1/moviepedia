import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, Calendar, Clock, Star } from "lucide-react";
import "./MovieDetail.css";

const API_KEY = "d9c1d4362d918aad39b75b1d4d4df372";
const BASE_URL = "https://api.themoviedb.org/3/movie";
const IMAGE_URL = "https://image.tmdb.org/t/p/w1280"; // Optimized image size

const PROFILE_URL = "https://image.tmdb.org/t/p/w185";

const MovieDetail = ({ movie, onClose }) => {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await fetch(
                    `${BASE_URL}/${movie.id}?api_key=${API_KEY}&append_to_response=credits,reviews`
                );
                const data = await response.json();
                setDetails(data);
            } catch (error) {
                console.error("Failed to fetch movie details", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [movie.id]);

    if (!movie) return null;

    // Animation variants
    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 }
    };

    const modalVariants = {
        hidden: { scale: 0.8, opacity: 0, y: 50 },
        visible: { scale: 1, opacity: 1, y: 0, transition: { type: "spring", damping: 25, stiffness: 300 } },
        exit: { scale: 0.8, opacity: 0, y: 50, transition: { duration: 0.2 } }
    };

    return (
        <motion.div
            className="movie-detail-overlay"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose} // Close on clicking outside
        >
            <motion.div
                className="movie-detail-modal"
                variants={modalVariants}
                onClick={(e) => e.stopPropagation()} // Prevent close on modal click
            >
                <div className="detail-header">
                    {/* Prefer backdrop, fallback to poster, fallback to movie.img */}
                    {details?.backdrop_path ? (
                        <img
                            src={`${IMAGE_URL}${details.backdrop_path}`}
                            alt="Backdrop"
                            className="backdrop-image"
                        />
                    ) : (
                        <img
                            src={movie.img}
                            alt="Backdrop"
                            className="backdrop-image"
                            style={{ filter: "blur(10px)" }} // Blur if it's the poster being reused
                        />
                    )}
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="detail-content">
                    <h2>{details?.title || movie.title}</h2>
                    {details?.tagline && <p className="tagline">"{details.tagline}"</p>}

                    <div className="meta-row">
                        {details?.vote_average > 0 && (
                            <div className="meta-item">
                                <Star size={14} fill="#e50914" color="#e50914" />
                                <span>{details.vote_average.toFixed(1)}</span>
                            </div>
                        )}
                        {details?.runtime > 0 && (
                            <div className="meta-item">
                                <Clock size={14} />
                                <span>{details.runtime} min</span>
                            </div>
                        )}
                        {details?.release_date && (
                            <div className="meta-item">
                                <Calendar size={14} />
                                <span>{details.release_date.split("-")[0]}</span>
                            </div>
                        )}
                        {details?.genres?.map(g => (
                            <div key={g.id} className="meta-item">{g.name}</div>
                        ))}
                    </div>

                    <div className="overview-section">
                        <h3>Overview</h3>
                        <p>{details?.overview || movie.desc}</p>
                    </div>

                    {loading ? (
                        <div style={{ padding: 20, textAlign: "center" }}>Loading details...</div>
                    ) : (
                        <>
                            {details?.credits?.cast?.length > 0 && (
                                <div className="cast-section">
                                    <h3>Top Cast</h3>
                                    <div className="cast-grid">
                                        {details.credits.cast.slice(0, 10).map((actor) => (
                                            <div key={actor.id} className="cast-member">
                                                <img
                                                    src={actor.profile_path ? `${PROFILE_URL}${actor.profile_path}` : "https://via.placeholder.com/100x100?text=?"}
                                                    alt={actor.name}
                                                    className="cast-img"
                                                />
                                                <span className="cast-name">{actor.name}</span>
                                                <span className="cast-character">{actor.character}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {details?.reviews?.results?.length > 0 && (
                                <div className="reviews-section">
                                    <h3>Reviews</h3>
                                    {details.reviews.results.slice(0, 3).map((review) => (
                                        <div key={review.id} className="review-item">
                                            <span className="review-author">{review.author}</span>
                                            <p className="review-content">{review.content.slice(0, 200)}...</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default MovieDetail;
