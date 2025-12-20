// hooks/useAvatarLoader.ts
import { useCallback } from "react";
import { avatarService } from "@/service/avatarService";
import type { Direction } from "@/types";

interface SpriteCache {
  idle: Record<Direction, HTMLImageElement>;
  run: Record<Direction, HTMLImageElement>;
  loaded: boolean;
}

const userSpriteCache: Record<string, SpriteCache> = {};

export const useAvatarLoader = () => {
  const loadUserAvatar = useCallback(async (userId: string) => {
    if (userSpriteCache[userId]) return;

    const avatar = await avatarService.getByUserId(userId);
    if (!avatar) return;

    userSpriteCache[userId] = {
      idle: {} as any,
      run: {} as any,
      loaded: false,
    };
    const directions: Direction[] = ["up", "down", "left", "right"];
    const promises: Promise<void>[] = [];

    directions.forEach((dir) => {
      ["idle", "run"].forEach((type) => {
        const url =
          type === "idle" ? avatar.idleUrls[dir] : avatar.runUrls[dir];
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = url;
        (userSpriteCache[userId] as any)[type][dir] = img;

        promises.push(
          new Promise<void>((resolve) => {
            img.onload = img.onerror = () => resolve();
          }),
        );
      });
    });

    await Promise.all(promises);
    userSpriteCache[userId].loaded = true;
  }, []);

  const getSprite = (
    userId: string,
    direction: Direction,
    isMoving: boolean,
  ) => {
    const cache = userSpriteCache[userId];
    if (!cache?.loaded) return null;
    const sheet = isMoving ? cache.run[direction] : cache.idle[direction];
    if (!sheet?.complete) return null;

    const frameIdx = isMoving ? Math.floor(Date.now() / 150) % 3 : 0;
    return {
      img: sheet,
      sourceX: frameIdx * 50,
      sourceY: 0,
      sourceWidth: 50,
      sourceHeight: 120,
    };
  };

  return { loadUserAvatar, getSprite };
};
