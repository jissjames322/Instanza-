export const Theme = (theme) => {
  if (theme === "dark") {
    return {
      bg: "bg-gray-900", // dark gray instead of pure black
      text: "text-gray-100", // soft white
      cardBg: "bg-gray-800", // slightly lighter gray for cards
      inputBg: "bg-gray-700", // inputs a bit darker
      inputText: "text-gray-100",
      placeholder: "placeholder-gray-400",
      border: "border-gray-600", // subtle border for inputs/cards
      hover: "hover:bg-gray-700", // subtle hover effect
    };
  } else {
    return {
      bg: "bg-gray-50", // soft off-white
      text: "text-gray-900", // dark text
      cardBg: "bg-white", // card background
      inputBg: "bg-gray-100", // input background
      inputText: "text-gray-900",
      placeholder: "placeholder-gray-500",
      border: "border-gray-300",
      hover: "hover:bg-gray-200",
    };
  }
};
