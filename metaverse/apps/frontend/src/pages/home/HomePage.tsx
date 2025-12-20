import React from "react";
import { GameShowcaseView, CommunityView, JoinCtaTarget } from "./GameCard";
import { Hero } from "./Hero";
import { FeaturesView } from "./FeatureView";
import { Footer } from "../admin/footer";

export const HomePage: React.FC = () => {
  return (
    <div>
      <div className="bg-slate-950 text-slate-200 min-h-screen font-sans antialiased selection:bg-purple-500 selection:text-white">
        <main>
          <Hero />
          <FeaturesView />
          <GameShowcaseView />
          <CommunityView />
          <JoinCtaTarget />
        </main>
        <Footer />
      </div>
    </div>
  );
};
