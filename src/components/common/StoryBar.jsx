import React from "react";

const StoryBar = ({ stories }) => {
  // A placeholder for the current user's ID to check if a story has been viewed.
  const currentUserId = "your_current_user_id"; // Replace with actual logic, e.g., from context

  return (
    <div className="w-full bg-black border border-neutral-800 rounded-lg p-4 mb-8">
      <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
        {/* You can add a "Create Story" button here as the first item if you like */}
        {stories.map((story) => {
          // Example check to see if the story is viewed.
          const isViewed = story.viewedBy?.includes(currentUserId);

          return (
            <div
              key={story._id}
              className="flex flex-col items-center space-y-2 flex-shrink-0"
            >
              <div className="relative">
                {/* The Gradient Ring */}
                <div
                  className={`w-16 h-16 rounded-full p-0.5
                    ${
                      isViewed
                        ? "bg-neutral-700"
                        : "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"
                    }`}
                >
                  {/* The white/black background for the ring effect */}
                  <div className="bg-black p-0.5 rounded-full">
                    <img
                      src={story.user.pic}
                      alt={story.user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                </div>
              </div>
              <p className="text-xs text-center text-neutral-300 w-16 truncate">
                {story.user.name}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StoryBar;
