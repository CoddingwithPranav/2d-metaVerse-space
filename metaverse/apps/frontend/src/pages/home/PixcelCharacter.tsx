export const PixelCharacter = () => {
  return (
    <div className="relative group shrink-0">
      <style>
        {`
          @keyframes subtleBob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
          .animate-subtleBob { animation: subtleBob 2.5s ease-in-out infinite; }
          @keyframes hiBubble { 0%, 100% { opacity: 0; transform: translate(8px, -8px) scale(0.7); } 10%, 80% { opacity: 1; transform: translate(0, 0) scale(1); } 90% { opacity: 0; transform: translate(8px, -8px) scale(0.7); } }
          .hi-bubble-animation { animation: hiBubble 3.5s ease-in-out infinite 0.5s; will-change: transform, opacity; }
        `}
      </style>
      <svg
        width="64"
        height="64"
        viewBox="0 0 16 16"
        xmlns="http://www.w3.org/2000/svg"
        className="inline-block animate-subtleBob filter drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]"
      >
        <rect x="5" y="1" width="6" height="1" fill="#7B4F2E" />
        <rect x="4" y="2" width="1" height="2" fill="#7B4F2E" />{" "}
        <rect x="11" y="2" width="1" height="2" fill="#7B4F2E" />
        <rect x="5" y="2" width="1" height="1" fill="#A56A40" />{" "}
        <rect x="10" y="2" width="1" height="1" fill="#A56A40" />
        <rect x="5" y="3" width="6" height="4" fill="#FFDBAC" />
        <rect x="6" y="4" width="1" height="1" fill="#FFFFFF" />{" "}
        <rect x="9" y="4" width="1" height="1" fill="#FFFFFF" />
        <rect x="6" y="4" width="1" height="1" fill="#333333" />{" "}
        <rect x="9" y="4" width="1" height="1" fill="#333333" />
        <rect x="4" y="7" width="8" height="5" fill="#5DADE2" />{" "}
        <rect x="7" y="7" width="2" height="1" fill="#3498DB" />
        <rect x="3" y="7" width="1" height="3" fill="#FFDBAC" />{" "}
        <rect x="12" y="7" width="1" height="3" fill="#FFDBAC" />
        <rect x="5" y="12" width="2" height="3" fill="#2C3E50" />{" "}
        <rect x="9" y="12" width="2" height="3" fill="#2C3E50" />
        <rect x="5" y="15" width="2" height="1" fill="#7B4F2E" />{" "}
        <rect x="9" y="15" width="2" height="1" fill="#7B4F2E" />
      </svg>
      <div className="hi-bubble-animation absolute -top-4 -right-10 md:-right-12 bg-gradient-to-br from-purple-500 to-cyan-500 text-white px-3 py-1.5 rounded-lg shadow-xl text-sm font-bold">
        Hi!
        <div className="absolute left-2 bottom-[-6px] w-0 h-0 border-l-[7px] border-l-transparent border-t-[7px] border-t-purple-500 border-r-[7px] border-r-transparent"></div>
      </div>
    </div>
  );
};
