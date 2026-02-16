import React from "react";
import { GameShowcaseView, CommunityView, JoinCtaTarget } from "./GameCard";
import { Hero } from "./Hero";
import { FeaturesView } from "./FeatureView";
import { Footer } from "../admin/footer";

export const HomePage: React.FC = () => {
  return (
    <div className="bg-white min-h-screen">
      <main>
        <Hero />
        <JoinCtaTarget />
      </main>
    </div>
  );
};
