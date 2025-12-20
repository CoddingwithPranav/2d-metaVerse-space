import { useScrollAnimation } from "@/hooks/ScrollHook";
import { Gamepad2, ArrowRight, MessageSquare, Twitter } from "lucide-react";
import { useRef, useEffect } from "react";

type GameCardProps = {
  title: string;
  description: string;
  imageUrl?: string;
  genre: string;
  delay: number;
};

export const GameCard = ({
  title,
  description,
  imageUrl,
  genre,
  delay,
}: GameCardProps) => {
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
  const placeholderBg = `bg-gradient-to-br from-${["purple", "cyan", "pink", "blue"][Math.floor(Math.random() * 4)]}-700 to-${["slate", "gray", "zinc", "neutral"][Math.floor(Math.random() * 4)]}-800`;
  return (
    <div
      ref={cardRef}
      className="bg-slate-800 rounded-xl shadow-xl overflow-hidden group transition-all duration-300 hover:shadow-purple-500/30 transform hover:scale-105 border border-slate-700 hover:border-purple-500/50"
    >
      <div
        className={`w-full h-48 ${imageUrl ? "" : placeholderBg} flex items-center justify-center overflow-hidden`}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://placehold.co/600x400/334155/e2e8f0?text=Error`;
            }}
          />
        ) : (
          <Gamepad2 size={64} className="text-slate-500 opacity-50" />
        )}
      </div>
      <div className="p-6">
        <span className="inline-block bg-cyan-500/20 text-cyan-300 text-xs font-semibold px-2.5 py-1 rounded-full mb-2">
          {genre}
        </span>
        <h3 className="text-xl font-semibold text-slate-100 mb-2">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">
          {description}
        </p>
        <a
          href="#"
          className="inline-block mt-4 text-purple-400 hover:text-purple-300 font-medium group/link"
        >
          Learn More{" "}
          <ArrowRight
            size={16}
            className="inline ml-1 transition-transform duration-200 group-hover/link:translate-x-1"
          />
        </a>
      </div>
    </div>
  );
};

// Game Showcase Section (Now a component for 'home' page)
export const GameShowcaseView = () => {
  const games = [
    {
      title: "Pixel Raiders",
      description: "Embark on epic quests...",
      genre: "RPG Adventure",
      delay: 0,
      imageUrl: "https://placehold.co/600x400/2D3748/E2E8F0?text=Pixel+Raiders",
    },
    {
      title: "Cosmic Cartels",
      description: "Build your intergalactic trading empire...",
      genre: "Sci-Fi Strategy",
      delay: 150,
      imageUrl:
        "https://placehold.co/600x400/4A5568/E2E8F0?text=Cosmic+Cartels",
    },
    {
      title: "Blocky Racers",
      description: "High-octane pixel racing action!",
      genre: "Racing",
      delay: 300,
      imageUrl: "https://placehold.co/600x400/718096/E2E8F0?text=Blocky+Racers",
    },
    {
      title: "MetaTown Sim",
      description: "Design and manage your own bustling pixel city.",
      genre: "Simulation",
      delay: 450,
      imageUrl: "https://placehold.co/600x400/A0AEC0/E2E8F0?text=MetaTown+Sim",
    },
  ];
  return (
    <section
      id="games"
      className="py-20 md:py-28 bg-gradient-to-b from-slate-900 to-slate-950"
    >
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
          Featured Games
        </h2>
        <p className="text-xl text-slate-400 text-center mb-16 md:mb-20 max-w-2xl mx-auto">
          A glimpse into the diverse experiences waiting for you in the
          PixelVerse.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {games.map((game, index) => (
            <GameCard key={index} {...game} />
          ))}
        </div>
        <div className="text-center mt-16">
          <button
            onClick={() => alert("Redirect to all games page!")}
            className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white px-8 py-3.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            Discover All Games
          </button>
        </div>
      </div>
    </section>
  );
};

// Community Section (Now a component for 'home' page)
export const CommunityView = () => {
  return (
    <section id="community" className="py-20 md:py-28 bg-slate-900">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
          Join Our Community
        </h2>
        <p className="text-xl text-slate-400 text-center mb-12 max-w-2xl mx-auto">
          Connect with fellow PixelVerse explorers, share your creations, and
          stay updated.
        </p>
        <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-10">
          <a
            href="#"
            className="flex items-center space-x-3 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 hover:border-purple-500 text-slate-200 px-8 py-4 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <MessageSquare size={32} className="text-purple-400" />
            <span className="text-xl font-semibold">Join our Discord</span>
          </a>
          <a
            href="#"
            className="flex items-center space-x-3 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 hover:border-cyan-500 text-slate-200 px-8 py-4 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <Twitter size={32} className="text-cyan-400" />
            <span className="text-xl font-semibold">Follow on Twitter</span>
          </a>
        </div>
      </div>
    </section>
  );
};
export const JoinCtaTarget = () => (
  <div id="join-cta-target" className="py-4 bg-slate-950"></div>
);
