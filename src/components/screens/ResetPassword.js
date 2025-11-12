import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import M from "materialize-css";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [password, setPassword] = useState("");

  const PostData = () => {
    fetch("/new-password", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          M.toast({ html: data.error, classes: "red darken-3" });
        } else {
          M.toast({ html: data.message, classes: "green darken-1" });
          navigate("/signin");
        }
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white w-full max-w-sm p-8 rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold mb-6 font-sans">Instanza</h1>

        <input
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={PostData}
          className="w-full bg-blue-500 text-white py-2 rounded-md font-semibold hover:bg-blue-600 transition"
        >
          Update Password
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;
