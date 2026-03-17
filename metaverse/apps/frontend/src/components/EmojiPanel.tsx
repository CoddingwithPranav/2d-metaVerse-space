import { X } from "lucide-react";
import { EMOJI_OPTIONS } from "@/constants";

interface EmojiPanelProps {
  show: boolean;
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export const EmojiPanel = ({ show, onSelect, onClose }: EmojiPanelProps) => {
  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 mb-5 z-50">
      <div className="bg-white border-2 border-gray-200 p-3 rounded-xl flex gap-2 shadow-lg">
        {EMOJI_OPTIONS.map((emoji, i) => (
          <button
            key={emoji}
            onClick={() => {
              onSelect(emoji);
              onClose();
            }}
            className="text-3xl p-2 hover:bg-gray-100 rounded-lg relative"
          >
            {emoji}
            <span className="absolute -top-1 -right-1 bg-[#9ef01a] text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
              {i + 1}
            </span>
          </button>
        ))}
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-700">
          <X size={20} />
        </button>
      </div>
    </div>
  );
};
