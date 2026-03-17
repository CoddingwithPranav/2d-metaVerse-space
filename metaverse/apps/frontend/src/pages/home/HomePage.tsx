import React from "react";
import { Hero } from "./Hero";

export const HomePage: React.FC = () => {
  return (
    <div className="bg-white min-h-screen">
      <main>
        <Hero />
      </main>
    </div>
  );
};
