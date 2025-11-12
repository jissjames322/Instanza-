import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../common/Sidebar";
import { UserContext } from "../../App";
import { MdPhotoLibrary, MdClose } from "react-icons/md";
import toast from 'react-hot-toast';
import API from "../api/axios.js"

const CreatePost = () => {
  const navigate = useNavigate();
  const { state } = useContext(UserContext);
  const [body, setBody] = useState("");
  const [image, setImage] = useState(null);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  // Environment variables
  const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
  const CLOUDINARY_UPLOAD_PRESET =
    process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

  useEffect(() => {
    if (!image) {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(image);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [image]);

  useEffect(() => {
    if (url) {
      API.post("/createpost", { body, pic: url })
        .then((response) => {
          setLoading(false);
          toast.success("Posted successfully!");
          navigate("/");
        })
        .catch((err) => {
          setLoading(false);
          console.log(err);
          toast.error(err.response?.data?.error || "Failed to create post");
        });
    }
  }, [url, body, navigate]);

  const postDetails = () => {
    if (!image) {
      toast.error("Please upload an image");
      return;
    }
    setLoading(true);
    const data = new FormData();
    data.append("file", image);
    data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    data.append("cloud_name", CLOUDINARY_CLOUD_NAME);

    fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "post",
        body: data,
      }
    )
      .then((res) => res.json())
      .then((data) => setUrl(data.url))
      .catch((err) => {
        console.log(err);
        setLoading(false);
        toast.error("Image upload failed");
      });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
      <div className="w-64 hidden md:block">
        <Sidebar />
      </div>
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 right-4 text-white"
      >
        <MdClose size={30} />
      </button>
      <div className="bg-neutral-800 w-full max-w-4xl h-[75vh] rounded-2xl shadow-xl flex flex-col md:flex-row overflow-hidden">
        {/* Header for mobile */}
        <div className="md:hidden flex justify-between items-center p-3 border-b border-neutral-700">
          <h2 className="text-lg font-semibold text-white">Create New Post</h2>
          <button
            onClick={postDetails}
            disabled={loading}
            className="text-blue-500 font-semibold hover:text-blue-400 disabled:text-gray-500"
          >
            {loading ? "Sharing..." : "Share"}
          </button>
        </div>

        {/* Left Panel: Image Upload */}
        <div className="flex-1 bg-black flex items-center justify-center relative aspect-square md:aspect-auto">
          {preview ? (
            <img
              src={preview}
              alt="preview"
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-center text-white">
              <MdPhotoLibrary size={80} className="mx-auto text-neutral-500" />
              <p className="mt-4">Drag photos and videos here</p>
              <label className="mt-4 inline-block bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg cursor-pointer hover:bg-blue-600">
                Select from computer
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setImage(e.target.files[0])}
                />
              </label>
            </div>
          )}
        </div>

        {/* Right Panel: Caption and Details */}
        <div className="w-full md:w-80 lg:w-96 bg-neutral-800 text-white flex flex-col p-4">
          <div className="hidden md:flex justify-between items-center pb-3 border-b border-neutral-700">
            <h2 className="text-lg font-semibold">Create New Post</h2>
            <button
              onClick={postDetails}
              disabled={loading || !image}
              className="text-blue-500 font-semibold hover:text-blue-400 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              {loading ? "Sharing..." : "Share"}
            </button>
          </div>
          <div className="flex items-center space-x-3 my-4">
            <img
              src={state?.pic}
              alt="profile"
              className="w-9 h-9 rounded-full object-cover"
            />
            <span className="font-semibold">{state?.name}</span>
          </div>
          <textarea
            placeholder="Write a caption..."
            className="flex-1 w-full bg-transparent outline-none py-1 resize-none text-white placeholder-gray-500"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
