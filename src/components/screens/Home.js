

import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../App";
import { Link } from "react-router-dom";
import Sidebar from "../common/Sidebar";
import StoryBar from "./StoryBar";
import StoryViewer from "./StoryViewer";
import { Theme } from "../common/theme.js";
import { useNavigate } from "react-router-dom";
import ChatBot from '../AI/ChatBot'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import toast from 'react-hot-toast'


const Home = () => {
  const [data, setData] = useState([]);
  const { state } = useContext(UserContext);
  const navigate = useNavigate();

  // Stories state and viewer control
  const [stories, setStories] = useState([]);
  const [isViewing, setIsViewing] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  // New story inputs
  const [newStoryUrl, setNewStoryUrl] = useState("");
  const [newStoryTitle, setNewStoryTitle] = useState("");
  const [newStoryFile, setNewStoryFile] = useState(null);

  const [openCommentPostId, setOpenCommentPostId] = useState(null);
  const [isJumping, setIsJumping] = React.useState(false);

const handleLike = (postId) => {
  setIsJumping(true);
  likePost(postId);
};

const onAnimationComplete = () => {
  setIsJumping(false);
};

const jumpVariants = {
  idle: { y: 0 },
  jump: { y: -10, transition: { yoyo: 1, duration: 0.3 } },
};

  // Fetch posts on mount
  useEffect(() => {
    fetch("/allpost", {
      headers: { Authorization: "Bearer " + localStorage.getItem("jwt") },
    })
      .then((res) => res.json())
      .then((result) => setData(result.posts))
      .catch((err) => console.error(err));
  }, []);

  // Fetch stories on mount
  useEffect(() => {
    const fetchStories = async () => {
      try {
        const token = localStorage.getItem("jwt");
        const res = await fetch("/stories", {
          headers: { Authorization: "Bearer " + token },
        });
        const data = await res.json();
        setStories(data || []);
      } catch (err) {
        console.error("Error fetching stories:", err);
      }
    };
    fetchStories();
  }, []);

  // Story selection handler for StoryBar
  const openStoryViewer = (selectedStory) => {
    const index = stories.findIndex((story) => story._id === selectedStory._id);
    if (index !== -1) {
      setCurrentStoryIndex(index);
      setIsViewing(true);
    }
  };

  // ---- Like Post ----
  const likePost = (id) => {
    fetch("/like", {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({ postId: id }),
    })
      .then((res) => res.json())
      .then((result) => {
        const newData = data.map((item) =>
          item._id === result._id ? result : item
        );
        setData(newData);
      })
      .catch((err) => console.log(err));
  };

  // ---- Unlike Post ----
  const unlikePost = (id) => {
    fetch("/unlike", {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({ postId: id }),
    })
      .then((res) => res.json())
      .then((result) => {
        const newData = data.map((item) =>
          item._id === result._id ? result : item
        );
        setData(newData);
      })
      .catch((err) => console.log(err));
  };

  // ---- Add Comment ----
  const makeComment = (text, postId) => {
    fetch("/comment", {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({ postId, text }),
    })
      .then((res) => res.json())
      .then((result) => {
        const newData = data.map((item) =>
          item._id === result._id ? result : item
        );
        setData(newData);
      })
      .catch((err) => console.log(err));
  };

  // ---- Delete Comment ----
  const deleteComment = (postId, commentId) => {
    fetch("/deletecomment", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({ postId, commentId }),
    })
      .then((res) => res.json())
      .then((result) => {
        const newData = data.map((item) =>
          item._id === result._id ? result : item
        );
        setData(newData);
      })
      .catch((err) => console.log(err));
  };

  // ---- Delete Post ----
  const deletePost = (postId) => {
    fetch(`/deletepost/${postId}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + localStorage.getItem("jwt") },
    })
      .then((res) => res.json())
      .then((result) => {
        const newData = data.filter((item) => item._id !== result._id);
        setData(newData);
      })
      .catch((err) => console.error("Delete error:", err));
  };

  // ---- Add Story ----
  const addStory = async () => {
    if (!newStoryFile || !newStoryTitle) return;

    const formData = new FormData();
    formData.append("media", newStoryFile);
    formData.append("title", newStoryTitle);

    const token = localStorage.getItem("jwt");
    const res = await fetch("/uploadstory", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: formData,
    });

    if (!res.ok) throw new Error("Error uploading story");
    const story = await res.json();
    setStories((prev) => [...prev, story]);
    setNewStoryFile(null);
    setNewStoryTitle("");
  };

  // ---- Delete Story ----
  const deleteStory = async (storyId) => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`/stories/${storyId}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      });
      if (res.ok) {
        setStories((prev) => prev.filter((story) => story._id !== storyId));
      } else {
        throw new Error("Failed to delete story");
      }
    } catch (err) {
      console.error("Error deleting story:", err);
    }
  };

  return (
    <div className="flex-1 bg-black flex justify-center w-full scrollbar-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Feed */}
      <main className="flex-1 flex bg-black justify-center scrollbar-hidden pt-14 md:pt-0">
        <div className="w-full max-w-xl sm:max-w-2xl md:max-w-3xl py-6">
          {/* Stories Bar at the top */}
          <section className="mb-6 px-2 overflow-x-auto whitespace-nowrap">
            <div
              onClick={() => {
                addStory(); // Call your function
                navigate("/create-story"); // Navigate to path
              }}
              className="cursor-pointer inline-flex items-center justify-center mr-4 rounded-full w-20 h-20 bg-gray-700 text-white text-4xl font-bold select-none"
              aria-label="Add new story"
              role="button"
              tabIndex={0}
            >
              +
            </div>

            {stories.map((story, index) => {
              const isActive = index === currentStoryIndex && isViewing;
              const isViewed = story.viewedBy?.includes(state._id);

              return (
                <div
                  key={story._id}
                  className="relative cursor-pointer inline-block mr-4"
                  onClick={() => openStoryViewer(story)}
                  aria-label={`Story by ${story.title}`}
                >
                  <div
                    className={`relative rounded-full p-[2px] w-20 h-20 ${
                      isViewed
                        ? "story-ring-watched"
                        : "story-ring-loading " +
                          (isActive ? "animate-spin-slow" : "")
                    }`}
                  >
                    <img
                      src={story.mediaUrl}
                      alt={story.title}
                      className="rounded-full object-cover w-18 h-18 border-2 border-black"
                      style={{ width: 72, height: 72 }}
                    />
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteStory(story._id);
                    }}
                    className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-700 text-xs"
                    aria-label="Delete story"
                  >
                    ×
                  </button>

                  <p className="text-xs text-center truncate max-w-[72px] mt-1 text-gray-800 dark:text-gray-200">
                    {story.title}
                  </p>
                </div>
              );
            })}
          </section>

          {/* Posts below stories */}
          {data.map((item) => (
            <div
              key={item._id}
              className="  border-gray-200 dark:border-neutral-900 rounded-lg  mb-3"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3">
                <Link
                  to={
                    item.postedBy._id !== state._id
                      ? "/profile/" + item.postedBy._id
                      : "/profile/"
                  }
                  className="flex items-center space-x-3"
                >
                  <img
                    src={item.postedBy.pic}
                    alt="profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span className="font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                    {item.postedBy.name}
                    {item.postedBy.isVerified && (
                      <img
                        src="/badge/vbadge.png" 
                        alt="verified"
                        className="ml-2 w-5 h-5 inline-block"
                        style={{ verticalAlign: "middle" }}
                      />
                    )}
                  </span>
                </Link>

                {item.postedBy._id === state._id && (
                  <button
                    onClick={() => deletePost(item._id)}
                    className="text-gray-400 hover:text-red-500"
                    aria-label="Delete post"
                  >
                    <span className="material-icons">delete</span>
                  </button>
                )}
              </div>

              {/* Post Image */}
              <div className="w-full bg-transparent">
                <img
                  src={item.photo}
                  alt="post"
                  className="block w-full h-auto"
                  loading="lazy"
                />
              </div>

              {/* Actions */}
              <div className="px-4 py-3">
                <div className="flex items-center space-x-4">
                  {item.likes.includes(state._id) ? (
                    <motion.span
                      onClick={() => {
                        setIsJumping(true);
                        unlikePost(item._id);
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label="Unlike post"
                      className="material-icons cursor-pointer text-red-500"
                      style={{ fontSize: "35px" }}
                      variants={jumpVariants}
                      animate={isJumping ? "jump" : "idle"}
                      onAnimationComplete={onAnimationComplete}
                    >
                      favorite
                    </motion.span>
                  ) : (
                    <motion.span
                      onClick={() => handleLike(item._id)}
                      role="button"
                      tabIndex={0}
                      aria-label="Like post"
                      className="material-icons cursor-pointer text-gray-600 dark:text-gray-300"
                      style={{ fontSize: "36px" }}
                      variants={jumpVariants}
                      animate={isJumping ? "jump" : "idle"}
                      onAnimationComplete={onAnimationComplete}
                    >
                      favorite_border
                    </motion.span>
                  )}

                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {item.likes.length} likes
                  </span>

                  {/* Comment Button */}
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label="Open comment box"
                    className="cursor-pointer text-gray-600 dark:text-gray-300"
                    onClick={() => {
                      setOpenCommentPostId(
                        openCommentPostId === item._id ? null : item._id
                      );
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faComment}
                      flip="horizontal"
                      size="2x"
                    />
                  </span>

                  {/* Share Button */}
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label="Share post"
                    className="cursor-pointer text-gray-600 dark:text-gray-300"
                    onClick={() => {
                      toast.error("Share feature to be implemented");
                    }}
                  >
                    <FontAwesomeIcon icon={faPaperPlane} size="2x" />
                  </span>

                  {/* Save Button */}
                  <div className="flex justify-end w-full p-2">
                    <span
                      className="material-icons cursor-pointer text-gray-600 dark:text-gray-300"
                      style={{ fontSize: "36px" }}
                      role="button"
                      tabIndex={0}
                      aria-label="Save post"
                      onClick={() => {
                        toast.error("Save feature to be implemented");
                      }}
                    >
                      bookmark_border
                    </span>
                  </div>
                </div>

                <h6 className="mt-2 font-semibold text-gray-800 dark:text-gray-200">
                  {item.title}
                </h6>
                <p className="text-gray-700 dark:text-gray-400">{item.body}</p>

                {/* Conditionally render comments and comment input */}
                {openCommentPostId === item._id && (
                  <>
                    <div className="mt-3 space-y-1">
                      {item.comments.map((record) => (
                        <div
                          key={record._id}
                          className="flex items-center justify-between text-sm px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800"
                        >
                          <div className="flex space-x-1">
                            <span className="font-semibold text-gray-800 dark:text-gray-200">
                              {record.postedBy.name}:
                            </span>
                            <span className="text-gray-700 dark:text-gray-300">
                              {record.text}
                            </span>
                          </div>
                          {record.postedBy._id === state._id && (
                            <span
                              onClick={() =>
                                deleteComment(item._id, record._id)
                              }
                              className="material-icons cursor-pointer text-gray-400 hover:text-red-500"
                              role="button"
                              tabIndex={0}
                              aria-label="Delete comment"
                            >
                              delete
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    <form
                      className="mt-3"
                      onSubmit={(e) => {
                        e.preventDefault();
                        makeComment(e.target[0].value, item._id);
                        e.target[0].value = "";
                      }}
                    >
                      <input
                        id={`comment-input-${item._id}`}
                        type="text"
                        className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:bg-black dark:text-gray-200"
                        placeholder="Add a comment..."
                        aria-label="Add a comment"
                      />
                    </form>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
      <ChatBot userAvatar={state?.pic} />

      {/* Right Sidebar */}
      <aside className="hidden xl:flex flex-col w-96 ml-6 space-y-6">
        {/* Add New Story Form */}
        {/* Your story add form and story viewer here if you want */}
      </aside>
      {/* Story Viewer */}
      {isViewing && (
        <StoryViewer
          stories={stories}
          initialIndex={currentStoryIndex}
          onClose={() => setIsViewing(false)}
        />
      )}
    </div>
  );
};

export default Home;
