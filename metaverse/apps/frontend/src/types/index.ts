// types/index.ts
export type Direction = "up" | "down" | "left" | "right";

export interface UserState {
  id: string;
  x: number;
  y: number;
  direction: Direction;
}

export interface AnimatedUserDisplayState {
  currentPixelX: number;
  currentPixelY: number;
}

export interface Emoji {
  userId: string;
  emoji: string;
  expiresAt: number;
}

export interface ChatMessage {
  userId: string;
  message: string;
  expiresAt: number;
}

export interface SpaceElementInState {
  id: string;
  x: number;
  y: number;
  elementDefinition: {
    id: string;
    imageUrl: string;
    width: number;
    height: number;
    static: boolean;
  };
}

export interface Avatar {
  idleUrls: Record<Direction, string>;
  runUrls: Record<Direction, string>;
}

export type IncomingMessage =
  | {
      type: "space-joined";
      payload: {
        userId: string;
        spawn: { x: number; y: number };
        users: { id: string; x: number; y: number }[];
      };
    }
  | { type: "user-joined"; payload: { userId: string; x: number; y: number } }
  | { type: "user-moved"; payload: { id: string; x: number; y: number } }
  | { type: "movement-rejected"; payload: { x: number; y: number } }
  | { type: "user-left"; payload: { userId: string } }
  | {
      type: "user-action";
      payload: { action: string; userId: string; emoji?: string };
    }
  | { type: "message-received"; payload: { message: string; userId: string } }
  | { type: "error"; payload: { message: string } };

export interface BackGround {
  id: string;
  Url: string;
}

export interface User {
  email: string;
  role: "admin" | "user";
}

export interface AuthState {
  token: string | null;
  user: User | null;
  login: (data: { token: string; user: User }) => void;
  logout: () => void;
}
