import React, { useContext } from "react";
import { UserContext } from "../../App"; // Assuming you have UserContext

const Suggestions = () => {
  const { state } = useContext(UserContext);

  // Placeholder data for suggestions. You would fetch this from your API.
  const suggestedUsers = [
    {
      _id: "1",
      name: "imyour.areen",
      pic: "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=400",
    },
    {
      _id: "2",
      name: "gladiators_23",
      pic: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400",
    },
    {
      _id: "3",
      name: "thegame.official",
      pic: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400",
    },
    {
      _id: "4",
      name: "nte_sambura_",
      pic: "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400",
    },
  ];

  return (
    <div className="text-white text-sm">
      {/* Current User */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <img
            src={state?.pic}
            alt="profile"
            className="w-14 h-14 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold">{state?.name}</p>
            <p className="text-neutral-400">Welcome!</p>
          </div>
        </div>
        <button className="text-blue-500 font-semibold text-xs">Switch</button>
      </div>

      {/* Suggestions Header */}
      <div className="flex justify-between mb-2">
        <p className="font-semibold text-neutral-400">Suggested for you</p>
        <button className="font-semibold text-xs">See All</button>
      </div>

      {/* Suggestion List */}
      <div className="space-y-3">
        {suggestedUsers.map((user) => (
          <div key={user._id} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={user.pic}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-neutral-500 text-xs">Follows you</p>
              </div>
            </div>
            <button className="text-blue-500 font-semibold text-xs">
              Follow
            </button>
          </div>
        ))}
      </div>
      <p className="text-neutral-600 text-xs mt-6">
        &copy; {new Date().getFullYear()} Instanza 
      </p>
    </div>
  );
};

export default Suggestions;
