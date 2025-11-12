import React from "react";

/**
 * Instagram-style animated loading bar.
 */
const InstaLineLoader = ({ style = {}, duration = 2 }) => {
  return (
    <div
      className="w-full h-1.5 overflow-hidden bg-gray-900 rounded"
      style={{ ...style, height: '3px', background: '#222' }}
    >
      <div
        className="h-full animate-insta-loader"
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, #a162e8, #faff70, #ff844b, #fd2f7a, #a162e8, #faff70)',
          backgroundSize: '200% auto',
          animation: `insta-loader-anim ${duration}s linear infinite`
        }}
      />
      <style>{`
        @keyframes insta-loader-anim {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%);}
        }
      `}</style>
    </div>
  );
};

export default InstaLineLoader;
