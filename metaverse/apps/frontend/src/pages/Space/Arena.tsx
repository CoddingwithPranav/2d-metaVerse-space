import React, { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import { BACKEND_URL, WS_URL } from "@/config";
import useAuth from "@/utils/Authhook";
import { useParams } from "react-router-dom";

// Define types for WebSocket messages
type IncomingMessage =
  | { type: "space-joined"; payload: { userId: string; spawn: { x: number; y: number }; users: { id: string; x: number; y: number }[] } }
  | { type: "user-joined"; payload: { userId: string; x: number; y: number } }
  | { type: "user-moved"; payload: { id: string; x: number; y: number } }
  | { type: "movement-rejected"; payload: { x: number; y: number } }
  | { type: "user-left"; payload: { userId: string } }
  | { type: "user-action"; payload: { action: string; userId: string; emoji?: string } }
  | { type: "message-received"; payload: { message: string; userId: string } }
  | { type: "error"; payload: { message: string } };

type UserState = { id: string; x: number; y: number; direction: string };
type SpaceElementInState = { id: string; x: number; y: number; elementDefinition: { id: string; imageUrl: string; width: number; height: number; static: boolean } };
type AnimatedUserDisplayState = { currentPixelX: number; currentPixelY: number };
type Emoji = { userId: string; emoji: string; expiresAt: number };
type ChatMessage = { userId: string; message: string; expiresAt: number };

// Constants for grid and animation
const CELL_SIZE = 20;
const GRID_DEFAULT = { width: 50, height: 50 };
const ANIMATION_SPEED = 0.1;
const MOVE_TIMEOUT = 30;
const FRAME_WIDTH = 50;
const FRAME_HEIGHT = 120;
const NUM_ANIMATION_FRAMES = 3;
const ANIMATION_FRAME_DURATION = 200;
const RENDER_CHARACTER_WIDTH = 50;
const RENDER_CHARACTER_HEIGHT = 100;

import run_down from './run_down.png';
import run_up from './run-up.png';
import run_right from './run-right.png';
import run_left from './run-left.png';
import Idle_up from './idle_up.png';
import Idle_down from './Idel_down.png';
import Idle_left from './idle_left.png';
import Idle_right from './Idel_right.png';
const SPRITE_SHEETS_URLS: Record<string, string> = {
  idle_down: Idle_down,
  run_down: run_down,
  idle_left: Idle_left,
  idle_right: Idle_right,
  idle_up: Idle_up,
  run_left: run_left,
  run_right: run_right,
  run_up: run_up,
};
const DEFAULT_SPRITE_URL = "https://openclipart.org/image/2000px/248259";

const userImageCache: Record<string, { img: HTMLImageElement; loaded: boolean }> = {};
const elementImageCache: Record<string, { img: HTMLImageElement; width: number; height: number; loaded: boolean }> = {};

const useWebSocket = (
  url: string,
  token: string,
  spaceId: string,
  setAnimatedUserPositions: React.Dispatch<React.SetStateAction<Record<string, AnimatedUserDisplayState>>>,
  setEmojis: React.Dispatch<React.SetStateAction<Emoji[]>>,
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  gridWidth: number,
  gridHeight: number,
  shouldConnect: boolean
) => {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [selfId, setSelfId] = useState<string | null>(null);
  const [users, setUsers] = useState<Record<string, UserState>>({});
  const [error, setError] = useState<string | null>(null);
  const [isMovingSelf, setIsMovingSelf] = useState(false);

  useEffect(() => {
    if (!shouldConnect || !token || !spaceId) return;

    const connect = () => {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        setError(null);
        ws.send(JSON.stringify({ type: "join", payload: { token, spaceId } }));
      };

      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data) as IncomingMessage;
          switch (msg.type) {
            case "space-joined":
              setSelfId(msg.payload.userId);
              setUsers(() => {
                const allUsers: Record<string, UserState> = {
                  [msg.payload.userId]: {
                    id: msg.payload.userId,
                    x: msg.payload.spawn.x,
                    y: msg.payload.spawn.y,
                    direction: "down",
                  },
                };
                msg.payload.users.forEach((u) => {
                  allUsers[u.id] = { id: u.id, x: u.x, y: u.y, direction: "down" };
                });
                return allUsers;
              });
              setAnimatedUserPositions((prev) => {
                const newPositions = { ...prev };
                Object.values(msg.payload.users).forEach((u) => {
                  newPositions[u.id] = {
                    currentPixelX: u.x * CELL_SIZE,
                    currentPixelY: u.y * CELL_SIZE,
                  };
                });
                newPositions[msg.payload.userId] = {
                  currentPixelX: msg.payload.spawn.x * CELL_SIZE,
                  currentPixelY: msg.payload.spawn.y * CELL_SIZE,
                };
                return newPositions;
              });
              break;
            case "user-joined":
              setUsers((prev) => ({
                ...prev,
                [msg.payload.userId]: { id: msg.payload.userId, x: msg.payload.x, y: msg.payload.y, direction: "down" },
              }));
              setAnimatedUserPositions((prev) => ({
                ...prev,
                [msg.payload.userId]: { currentPixelX: msg.payload.x * CELL_SIZE, currentPixelY: msg.payload.y * CELL_SIZE },
              }));
              break;
            case "user-moved":
              setUsers((prev) => {
                const oldUser = prev[msg.payload.id];
                if (!oldUser) return prev;
                const dx = msg.payload.x - oldUser.x;
                const dy = msg.payload.y - oldUser.y;
                let direction = oldUser.direction;
                if (dx === 1 && dy === 0) direction = "right";
                else if (dx === -1 && dy === 0) direction = "left";
                else if (dx === 0 && dy === 1) direction = "down";
                else if (dx === 0 && dy === -1) direction = "up";
                return { ...prev, [msg.payload.id]: { id: msg.payload.id, x: msg.payload.x, y: msg.payload.y, direction } };
              });
              if (msg.payload.id === selfId) setIsMovingSelf(false);
              break;
            case "movement-rejected":
              if (selfId) {
                setUsers((prev) => ({ ...prev, [selfId]: { ...prev[selfId], x: msg.payload.x, y: msg.payload.y } }));
                setAnimatedUserPositions((prev) => ({
                  ...prev,
                  [selfId]: { currentPixelX: msg.payload.x * CELL_SIZE, currentPixelY: msg.payload.y * CELL_SIZE },
                }));
                setIsMovingSelf(false);
              }
              break;
            case "user-left":
              setUsers((prev) => {
                const updatedUsers = { ...prev };
                delete updatedUsers[msg.payload.userId];
                return updatedUsers;
              });
              setAnimatedUserPositions((prev) => {
                const updatedPositions = { ...prev };
                delete updatedPositions[msg.payload.userId];
                return updatedPositions;
              });
              break;
            case "user-action":
              const { action, userId: emittingUserId, emoji } = msg.payload;
              if (action === "show-emoji" && emoji) {
                setEmojis((prev) => [
                  ...prev.filter((e) => e.userId !== emittingUserId),
                  { userId: emittingUserId, emoji, expiresAt: Date.now() + 2000 },
                ]);
              }
              break;
            case "message-received":
              setChatMessages((prev) => [
                ...prev,
                { userId: msg.payload.userId, message: msg.payload.message, expiresAt: Date.now() + 5000 },
              ]);
              break;
            case "error":
              setError(msg.payload.message);
              setIsMovingSelf(false);
              break;
          }
        } catch (err) {
          setError("Invalid message from server");
          setIsMovingSelf(false);
        }
      };

      ws.onclose = () => setConnected(false);
      ws.onerror = () => setError("WebSocket connection error");
    };

    connect();
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [shouldConnect, url, token, spaceId, setAnimatedUserPositions, setEmojis, setChatMessages]);

  const moveUser = useCallback(
    (x: number, y: number) => {
      if (!selfId || !connected || !users[selfId] || isMovingSelf) return;
      if (x < 0 || y < 0 || x >= gridWidth || y >= gridHeight) return;

      setIsMovingSelf(true);
      setUsers(prev => {
        if (!prev[selfId]) return prev;
        const dx = x - prev[selfId].x;
        const dy = y - prev[selfId].y;
        let direction = prev[selfId].direction;
        if (dx === 1 && dy === 0) direction = "right";
        else if (dx === -1 && dy === 0) direction = "left";
        else if (dx === 0 && dy === 1) direction = "down";
        else if (dx === 0 && dy === -1) direction = "up";
        return {
          ...prev,
          [selfId]: { ...prev[selfId], x, y, direction },
        };
      });
      wsRef.current?.send(JSON.stringify({ type: "move", payload: { x, y } }));
      setTimeout(() => setIsMovingSelf(false), MOVE_TIMEOUT * 5);
    },
    [selfId, connected, users, isMovingSelf, gridWidth, gridHeight]
  );

  const sendAction = useCallback(
    (action: string, emoji?: string) => {
      if (!selfId || !connected) return;
      const payload: { action: string; userId: string; emoji?: string } = { action, userId: selfId };
      if (emoji) payload.emoji = emoji;
      wsRef.current?.send(JSON.stringify({ type: "user-action", payload }));
    },
    [selfId, connected]
  );

  const sendMessage = useCallback(
    (message: string) => {
      if (!connected) return;
      wsRef.current?.send(JSON.stringify({ type: "send-message", payload: { message } }));
    },
    [connected]
  );

  return { connected, selfId, users, moveUser, sendAction, sendMessage, error, isMovingSelf };
};

export default function Arena() {
  const { spaceId } = useParams<{ spaceId: string }>();
  const { token } = useAuth();
  const [spaceElements, setSpaceElements] = useState<SpaceElementInState[]>([]);
  const [gridSize, setGridSize] = useState(GRID_DEFAULT);
  const [criticalImagesLoaded, setCriticalImagesLoaded] = useState(false);
  const [imageLoadError, setImageLoadError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const [animatedUserPositions, setAnimatedUserPositions] = useState<Record<string, AnimatedUserDisplayState>>({});
  const backgroundImgRef = useRef<HTMLImageElement | null>(null);
  const [emojis, setEmojis] = useState<Emoji[]>([]);
  const [showMessageInput, setShowMessageInput] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [showEmojiPanel, setShowEmojiPanel] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const { connected, selfId, users, moveUser, sendAction, sendMessage, error: wsError, isMovingSelf } = useWebSocket(
    WS_URL,
    token || "",
    spaceId || "",
    setAnimatedUserPositions,
    setEmojis,
    setChatMessages,
    gridSize.width,
    gridSize.height,
    isConnecting
  );

  useEffect(() => {
    if (!spaceId || !token || !isConnecting || !connected) return;

    const fetchSpaceAndElements = async () => {
      try {
        setCriticalImagesLoaded(false);
        setImageLoadError(null);
        const res = await axios.get(`${BACKEND_URL}/space/${spaceId}`, {
          headers: { authorization: `Bearer ${token}` },
        });
        const BackgroundImageUrl = res.data.backgroundUrl;
        const [width, height] = res.data.dimensions.toLowerCase().split("x").map(Number);
        const gridWidthCells = Math.floor(width / CELL_SIZE);
        const gridHeightCells = Math.floor(height / CELL_SIZE);
        setGridSize({ width: gridWidthCells, height: gridHeightCells });

        const fetchedElements: SpaceElementInState[] = res.data.elements.map((el: any) => ({
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
        }));
        setSpaceElements(fetchedElements);

        const elementImagePromises = fetchedElements.map((e) => {
          if (!elementImageCache[e.elementDefinition.id]) {
            const img = new Image();
            img.src = e.elementDefinition.imageUrl;
            elementImageCache[e.elementDefinition.id] = {
              img,
              width: e.elementDefinition.width,
              height: e.elementDefinition.height,
              loaded: false,
            };
            return new Promise<void>((resolve) => {
              img.onload = () => {
                elementImageCache[e.elementDefinition.id].loaded = true;
                resolve();
              };
              img.onerror = () => {
                setImageLoadError((prev) => prev || `Failed to load element: ${e.elementDefinition.id}`);
                resolve();
              };
            });
          }
          return Promise.resolve();
        });

        const characterSpritePromises = Object.entries(SPRITE_SHEETS_URLS).map(([key, url]) => {
          return new Promise<void>((resolve) => {
            if (!userImageCache[key]) {
              const img = new Image();
              img.src = url;
              userImageCache[key] = { img, loaded: false };
              img.onload = () => {
                userImageCache[key].loaded = true;
                resolve();
              };
              img.onerror = () => {
                setImageLoadError((prev) => prev || `Failed to load sprite: ${key}`);
                resolve();
              };
            } else {
              resolve();
            }
          });
        });

        if (!userImageCache["default"]) {
          const img = new Image();
          img.src = DEFAULT_SPRITE_URL;
          userImageCache["default"] = { img, loaded: false };
          img.onload = () => {
            userImageCache["default"].loaded = true;
          };
          img.onerror = () => {
            console.error("Default sprite failed to load");
          };
        }

        const imagePromises = [...elementImagePromises, ...characterSpritePromises];
        if (BackgroundImageUrl) {
          const bgImg = new Image();
          bgImg.src = BackgroundImageUrl;
          backgroundImgRef.current = bgImg;
          imagePromises.push(
            new Promise<void>((resolve) => {
              bgImg.onload = () => resolve();
              bgImg.onerror = () => {
                setImageLoadError((prev) => prev || "Failed to load background");
                resolve();
              };
            })
          );
        }

        await Promise.all(imagePromises);
        const allSpritesLoaded = Object.values(userImageCache).every((sprite) => sprite.loaded);
        setCriticalImagesLoaded(true);
        if (!allSpritesLoaded) setImageLoadError("Some sprites failed to load; using fallback.");
      } catch (err) {
        setImageLoadError("Failed to load space data or assets");
        setCriticalImagesLoaded(true);
      }
    };

    fetchSpaceAndElements();
  }, [spaceId, token, isConnecting, connected]);

  useEffect(() => {
    setAnimatedUserPositions((prev) => {
      const newPositions = { ...prev };
      let changed = false;
      Object.values(users).forEach((user) => {
        if (!newPositions[user.id]) {
          newPositions[user.id] = { currentPixelX: user.x * CELL_SIZE, currentPixelY: user.y * CELL_SIZE };
          changed = true;
        }
      });
      Object.keys(newPositions).forEach((uid) => {
        if (!users[uid]) {
          delete newPositions[uid];
          changed = true;
        }
      });
      return changed ? newPositions : prev;
    });
  }, [users]);

  useEffect(() => {
    if (!connected || !criticalImagesLoaded) return;

    const animate = () => {
      setAnimatedUserPositions((prev) => {
        const nextPositions = { ...prev };
        let needsUpdate = false;

        Object.keys(users).forEach((userId) => {
          const user = users[userId];
          const animatedPos = nextPositions[userId];
          if (user && animatedPos) {
            const targetPixelX = user.x * CELL_SIZE;
            const targetPixelY = user.y * CELL_SIZE;
            const diffX = targetPixelX - animatedPos.currentPixelX;
            const diffY = targetPixelY - animatedPos.currentPixelY;

            if (Math.abs(diffX) < 0.5 && Math.abs(diffY) < 0.5) {
              if (animatedPos.currentPixelX !== targetPixelX || animatedPos.currentPixelY !== targetPixelY) {
                animatedPos.currentPixelX = targetPixelX;
                animatedPos.currentPixelY = targetPixelY;
                needsUpdate = true;
              }
            } else {
              animatedPos.currentPixelX += diffX * ANIMATION_SPEED;
              animatedPos.currentPixelY += diffY * ANIMATION_SPEED;
              needsUpdate = true;
            }
          }
        });

        return needsUpdate ? nextPositions : prev;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [connected, criticalImagesLoaded, users]);

  useEffect(() => {
    const interval = setInterval(() => {
      setEmojis((prev) => prev.filter((e) => Date.now() < e.expiresAt));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setChatMessages((prev) => prev.filter((m) => Date.now() < m.expiresAt));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getSpriteDetails = useCallback(
    (
      userId: string,
      direction: string,
      currentX: number,
      currentY: number,
      targetX: number,
      targetY: number
    ) => {
      const isVisuallyMoving =
        Math.abs(targetX * CELL_SIZE - currentX) > 0.1 ||
        Math.abs(targetY * CELL_SIZE - currentY) > 0.1;
      const animState = isVisuallyMoving ? "run" : "idle";
      const spriteKey = `${animState}_${direction.toLowerCase()}`;

      let spriteAsset = userImageCache[spriteKey];
      if (!spriteAsset || !spriteAsset.loaded) {
        spriteAsset = userImageCache["default"];
        if (!spriteAsset || !spriteAsset.loaded) {
          return null;
        }
      }

      let sourceX = 0;
      if (animState === "run") {
        const frameIndex = Math.floor(Date.now() / ANIMATION_FRAME_DURATION) % NUM_ANIMATION_FRAMES;
        sourceX = frameIndex * FRAME_WIDTH;
      }

      return {
        img: spriteAsset.img,
        sourceX,
        sourceY: 0,
        sourceWidth: FRAME_WIDTH,
        sourceHeight: FRAME_HEIGHT,
      };
    },
    []
  );

  useEffect(() => {
    if (!canvasRef.current || !criticalImagesLoaded) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const { width: gridW, height: gridH } = gridSize;
    canvasRef.current.width = gridW * CELL_SIZE;
    canvasRef.current.height = gridH * CELL_SIZE;

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    if (backgroundImgRef.current && backgroundImgRef.current.complete) {
      ctx.drawImage(backgroundImgRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
    } else {
      ctx.strokeStyle = "#eee";
      for (let x = 0; x <= gridW; x++) {
        ctx.beginPath();
        ctx.moveTo(x * CELL_SIZE, 0);
        ctx.lineTo(x * CELL_SIZE, gridH * CELL_SIZE);
        ctx.stroke();
      }
      for (let y = 0; y <= gridH; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * CELL_SIZE);
        ctx.lineTo(gridW * CELL_SIZE, y * CELL_SIZE);
        ctx.stroke();
      }
    }

    spaceElements.forEach((e) => {
      const cache = elementImageCache[e.elementDefinition.id];
      if (cache?.loaded) {
        ctx.drawImage(cache.img, e.x, e.y, e.elementDefinition.width, e.elementDefinition.height);
      } else {
        ctx.fillStyle = "#ccc";
        ctx.fillRect(e.x, e.y, e.elementDefinition.width, e.elementDefinition.height);
      }
    });

    Object.keys(animatedUserPositions).forEach((userId) => {
      const user = users[userId];
      const animPos = animatedUserPositions[userId];
      if (!user || !animPos) return;

      const spriteDetails = getSpriteDetails(user.id, user.direction, animPos.currentPixelX, animPos.currentPixelY, user.x, user.y);

      if (spriteDetails && spriteDetails.img) {
        if (spriteDetails.img.naturalWidth < spriteDetails.sourceX + spriteDetails.sourceWidth) {
          console.error(`Image bounds error for ${userId}`);
        }

        ctx.drawImage(
          spriteDetails.img,
          spriteDetails.sourceX,
          spriteDetails.sourceY,
          spriteDetails.sourceWidth,
          spriteDetails.sourceHeight,
          animPos.currentPixelX,
          animPos.currentPixelY,
          RENDER_CHARACTER_WIDTH,
          RENDER_CHARACTER_HEIGHT
        );
      } else {
        ctx.fillStyle = userId === selfId ? "#3b82f6" : "#ef4444";
        ctx.fillRect(animPos.currentPixelX + 1, animPos.currentPixelY + 1, RENDER_CHARACTER_WIDTH - 2, RENDER_CHARACTER_HEIGHT - 2);
      }
    });

    emojis.forEach((e) => {
      const user = users[e.userId];
      const animPos = animatedUserPositions[e.userId];
      if (user && animPos) {
        ctx.font = "20px Arial";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.fillText(e.emoji, animPos.currentPixelX + RENDER_CHARACTER_WIDTH / 2, animPos.currentPixelY - 10);
      }
    });

    const messagesByUser = chatMessages.reduce((acc, msg) => {
      if (!acc[msg.userId]) acc[msg.userId] = [];
      acc[msg.userId].push(msg);
      return acc;
    }, {} as Record<string, ChatMessage[]>);

    Object.keys(messagesByUser).forEach((userId) => {
      const user = users[userId];
      const animPos = animatedUserPositions[userId];
      if (user && animPos) {
        const messages = messagesByUser[userId];
        messages.forEach((msg, index) => {
          const yOffset = -10 - (index * 20);
          ctx.font = "14px Arial";
          ctx.fillStyle = "black";
          ctx.textAlign = "center";
          ctx.fillText(msg.message, animPos.currentPixelX + RENDER_CHARACTER_WIDTH / 2, animPos.currentPixelY + yOffset);
        });
      }
    });
  }, [animatedUserPositions, users, spaceElements, criticalImagesLoaded, gridSize, selfId, emojis, chatMessages, getSpriteDetails]);

  const isPositionValid = useCallback(
    (x: number, y: number) => {
      const userPixelLeft = x * CELL_SIZE;
      const userPixelRight = userPixelLeft + CELL_SIZE;
      const userPixelTop = y * CELL_SIZE;
      const userPixelBottom = userPixelTop + CELL_SIZE;

      const noStaticCollision = !spaceElements.some((e) => {
        if (!e.elementDefinition.static) return false;
        const elLeft = e.x;
        const elRight = elLeft + e.elementDefinition.width;
        const elTop = e.y;
        const elBottom = elTop + e.elementDefinition.height;
        return (
          userPixelLeft < elRight &&
          userPixelRight > elLeft &&
          userPixelTop < elBottom &&
          userPixelBottom > elTop
        );
      });

      const noUserCollision = !Object.values(users).some((u) => u.id !== selfId && u.x === x && u.y === y);
      return noStaticCollision && noUserCollision;
    },
    [spaceElements, users, selfId]
  );

  const keyActions = useCallback(
    () => ({
      ArrowLeft: () => {
        if (selfId && users[selfId] && !isMovingSelf) {
          const nx = users[selfId].x - 1;
          const ny = users[selfId].y;
          if (isPositionValid(nx, ny)) moveUser(nx, ny);
        }
      },
      ArrowRight: () => {
        if (selfId && users[selfId] && !isMovingSelf) {
          const nx = users[selfId].x + 1;
          const ny = users[selfId].y;
          if (isPositionValid(nx, ny)) moveUser(nx, ny);
        }
      },
      ArrowUp: () => {
        if (selfId && users[selfId] && !isMovingSelf) {
          const nx = users[selfId].x;
          const ny = users[selfId].y - 1;
          if (isPositionValid(nx, ny)) moveUser(nx, ny);
        }
      },
      ArrowDown: () => {
        if (selfId && users[selfId] && !isMovingSelf) {
          const nx = users[selfId].x;
          const ny = users[selfId].y + 1;
          if (isPositionValid(nx, ny)) moveUser(nx, ny);
        }
      },
      h: () => setShowEmojiPanel(true),
      i: () => setShowMessageInput(true),
    }),
    [selfId, users, moveUser, isPositionValid, isMovingSelf]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLCanvasElement>) => {
      if (!connected || !selfId || !users[selfId]) return;
      const actions: any = keyActions();
      const action = actions[e.key];
      if (action) {
        action();
        e.preventDefault();
      }
    },
    [connected, selfId, users, keyActions]
  );

  if (!token || !spaceId) {
    return (
      <Card className="w-96">
        <CardHeader><CardTitle>Connection Issue</CardTitle></CardHeader>
        <CardContent><p className="text-red-500">Missing token or Space ID.</p></CardContent>
      </Card>
    );
  }

  if (!isConnecting) {
    return (
      <Card className="w-96 mx-auto my-10">
        <CardHeader><CardTitle>Join "{spaceId}"</CardTitle></CardHeader>
        <CardContent className="flex flex-col items-center">
          <p className="mb-4">Ready to enter?</p>
          <button
            onClick={() => setIsConnecting(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded"
          >
            Connect
          </button>
        </CardContent>
      </Card>
    );
  }

  if (!connected && !wsError) {
    return (
      <Card className="w-96 mx-auto my-10">
        <CardHeader><CardTitle>Connecting...</CardTitle></CardHeader>
        <CardContent><p className="text-gray-600">Connecting to "{spaceId}"...</p></CardContent>
      </Card>
    );
  }

  if (wsError) {
    return (
      <Card className="w-96 mx-auto my-10">
        <CardHeader><CardTitle>Connection Error</CardTitle></CardHeader>
        <CardContent>
          <p className="text-red-500 mb-4">{wsError}</p>
          <button
            onClick={() => setIsConnecting(false)}
            className="bg-gray-300 hover:bg-gray-400 text-black py-2 px-4 rounded"
          >
            Go Back
          </button>
        </CardContent>
      </Card>
    );
  }

  if (!criticalImagesLoaded) {
    return (
      <Card className="w-80 mx-auto my-10">
        <CardHeader><CardTitle>Loading Assets...</CardTitle></CardHeader>
        <CardContent>
          {imageLoadError ? (
            <p className="text-red-500">{imageLoadError}</p>
          ) : (
            <p className="text-gray-600">Loading elements and sprites...</p>
          )}
        </CardContent>
      </Card>
    );
  }

  if (imageLoadError) {
    return (
      <Card className="w-96 mx-auto my-10">
        <CardHeader><CardTitle>Asset Issue</CardTitle></CardHeader>
        <CardContent>
          <p className="text-red-500 mb-4">{imageLoadError}</p>
          <p className="text-sm text-gray-500 mb-4">Proceed with possible visual issues?</p>
          <button
            onClick={() => setCriticalImagesLoaded(true)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded mr-2"
          >
            Proceed
          </button>
          <button
            onClick={() => setIsConnecting(false)}
            className="bg-gray-300 hover:bg-gray-400 text-black py-2 px-4 rounded"
          >
            Reconnect
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col items-center p-4">
      {showEmojiPanel && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded shadow-lg flex gap-2">
          {["👋", "👍", "❤️", "😂", "🎉"].map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                sendAction("show-emoji", emoji);
                setShowEmojiPanel(false);
              }}
              className="text-2xl hover:bg-gray-100 p-2 rounded"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
      {showMessageInput && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded shadow-lg">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setShowMessageInput(false);
                  setMessageInput("");
                }
              }}
              className="border p-2 rounded w-64"
              autoFocus
            />
            <button
              onClick={() => {
                if (messageInput.trim()) {
                  sendMessage(messageInput);
                  setShowMessageInput(false);
                  setMessageInput("");
                }
              }}
              className="ml-2 bg-blue-500 text-white p-2 rounded"
            >
              Send
            </button>
          </div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        tabIndex={0}
        autoFocus
        className="border-2 border-gray-400 rounded-lg shadow-2xl focus:ring-4 focus:ring-blue-500"
        onKeyDown={handleKeyDown}
      />
      <div className="mt-4 p-3 bg-gray-100 rounded-md shadow-md text-sm">
        <div className="font-bold text-gray-800 mb-1">Controls:</div>
        <div className="flex items-center gap-2 text-gray-700">
          <span className="font-mono p-1 bg-gray-200 rounded">←</span>
          <span className="font-mono p-1 bg-gray-200 rounded">↑</span>
          <span className="font-mono p-1 bg-gray-200 rounded">→</span>
          <span className="font-mono p-1 bg-gray-200 rounded">↓</span>
          <span>(Move)</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700 mt-1">
          <span className="font-mono p-1 bg-gray-200 rounded">H</span>
          <span>(Emoji Panel)</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700 mt-1">
          <span className="font-mono p-1 bg-gray-200 rounded">I</span>
          <span>(Send Message)</span>
        </div>
        {selfId && users[selfId] && (
          <div className="mt-2 text-xs text-gray-600">
            Position: ({users[selfId].x}, {users[selfId].y}) Direction: {users[selfId].direction}
          </div>
        )}
        {isMovingSelf && <div className="mt-1 text-xs text-blue-500">Moving...</div>}
      </div>
    </div>
  );
}