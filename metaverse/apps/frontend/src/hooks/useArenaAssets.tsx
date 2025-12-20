// hooks/useArenaAssets.ts
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { BACKEND_URL } from "@/config";
import type { SpaceElementInState } from "@/types";

interface UseArenaAssetsProps {
  spaceId: string;
  token: string;
  isConnecting: boolean;
}

export const useArenaAssets = ({
  spaceId,
  token,
  isConnecting,
}: UseArenaAssetsProps) => {
  const [spaceElements, setSpaceElements] = useState<SpaceElementInState[]>([]);
  const [gridSize, setGridSize] = useState({ width: 50, height: 50 });
  const [backgroundImg, setBackgroundImg] = useState<HTMLImageElement | null>(
    null,
  );
  const [criticalImagesLoaded, setCriticalImagesLoaded] = useState(false);
  const [imageLoadError, setImageLoadError] = useState<string | null>(null);

  const elementImageCache = useRef<
    Record<string, { img: HTMLImageElement; loaded: boolean }>
  >({});

  useEffect(() => {
    if (!spaceId || !token || !isConnecting) return;

    const load = async () => {
      try {
        setCriticalImagesLoaded(false);
        setImageLoadError(null);

        const res = await axios.get(`${BACKEND_URL}/space/${spaceId}`, {
          headers: { authorization: `Bearer ${token}` },
        });

        const { backgroundUrl, dimensions, elements } = res.data;
        const [w, h] = dimensions.toLowerCase().split("x").map(Number);
        setGridSize({ width: w, height: h });

        const fetchedElements: SpaceElementInState[] = elements.map(
          (el: any) => ({
            id: el.id,
            x: el.x,
            y: el.y,
            elementDefinition: {
              id: el.element.id,
              imageUrl: el.element.imageUrl,
              width: Number(el.element.width),
              height: Number(el.element.height),
              static: el.element.static,
            },
          }),
        );
        setSpaceElements(fetchedElements);

        const promises: Promise<void>[] = [];

        fetchedElements.forEach((e) => {
          if (!elementImageCache.current[e.elementDefinition.id]) {
            const img = new Image();
            img.src = e.elementDefinition.imageUrl;
            elementImageCache.current[e.elementDefinition.id] = {
              img,
              loaded: false,
            };
            promises.push(
              new Promise<void>((resolve) => {
                img.onload = () => {
                  elementImageCache.current[e.elementDefinition.id].loaded =
                    true;
                  resolve();
                };
                img.onerror = () => resolve();
              }),
            );
          }
        });

        if (backgroundUrl) {
          const bgImg = new Image();
          bgImg.src = backgroundUrl;
          promises.push(
            new Promise<void>((resolve) => {
              bgImg.onload = () => {
                setBackgroundImg(bgImg);
                resolve();
              };
              bgImg.onerror = () => resolve();
            }),
          );
        }

        await Promise.all(promises);
        setCriticalImagesLoaded(true);
      } catch (err) {
        setImageLoadError("Failed to load space assets");
        setCriticalImagesLoaded(true);
      }
    };

    load();
  }, [spaceId, token, isConnecting]);

  return {
    spaceElements,
    gridSize,
    backgroundImg,
    criticalImagesLoaded,
    imageLoadError,
    elementImageCache: elementImageCache.current,
  };
};
