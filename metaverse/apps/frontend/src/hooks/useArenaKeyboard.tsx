// hooks/useArenaKeyboard.ts
import type { Direction } from "@/types";
import { useCallback, useEffect } from "react";

interface UseArenaKeyboardProps {
  selfId: string | null;
  users: Record<string, { x: number; y: number; direction: Direction }>;
  isMovingSelf: boolean;
  moveUser: (x: number, y: number) => void;
  showEmojiPanel: boolean;
  setShowEmojiPanel: (v: boolean) => void;
  showMessageInput: boolean;
  setShowMessageInput: (v: boolean) => void;
  sendAction: (action: string, emoji?: string) => void;
  emojiOptions: readonly string[];
}

export const useArenaKeyboard = ({
  selfId,
  users,
  isMovingSelf,
  moveUser,
  showEmojiPanel,
  setShowEmojiPanel,
  showMessageInput,
  setShowMessageInput,
  sendAction,
  emojiOptions,
}: UseArenaKeyboardProps) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // 1. Message input has priority
      if (showMessageInput) {
        if (e.key === "Escape") {
          setShowMessageInput(false);
          e.preventDefault();
        }
        return;
      }

      // 2. Emoji panel
      if (showEmojiPanel) {
        const num = Number(e.key);
        if (num >= 1 && num <= emojiOptions.length) {
          sendAction("show-emoji", emojiOptions[num - 1]);
          setShowEmojiPanel(false);
          e.preventDefault();
        } else if (e.key === "Escape" || e.key.toLowerCase() === "h") {
          setShowEmojiPanel(false);
          e.preventDefault();
        }
        return;
      }

      // 3. Normal arena controls
      if (!selfId || !users[selfId] || isMovingSelf) return;

      const u = users[selfId];
      let nx = u.x;
      let ny = u.y;

      switch (e.key) {
        case "ArrowLeft":
          nx -= 1;
          break;
        case "ArrowRight":
          nx += 1;
          break;
        case "ArrowUp":
          ny -= 1;
          break;
        case "ArrowDown":
          ny += 1;
          break;
        case "h":
        case "H":
          setShowEmojiPanel(!showEmojiPanel);
          e.preventDefault();
          return;
        case "i":
        case "I":
          setShowMessageInput(true);
          e.preventDefault();
          return;
        default:
          return;
      }

      moveUser(nx, ny);
      e.preventDefault();
    },
    [
      selfId,
      users,
      isMovingSelf,
      moveUser,
      showEmojiPanel,
      setShowEmojiPanel,
      showMessageInput,
      setShowMessageInput,
      sendAction,
      emojiOptions,
    ],
  );

  // Attached to the document (so it works even if canvas loses focus)
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return null;
};
