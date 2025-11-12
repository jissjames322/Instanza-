import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../App";
import { Link } from "react-router-dom";
import { Theme } from "../common/theme.js";

const Home = () => {
  const [data, setData] = useState([]);
  const { state } = useContext(UserContext);

  useEffect(() => {
    fetch("/followerspost", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
    })
      .then((res) => res.json())
      .then((result) => setData(result.posts));
  }, []);

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

  const deletePost = (postId) => {
    fetch(`/deletepost/${postId}`, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
    })
      .then((res) => res.json())
      .then((result) => {
        const newData = data.filter((item) => item._id !== result._id);
        setData(newData);
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="home bg-gray-100 min-h-screen flex flex-col items-center py-6">
      {data.map((item) => (
        <div
          key={item._id}
          className="bg-white border rounded-lg shadow-sm w-full max-w-md mb-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3">
            <Link
              to={
                item.postedBy._id !== state._id
                  ? "/profile/" + item.postedBy._id
                  : "/profile/"
              }
              className="flex items-center space-x-2"
            >
              <img
                src={item.postedBy.pic}
                alt="profile"
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="font-semibold">{item.postedBy.name}</span>
            </Link>
            {item.postedBy._id === state._id && (
              <button onClick={() => deletePost(item._id)}>
                <i className="material-icons text-gray-500">more_vert</i>
              </button>
            )}
          </div>

          {/* Post Image */}
          <div className="w-full">
            <img src={item.photo} alt="" className="w-full object-cover" />
          </div>

          {/* Actions */}
          <div className="flex items-center px-4 py-2 space-x-4">
            {item.likes.includes(state._id) ? (
              <i
                className="material-icons text-red-500 cursor-pointer"
                onClick={() => unlikePost(item._id)}
              >
                favorite
              </i>
            ) : (
              <i
                className="material-icons cursor-pointer"
                onClick={() => likePost(item._id)}
              >
                favorite_border
              </i>
            )}
            <i className="material-icons cursor-pointer">chat_bubble_outline</i>
            <i className="material-icons cursor-pointer">send</i>
          </div>

          {/* Likes */}
          <div className="px-4">
            <p className="font-semibold">{item.likes.length} likes</p>
          </div>

          {/* Caption */}
          <div className="px-4 py-1">
            <span className="font-semibold">{item.postedBy.name} </span>
            {item.title}
          </div>
          <div className="px-4 text-gray-700 text-sm">{item.body}</div>

          {/* Comments */}
          <div className="px-4 py-2 text-sm">
            {item.comments.length > 2 && (
              <p className="text-gray-500 cursor-pointer">
                View all {item.comments.length} comments
              </p>
            )}
            {item.comments.slice(-2).map((record) => (
              <div key={record._id} className="flex justify-between">
                <p>
                  <span className="font-semibold">{record.postedBy.name}</span>{" "}
                  {record.text}
                </p>
                {record.postedBy._id === state._id && (
                  <i
                    className="material-icons text-gray-400 cursor-pointer hover:text-red-500"
                    onClick={() => deleteComment(item._id, record._id)}
                  >
                    delete
                  </i>
                )}
              </div>
            ))}
          </div>

          {/* Comment Box */}
          <form
            className="border-t flex items-center px-4 py-2"
            onSubmit={(e) => {
              e.preventDefault();
              makeComment(e.target[0].value, item._id);
              e.target[0].value = "";
            }}
          >
            <input
              type="text"
              placeholder="Add a comment..."
              className="flex-1 border-none focus:ring-0 text-sm"
            />
            <button
              type="submit"
              className="text-blue-500 text-sm font-semibold"
            >
              Post
            </button>
          </form>
        </div>
      ))}
    </div>
  );
};

export default Home;
