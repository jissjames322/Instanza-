import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../../App";
import Sidebar from "../common/Sidebar";
import { MdGridOn, MdOndemandVideo, MdBookmarkBorder } from "react-icons/md";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const VideoPlayer = ({ videoUrl }) => {
  const videoRef = React.useRef();
  const [muted, setMuted] = useState(true);

  const togglePlay = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };

  const toggleMute = () => {
    setMuted(!muted);
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
    }
  };

  return (
    <video
      ref={videoRef}
      src={videoUrl}
      muted={muted}
      controls={false}
      loop
      className="w-full rounded"
      onClick={togglePlay}
      onDoubleClick={toggleMute}
      style={{ cursor: "pointer", background: "#111" }}
    />
  );
};

const Profile = () => {
  const [mypics, setPics] = useState([]);
  const [myreels, setReels] = useState([]);
  const { state, dispatch } = useContext(UserContext);
  const [image, setImage] = useState("");
  const [activeTab, setActiveTab] = useState("posts");
  const [selectedPost, setSelectedPost] = useState(null);
  const [viewingReel, setViewingReel] = useState(false);
  const [openCommentPostId, setOpenCommentPostId] = useState(null);
  const [isJumping, setIsJumping] = useState(false);

  useEffect(() => {
    const headers = { Authorization: "Bearer " + localStorage.getItem("jwt") };
    fetch("/mypost", { headers })
      .then((res) => res.json())
      .then((result) => {
        setPics(result.mypost || []);
      });
    fetch("/myreels", { headers })
      .then((res) => res.json())
      .then((result) => {
        setReels(result.myreels || []);
      });
  }, []);

useEffect(() => {
  if (image) {
    const data = new FormData();
    data.append("file", image);
    data.append(
      "upload_preset",
      process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET
    );
    data.append("cloud_name", process.env.REACT_APP_CLOUDINARY_CLOUD_NAME);

    fetch(
      `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "post",
        body: data,
      }
    )
      .then((res) => res.json())
      .then((data) => {
        fetch("/updatepic", {
          method: "put",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("jwt"),
          },
          body: JSON.stringify({ pic: data.url }),
        })
          .then((res) => res.json())
          .then((result) => {
            localStorage.setItem(
              "user",
              JSON.stringify({ ...state, pic: result.pic })
            );
            dispatch({ type: "UPDATEPIC", payload: result.pic });
          });
      })
      .catch((err) => {
        console.log(err);
      });
  }
}, [image, state, dispatch]);

  const updatePhoto = (file) => {
    setImage(file);
  };

  // Like / Unlike post
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
        const newPics = mypics.map((item) =>
          item._id === result._id ? result : item
        );
        setPics(newPics);
        if (selectedPost && selectedPost._id === result._id)
          setSelectedPost(result);
      })
      .catch((err) => console.log(err));
  };

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
        const newPics = mypics.map((item) =>
          item._id === result._id ? result : item
        );
        setPics(newPics);
        if (selectedPost && selectedPost._id === result._id)
          setSelectedPost(result);
      })
      .catch((err) => console.log(err));
  };

  // Add Comment
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
        const newPics = mypics.map((item) =>
          item._id === result._id ? result : item
        );
        setPics(newPics);
        if (selectedPost && selectedPost._id === result._id)
          setSelectedPost(result);
      })
      .catch((err) => console.log(err));
  };

  // Delete Comment
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
        const newPics = mypics.map((item) =>
          item._id === result._id ? result : item
        );
        setPics(newPics);
        if (selectedPost && selectedPost._id === result._id)
          setSelectedPost(result);
      })
      .catch((err) => console.log(err));
  };

  // Delete Post
  const deletePost = (postId) => {
    fetch(`/deletepost/${postId}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + localStorage.getItem("jwt") },
    })
      .then((res) => res.json())
      .then((result) => {
        const newPics = mypics.filter((item) => item._id !== result._id);
        setPics(newPics);
        if (selectedPost && selectedPost._id === result._id)
          setSelectedPost(null);
      })
      .catch((err) => console.error("Delete error:", err));
  };

  const TabButton = ({ label, icon, tabName }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`flex items-center space-x-2 py-3 text-sm font-medium tracking-widest uppercase ${
        activeTab === tabName
          ? "text-white border-t border-white"
          : "text-neutral-500"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  function openPost(post) {
    setSelectedPost(post);
    setViewingReel(false);
    setOpenCommentPostId(post._id);
  }

  function openReel(reel) {
    setSelectedPost(reel);
    setViewingReel(true);
    setOpenCommentPostId(null);
  }

  function closeModal() {
    setSelectedPost(null);
    setViewingReel(false);
    setOpenCommentPostId(null);
  }

  const jumpVariants = {
    idle: { y: 0 },
    jump: { y: -10, transition: { yoyo: 1, duration: 0.3 } },
  };

  return (
    <div className="bg-black min-h-screen text-white flex pt-10 md:pt-0">
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-64 flex justify-center px-4 py-8 pt-14 md:pt-0">
        <div className="w-full max-w-4xl pt-9">
          <header className="flex flex-col md:flex-row items-center md:items-start gap-8 pb-8">
            {/* Profile Picture */}
            <div className="flex-shrink-0 relative">
              <img
                src={state?.pic || "/avatar.png"}
                alt={state?.username || "profile"}
                className="w-[145px] h-[145px] rounded-full object-cover border border-neutral-800"
              />

              {/* Upload button (hidden on others’ profiles if needed) */}
              <label className="absolute bottom-0 right-2 bg-blue-500 p-2 rounded-full cursor-pointer hover:bg-blue-600 transition">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                    clipRule="evenodd"
                  />
                </svg>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => updatePhoto(e.target.files[0])}
                />
              </label>
            </div>

            {/* Profile Info */}
            <div className="flex-1 flex flex-col space-y-5 text-white">
              {/* Username + Buttons */}
              <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-3 md:space-y-0">
                <div className="flex items-center space-x-2">
                  <h2 className="text-2xl font-light tracking-tight">
                    {state?.name || "loading"}
                  </h2>
                  {state?.isVerified && (
                    <img
                      src="/badge/vbadge.png"
                      alt="verified"
                      className="w-5 h-5 mt-[2px]" // perfectly aligned vertically
                    />
                  )}
                </div>

                {/* Buttons */}
                <div className="flex space-x-2">
                  <button className="bg-neutral-800 text-sm px-4 py-1.5 rounded-md font-semibold hover:bg-neutral-700 transition">
                    Edit profile
                  </button>
                </div>
              </div>

              {/* Stats */}
              <ul className="flex justify-center md:justify-start space-x-8 text-base">
                <li>
                  <span className="font-semibold">{mypics.length}</span> posts
                </li>
                <li>
                  <span className="font-semibold">
                    {state?.followers?.length || 0}
                  </span>{" "}
                  followers
                </li>
                <li>
                  <span className="font-semibold">
                    {state?.following?.length || 0}
                  </span>{" "}
                  following
                </li>
              </ul>

              {/* Bio */}
              <div className="space-y-1">
                <p className="font-semibold">{state?.name}</p>
                <p className="text-neutral-400">{state?.email}</p>
                {state?.bio && <p className="text-white">{state.bio}</p>}
                {state?.link && (
                  <a
                    href={state.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline text-sm"
                  >
                    {state.link}
                  </a>
                )}
              </div>
            </div>
          </header>

          <div className="border-t border-neutral-800">
            <div className="flex justify-center gap-12">
              <TabButton label="Posts" icon={<MdGridOn />} tabName="posts" />
              <TabButton
                label="Reels"
                icon={<MdOndemandVideo />}
                tabName="reels"
              />
              <TabButton
                label="Saved"
                icon={<MdBookmarkBorder />}
                tabName="saved"
              />
            </div>

            <div>
              {activeTab === "posts" && (
                <div className="grid grid-cols-3 gap-1 mt-4">
                  {mypics.map((item) => (
                    <div
                      key={item._id}
                      className="relative w-full aspect-square cursor-pointer"
                      onClick={() => openPost(item)}
                    >
                      <img
                        src={item.photo}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
              {activeTab === "reels" && (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-1 mt-4">
                  {myreels.map((item) => (
                    <div
                      key={item._id}
                      className="relative w-full aspect-square cursor-pointer"
                      onClick={() => openReel(item)}
                    >
                      <video
                        src={item.video}
                        poster={item.thumbnail} // <-- Add your thumbnails here
                        className="w-full h-full object-cover"
                        controls={false}
                        muted
                        loop
                        preload="metadata" // Optionally preload metadata quickly
                      />
                    </div>
                  ))}
                </div>
              )}
              {activeTab === "saved" && (
                <div className="text-center py-16 text-neutral-500">
                  <h3 className="text-2xl font-bold">No Saved Posts Yet</h3>
                  <p>Your saved posts will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal for post/reel */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 transition-opacity p-4 overflow-auto"
          onClick={closeModal}
          aria-modal="true"
          role="dialog"
          aria-label={viewingReel ? "Reel viewer" : "Post viewer"}
        >
          <div
            className="relative max-w-3xl w-full bg-black rounded shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {!viewingReel ? (
              <>
                {/* Post Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-700">
                  <Link
                    to={`/profile/${selectedPost.postedBy._id}`}
                    className="flex items-center space-x-3"
                  >
                    <img
                      src={selectedPost.postedBy.pic}
                      alt={selectedPost.postedBy.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <span className="font-semibold text-white flex items-center">
                      {selectedPost.postedBy.name}
                      {selectedPost.postedBy.isVerified && (
                        <img
                          src="/badge/vbadge.png"
                          alt="verified"
                          className="ml-2 w-5 h-5 inline-block"
                          style={{ verticalAlign: "middle" }}
                        />
                      )}
                    </span>
                  </Link>
                  {selectedPost.postedBy._id === state._id && (
                    <button
                      onClick={() => {
                        deletePost(selectedPost._id);
                        closeModal();
                      }}
                      className="text-gray-400 hover:text-red-500"
                      aria-label="Delete post"
                    >
                      <span className="material-icons">delete</span>
                    </button>
                  )}
                </div>

                {/* Post Image */}
                <img
                  src={selectedPost.photo}
                  alt={selectedPost.title}
                  className="w-full h-auto rounded-b mb-2 max-w-full max-h-[90vh] mx-auto"
                />

                {/* Post Actions */}
                <div className="px-4 py-3 border-t border-neutral-700">
                  <div className="flex items-center space-x-4">
                    {selectedPost.likes.includes(state._id) ? (
                      <motion.span
                        onClick={() => {
                          setIsJumping(true);
                          unlikePost(selectedPost._id);
                        }}
                        role="button"
                        tabIndex={0}
                        aria-label="Unlike post"
                        className="material-icons cursor-pointer text-red-500"
                        style={{ fontSize: "35px" }}
                        variants={jumpVariants}
                        animate={isJumping ? "jump" : "idle"}
                        onAnimationComplete={() => setIsJumping(false)}
                      >
                        favorite
                      </motion.span>
                    ) : (
                      <motion.span
                        onClick={() => {
                          setIsJumping(true);
                          likePost(selectedPost._id);
                        }}
                        role="button"
                        tabIndex={0}
                        aria-label="Like post"
                        className="material-icons cursor-pointer text-gray-600"
                        style={{ fontSize: "36px" }}
                        variants={jumpVariants}
                        animate={isJumping ? "jump" : "idle"}
                        onAnimationComplete={() => setIsJumping(false)}
                      >
                        favorite_border
                      </motion.span>
                    )}

                    <span className="text-sm text-white">
                      {selectedPost.likes.length} likes
                    </span>

                    {/* Comment Button */}
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label="Open comment box"
                      className="cursor-pointer text-white"
                      onClick={() => {
                        setOpenCommentPostId(
                          openCommentPostId === selectedPost._id
                            ? null
                            : selectedPost._id
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
                      className="cursor-pointer text-white"
                      onClick={() => {
                        toast.error("Share feature to be implemented");
                      }}
                    >
                      <FontAwesomeIcon icon={faPaperPlane} size="2x" />
                    </span>

                    {/* Save Button */}
                    <div className="flex justify-end w-full p-2">
                      <span
                        className="material-icons cursor-pointer text-white"
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

                  <h6 className="mt-2 font-semibold text-white">
                    {selectedPost.title}
                  </h6>
                  <p className="text-gray-300">{selectedPost.body}</p>

                  {/* Comments section */}
                  {openCommentPostId === selectedPost._id && (
                    <>
                      <div className="mt-3 space-y-1 max-h-48 overflow-y-auto">
                        {selectedPost.comments.map((record) => (
                          <div
                            key={record._id}
                            className="flex items-center justify-between text-sm px-2 py-1 rounded-md hover:bg-gray-700"
                          >
                            <div className="flex space-x-1">
                              <span className="font-semibold text-white">
                                {record.postedBy.name}:
                              </span>
                              <span className="text-gray-300">
                                {record.text}
                              </span>
                            </div>
                            {record.postedBy._id === state._id && (
                              <span
                                onClick={() =>
                                  deleteComment(selectedPost._id, record._id)
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
                          makeComment(e.target[0].value, selectedPost._id);
                          e.target[0].value = "";
                        }}
                      >
                        <input
                          type="text"
                          className="w-full px-3 py-2 text-sm rounded-md border border-gray-600 bg-black text-white focus:outline-none focus:ring-1 focus:ring-gray-400"
                          placeholder="Add a comment..."
                          aria-label="Add a comment"
                          autoComplete="off"
                        />
                      </form>
                    </>
                  )}
                </div>
              </>
            ) : (
              <VideoPlayer videoUrl={selectedPost.video} />
            )}
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-white text-3xl font-bold"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
