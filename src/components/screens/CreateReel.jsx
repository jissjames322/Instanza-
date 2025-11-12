import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../App";
import { MdMovie, MdClose } from "react-icons/md";
import Sidebar from "../common/Sidebar";
import API from "../api/axios"; // Make sure this path is correct
import toast from 'react-hot-toast'

const CreateReel = () => {
  const navigate = useNavigate();
  const { state } = useContext(UserContext);
  const [caption, setCaption] = useState("");
  const [video, setVideo] = useState(null);
  const [url, setUrl] = useState(""); // Set after successful Cloudinary upload
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [cloudErr, setCloudErr] = useState(""); // Cloudinary errors

  // Environment variables
  const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
  const CLOUDINARY_UPLOAD_PRESET =
    process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

  useEffect(() => {
    if (!video) {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(video);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [video]);

  useEffect(() => {
    if (!url || typeof url !== "string" || !/^https?:\/\//.test(url)) return;
    setLoading(true);

    API.post("/createreel", {
      caption,
      video: url,
    })
      .then((res) => {
        setLoading(false);
        const data = res.data;
        if (data.error) {
          alert(data.error);
        } else {
          toast.success("Reel posted successfully!");
          setCaption("");
          setVideo(null);
          setUrl("");
          setPreview(null);
          navigate("/reels");
        }
      })
      .catch((err) => {
        setLoading(false);
        toast.error(
          err?.response?.data?.error ||
            "Reel creation failed. Please try again."
        );
      });
  }, [url, caption, navigate]);

  const postDetails = () => {
    if (!video) {
      toast.error("Please upload a video");
      return;
    }
    setLoading(true);
    setCloudErr("");
    const data = new FormData();
    data.append("file", video);
    data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    data.append("cloud_name", CLOUDINARY_CLOUD_NAME);

    fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
      {
        method: "post",
        body: data,
      }
    )
      .then((res) => res.json())
      .then((data) => {
        const videoUrl = data.secure_url || data.url;
        if (!videoUrl) {
          setLoading(false);
          setCloudErr("Video upload failed, please try again.");
          toast.error("Video upload failed, please try another video.");
          return;
        }
        setUrl(videoUrl);
      })
      .catch((err) => {
        setLoading(false);
        setCloudErr("Network error uploading video.");
        toast.error("Network error uploading video.");
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
        {/* Left Panel: Video Upload */}
        <div className="flex-1 bg-black flex items-center justify-center relative aspect-square md:aspect-auto">
          {preview ? (
            <video
              src={preview}
              controls
              autoPlay
              loop
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-center text-white">
              <MdMovie size={80} className="mx-auto text-neutral-500" />
              <p className="mt-4">Upload a video for your Reel</p>
              <label className="mt-4 inline-block bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg cursor-pointer hover:bg-blue-600">
                Select from computer
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => {
                    if (
                      e.target.files &&
                      e.target.files.length > 0 &&
                      e.target.files[0].type.includes("video")
                    ) {
                      setVideo(e.target.files[0]);
                      setCloudErr("");
                    } else {
                      setCloudErr("Please select a valid video file.");
                    }
                  }}
                />
              </label>
              {cloudErr && <p className="text-red-500 mt-3">{cloudErr}</p>}
            </div>
          )}
        </div>
        {/* Right Panel: Caption and Details */}
        <div className="w-full md:w-80 lg:w-96 bg-neutral-800 text-white flex flex-col p-4">
          <div className="flex justify-between items-center pb-3 border-b border-neutral-700">
            <h2 className="text-lg font-semibold">Create New Reel</h2>
            <button
              onClick={postDetails}
              disabled={loading || !video}
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
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default CreateReel;
