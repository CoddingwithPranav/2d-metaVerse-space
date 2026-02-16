import { useScrollAnimation } from "@/hooks/ScrollHook";
import { Layers, ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";

type Item = {
  imageUrl?: string;
  title: string;
  description: string;
  type?: string;
  details?: string;
};

interface ItemCardProps {
  item: Item;
  delay: number;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, delay }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const addToObserve = useScrollAnimation(0.15);

  useEffect(() => {
    if (cardRef.current) {
      cardRef.current.classList.add(
        "opacity-0",
        "transform",
        "translate-y-12",
        "motion-safe:transition-all",
        "motion-safe:duration-700",
        "motion-safe:ease-out",
      );
      cardRef.current.style.transitionDelay = `${delay}ms`;
      addToObserve(cardRef.current);
    }
  }, [addToObserve, delay]);

  const placeholderBg = `bg-gradient-to-br from-[#9ef01a]/80 to-gray-100`;

  return (
    <div
      ref={cardRef}
      className="bg-white rounded-xl shadow-xl overflow-hidden group transition-all duration-300 hover:shadow-[#9ef01a]/30 transform hover:scale-105 border border-gray-200 hover:border-[#9ef01a]/50"
    >
      <div
        className={`w-full h-56 ${item.imageUrl ? "" : placeholderBg} flex items-center justify-center overflow-hidden`}
      >
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                `https://placehold.co/600x400/f5f5f5/cccccc?text=Error`;
            }}
          />
        ) : (
          <Layers size={64} className="text-gray-300 opacity-50" /> // Default icon
        )}
      </div>
      <div className="p-6">
        {item.type && (
          <span className="inline-block bg-[#9ef01a]/15 text-[#9ef01a] text-xs font-semibold px-2.5 py-1 rounded-full mb-2">
            {item.type}
          </span>
        )}
        <h3 className="text-xl font-semibold text-black mb-2">
          {item.title}
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-3">
          {item.description}
        </p>
        {item.details && (
          <p className="text-xs text-gray-500">{item.details}</p>
        )}
        <button className="inline-flex items-center mt-4 text-[#9ef01a] hover:text-[#8dd919] font-medium group/link">
          Explore{" "}
          <ArrowRight
            size={16}
            className="inline ml-1 transition-transform duration-200 group-hover/link:translate-x-1"
          />
        </button>
      </div>
    </div>
  );
};
