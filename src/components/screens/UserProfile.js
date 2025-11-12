import React, { useEffect, useState, useRef, useContext } from "react";
import Sidebar from "../common/Sidebar";
import { MdGridOn, MdOndemandVideo, MdBookmarkBorder } from "react-icons/md";
import { useParams, Link } from "react-router-dom";
import { UserContext } from "../../App";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import InstaLineLoader from "../common/InstaLineLoad";
const VideoPlayer = ({ videoUrl }) => {
  const videoRef = useRef();
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

const ReelItem = ({ reel }) => {
  return (
    <div className="mb-6 w-full max-w-lg mx-auto bg-black rounded shadow-lg overflow-hidden">
      <video
        src={reel.video}
        className="w-full object-contain"
        muted
        loop
        controls={false}
        playsInline
      />
      <div className="p-3 text-white">
        <Link
          to={`/profile/${reel.postedBy?._id}`}
          className="flex items-center space-x-2 mb-2"
        >
          <img
            src={reel.postedBy?.pic || "/avatar.png"}
            alt={reel.postedBy?.name || "User"}
            className="w-8 h-8 rounded-full object-cover border border-white"
          />
          <span className="font-semibold">
            {reel.postedBy?.name || "Unknown User"}
          </span>
        </Link>
        <p className="text-sm line-clamp-2">{reel.caption}</p>
      </div>
    </div>
  );
};

const UserProfile = () => {
  const { userid } = useParams();
  const { state } = useContext(UserContext);
  const [userProfile, setUserProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("posts");
  const [posts, setPosts] = useState([]);
  const [reels, setReels] = useState([]);
  const [saved, setSaved] = useState([]);

  // Modal viewer state
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewingReel, setViewingReel] = useState(false);
  const [openCommentPostId, setOpenCommentPostId] = useState(null);
  const [isJumping, setIsJumping] = useState(false);

  useEffect(() => {
    fetch(`/user/${userid}`, {
      headers: { Authorization: "Bearer " + localStorage.getItem("jwt") },
    })
      .then((res) => res.json())
      .then((data) => {
        setUserProfile(data.user);
        setPosts(data.posts || []);
        setReels(data.reels || []); // assuming reels are provided here
        // setSaved(data.saved || []);
      })
      .catch((err) => {
        console.log("Error fetching user profile:", err);
      });
  }, [userid]);

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
        const newPosts = posts.map((item) =>
          item._id === result._id ? result : item
        );
        setPosts(newPosts);
        if (selectedItem && selectedItem._id === result._id)
          setSelectedItem(result);
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
        const newPosts = posts.map((item) =>
          item._id === result._id ? result : item
        );
        setPosts(newPosts);
        if (selectedItem && selectedItem._id === result._id)
          setSelectedItem(result);
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
        const newPosts = posts.map((item) =>
          item._id === result._id ? result : item
        );
        setPosts(newPosts);
        if (selectedItem && selectedItem._id === result._id)
          setSelectedItem(result);
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
        const newPosts = posts.map((item) =>
          item._id === result._id ? result : item
        );
        setPosts(newPosts);
        if (selectedItem && selectedItem._id === result._id)
          setSelectedItem(result);
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
        const newPosts = posts.filter((item) => item._id !== result._id);
        setPosts(newPosts);
        if (selectedItem && selectedItem._id === result._id)
          setSelectedItem(null);
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

  // Modal logic for posts/reels
  const openPost = (post) => {
    setSelectedItem(post);
    setViewingReel(false);
    setOpenCommentPostId(post._id);
  };

  const openReel = (reel) => {
    setSelectedItem(reel);
    setViewingReel(true);
    setOpenCommentPostId(null);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setViewingReel(false);
    setOpenCommentPostId(null);
  };

if (!userProfile) {
  return (
    <div className="flex flex-col items-center justify-center mt-10 w-full">
      <InstaLineLoader style={{ maxWidth: 320 }} />
      <h2 className="text-center text-gray-400 mt-6">Loading...</h2>
    </div>
  );
}

  return (
    <div className="bg-black min-h-screen text-white flex pt-14 md:pt-0">
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-64 flex justify-center px-8 py-8 pt-15 md:pt-0">
        <div className="w-full max-w-4xl pt-9">
          <header className="flex flex-col md:flex-row items-center md:items-start gap-8 pb-8">
            {/* Profile Picture */}
            <div className="flex-shrink-0">
              <img
                src={userProfile.pic || "/avatar.png"}
                alt={userProfile.username}
                className="w-[145px] h-[145px] rounded-full object-cover border border-neutral-700"
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1 flex flex-col space-y-4 text-white">
              {/* Username Row */}
              <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
                <h2 className="text-2xl font-light flex items-center">
                  {userProfile.username}
                  {userProfile.isVerified && (
                    <img
                      src="/badge/vbadge.png"
                      alt="verified"
                      className="ml-2 w-5 h-5"
                      style={{ verticalAlign: "middle" }}
                    />
                  )}
                </h2>

                {/* Buttons beside username (like Follow/Message) */}
                <div className="flex space-x-2">
                  <button className="bg-neutral-800 text-sm px-4 py-1 rounded-md font-semibold hover:bg-neutral-700 transition">
                    Following
                  </button>
                  <button className="bg-neutral-800 text-sm px-4 py-1 rounded-md font-semibold hover:bg-neutral-700 transition">
                    Message
                  </button>
                </div>
              </div>

              {/* Stats Row */}
              <ul className="flex justify-center md:justify-start space-x-6 text-sm">
                <li>
                  <span className="font-semibold">{posts.length}</span> posts
                </li>
                <li>
                  <span className="font-semibold">
                    {userProfile.followers?.length || 0}
                  </span>{" "}
                  followers
                </li>
                <li>
                  <span className="font-semibold">
                    {userProfile.following?.length || 0}
                  </span>{" "}
                  following
                </li>
              </ul>

              {/* Bio Section */}
              <div>
                <p className="font-semibold">{userProfile.name}</p>
                <p className="text-neutral-400">{userProfile.email}</p>
                {userProfile.bio && (
                  <p className="text-white">{userProfile.bio}</p>
                )}
                {userProfile.link && (
                  <a
                    href={userProfile.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    {userProfile.link}
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
                  {posts.map((item) => (
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
                  {reels.length ? (
                    reels.map((item) => (
                      <div
                        key={item._id}
                        className="relative w-full aspect-square cursor-pointer"
                        onClick={() => openReel(item)}
                      >
                        <video
                          src={item.video}
                          className="w-full h-full object-cover"
                          controls={false}
                          muted
                          loop
                        />
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-neutral-500 py-6">
                      No reels available.
                    </p>
                  )}
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

      {/* Fade-in modal for post/reel */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 transition-opacity p-4 overflow-auto"
          onClick={closeModal}
          aria-modal="true"
          role="dialog"
          aria-label={viewingReel ? "Reels viewer" : "Post viewer"}
        >
          <div
            className="relative max-w-4xl w-full bg-black rounded shadow-lg p-4 overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {!viewingReel ? (
              <>
                {/* Post Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-700">
                  <Link
                    to={`/profile/${selectedItem.postedBy._id}`}
                    className="flex items-center space-x-3"
                  >
                    <img
                      src={selectedItem.postedBy.pic}
                      alt={selectedItem.postedBy.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <span className="font-semibold text-white flex items-center">
                      {selectedItem.postedBy.name}
                      {selectedItem.postedBy.isVerified && (
                        <img
                          src="/badge/vbadge.png"
                          alt="verified"
                          className="ml-2 w-5 h-5 inline-block"
                          style={{ verticalAlign: "middle" }}
                        />
                      )}
                    </span>
                  </Link>
                  {selectedItem.postedBy._id === state._id && (
                    <button
                      onClick={() => {
                        deletePost(selectedItem._id);
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
                  src={selectedItem.photo}
                  alt={selectedItem.title}
                  className="w-full h-auto rounded-b mb-2 max-w-full max-h-[90vh] mx-auto"
                />

                {/* Post Actions */}
                <div className="px-4 py-3 border-t border-neutral-700">
                  <div className="flex items-center space-x-4">
                    {selectedItem.likes.includes(state._id) ? (
                      <motion.span
                        onClick={() => {
                          setIsJumping(true);
                          unlikePost(selectedItem._id);
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
                        onClick={() => handleLike(selectedItem._id)}
                        role="button"
                        tabIndex={0}
                        aria-label="Like post"
                        className="material-icons cursor-pointer text-gray-600"
                        style={{ fontSize: "36px" }}
                        variants={jumpVariants}
                        animate={isJumping ? "jump" : "idle"}
                        onAnimationComplete={onAnimationComplete}
                      >
                        favorite_border
                      </motion.span>
                    )}

                    <span className="text-sm text-white">
                      {selectedItem.likes.length} likes
                    </span>

                    {/* Comment Button */}
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label="Open comment box"
                      className="cursor-pointer text-white"
                      onClick={() => {
                        setOpenCommentPostId(
                          openCommentPostId === selectedItem._id
                            ? null
                            : selectedItem._id
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
                    {selectedItem.title}
                  </h6>
                  <p className="text-gray-300">{selectedItem.body}</p>

                  {/* Comments section */}
                  {openCommentPostId === selectedItem._id && (
                    <>
                      <div className="mt-3 space-y-1 max-h-48 overflow-y-auto">
                        {selectedItem.comments.map((record) => (
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
                                  deleteComment(selectedItem._id, record._id)
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
                          makeComment(e.target[0].value, selectedItem._id);
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
              // Scrollable Reels Modal Content
              <div className="h-[80vh] overflow-y-auto space-y-6">
                {reels.length === 0 && (
                  <p className="text-white text-center py-4">
                    No reels available.
                  </p>
                )}
                {reels.map((reel) => (
                  <div key={reel._id}>
                    <VideoPlayer videoUrl={reel.video} />
                    <div className="text-white p-2">
                      <Link
                        to={`/profile/${reel.postedBy?._id}`}
                        className="flex items-center space-x-2 mb-2"
                      >
                        <img
                          src={reel.postedBy?.pic || "/avatar.png"}
                          alt={reel.postedBy?.name || "User"}
                          className="w-8 h-8 rounded-full object-cover border border-white"
                        />
                        <span className="font-semibold">
                          {reel.postedBy?.name || "Unknown User"}
                        </span>
                      </Link>
                      <p className="text-sm line-clamp-2">{reel.caption}</p>
                    </div>
                  </div>
                ))}
              </div>
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

export default UserProfile;
