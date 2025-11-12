import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// NOTE: Ensure this path is correct in your project setup
import chatDatasetCSV from "./ChatMon.txt";
const BOT_NAME = "Insta Mon";
// NOTE: BOT_AVATAR is assumed to be available at this path
const BOT_AVATAR = "/AI/chatmon.jpg";


/**
 * Utility to parse the CSV text into a structured dataset.
 */
function parseDataset(csvText) {
  const lines = csvText.trim().split("\n");
  // Remove header if present
  const [header, ...rows] = lines[0].toLowerCase().includes("question")
    ? lines
    : ["", ...lines];

  return rows
    .map((row) => {
      // Handling commas inside the response field
      const match =
        row.match(/^"?(.*?)"?,"(.*)"$/) || row.match(/^"?(.*?)"?,(.*?)$/);
      if (!match) {
        // Fallback for simple comma separation without quotes
        const [question, ...rest] = row.split(",");
        return {
          question: question.trim().toLowerCase(),
          response: rest.join(",").trim(),
        };
      }
      const [, question, response] = match;
      return {
        question: question.trim().toLowerCase(),
        response: response.trim(),
      };
    })
    .filter((item) => item.question && item.response); // Filter out empty entries
}

/**
 * Enhanced response function using keyword scoring for better fuzzy matching.
 */
function getBotResponse(query, dataset) {
  const normalizedQ = query.toLowerCase().trim();
  const queryWords = normalizedQ.split(/\s+/).filter((word) => word.length > 2);

  // 1. Check for Exact Match (Highest priority)
  const exactMatch = dataset.find((pair) => normalizedQ === pair.question);
  if (exactMatch) return exactMatch.response;

  // 2. Check for Greetings (High priority)
  if (
    [
      "hi",
      "hello",
      "hey",
      "good morning",
      "good afternoon",
      "good evening",
    ].some((greet) => normalizedQ.startsWith(greet))
  ) {
    // Try to find the specific greeting response
    const specificGreeting = dataset.find((pair) =>
      normalizedQ.startsWith(pair.question)
    );
    if (specificGreeting) return specificGreeting.response;
    // Fallback to a general greeting
    return "Hey there! 👋 How can I help you with your Instanza clone app today?";
  }

  // 3. Keyword Scoring (Best fuzzy match)
  let bestMatch = null;
  let highestScore = 0;

  for (const pair of dataset) {
    const questionWords = pair.question.split(/\s+/);
    let score = 0;

    for (const qWord of queryWords) {
      if (questionWords.includes(qWord)) {
        score += 3; // Word match in question is strong
      }
      // Check if query word is present anywhere in the question/response text
      if (
        pair.question.includes(qWord) ||
        pair.response.toLowerCase().includes(qWord)
      ) {
        score += 1;
      }
    }

    // Add bonus for partial question match (original logic)
    if (normalizedQ.includes(pair.question)) {
      score += 5;
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = pair;
    }
  }

  // If a strong enough match is found, return its response.
  // The threshold (e.g., 6) can be tuned based on dataset size and desired responsiveness.
  if (highestScore >= 6 && bestMatch) {
    return bestMatch.response;
  }

  // 4. Contextual Fallback
  const matchingRows = dataset.filter((pair) =>
    queryWords.some(
      (qw) =>
        pair.question.includes(qw) || pair.response.toLowerCase().includes(qw)
    )
  );

  if (matchingRows.length > 0) {
    // Suggest relevant responses or topics from the dataset
    const suggestions = matchingRows
      .slice(0, 2)
      .map((pair) => `• ${pair.response}`)
      .join("\n");

    return `Here are some tips based on your query:\n${suggestions}\nIf you need more details, try a more specific question about the app's features.`;
  }

  // 5. Default Fallback
  return "I'm sorry, I couldn't find a direct answer to that specific query. I can assist with **Home, Post Creation, Profile, Reels, Stories, and Messages**. Could you rephrase your question about the app's features?";
}

const ChatBot = ({ userAvatar }) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [dataset, setDataset] = useState([]);
  const [messages, setMessages] = useState([
    {
      sender: BOT_NAME,
      text: "Hey there! 👋 How can I help you with your Instanza clone account today?",
      delivered: true,
    },
  ]);
  const messagesEndRef = useRef(null);
const USER_AVATAR =
  userAvatar || "https://placehold.co/100x100/4c0519/fca5a5?text=User";
  // Lazy-load and parse dataset when chat opens
  useEffect(() => {
    if (chatOpen && dataset.length === 0) {
      // NOTE: Using fetch assumes Vite/CRA has made the file publicly accessible
      fetch(chatDatasetCSV)
        .then((res) => {
          if (!res.ok) {
            // If fetch fails (e.g., file not found), log error and use empty dataset
            console.error("Failed to load dataset file:", res.statusText);
            return "";
          }
          return res.text();
        })
        .then((csv) => setDataset(parseDataset(csv)))
        .catch((err) => {
          console.error("Error parsing or fetching CSV:", err);
          // Provide a default dataset if all else fails
          setDataset(parseDataset("Question,Response\nHi,Welcome back!"));
        });
    }

    // Clear chat and reset state when closed
    if (!chatOpen) {
      setMessages([
        {
          sender: BOT_NAME,
          text: "Hey there! 👋 How can I help you with your Instanza clone account today?",
          delivered: true,
        },
      ]);
      setInput("");
      setIsTyping(false);
    }
  }, [chatOpen, dataset.length]);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    if (chatOpen)
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = { sender: "User", text: input.trim(), delivered: true };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Delay bot response to simulate "typing"
    setTimeout(() => {
      const botResp = getBotResponse(userMessage.text, dataset);
      setMessages((prev) => [
        ...prev,
        { sender: BOT_NAME, text: botResp, delivered: true },
      ]);
      setIsTyping(false);
    }, 1100);
  };

  const chatIcon = (
    // Updated button size and scale
    <motion.button
      key="chat-btn"
      onClick={() => setChatOpen(true)}
      // Increased size and adjusted position slightly
      className="fixed bottom-7 right-7 bg-black-600 rounded-full shadow-lg p-5 z-50 focus:outline-none"
      // Increased scale slightly
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0 }}
      animate={{ scale: 1, transition: { type: "spring", stiffness: 300 } }}
    >
      <i className="material-icons w-9 h-9 text-white" style={{ fontSize: 36 }}>
        headset_mic
      </i>
    </motion.button>
  );

  return (
    <>
      <AnimatePresence>
        {!chatOpen && chatIcon}
        {chatOpen && (
          <motion.div
            key="chat-popup"
            initial={{ scale: 0.8, y: 120, opacity: 0 }}
            animate={{
              scale: 1,
              y: 0,
              opacity: 1,
              transition: { type: "spring", stiffness: 280, damping: 25 },
            }}
            exit={{
              scale: 0.7,
              y: 120,
              opacity: 0,
              transition: { duration: 0.2 },
            }}
            // Updated background and border to dark grey/black
            className="fixed bottom-7 right-7 w-[368px] max-w-sm h-[560px] flex flex-col bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl z-50"
          >
            {/* HEADER */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <div className="flex items-center">
                <img
                  src={BOT_AVATAR}
                  className="w-14 h-14 rounded-full mr-2"
                  alt="Bot"
                />
                <div>
                  <div className="text-white font-semibold">{BOT_NAME}</div>
                  <div className="text-xs text-indigo-400">AI Assistant</div>
                </div>
              </div>
              <button
                className="hover:text-white text-gray-400"
                title="Close"
                onClick={() => setChatOpen(false)}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            {/* MESSAGES */}
            <div className="flex-1 p-4 overflow-y-auto scrollbar-hidden">
              <div className="text-center text-xs text-gray-500 my-2">
                Today
              </div>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{
                    opacity: 0,
                    x: msg.sender === BOT_NAME ? -30 : 30,
                  }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`flex mb-4 ${
                    msg.sender === BOT_NAME ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`flex items-end ${
                      msg.sender === BOT_NAME ? "" : "flex-row-reverse"
                    }`}
                  >
                    <img
                      src={msg.sender === BOT_NAME ? BOT_AVATAR : USER_AVATAR}
                      className="w-8 h-8 rounded-full object-cover mx-2"
                      alt="Avatar"
                    />
                    <div
                      className={`px-4 py-3 rounded-xl shadow-xl transition-all duration-300
                      ${
                        msg.sender === BOT_NAME
                          ? // Bot message background updated to a clean dark grey
                            "bg-gray-700 text-white rounded-bl-none"
                          : // User message background kept vibrant for contrast
                            "bg-indigo-600 text-white rounded-br-none"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start mb-3"
                >
                  <div className="flex items-end">
                    <img
                      src={BOT_AVATAR}
                      className="w-10 h-10 rounded-full mx-2"
                      alt="Bot"
                    />
                    <div className="px-4 py-2 bg-gray-700 text-white rounded-xl rounded-bl-none text-sm">
                      <span className="animate-pulse">...</span>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
            {/* INPUT */}
            <form
              onSubmit={handleSend}
              className="p-3 border-t border-gray-800"
            >
              {/* Input container updated to dark grey */}
              <div className="flex items-center bg-gray-800 rounded-full p-1 shadow-inner">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything about the app..."
                  className="flex-1 bg-transparent text-white px-4 py-2 focus:outline-none placeholder-gray-500"
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className={`p-2 rounded-full transition-colors ${
                    input.trim()
                      ? "bg-indigo-600 text-white hover:bg-indigo-500"
                      : "bg-gray-700 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <svg
                    className="w-6 h-6 transform rotate-90"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
