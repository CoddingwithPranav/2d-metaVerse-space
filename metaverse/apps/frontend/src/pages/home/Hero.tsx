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
      className="min-h-screen flex items-center justify-center pt-20 bg-gradient-to-br from-slate-950 via-slate-900 to-gray-900 relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="pixelGrid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0 10h20M10 0v20"
                stroke="rgba(100, 116, 139, 0.3)"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pixelGrid)" />
        </svg>
      </div>
      <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
          <div ref={characterRef} className="mb-6 md:mb-0 md:order-2">
            <PixelCharacter />
          </div>
          <div className="md:text-left md:order-1">
            <h1
              ref={titleRef}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6"
            >
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 leading-tight">
                Explore Infinite Worlds
              </span>
              <span className="block text-slate-300 mt-1 md:mt-2">
                Your 2D Metaverse Awaits.
              </span>
            </h1>
            <p
              ref={subtitleRef}
              className="text-lg md:text-xl text-slate-400 mb-10 max-w-xl mx-auto md:mx-0"
            >
              Dive into a universe of interconnected games, vibrant communities,
              and endless pixelated adventures. Create, play, and connect like
              never before.
            </p>
            <div ref={buttonRef}>
              <button
                onClick={() =>
                  document
                    .getElementById("join-cta-target")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="animated-border-button rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group"
              >
                <span className="inner-content px-10 py-4 text-white text-lg font-semibold">
                  Join the Metaverse{" "}
                  <ArrowRight
                    size={24}
                    className="ml-3 group-hover:translate-x-1 transition-transform"
                  />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
