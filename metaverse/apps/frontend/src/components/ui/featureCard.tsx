import { useScrollAnimation } from "@/hooks/ScrollHook";
import { useRef, useEffect } from "react";

type FeatureCardProps = {
  icon: React.ComponentType<{ size?: number }>;
  title: string;
  description: string;
  delay: number;
};

export const FeatureCard = ({
  icon: Icon,
  title,
  description,
  delay,
}: FeatureCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const addToObserve = useScrollAnimation();
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
  return (
    <div
      ref={cardRef}
      className="bg-white/10 p-6 rounded-xl shadow-xl border border-gray-300 hover:border-[#9ef01a]/50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[#9ef01a]/20"
    >
      <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-gradient-to-br from-[#9ef01a] to-[#9ef01a] text-white shadow-lg">
        <Icon size={32} />
      </div>
      <h3 className="text-2xl font-semibold text-white mb-3">{title}</h3>
      <p className="text-gray-300 leading-relaxed">{description}</p>
    </div>
  );
};
