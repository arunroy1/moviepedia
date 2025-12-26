import React from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Info } from "lucide-react";

const Card = ({ movie, removeCard, onExpand }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (event, info) => {
    if (info.offset.x > 100) {
      removeCard(movie.id, true); // Swipe Right = Like
    } else if (info.offset.x < -100) {
      removeCard(movie.id, false); // Swipe Left = Dislike
    }
  };

  const handleViewDetails = (e) => {
    e.stopPropagation();
    onExpand && onExpand(movie);
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      style={{ x, rotate, opacity }}
      className="card"
      whileHover={{ scale: 1.02 }}
    >
      <div className="card-image" style={{ backgroundImage: `url(${movie.img})` }}></div>
      <div className="card-content">
        <h3>{movie.title}</h3>
        <span>{movie.genre}</span>
        <p>{movie.desc}</p>
        <button className="view-details-btn" onClick={handleViewDetails}>
          <Info size={16} />
          View Details
        </button>
      </div>
    </motion.div>
  );
};

export default Card;