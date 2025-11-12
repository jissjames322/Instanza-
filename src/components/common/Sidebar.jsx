// src/components/common/Sidebar.js

import React, { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../../App";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdSearch,
  MdOndemandVideo,
  MdFavoriteBorder,
  MdAccountCircle,
  MdOutlineExplore,
  MdMovie,
  MdPhotoLibrary,
  MdClose,
} from "react-icons/md";
import { FaFacebookMessenger } from "react-icons/fa";
import { CgAddR } from "react-icons/cg";
import { GoHomeFill } from "react-icons/go";
import { BsPostcard } from "react-icons/bs";
import { useSocket } from "../socket/SocketContext"; // New Import
import NotificationPanel from "./NotificationPanel"; // New Import
import toast from "react-hot-toast";
const CreateModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  };

  const menuItems = [
    {
      label: "Create Post",
      icon: <BsPostcard size={22} />,
      path: "/createpost",
    },
    {
      label: "Create Story",
      icon: <MdPhotoLibrary size={22} />,
      path: "/create-story",
    },
    { label: "Create Reel", icon: <MdMovie size={22} />, path: "/create-reel" },
  ];

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="bg-neutral-800 rounded-2xl w-full max-w-sm m-4 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center p-4 border-b border-neutral-700 relative">
          <h3 className="font-semibold text-white">Create</h3>
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-400 hover:text-white"
          >
            <MdClose size={24} />
          </button>
        </div>
        <div className="flex flex-col">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                navigate(item.path);
                onClose();
              }}
              className="flex items-center justify-between p-4 text-left text-white hover:bg-neutral-700 transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                ></path>
              </svg>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state, dispatch } = useContext(UserContext);
  const { unreadCount, notifications, markNotificationRead, markAllRead } =
    useSocket();

  const [searchPanelOpen, setSearchPanelOpen] = useState(false);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [userDetails, setUserDetails] = useState([]);
  const [notifPanelOpen, setNotifPanelOpen] = useState(false); // Notification Panel State

  const isActive = (path) => location.pathname === path;
  const toggleNotifications = () => {
    setNotifPanelOpen((prev) => !prev);
    setSearchPanelOpen(false);
    // Optional: markAllRead(); // mark all read on panel open or manual button inside panel
  };
  const fetchUsers = (query) => {
    setSearch(query);
    if (!query.trim()) {
      setUserDetails([]);
      return;
    }
    fetch("/search-users", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    })
      .then((res) => res.json())
      .then((results) => {
        setUserDetails(results.users || []);
      });
  };

  const navLinksDesktop = [
    { path: "/", label: "Home", icon: <GoHomeFill size={24} /> },
    ...(state?.isAdmin
      ? [
          {
            path: "/admin/dashboard",
            label: "Admin",
            icon: <MdAccountCircle size={24} className="text-yellow-400" />,
          },
        ]
      : []),
    {
      path: "/search",
      label: "Search",
      icon: <MdSearch size={24} />,
      action: () => {
        setSearchPanelOpen((prev) => !prev);
        setNotifPanelOpen(false); // Close notification panel
      },
    },
    { path: "/reels", label: "Reels", icon: <MdOndemandVideo size={24} /> },
    {
      path: "/messages",
      label: "Messages",
      icon: <FaFacebookMessenger size={24} />,
    },
    {
      path: "/notifications",
      label: "Notifications",
      icon: (
        <div className="relative">
          <MdFavoriteBorder size={24} />
          {unreadCount > 0 && (
            <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-black" />
          )}
        </div>
      ),
      action: () => {
        setNotifPanelOpen((prev) => !prev);
        setSearchPanelOpen(false); // Close search panel
      },
    },
    {
      path: "/create",
      label: "Create",
      icon: <CgAddR size={24} />,
      action: () => {
        setCreateModalOpen(true);
        setSearchPanelOpen(false); // Close panels
        setNotifPanelOpen(false);
      },
    },
    {
      path: "/profile",
      label: "Profile",
      icon: state ? (
        <img
          src={state.pic}
          alt="profile"
          className="w-6 h-6 rounded-full object-cover"
        />
      ) : (
        <MdAccountCircle size={24} />
      ),
    },
  ];

  const handleLogout = () => {
    localStorage.clear();
    dispatch({ type: "CLEAR" });
    navigate("/signin");
  };

  return (
    <>
      <AnimatePresence>
        <CreateModal
          isOpen={isCreateModalOpen}
          onClose={() => setCreateModalOpen(false)}
        />
      </AnimatePresence>

      {/* Overlay to close panels */}
      {(searchPanelOpen || notifPanelOpen) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            setSearchPanelOpen(false);
            setNotifPanelOpen(false);
          }}
        />
      )}

      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-black border-r border-neutral-800 fixed top-0 left-0 h-screen text-white p-4 z-50 transition-all duration-300 ${
          searchPanelOpen || notifPanelOpen ? "w-20" : "w-64"
        }`}
      >
        <h1
          className={`text-2xl font-bold font-instagramHeadline mb-8 px-3 overflow-hidden ${
            searchPanelOpen || notifPanelOpen
              ? "opacity-0 w-0"
              : "opacity-100 w-auto"
          } transition-opacity duration-300`}
        >
          Instanza
        </h1>

        <nav className="flex flex-col space-y-2 flex-1 bg-black">
          {navLinksDesktop.map(({ path, label, icon, action }) => {
            if (label === "Notifications") {
              return (
                <button
                  key={label}
                  onClick={toggleNotifications}
                  className="w-full text-left"
                >
                  <div className="relative flex items-center space-x-4 p-3 rounded-lg hover:bg-neutral-900 transition-colors duration-200">
                    {icon}
                    <span
                      className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${
                        notifPanelOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
                      }`}
                    >
                      {label}
                    </span>
                    {unreadCount > 0 && (
                      <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse border border-black" />
                    )}
                  </div>
                </button>
              );
            }
            const content = (
              <div
                className={`flex items-center space-x-4 p-3 rounded-lg hover:bg-neutral-900 transition-colors duration-200 ${
                  isActive(path) && !action ? "font-bold bg-neutral-900" : ""
                }`}
              >
                <div className="flex-shrink-0">{icon}</div>{" "}
                <span
                  className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${
                    searchPanelOpen || notifPanelOpen
                      ? "opacity-0 w-0"
                      : "opacity-100 w-auto"
                  }`}
                >
                  {label}
                </span>
              </div>
            );

            return action ? (
              <button key={label} onClick={action} className="w-full text-left">
                {content}
              </button>
            ) : (
              <Link key={path} to={path}>
                {content}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto">
          <button
            onClick={() => {
              navigate("/more");
            }}
            className="flex items-center space-x-4 p-3 rounded-lg hover:bg-neutral-900 w-full text-left"
          >
            <MdOutlineExplore size={24} />
            <span
              className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${
                searchPanelOpen || notifPanelOpen
                  ? "opacity-0 w-0"
                  : "opacity-100 w-auto"
              }`}
            >
              More
            </span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-4 p-3 rounded-lg hover:bg-neutral-900 w-full text-left"
          >
            <MdAccountCircle size={24} />
            <span
              className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${
                searchPanelOpen || notifPanelOpen
                  ? "opacity-0 w-0"
                  : "opacity-100 w-auto"
              }`}
            >
              Log out
            </span>
          </button>
        </div>
      </aside>

      {/* Search Slide-in Panel */}
      <AnimatePresence>
        {searchPanelOpen && (
          <motion.div
            initial={{ x: -400 }}
            animate={{ x: 0 }}
            exit={{ x: -400 }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed z-40 top-0 left-20 bg-black border-r border-neutral-800 flex flex-col h-full w-96 rounded-r-2xl search-panel"
          >
            <div className="p-6 pb-4 border-b border-neutral-700">
              <h2 className="mb-6 text-2xl font-bold text-white">Search</h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full py-2 px-4 rounded-lg bg-neutral-700 text-white focus:outline-none placeholder-gray-400"
                  value={search}
                  autoFocus
                  onChange={(e) => fetchUsers(e.target.value)}
                />
                {search && (
                  <MdClose
                    onClick={() => fetchUsers("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-white"
                  />
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-2 pt-4">
              {userDetails.length > 0 ? (
                <ul>
                  {userDetails.map((user) => (
                    <Link
                      key={user._id}
                      to={
                        user._id !== state?._id
                          ? `/profile/${user._id}`
                          : "/profile"
                      }
                      onClick={() => {
                        setSearch("");
                        setSearchPanelOpen(false);
                      }}
                      className="block"
                    >
                      <li className="flex items-center py-2 px-3 hover:bg-neutral-800 rounded-md cursor-pointer text-white">
                        <img
                          src={user.pic}
                          alt={user.name}
                          className="w-11 h-11 rounded-full object-cover mr-4"
                        />
                        <div>
                          <div className="font-semibold">{user.name}</div>
                          <div className="text-gray-400 text-sm">
                            {user.email}
                          </div>
                        </div>
                      </li>
                    </Link>
                  ))}
                </ul>
              ) : (
                <div className="text-center text-gray-500 pt-10">
                  {search ? "No users found." : "Search for users."}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {notifPanelOpen && (
          <NotificationPanel
            leftOffset={searchPanelOpen || notifPanelOpen ? "w-20" : "w-64"} // or pixel values
            isOpen={notifPanelOpen}
            onClose={() => setNotifPanelOpen(false)}
            notifications={notifications}
            markNotificationRead={markNotificationRead}
            markAllRead={markAllRead}
          />
        )}
      </AnimatePresence>

      {/* Mobile Top Bar */}
      <div className="fixed top-0 left-0 right-0 bg-black border-b border-neutral-800 flex items-center justify-between px-4 h-14 text-white md:hidden z-[9999]">
        <h1 className="text-2xl font-instagramHeadline font-bold tracking-tight select-none">
          Instanza
        </h1>
        <div className="flex items-center space-x-4">
          <Link to="/notification">
            <MdFavoriteBorder
              size={26}
              className="text-neutral-400 hover:text-white transition-colors duration-200"
            />
          </Link>
          <Link to="/messages">
            <FaFacebookMessenger
              size={26}
              className="text-neutral-400 hover:text-white transition-colors duration-200"
            />
          </Link>
        </div>
      </div>

      {/* Mobile Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-neutral-800 flex justify-around items-center h-14 text-white md:hidden z-50">
        <Link to="/">
          <GoHomeFill
            size={24}
            className={isActive("/") ? "text-white" : "text-neutral-400"}
          />
        </Link>
        <button onClick={() => toast.success("Mobile search coming soon!")}>
          <MdSearch size={26} className="text-neutral-400" />
        </button>
        <button onClick={() => setCreateModalOpen(true)}>
          <CgAddR size={24} className="text-neutral-400" />
        </button>
        <Link to="/reels">
          <MdOndemandVideo
            size={24}
            className={isActive("/reels") ? "text-white" : "text-neutral-400"}
          />
        </Link>
        <Link to="/profile">
          {state ? (
            <img
              src={state.pic}
              alt="profile"
              className={`w-7 h-7 rounded-full object-cover ${
                isActive("/profile") ? "border-2 border-white" : ""
              }`}
            />
          ) : (
            <MdAccountCircle size={24} />
          )}
        </Link>
      </nav>
    </>
  );
};

export default Sidebar;
