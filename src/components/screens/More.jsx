import React, { useContext, useState } from "react";
import { UserContext } from "../../App";
import { useNavigate } from "react-router-dom";
import { MdLogout, MdArrowBack } from "react-icons/md";
import Sidebar from "../common/Sidebar"; // adjust path as needed

const More = () => {
  const { state, dispatch } = useContext(UserContext);
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState({
    username: state?.username || "",
    name: state?.name || "",
    email: state?.email || "",
  });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/edit", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("jwt"),
        },
        body: JSON.stringify(userInfo),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update user info");
        setLoading(false);
        return;
      }

      dispatch({ type: "UPDATE_USER", payload: data.user });
      setEditMode(false);
    } catch (err) {
      setError("Server error: Unable to update user info");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    dispatch({ type: "CLEAR" });
    navigate("/signin");
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-black text-white">
      {/* Sidebar area - fixed width on md+ */}
      <div className="hidden md:block w-60 border-r border-neutral-800">
        <Sidebar />
      </div>

      {/* Main content area */}
      <main className="flex-1 flex flex-col items-center justify-start p-6 md:p-12">
        <div className="flex w-full max-w-lg flex-col">
          {/* Back button */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center space-x-1 text-cyan-600 hover:text-blue-300 mb-6 focus:outline-none self-start"
            aria-label="Go back home"
            type="button"
          >
            <MdArrowBack size={24} />
            <span className="font-semibold">Back to Home</span>
          </button>

          <h2 className="text-3xl font-bold mb-6 text-center w-full">
            Account Settings
          </h2>

          <div className="bg-neutral-900 rounded-lg p-6 shadow-md w-full">
            {error && (
              <div className="mb-4 text-red-500 text-center font-semibold">
                {error}
              </div>
            )}
            <div className="mb-4">
              <label className="block text-gray-300 mb-1" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                disabled={!editMode || loading}
                value={userInfo.username}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded-md bg-neutral-800 text-white placeholder-gray-400 focus:outline-none ${
                  editMode
                    ? "border border-pink-600"
                    : "border border-transparent"
                }`}
                placeholder="Enter username"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-300 mb-1" htmlFor="name">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                disabled={!editMode || loading}
                value={userInfo.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded-md bg-neutral-800 text-white placeholder-gray-400 focus:outline-none ${
                  editMode
                    ? "border border-pink-600"
                    : "border border-transparent"
                }`}
                placeholder="Enter full name"
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-300 mb-1" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                disabled={!editMode || loading}
                value={userInfo.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded-md bg-neutral-800 text-white placeholder-gray-400 focus:outline-none ${
                  editMode
                    ? "border border-pink-600"
                    : "border border-transparent"
                }`}
                placeholder="Enter email"
              />
            </div>

            {editMode ? (
              <div className="flex space-x-4 justify-center">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 focus:outline-none disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => {
                    setEditMode(false);
                    setUserInfo({
                      username: state?.username || "",
                      name: state?.name || "",
                      email: state?.email || "",
                    });
                    setError("");
                  }}
                  disabled={loading}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex justify-center">
                <button
                  onClick={() => setEditMode(true)}
                  className="bg-pink-600 text-white px-6 py-2 rounded-md hover:bg-pink-700 focus:outline-none"
                >
                  Edit Info
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="mt-10 flex items-center justify-center space-x-2 text-red-500 hover:text-red-600 border border-red-500 hover:border-red-600 px-6 py-3 rounded-md mx-auto transition-colors duration-200 focus:outline-none max-w-xs w-full"
            aria-label="Logout"
          >
            <MdLogout size={24} />
            <span className="font-semibold">Logout</span>
          </button>

          <div className="mt-10 bg-neutral-900 rounded-lg p-6 shadow-md w-full text-center">
            <h3 className="text-xl font-semibold mb-4">Change Theme</h3>
            <div className="flex justify-center space-x-4">
              <button className="px-4 py-2 rounded-md">Dark</button>
              <button className="px-4 py-2 rounded-md">Light</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default More;
