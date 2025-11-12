import React, { useEffect, useState } from "react";
import axios from "axios";
import { Theme } from "../common/theme.js";

const StoryBar = ({ onSelect }) => {
  const [stories, setStories] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem("jwt");
        const res = await axios.get("/stories", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStories(res.data || []);
      } catch (e) {
        console.error(e);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="flex space-x-4 p-2 border-b border-gray-800 overflow-x-auto bg-black">
      {stories.map((story, i) => {
        // Example: Check if viewed by current user; replace with actual logic
        const isViewed = story.viewedBy?.includes(
          localStorage.getItem("userId")
        );

        return (
          <div
            key={story._id || i}
            className="flex flex-col items-center cursor-pointer select-none"
            onClick={() => onSelect(story)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onSelect(story)}
            aria-label={`View story of ${story.user.name}`}
          >
            <div className="relative w-20 h-20 flex items-center justify-center">
              {/* Gradient circle ring */}
              <div
                className={`w-20 h-20 rounded-full absolute
                  ${
                    isViewed
                      ? "bg-gray-700"
                      : "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 animate-spin"
                  }
                `}
                style={{ top: 0, left: 0 }}
              />
              {/* Inner black background to provide the ring effect */}
              <div
                className="w-18 h-18 rounded-full absolute bg-black"
                style={{ top: 8, left: 8 }}
              />
              {/* User Image */}
              <img
                src={story.user.pic}
                alt={story.user.name}
                className={`relative rounded-full object-cover w-16 h-16 border-2 border-black ${
                  isViewed ? "filter saturate-50" : ""
                }`}
                draggable={false}
              />
            </div>
            <p className="text-xs mt-2 max-w-[72px] overflow-hidden whitespace-nowrap text-ellipsis text-center text-white">
              {story.user.name}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default StoryBar;
