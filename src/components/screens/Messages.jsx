import React, { useEffect, useState, useContext, useRef } from "react";
import { UserContext } from "../../App";
import { io } from "socket.io-client";
import API from "../api/axios";
import Sidebar from "../common/Sidebar";

export default function Messages() {
  const { state: user } = useContext(UserContext);
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const scrollRef = useRef();
  const [followingUsers, setFollowingUsers] = useState([]);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);

  // Auto-refresh conversations and messages
  useEffect(() => {
    if (!user?._id) return;

    // Refresh conversations every 5 seconds
    const interval = setInterval(() => {
      fetchConversations();
      if (currentChat) {
        fetchMessages();
      }
    }, 5000);

    setRefreshInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user, currentChat]);

  useEffect(() => {
    if (!user?._id) return;
    const newSocket = io("http://localhost:5000", {
      auth: { token: localStorage.getItem("jwt") },
    });
    setSocket(newSocket);
    newSocket.emit("addUser", user._id);

 newSocket.on("getMessage", (data) => {
   if (currentChat?.members.some((m) => m._id === data.senderId)) {
     setMessages((prev) => {
       // Check if message already exists to prevent duplicates
       const messageExists = prev.some(
         (msg) =>
           msg._id === data._id ||
           (msg.sender === data.senderId &&
             msg.text === data.text &&
             msg.createdAt === data.createdAt)
       );

       if (messageExists) {
         return prev; // Don't add duplicate
       }

       return [
         ...prev,
         {
           ...data,
           sender: data.senderId,
           createdAt: Date.now(),
           isEncrypted: true,
         },
       ];
     });
   }
 });

    // Listen for new conversation creation
    newSocket.on("newConversation", () => {
      fetchConversations();
    });

    return () => {
      newSocket.disconnect();
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [user, currentChat]);

  const fetchConversations = async () => {
    try {
      const res = await API.get("/api/conversations");
      setConversations(res.data);
    } catch (err) {
      console.error("Error fetching conversations:", err);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await API.get(`/api/messages/${currentChat._id}`);
      setMessages(res.data);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  useEffect(() => {
    if (!user?._id) return;
    fetchConversations();
  }, [user]);

  useEffect(() => {
    if (!currentChat) return;
    fetchMessages();
  }, [currentChat]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!user?._id) return;
    const fetchFollowing = async () => {
      try {
        const res = await API.get("/users/following");
        setFollowingUsers(res.data.following || []);
      } catch (err) {
        console.error("Error fetching following users:", err);
      }
    };
    fetchFollowing();
  }, [user]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const message = {
      conversationId: currentChat._id,
      sender: user._id,
      text: newMessage,
    };
    try {
      const res = await API.post("/api/messages", message);
      setMessages((prev) => [...prev, { ...res.data, isEncrypted: true }]);
      setNewMessage("");

      // Refresh conversations to update last message
      fetchConversations();

      // const receiverId = currentChat.members.find(
      //   (m) => m._id !== user._id
      // )._id;
      // socket.emit("sendMessage", {
      //   senderId: user._id,
      //   receiverId,
      //   text: newMessage,
      //   conversationId: currentChat._id,
      // });
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleClickFollowingUser = async (followedUser) => {
    const existingConv = conversations.find(
      (conv) =>
        conv.members.length === 2 &&
        conv.members.some((m) => m._id === followedUser._id) &&
        conv.members.some((m) => m._id === user._id)
    );
    if (existingConv) {
      setCurrentChat(existingConv);
    } else {
      try {
        const res = await API.post("/api/conversations", {
          receiverId: followedUser._id,
        });
        setConversations((prev) => [...prev, res.data]);
        setCurrentChat(res.data);

        // Notify other user via socket
        socket.emit("newConversation", {
          receiverId: followedUser._id,
        });
      } catch (error) {
        console.error("Error creating conversation:", error);
      }
    }
  };

  const handleSetCurrentChat = (conv) => {
    setCurrentChat(conv);
    if (window.innerWidth < 768) {
      setIsChatModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsChatModalOpen(false);
    setCurrentChat(null);
  };

  const getOtherUser = (conversation) => {
    return conversation.members?.find((m) => m._id !== user._id);
  };

  // Manual refresh function
  const handleManualRefresh = () => {
    fetchConversations();
    if (currentChat) {
      fetchMessages();
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-black text-white">
      <Sidebar />
      <div className="flex-1 md:ml-64 flex flex-col h-screen">
        <div className="flex flex-1 h-full border border-gray-800">
          {/* Conversations + Following list */}
          <div
            className={`w-full md:w-96 border-r border-gray-800 flex flex-col h-full ${
              isChatModalOpen ? "hidden" : "block"
            }`}
          >
            {/* Header with refresh button */}
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-xl">{user?.username}</h2>
                <div className="flex space-x-4">
                  <button
                    onClick={handleManualRefresh}
                    className="hover:text-blue-400 transition-colors"
                    title="Refresh messages"
                  >
                    <i className="material-icons">refresh</i>
                  </button>
                  <button className="text-xl">📷</button>
                  <button className="text-xl">✏️</button>
                </div>
              </div>
            </div>

            {/* Following list */}
            <div className="border-b border-gray-800">
              <div className="p-4">
                <h3 className="font-semibold mb-3">Following</h3>
                <div className="flex space-x-4 overflow-x-auto pb-2">
                  {followingUsers.length === 0 ? (
                    <p className="text-gray-500 text-sm">No following users.</p>
                  ) : (
                    followingUsers.map((f) => (
                      <div
                        key={f._id}
                        className="flex flex-col items-center cursor-pointer"
                        onClick={() => {
                          handleClickFollowingUser(f);
                          if (window.innerWidth < 768) setIsChatModalOpen(true);
                        }}
                      >
                        <div className="w-14 h-14 rounded-full border-2 border-pink-500 p-0.5 mb-1">
                          <img
                            src={f.pic || "/default-avatar.png"}
                            alt={f.username}
                            className="w-full h-full rounded-full object-cover"
                          />
                        </div>
                        <span className="text-xs truncate w-14 text-center">
                          {f.username}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Conversations list */}
            <div className="flex-1 overflow-y-auto">
              {conversations.map((c) => {
                const otherUser = getOtherUser(c);
                if (!otherUser) return null;
                return (
                  <div
                    key={c._id}
                    className={`flex items-center p-4 cursor-pointer border-b border-gray-800 hover:bg-gray-900 ${
                      currentChat?._id === c._id ? "bg-gray-900" : ""
                    }`}
                    onClick={() => handleSetCurrentChat(c)}
                  >
                    <div className="w-14 h-14 rounded-full overflow-hidden mr-3">
                      <img
                        src={otherUser.pic || "/default-avatar.png"}
                        alt="avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="font-semibold text-sm">
                          {otherUser.username}
                        </p>
                        <span className="text-xs text-gray-400">
                          {c.lastMessageAt
                            ? new Date(c.lastMessageAt).toLocaleDateString()
                            : ""}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 truncate">
                        {c.lastMessage === "🔒 Encrypted message" ? (
                          <span className="flex items-center">
                            <span className="mr-1 text-xs">🔒</span>
                            <span>Encrypted message</span>
                          </span>
                        ) : (
                          c.lastMessage || "No messages yet"
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chat window on medium+ screens */}
          <main className="hidden md:flex flex-1 flex-col">
            {!currentChat ? (
              <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <div className="w-24 h-24 border-2 border-white rounded-full flex items-center justify-center mb-6">
                  <span className="text-3xl">✉️</span>
                </div>
                <h2 className="text-2xl font-light mb-2">Your Messages</h2>
                <p className="text-gray-400 mb-6">
                  Send private messages to a friend or group.
                </p>
                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold">
                  Send Message
                </button>
              </div>
            ) : (
              <>
                {/* Chat Header with refresh */}
                <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
                      <img
                        src={
                          getOtherUser(currentChat)?.pic ||
                          "/default-avatar.png"
                        }
                        alt="avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold">
                        {getOtherUser(currentChat)?.username}
                      </p>
                      <div className="flex items-center text-xs text-gray-400">
                        <span className="mr-1 text-green-500">🔒</span>
                        <span>End-to-end encrypted</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleManualRefresh}
                      className="hover:text-blue-400 transition-colors"
                      title="Refresh messages"
                    >
                      <i className="material-icons">refresh</i>
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 bg-black">
                  {messages.map((msg) => (
                    <div
                      key={msg._id || msg.createdAt}
                      ref={scrollRef}
                      className={`flex mb-4 ${
                        // Fix the comparison - handle both object and string IDs
                        msg.sender._id === user._id || msg.sender === user._id
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div className="max-w-xs">
                        <div
                          className={`p-3 rounded-2xl ${
                            msg.sender._id === user._id ||
                            msg.sender === user._id
                              ? "bg-blue-500 text-white rounded-br-none"
                              : "bg-gray-800 text-white rounded-bl-none"
                          }`}
                        >
                          {msg.text}
                        </div>
                        {msg.isEncrypted && (
                          <div
                            className={`text-xs text-gray-500 mt-1 flex items-center ${
                              msg.sender._id === user._id ||
                              msg.sender === user._id
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          ></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <form
                  onSubmit={handleSend}
                  className="p-4 border-t border-gray-800 bg-black"
                >
                  <div className="flex items-center">
                    <button
                      type="button"
                      className="text-xl mr-3 text-gray-400 hover:text-white"
                    >
                      😃
                    </button>
                    <button
                      type="button"
                      className="text-xl mr-3 text-gray-400 hover:text-white"
                    >
                      <i className="material-icons">camera_alt</i>
                    </button>
                    <button
                      type="button"
                      className="text-xl mr-3 text-gray-400 hover:text-white"
                    >
                      <i className="material-icons">keyboard_voice</i>
                    </button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Message..."
                      className="flex-1 p-2 bg-gray-800 rounded-lg outline-none border-none text-white placeholder-gray-400"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className={`ml-2 px-4 py-2 rounded-lg font-semibold ${
                        newMessage.trim()
                          ? "bg-blue-500 text-white hover:bg-blue-600"
                          : "bg-blue-900 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      Send
                    </button>
                  </div>
                </form>
              </>
            )}
          </main>
        </div>

        {/* Chat modal for small screens */}
        {isChatModalOpen && window.innerWidth < 768 && currentChat && (
          <div className="fixed inset-0 z-50 bg-black flex flex-col">
            {/* Header */}
            <header className="p-4 border-b border-gray-800 flex items-center justify-between bg-black">
              <div className="flex items-center">
                <button
                  onClick={handleCloseModal}
                  className="mr-4 text-white text-xl"
                  aria-label="Close chat"
                >
                  ←
                </button>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                    <img
                      src={
                        getOtherUser(currentChat)?.pic || "/default-avatar.png"
                      }
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="font-semibold">
                      {getOtherUser(currentChat)?.username}
                    </h2>
                    <div className="flex items-center text-xs text-gray-400">
                      <span className="mr-1 text-green-500">🔒</span>
                      <span>End-to-end encrypted</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleManualRefresh}
                  className="text-xl text-gray-300 hover:text-white"
                  title="Refresh messages"
                >
                  🔄
                </button>
                <button className="text-xl text-gray-300 hover:text-white">
                  ℹ️
                </button>
              </div>
            </header>

            {/* Messages */}
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-black">
              {messages.map((msg) => (
                <div
                  key={msg._id || msg.createdAt}
                  ref={scrollRef}
                  className={`flex mb-4 ${
                    msg.sender._id === user._id || msg.sender === user._id
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div className="max-w-xs">
                    <div
                      className={`p-3 rounded-2xl ${
                        msg.sender._id === user._id || msg.sender === user._id
                          ? "bg-blue-500 text-white rounded-br-none"
                          : "bg-gray-800 text-white rounded-bl-none"
                      }`}
                    >
                      {msg.text}
                    </div>
                    {msg.isEncrypted && (
                      <div
                        className={`text-xs text-gray-500 mt-1 flex items-center ${
                          msg.sender._id === user._id || msg.sender === user._id
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                       
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <form
              onSubmit={handleSend}
              className="p-4 border-t border-gray-800 bg-black"
            >
              <div className="flex items-center">
                <button
                  type="button"
                  className="text-xl mr-3 text-gray-400 hover:text-white"
                >
                  😊
                </button>
                <button
                  type="button"
                  className="text-xl mr-3 text-gray-400 hover:text-white"
                >
                  📷
                </button>
                <button
                  type="button"
                  className="text-xl mr-3 text-gray-400 hover:text-white"
                >
                  🎤
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Message..."
                  className="flex-1 p-2 bg-gray-800 rounded-lg outline-none border-none text-white placeholder-gray-400"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className={`ml-2 px-4 py-2 rounded-lg font-semibold ${
                    newMessage.trim()
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : "bg-blue-900 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
