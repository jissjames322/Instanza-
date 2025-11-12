import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../App";
import { MdPhotoLibrary, MdClose } from "react-icons/md";
import Sidebar from "../common/Sidebar";
import toast from 'react-hot-toast'

const CreateStory = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
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

  const postStory = () => {
    if (!image) {
      toast("Please select an image for your story");
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
      .then((data) => {
        fetch("/createstory", {
          method: "post",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("jwt"),
          },
          body: JSON.stringify({
            mediaUrl: data.url,
          }),
        })
          .then((res) => res.json())
          .then((storyData) => {
            setLoading(false);
            if (storyData.error) {
              alert(storyData.error);
            } else {
              toast.success("Story added!");
              navigate("/");
            }
          });
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
        toast.error("Story upload failed");
      });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center text-white">
      <div className="w-64 hidden md:block">
        <Sidebar />
      </div>
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 right-4 text-white"
      >
        <MdClose size={30} />
      </button>

      <h2 className="text-2xl font-bold mb-8">Create Story</h2>

      <div className="w-full max-w-sm h-3/5 bg-neutral-900 rounded-2xl flex items-center justify-center relative overflow-hidden">
        {preview ? (
          <img
            src={preview}
            alt="Story Preview"
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="text-center text-neutral-400">
            <MdPhotoLibrary size={60} className="mx-auto" />
            <p className="mt-2">Select an image or video</p>
          </div>
        )}
      </div>

      <div className="mt-8 flex space-x-4">
        <label className="bg-neutral-700 text-white font-semibold py-2 px-5 rounded-lg cursor-pointer hover:bg-neutral-600">
          Choose File
          <input
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </label>
        <button
          onClick={postStory}
          disabled={!image || loading}
          className="bg-blue-500 text-white font-semibold py-2 px-5 rounded-lg disabled:bg-neutral-500 disabled:cursor-not-allowed hover:bg-blue-600"
        >
          {loading ? "Adding..." : "Add to Story"}
        </button>
      </div>
    </div>
  );
};

export default CreateStory;
