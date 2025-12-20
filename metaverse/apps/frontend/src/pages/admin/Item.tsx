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

  const placeholderBg = `bg-gradient-to-br from-${["indigo", "sky", "rose", "teal"][Math.floor(Math.random() * 4)]}-700 to-slate-800`;

  return (
    <div
      ref={cardRef}
      className="bg-slate-800 rounded-xl shadow-xl overflow-hidden group transition-all duration-300 hover:shadow-cyan-500/30 transform hover:scale-105 border border-slate-700 hover:border-cyan-500/50"
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
                `https://placehold.co/600x400/334155/e2e8f0?text=Error`;
            }}
          />
        ) : (
          <Layers size={64} className="text-slate-500 opacity-50" /> // Default icon
        )}
      </div>
      <div className="p-6">
        {item.type && (
          <span className="inline-block bg-purple-500/20 text-purple-300 text-xs font-semibold px-2.5 py-1 rounded-full mb-2">
            {item.type}
          </span>
        )}
        <h3 className="text-xl font-semibold text-slate-100 mb-2">
          {item.title}
        </h3>
        <p className="text-slate-400 text-sm leading-relaxed line-clamp-3 mb-3">
          {item.description}
        </p>
        {item.details && (
          <p className="text-xs text-slate-500">{item.details}</p>
        )}
        <button className="inline-flex items-center mt-4 text-cyan-400 hover:text-cyan-300 font-medium group/link">
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
