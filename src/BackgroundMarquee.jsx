import React, { useEffect, useState } from "react";
import "./BackgroundMarquee.css";

const API_KEY = "d9c1d4362d918aad39b75b1d4d4df372";
const BASE_URL = "https://api.themoviedb.org/3/movie/popular";
const IMAGE_URL = "https://image.tmdb.org/t/p/w300"; // Smaller images for background

const BackgroundMarquee = ({ paused }) => {
    const [posters, setPosters] = useState([]);

    useEffect(() => {
        const fetchPosters = async () => {
            try {
                // Fetch 3 pages to get enough images for rows
                const promises = [1, 2, 3].map(page =>
                    fetch(`${BASE_URL}?api_key=${API_KEY}&page=${page}`).then(res => res.json())
                );
                const results = await Promise.all(promises);
                const allMovies = results.flatMap(data => data.results);

                // Filter out missing images and map to URLs
                const imageUrls = allMovies
                    .filter(m => m.poster_path)
                    .map(m => `${IMAGE_URL}${m.poster_path}`);

                setPosters(imageUrls);
            } catch (error) {
                console.error("Error fetching background images", error);
            }
        };

        fetchPosters();
    }, []);

    if (posters.length === 0) return null;

    // Split into 3 rows
    const row1 = posters.slice(0, 20);
    const row2 = posters.slice(20, 40);
    const row3 = posters.slice(40, 60);

    // Helper to render a continuous marquee row
    // We duplicate the content to ensure seamless loop
    const MarqueeRow = ({ images, direction, speed }) => (
        <div className={`marquee-row ${direction}`}>
            <div
                className="marquee-content"
                style={{
                    animationDuration: `${speed}s`,
                    animationPlayState: paused ? "paused" : "running"
                }}
            >
                {images.map((src, i) => (
                    <img key={`orig-${i}`} src={src} alt="" />
                ))}
                {/* Duplicate for loop */}
                {images.map((src, i) => (
                    <img key={`dup-${i}`} src={src} alt="" />
                ))}
            </div>
        </div>
    );

    return (
        <div className="marquee-container">
            <div className="marquee-overlay"></div>
            <div className="marquee-wrapper">
                <MarqueeRow images={row1} direction="left" speed={40} />
                <MarqueeRow images={row2} direction="right" speed={50} />
                <MarqueeRow images={row3} direction="left" speed={60} />
            </div>
        </div>
    );
};

export default BackgroundMarquee;
