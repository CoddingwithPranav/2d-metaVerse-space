import { FeatureCard } from "@/components/ui/featureCard";
import { Gamepad2, Palette, Server, UsersRound } from "lucide-react";

export const FeaturesView = () => {
  const features = [
    {
      icon: Palette,
      title: "Cross-Game Avatars",
      description:
        "Your unique pixel identity travels with you across all games and experiences.",
      delay: 0,
    },
    {
      icon: Server,
      title: "Player-Driven Economy",
      description:
        "Trade, craft, and build your fortune in a dynamic, community-led marketplace.",
      delay: 150,
    },
    {
      icon: UsersRound,
      title: "Vibrant Communities",
      description:
        "Connect with friends, join guilds, and participate in exciting global events.",
      delay: 300,
    },
    {
      icon: Gamepad2,
      title: "Endless Games",
      description:
        "Discover a constantly expanding universe of games created by us and the community.",
      delay: 450,
    },
  ];
  return (
    <section id="features" className="py-20 md:py-28 bg-slate-900">
      {" "}
      {/* Reverted to standard section for home page flow */}
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
          Why PixelVerse?
        </h2>
        <p className="text-xl text-slate-400 text-center mb-16 md:mb-20 max-w-2xl mx-auto">
          Experience a new dimension of gaming with features designed for true
          immersion and connection.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};
