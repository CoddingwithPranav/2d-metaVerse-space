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
  const placeholderBg = `bg-gradient-to-br from-[#9ef01a]/80 to-gray-100`;
  return (
    <div
      ref={cardRef}
      className="bg-white rounded-xl shadow-xl overflow-hidden group transition-all duration-300 hover:shadow-[#9ef01a]/30 transform hover:scale-105 border border-gray-200 hover:border-[#9ef01a]/50"
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
              target.src = `https://placehold.co/600x400/f5f5f5/cccccc?text=Error`;
            }}
          />
        ) : (
          <Gamepad2 size={64} className="text-gray-300 opacity-50" />
        )}
      </div>
      <div className="p-6">
        <span className="inline-block bg-[#9ef01a]/15 text-[#9ef01a] text-xs font-semibold px-2.5 py-1 rounded-full mb-2">
          {genre}
        </span>
        <h3 className="text-xl font-semibold text-black mb-2">{title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
          {description}
        </p>
        <a
          href="#"
          className="inline-block mt-4 text-[#9ef01a] hover:text-[#8dd919] font-medium group/link"
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
      imageUrl: "https://placehold.co/600x400/f5f5f5/cccccc?text=Pixel+Raiders",
    },
    {
      title: "Cosmic Cartels",
      description: "Build your intergalactic trading empire...",
      genre: "Sci-Fi Strategy",
      delay: 150,
      imageUrl:
        "https://placehold.co/600x400/f0f0f0/cccccc?text=Cosmic+Cartels",
    },
    {
      title: "Blocky Racers",
      description: "High-octane pixel racing action!",
      genre: "Racing",
      delay: 300,
      imageUrl: "https://placehold.co/600x400/e8e8e8/cccccc?text=Blocky+Racers",
    },
    {
      title: "MetaTown Sim",
      description: "Design and manage your own bustling pixel city.",
      genre: "Simulation",
      delay: 450,
      imageUrl: "https://placehold.co/600x400/e0e0e0/cccccc?text=MetaTown+Sim",
    },
  ];
  return (
    <section
      id="games"
      className="py-20 md:py-28 bg-white"
    >
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-black">
          Featured Games
        </h2>
        <p className="text-xl text-gray-600 text-center mb-16 md:mb-20 max-w-2xl mx-auto">
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
            className="text-lg font-semibold bg-[#9ef01a] hover:bg-[#8dd919] text-black px-8 py-3.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
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
    <section id="community" className="py-20 md:py-28 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-black">
          Join Our Community
        </h2>
        <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Connect with fellow PixelVerse explorers, share your creations, and
          stay updated.
        </p>
        <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-10">
          <a
            href="#"
            className="flex items-center space-x-3 bg-white hover:bg-gray-50 border border-gray-200 hover:border-[#9ef01a] text-gray-800 px-8 py-4 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <MessageSquare size={32} className="text-[#9ef01a]" />
            <span className="text-xl font-semibold">Join our Discord</span>
          </a>
          <a
            href="#"
            className="flex items-center space-x-3 bg-white hover:bg-gray-50 border border-gray-200 hover:border-[#9ef01a] text-gray-800 px-8 py-4 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <Twitter size={32} className="text-[#9ef01a]" />
            <span className="text-xl font-semibold">Follow on Twitter</span>
          </a>
        </div>
      </div>
    </section>
  );
};
export const JoinCtaTarget = () => {
  return (
    <section id="join-cta-target" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6 text-center">
        <div className="max-w-3xl mx-auto bg-white p-12 rounded-xl border-2 border-gray-200 shadow-sm">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-black">
            Ready to Start?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of players in the metaverse. Create your account and dive in!
          </p>
          <a
            href="/auth"
            className="inline-block bg-[#9ef01a] hover:opacity-90 px-12 py-4 rounded-lg text-black text-lg font-semibold transition-all"
          >
            Get Started Now
          </a>
        </div>
      </div>
    </section>
  );
};
