import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const StoryViewer = ({ stories = [], initialIndex = 0, onClose }) => {
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    if (stories.length === 0) return;

    // Start timer for current story length
    const timer = setTimeout(() => {
      onClose(); // Close viewer after 5 seconds (no next story)
    }, 5000);

    return () => clearTimeout(timer);
  }, [index, stories, onClose]);

  if (!stories.length) return null;

  return (
    <div
      className="fixed inset-0 bg-black flex items-center justify-center z-50"
      onClick={onClose} // clicking outside closes
      role="dialog"
      aria-modal="true"
      aria-label="Story viewer"
    >
      {/* Single progress bar on top for current story */}
      <motion.div
        className="absolute top-4 left-0 right-0 h-1 bg-gray-700 rounded"
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ duration: 5, ease: "linear" }}
        aria-hidden="true"
      />

      <button
        className="absolute top-4 right-4 text-white text-2xl"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Close story viewer"
      >
        ✕
      </button>

      <img
        src={stories[index].mediaUrl}
        alt={`Story ${index + 1}`}
        className="max-h-full max-w-full object-contain mx-auto"
        draggable={false}
      />
    </div>
  );
};

export default StoryViewer;
