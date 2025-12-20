import { useScrollAnimation } from "@/hooks/ScrollHook";
import { type ReactNode, useRef, useEffect } from "react";

// Animated wrapper component (Slightly adjusted for better animation kickoff)
export const AnimatedPageWrapper = ({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const addToObserve = useScrollAnimation(0.1); // Trigger when 10% of element is visible

  useEffect(() => {
    const currentRef = sectionRef.current;
    if (currentRef) {
      // Add initial hidden states for animation
      currentRef.classList.add(
        "opacity-0",
        "transform",
        "translate-y-0",
        "motion-safe:transition-all",
        "motion-safe:duration-700",
        "motion-safe:ease-out",
      );
      addToObserve(currentRef); // Add to observer to reveal on scroll
    }
  }, [addToObserve]); // Depend on addToObserve

  return (
    <div
      ref={sectionRef}
      id={id}
      className={`pt-28 pb-16 min-h-screen ${className}`}
    >
      <div className="container mx-auto px-4 md:px-6">{children}</div>
    </div>
  );
};
