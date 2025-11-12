import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { UserContext } from "../../App";
// 🟢 Import your configured Axios instance
import API from "../api/axios"; // Adjust the path based on your file structure

// ⚠️ IMPORTANT: Use the same base URL as your Axios instance for the socket.
// Since your axios.js hardcodes it, we use it here directly for socket connection.
const SOCKET_SERVER_URL = "http://localhost:5000";

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { state } = useContext(UserContext);
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // --- Socket Connection Logic ---
  useEffect(() => {
    if (state && state.token && state._id) {
      const newSocket = io(SOCKET_SERVER_URL, {
        auth: {
          token: state.token,
        },
      });

      setSocket(newSocket);

      // 1. Initial Socket Setup
      newSocket.on("connect", () => {
        console.log("Socket connected, ID:", newSocket.id);
        newSocket.emit("addUser", state._id);
      });

      // 2. Real-time Notification Listener
      newSocket.on("receiveNotification", (newNotification) => {
        console.log("Received new notification:", newNotification);
        setNotifications((prev) => [newNotification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });

      // 3. Clean up on disconnect/unmount
      newSocket.on("disconnect", () => {
        console.log("Socket disconnected");
      });

      return () => newSocket.close();
    } else {
      // Clean up on logout
      if (socket) {
        socket.close();
        setSocket(null);
      }
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [state?._id, state?.token]);

  // --- API Request Functions using Axios ---

  // Note: Since API.interceptors.request is configured to attach the JWT token,
  // we do not need to manually pass headers or check localStorage for 'jwt' here.

  // Function to fetch initial notifications and count
  const fetchNotifications = async () => {
    // Check is redundant but kept for safety/readability if API is not available
    if (!API) return;

    try {
      // 🟢 Replaced fetch with API.get
      const res = await API.get("/api/notifications");

      const fetchedNotifications = res.data.notifications || [];
      setNotifications(fetchedNotifications);
      setUnreadCount(fetchedNotifications.filter((n) => !n.read).length);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  // Function to mark a single notification as read
  const markNotificationAsRead = async (id) => {
    if (!API) return;

    try {
      // 🟢 Replaced fetch with API.put. Pass null as data for an empty body.
      await API.put(`/api/notifications/${id}/read`, null);

      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  // Function to mark ALL notifications as read
  const markAllAsRead = async () => {
    if (!API) return;

    try {
      // 🟢 Replaced fetch with API.put. Pass null as data for an empty body.
      await API.put(`/api/notifications/read/all`, null);

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        notifications,
        unreadCount,
        fetchNotifications,
        markNotificationAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
