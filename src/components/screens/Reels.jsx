import React, { useEffect, useState, useRef, useContext } from "react";
import Sidebar from "../common/Sidebar";
import { UserContext } from "../../App";
import { Link } from "react-router-dom";
import {
  FaHeart,
  FaComment,
  FaShare,
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
} from "react-icons/fa";
import { FiMoreHorizontal } from "react-icons/fi";

const ReelItem = ({ reel, isActive }) => {
  const { state } = useContext(UserContext);
  const videoRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    if (reel && state) {
      setIsLiked(reel.likes.includes(state._id));
      setLikeCount(reel.likes.length);
    }
  }, [reel, state]);

  const handleLike = () => {
    const endpoint = isLiked ? "/unlike" : "/like";
    fetch(endpoint, {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({ postId: reel._id }), // Assuming reels are treated like posts for likes
    })
      .then((res) => res.json())
      .then((result) => {
        setIsLiked(!isLiked);
        setLikeCount(result.likes.length);
      })
      .catch((err) => console.log(err));
  };

  const togglePlay = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

useEffect(() => {
  if (isActive && videoRef.current && videoRef.current.paused) {
    videoRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => {});
  } else if (!isActive && videoRef.current && !videoRef.current.paused) {
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
    setIsPlaying(false);
  }
}, [isActive]);

  return (
    <div className="h-full w-full flex items-center justify-center relative bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        onClick={togglePlay}
        src={reel.video}
        loop
        muted={isMuted}
        className="h-full w-full object-contain"
        playsInline // Important for mobile browsers
      />

      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/40 to-transparent flex justify-between items-center">
        <p className="text-white font-bold text-lg">Reels</p>
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="text-white text-xl"
        >
          {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
        </button>
      </div>

      {!isPlaying && (
        <div className="absolute text-white text-6xl opacity-70 pointer-events-none transform transition-transform duration-300 scale-150">
          <FaPlay />
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-4 text-white bg-gradient-to-t from-black/50 to-transparent">
        <Link
          to={`/profile/${reel.postedBy?._id}`}
          className="flex items-center space-x-2"
        >
          <img
            src={reel.postedBy?.pic || "/avatar.png"}
            alt="user"
            className="w-9 h-9 rounded-full object-cover border-2 border-white"
          />
          <p className="font-semibold text-sm">
            {reel.postedBy?.name || "Unknown User"}
          </p>
        </Link>
        <p className="text-sm mt-2 line-clamp-2">{reel.caption}</p>
      </div>

      <div className="absolute right-3 bottom-20 flex flex-col items-center space-y-5 text-white">
        <button
          onClick={handleLike}
          className="flex flex-col items-center transform transition-transform duration-200 hover:scale-110"
        >
          <FaHeart
            size={28}
            className={isLiked ? "text-red-500" : "text-white"}
          />
          <span className="text-xs font-semibold">{likeCount}</span>
        </button>
        <button className="flex flex-col items-center transform transition-transform duration-200 hover:scale-110">
          <FaComment size={28} />
          <span className="text-xs font-semibold">
            {reel.comments?.length || 0}
          </span>
        </button>
        <button className="flex flex-col items-center transform transition-transform duration-200 hover:scale-110">
          <FaShare size={28} />
        </button>
        <button className="transform transition-transform duration-200 hover:scale-110">
          <FiMoreHorizontal size={28} />
        </button>
      </div>
    </div>
  );
};

const Reels = () => {
  const [reels, setReels] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    setIsLoading(true);
    fetch("/allreels", {
      headers: { Authorization: "Bearer " + localStorage.getItem("jwt") },
    })
      .then((res) => res.json())
      .then((data) => {
        setReels(data.reels || []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch reels:", err);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
const WHEEL_THRESHOLD = 20; // Increase for less sensitivity

const handleWheel = (e) => {
  e.preventDefault();
  if (e.deltaY > WHEEL_THRESHOLD) {
    setCurrentIndex((prev) => Math.min(prev + 1, reels.length - 1));
  } else if (e.deltaY < -WHEEL_THRESHOLD) {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }
};

    const container = containerRef.current;
    container?.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container?.removeEventListener("wheel", handleWheel);
    };
  }, [reels.length]);

  return (
    <div className="bg-black flex h-screen w-screen overflow-hidden">
      <div className="w-0 md:w-64">
        <Sidebar />
      </div>
      <div
        ref={containerRef}
        className="flex-1 flex justify-center items-center relative"
      >
        {isLoading ? (
          <div className="text-white">Loading reels...</div>
        ) : reels.length > 0 ? (
          <div className="w-full h-full max-w-md relative">
            <div
              className="h-full w-full transition-transform duration-500 ease-in-out"
              style={{ transform: `translateY(-${currentIndex * 100}%)` }}
            >
              {reels.map((reel, index) => (
                <div key={reel._id} className="h-full w-full">
                  <ReelItem reel={reel} isActive={index === currentIndex} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-white">No reels to show.</div>
        )}
      </div>
    </div>
  );
};

export default Reels;
