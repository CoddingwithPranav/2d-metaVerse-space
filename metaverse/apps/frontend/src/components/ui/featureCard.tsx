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
      className="bg-slate-800/70 p-6 rounded-xl shadow-xl border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-cyan-500/20"
    >
      <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 text-white shadow-lg">
        <Icon size={32} />
      </div>
      <h3 className="text-2xl font-semibold text-slate-100 mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
};
