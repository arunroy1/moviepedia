import React from "react";
import { motion } from "framer-motion";
import "./IntroOverlay.css";

const IntroOverlay = ({ onComplete }) => {
    return (
        <motion.div
            className="intro-overlay"
            initial={{ backgroundColor: "rgba(10, 10, 11, 1)" }}
            animate={{ backgroundColor: "rgba(10, 10, 11, 0)" }}
            transition={{ duration: 2, delay: 2, ease: "easeInOut" }}
            onAnimationComplete={onComplete}
        >
            <motion.div
                className="intro-content"
                initial={{ opacity: 0, filter: "blur(5px)" }}
                animate={{
                    opacity: [0, 1, 0.12],
                    filter: ["blur(5px)", "blur(0px)", "blur(6px)"]
                }}
                transition={{
                    duration: 3,
                    times: [0, 0.3, 1],
                    ease: "easeInOut"
                }}
            >
                <h1 className="intro-title">
                    Movie Matcher
                </h1>
            </motion.div>
        </motion.div>
    );
};

export default IntroOverlay;
