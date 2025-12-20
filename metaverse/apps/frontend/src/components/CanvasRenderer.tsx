import { useEffect, useRef } from "react";
import {
  CELL_SIZE,
  RENDER_CHARACTER_WIDTH,
  RENDER_CHARACTER_HEIGHT,
} from "@/constants";
import type {
  UserState,
  AnimatedUserDisplayState,
  SpaceElementInState,
  Emoji,
  ChatMessage,
  Direction,
} from "@/types";

interface CanvasRendererProps {
  users: Record<string, UserState>;
  animatedPositions: Record<string, AnimatedUserDisplayState>;
  spaceElements: SpaceElementInState[];
  backgroundImg: HTMLImageElement | null;
  gridSize: { width: number; height: number };
  emojis: Emoji[];
  chatMessages: ChatMessage[];
  selfId: string | null;
  getSprite: (userId: string, direction: Direction, isMoving: boolean) => any;
  elementImageCache: Record<string, { img: HTMLImageElement; loaded: boolean }>;
}

export const CanvasRenderer = ({
  users,
  animatedPositions,
  spaceElements,
  backgroundImg,
  gridSize,
  emojis,
  chatMessages,
  selfId,
  getSprite,
  elementImageCache,
}: CanvasRendererProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = gridSize.width;
    canvas.height = gridSize.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (backgroundImg && backgroundImg.complete) {
      ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = "#1a202c";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "#2d3748";
      for (let x = 0; x <= gridSize.width; x += CELL_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, gridSize.height);
        ctx.stroke();
      }
      for (let y = 0; y <= gridSize.height; y += CELL_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(gridSize.width, y);
        ctx.stroke();
      }
    }

    spaceElements.forEach((e) => {
      const cache = elementImageCache[e.elementDefinition.id];
      if (cache?.loaded && cache.img.complete) {
        ctx.drawImage(
          cache.img,
          e.x,
          e.y,
          e.elementDefinition.width,
          e.elementDefinition.height,
        );
      }
    });

    Object.keys(animatedPositions)
      .sort(
        (a, b) =>
          (animatedPositions[a]?.currentPixelY || 0) -
          (animatedPositions[b]?.currentPixelY || 0),
      )
      .forEach((userId) => {
        const user = users[userId];
        const pos = animatedPositions[userId];
        if (!user || !pos) return;

        const targetX = user.x * CELL_SIZE;
        const targetY = user.y * CELL_SIZE;
        const isMoving =
          Math.abs(targetX - pos.currentPixelX) > 1 ||
          Math.abs(targetY - pos.currentPixelY) > 1;
        const sprite = getSprite(userId, user.direction, isMoving);

        if (sprite) {
          ctx.drawImage(
            sprite.img,
            sprite.sourceX,
            sprite.sourceY,
            sprite.sourceWidth,
            sprite.sourceHeight,
            pos.currentPixelX,
            pos.currentPixelY,
            RENDER_CHARACTER_WIDTH,
            RENDER_CHARACTER_HEIGHT,
          );
        } else {
          ctx.fillStyle =
            userId === selfId
              ? "rgba(99, 102, 241, 0.8)"
              : "rgba(239, 68, 68, 0.8)";
          ctx.fillRect(
            pos.currentPixelX + 2,
            pos.currentPixelY + 2,
            RENDER_CHARACTER_WIDTH - 4,
            RENDER_CHARACTER_HEIGHT - 4,
          );
        }

        const emoji = emojis.find((e) => e.userId === userId);
        if (emoji) {
          ctx.font = "24px Arial";
          ctx.fillText(
            emoji.emoji,
            pos.currentPixelX + RENDER_CHARACTER_WIDTH / 2,
            pos.currentPixelY - 15,
          );
        }

        chatMessages
          .filter((m) => m.userId === userId)
          .forEach((msg, i) => {
            const y = pos.currentPixelY - 45 - i * 25;
            ctx.fillStyle = "rgba(255,255,255,0.9)";
            ctx.fillRect(pos.currentPixelX, y, 100, 20);
            ctx.fillStyle = "black";
            ctx.fillText(msg.message, pos.currentPixelX + 50, y + 15);
          });
      });
  }, [
    users,
    animatedPositions,
    spaceElements,
    backgroundImg,
    gridSize,
    emojis,
    chatMessages,
    selfId,
    getSprite,
    elementImageCache,
  ]);

  return (
    <canvas
      autoFocus
      tabIndex={0}
      ref={canvasRef}
      className="border-2 border-slate-600 rounded-xl"
      style={{ imageRendering: "pixelated" }}
    />
  );
};
