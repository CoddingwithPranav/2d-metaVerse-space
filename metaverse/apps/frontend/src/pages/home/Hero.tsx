import { useScrollAnimation } from "@/hooks/ScrollHook";
import { ArrowRight } from "lucide-react";
import { useRef, useEffect } from "react";
import { PixelCharacter } from "./PixcelCharacter";
import "../../App.css";

export const Hero = () => {
  const addToObserve = useScrollAnimation();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const characterRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // const elements = [
    //   { ref: titleRef, delay: 200 },
    //   { ref: subtitleRef, delay: 400 },
    //   { ref: buttonRef, delay: 600 },
    //   { ref: characterRef, delay: 300 }
    // ];
    // elements.forEach(el => {
    //   if (el.ref.current) {
    //     (el.ref.current as HTMLElement).style.transitionDelay = `${el.delay}ms`;
    //     el.ref.current.classList.add(
    //       'opacity-0',
    //       'transform',
    //       'translate-y-8',
    //       'motion-safe:transition-all',
    //       'motion-safe:duration-700',
    //       'motion-safe:ease-out'
    //     );
    //     addToObserve(el.ref.current);
    //   }
    // });
  }, [addToObserve]);
  return (
    <section
      id="hero"
      className="min-h-screen flex items-center justify-center pt-20 bg-white relative overflow-hidden"
    >
      <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
        <div className="flex flex-col items-center justify-center gap-8 max-w-4xl mx-auto">
          <div ref={characterRef} className="mb-4">
            <PixelCharacter />
          </div>
          <div className="text-center">
            <h1
              ref={titleRef}
              className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-6 text-black"
            >
              Your 2D Metaverse
            </h1>
            <p
              ref={subtitleRef}
              className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto"
            >
              Create, explore, and connect in vibrant pixelated worlds. Your adventure starts here.
            </p>
            <div ref={buttonRef}>
              <button
                onClick={() =>
                  document
                    .getElementById("join-cta-target")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="bg-[#9ef01a] hover:opacity-90 px-10 py-4 rounded-lg text-black text-lg font-semibold transition-all inline-flex items-center"
              >
                Join the Metaverse
                <ArrowRight
                  size={24}
                  className="ml-3 group-hover:translate-x-1 transition-transform"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
