// components/GlitterBackground.tsx
import React from 'react';
import { useCallback } from 'react';
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim'; // loads tsparticles-slim

interface GlitterBackgroundProps {
  children?: React.ReactNode;
}

 const GlitterBackground: React.FC<GlitterBackgroundProps> = ({ children }) => {
  const particlesInit = useCallback(async (engine: any) => {
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async (container: any) => {
    console.log(container);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      <Particles
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        options={{
          background: {
            color: {
              value: '#0d47a1', // Dark blue background, adjust as needed
            },
          },
          fpsLimit: 60,
          interactivity: {
            events: {
              onClick: {
                enable: true,
                mode: 'push',
              },
              onHover: {
                enable: true,
                mode: 'repulse',
              },
              resize: true,
            },
            modes: {
              push: {
                quantity: 4,
              },
              repulse: {
                distance: 200,
                duration: 0.4,
              },
            },
          },
          particles: {
            color: {
              value: '#ffffff', // White particles for glitter effect
            },
            links: {
              color: '#ffffff',
              distance: 150,
              enable: false, // Set to true if you want lines connecting particles
              opacity: 0.5,
              width: 1,
            },
            collisions: {
              enable: true,
            },
            move: {
              direction: 'none',
              enable: true,
              outModes: {
                default: 'bounce',
              },
              random: false,
              speed: 1,
              straight: false,
            },
            number: {
              density: {
                enable: true,
                area: 800,
              },
              value: 80, // Number of particles
            },
            opacity: {
              value: 0.5,
            },
            shape: {
              type: 'circle', // Can be 'star', 'triangle', 'square', etc.
            },
            size: {
              value: { min: 1, max: 3 }, // Size range of particles
            },
          },
          detectRetina: true,
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1, // Ensures background
        }}
      />
      <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {children}
      </div>
    </div>
  );
};

export default GlitterBackground;