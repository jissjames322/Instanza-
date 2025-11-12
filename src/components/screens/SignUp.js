import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import M from "materialize-css";
import { FaFacebookSquare, LuInstagram } from "react-icons/lu";
import { FaRegImage } from "react-icons/fa";

const SignUp = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState(null);
  const [url, setUrl] = useState(undefined);

  useEffect(() => {
    if (url) {
      uploadFields();
    }
  }, [url]);
  
const uploadPic = () => {
  if (!image) return;
  const data = new FormData();
  data.append("file", image);
  data.append("upload_preset", process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);
  data.append("cloud_name", process.env.REACT_APP_CLOUDINARY_CLOUD_NAME);
  
  fetch(`https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: "post",
    body: data,
  })
      .then((res) => res.json())
      .then((data) => setUrl(data.url))
      .catch(() => {
        M.toast({ html: "Image upload failed", classes: "red darken-3" });
      });
  };

  const uploadFields = () => {
    if (
      !/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        email
      )
    ) {
      M.toast({ html: "Invalid Email", classes: "red darken-3" });
      return;
    }
    fetch("/signup", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name,username, password, email, pic: url }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          M.toast({ html: data.error, classes: "red darken-3" });
        } else {
          M.toast({ html: data.message, classes: "green darken-3" });
          navigate("/signin");
        }
      })
      .catch(() => {
        M.toast({ html: "Signup failed", classes: "red darken-3" });
      });
  };

  const PostData = () => {
    if (image) uploadPic();
    else uploadFields();
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-[#2d48bc] via-[#f24b99] to-[#fd944b] px-2 py-6">
      <div className="w-full max-w-sm flex flex-col items-center space-y-4">
        <div className="w-full bg-black rounded-xl shadow-2xl p-8 flex flex-col items-center">
          <LuInstagram size={70} color="#E1306C" />
          {/* Email Input */}
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mb-4 px-4 py-3 rounded bg-[#222] border border-gray-800 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-600"
          />
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full mb-4 px-4 py-3 rounded bg-[#222] border border-gray-800 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-600"
          />
          <input
            type="text"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-4 px-4 py-3 rounded bg-[#222] border border-gray-800 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-600"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-4 px-4 py-3 rounded bg-[#222] border border-gray-800 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-600"
          />
          {/* Hidden file input */}
          <input
            type="file"
            id="file-upload"
            onChange={(e) => setImage(e.target.files[0])}
            className="hidden"
            accept="image/*"
          />

          {/* Label that looks like a button with icon */}
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex items-center justify-center w-full mb-4 p-3 rounded border border-gray-800 text-gray-300 hover:bg-gray-700"
            title="Upload profile picture"
          >
            <i className="material-icons">insert_photo</i>
            <span className="ml-2">Upload Profile Picture</span>
          </label>
          <button
            onClick={PostData}
            className="w-full bg-blue-500 hover:bg-blue-600 transition text-white font-semibold py-2 rounded-md shadow"
          >
            Sign Up
          </button>
        </div>
        <div className="max-w-sm w-full mx-auto mt-3 bg-black rounded-xl shadow-xl text-gray-100 text-center py-4">
          Already have an account?{" "}
          <Link
            to="/signin"
            className="text-blue-400 font-semibold hover:underline"
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
