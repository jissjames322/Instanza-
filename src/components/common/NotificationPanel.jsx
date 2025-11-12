import React from "react";
import { motion } from "framer-motion";
const NotificationPanel = ({
  isOpen,
  onClose,
  notifications,
  markNotificationRead,
  markAllRead,
  leftOffset,
}) => {
  if (!isOpen) return null;

  const leftPx = leftOffset === "w-64" ? 256 : leftOffset === "w-20" ? 80 : 256;

  const panelVariants = {
    hidden: { x: -400, opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: -400, opacity: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={panelVariants}
      transition={{ type: "tween", duration: 0.3 }}
      style={{ left: leftPx, top: 0 }} // important: fixed to left side of sidebar
      className="fixed h-full w-96  text-white shadow-lg z-60 p-4 flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl ">Notifications</h2>
        <button
          onClick={markAllRead}
          className="text-sm text-blue-400 hover:underline"
        >
          Mark All Read
        </button>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          X
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 && (
          <p className="text-gray-400">No notifications</p>
        )}
        {notifications.map((notif) => (
          <div
            key={notif._id}
            className={`flex items-center space-x-4 p-3 rounded-md cursor-pointer ${
              !notif.read ? "bg-blue-700" : "hover:bg-neutral-800"
            }`}
            onClick={() => {
              if (!notif.read) markNotificationRead(notif._id);
              // Navigate or handle link if needed
            }}
          >
            <img
              src={notif.sender.pic}
              alt={notif.sender.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="text-sm">{notif.text}</p>
              <small className="text-gray-400">
                {new Date(notif.createdAt).toLocaleString()}
              </small>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default NotificationPanel;
