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
            pos.currentPixelX + RENDER_CHARACTER_WIDTH / 5,
            pos.currentPixelY - 15,
          );
        }
        chatMessages
          .filter((m) => m.userId === userId)
          .forEach((msg, i) => {
            const padding = 8;
            ctx.font = "bold 14px Inter, sans-serif";

            // 1. Measure text to make bubble width dynamic
            const textMetrics = ctx.measureText(msg.message);
            const bubbleWidth = textMetrics.width + padding * 2;
            const bubbleHeight = 28;

            // 2. Position (Stacked above the character)
            const x = pos.currentPixelX + (RENDER_CHARACTER_WIDTH / 2) - (bubbleWidth / 2);
            const y = pos.currentPixelY - 40 - (i * (bubbleHeight + 5));

            // 3. Draw Shadow for depth
            ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
            ctx.beginPath();
            ctx.roundRect(x + 2, y + 2, bubbleWidth, bubbleHeight, 8);
            ctx.fill();

            // 4. Draw Bubble Body
            ctx.fillStyle = "white";
            ctx.strokeStyle = "#e2e8f0"; // Light gray border
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(x, y, bubbleWidth, bubbleHeight, 8);
            ctx.fill();
            ctx.stroke();

            // 5. Draw the "Tail" (Little triangle pointing down)
            // Only draw for the bottom-most message
            if (i === 0) {
              ctx.fillStyle = "white";
              ctx.beginPath();
              ctx.moveTo(pos.currentPixelX + (RENDER_CHARACTER_WIDTH / 2) - 5, y + bubbleHeight);
              ctx.lineTo(pos.currentPixelX + (RENDER_CHARACTER_WIDTH / 2) + 5, y + bubbleHeight);
              ctx.lineTo(pos.currentPixelX + (RENDER_CHARACTER_WIDTH / 2), y + bubbleHeight + 6);
              ctx.fill();
              // Tail border
              ctx.strokeStyle = "#e2e8f0";
              ctx.stroke();
            }

            // 6. Draw Text
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#1e293b"; // Slate-800
            ctx.fillText(msg.message, x + bubbleWidth / 2, y + bubbleHeight / 2 + 1);
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
      className="border-2 border-gray-200 rounded-xl"
      style={{ imageRendering: "pixelated" }}
    />
  );
};
