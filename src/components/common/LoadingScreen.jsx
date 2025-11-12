import React, { useEffect } from "react";
import { motion } from "framer-motion";

const LoadingScreen = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: 2, ease: "easeInOut" },
    },
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black relative">
      <motion.div
        animate={{
          scale: [0.8, 1, 0.8],
          opacity: [0.7, 1, 0.7],
          rotate: [0, 15, -15, 0],
        }}
        transition={{
          duration: 2.5,
          ease: "easeInOut",
          repeat: 0,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="160"
          height="160"
          viewBox="0 0 16 16"
          fill="none"
          stroke="url(#insta-gradient)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="cursor-pointer"
        >
          <defs>
            <linearGradient
              id="insta-gradient"
              x1="0"
              y1="0"
              x2="16"
              y2="16"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#f9ce34" /> {/* Yellow */}
              <stop offset="0.3" stopColor="#ee2a7b" /> {/* Pink */}
              <stop offset="0.6" stopColor="#6228d7" /> {/* Purple */}
              <stop offset="1" stopColor="#3a8dde" /> {/* Blue */}
            </linearGradient>
            <linearGradient
              id="insta-circle"
              x1="4"
              y1="4"
              x2="12"
              y2="12"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#f9ce34" />
              <stop offset="0.3" stopColor="#ee2a7b" />
              <stop offset="0.6" stopColor="#6228d7" />
              <stop offset="1" stopColor="#3a8dde" />
            </linearGradient>
          </defs>
          {/* Outer rounded rectangle */}
          <motion.rect
            x="0.75"
            y="0.75"
            width="14.5"
            height="14.5"
            rx="3.5"
            ry="3.5"
            fill="none"
            stroke="url(#insta-gradient)"
            variants={pathVariants}
            initial="hidden"
            animate="visible"
          />
          {/* Main colorful camera circle */}
          <motion.circle
            cx="8"
            cy="8"
            r="4.109"
            stroke="url(#insta-gradient)"
            fill="url(#insta-circle)"
            variants={pathVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 1, duration: 1.5, ease: "easeInOut" }}
          />
          {/* Small flash circle */}
          <motion.circle
            cx="13.24"
            cy="2"
            r="0.96"
            fill="#fff"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 2.1, duration: 0.5, ease: "easeOut" }}
          />
        </svg>
      </motion.div>
      <div className="absolute bottom-8 left-0 w-full flex flex-col items-center">
        <span className="text-sm text-gray-400">from</span>
        <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
          J & J
        </span>
      </div>
    </div>
  );
};

export default LoadingScreen;
