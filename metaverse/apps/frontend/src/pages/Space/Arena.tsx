import React, { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, MessageSquareText, SmilePlus, X } from "lucide-react";
import { BACKEND_URL, WS_URL } from "@/config";
import useAuth from "@/utils/Authhook";
import { useParams } from "react-router-dom";

// Define types (assuming these are correct and complete from previous version)
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

// Constants
const CELL_SIZE = 20;
const GRID_DEFAULT = { width: 50, height: 50 };
const ANIMATION_SPEED = 0.1;
const MOVE_TIMEOUT = 20;
const FRAME_WIDTH = 50;
const FRAME_HEIGHT = 120;
const NUM_ANIMATION_FRAMES = 3;
const ANIMATION_FRAME_DURATION = 200;
const RENDER_CHARACTER_WIDTH = 50;
const RENDER_CHARACTER_HEIGHT = 100;

// Sprite Imports (ensure paths are correct)
import run_down from './Run_down.png';
import run_up from './Run_up.png';
import run_right from './Run_right.png';
import run_left from './Run_left.png';
import Idle_up from './Idle_up.png';
import Idle_down from './Idle_down.png';
import Idle_left from './Idle_left.png';
import Idle_right from './Idle_right.png';

const SPRITE_SHEETS_URLS: Record<string, string> = {
  idle_down: Idle_down, run_down: run_down, idle_left: Idle_left, idle_right: Idle_right,
  idle_up: Idle_up, run_left: run_left, run_right: run_right, run_up: run_up,
};
const DEFAULT_SPRITE_URL = "https://openclipart.org/image/2000px/248259";

const userImageCache: Record<string, { img: HTMLImageElement; loaded: boolean }> = {};
const elementImageCache: Record<string, { img: HTMLImageElement; width: number; height: number; loaded: boolean }> = {};

// Emoji options for the panel and keybinds
const EMOJI_OPTIONS = ["👋", "👍", "❤️", "😂", "🎉", "😮", "😢"];

// useWebSocket Hook ( 그대로 사용 )
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
                  { userId: emittingUserId, emoji, expiresAt: Date.now() + 3000 }, 
                ]);
              }
              break;
            case "message-received":
              setChatMessages((prev) => [
                ...prev,
                { userId: msg.payload.userId, message: msg.payload.message, expiresAt: Date.now() + 7000 },
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
      if (
        x < 0 ||
        y < 0 ||
        x * CELL_SIZE + RENDER_CHARACTER_WIDTH > gridWidth * CELL_SIZE ||
        y * CELL_SIZE + RENDER_CHARACTER_HEIGHT > gridHeight * CELL_SIZE
      ) return;

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
      if (!connected || !message.trim()) return;
      wsRef.current?.send(JSON.stringify({ type: "send-message", payload: { message } }));
    },
    [connected]
  );

  return { connected, selfId, users, moveUser, sendAction, sendMessage, error, isMovingSelf };
};


export default function Arena() {
  const { spaceId } = useParams<{ spaceId: string }>();
  const { token } = useAuth();
  // ... other state variables ...
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
    WS_URL, token || "", spaceId || "",
    setAnimatedUserPositions, setEmojis, setChatMessages,
    gridSize.width, gridSize.height,
    isConnecting && criticalImagesLoaded
  );

  // useEffect for fetching space data and assets ( 그대로 사용 )
  useEffect(() => {
    if (!spaceId || !token || !isConnecting ) return;

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
                setImageLoadError((prev) => prev || `Failed to load element: ${e.elementDefinition.imageUrl}`);
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
                setImageLoadError((prev) => prev || `Failed to load sprite: ${url}`);
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
            const defaultPromise = new Promise<void>(resolve => {
                img.onload = () => { userImageCache["default"].loaded = true; resolve();};
                img.onerror = () => { console.error("Default sprite failed to load"); resolve(); };
            });
            characterSpritePromises.push(defaultPromise);
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
        const allSpritesLoaded = Object.values(SPRITE_SHEETS_URLS).every(key => userImageCache[key]?.loaded);
        if (!allSpritesLoaded && !imageLoadError) setImageLoadError("Some character sprites failed to load; using fallback where needed.");
        
        setCriticalImagesLoaded(true);
      } catch (err) {
        console.error("Fetch Space Error:", err);
        setImageLoadError("Failed to load space data or critical assets.");
        setCriticalImagesLoaded(true); 
      }
    };

    fetchSpaceAndElements();
  }, [spaceId, token, isConnecting]);
  
  // useEffect for user position initialization ( 그대로 사용 )
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

  // useEffect for animation loop ( 그대로 사용 )
   useEffect(() => {
    if (!connected || !criticalImagesLoaded || Object.keys(users).length === 0) {
        if(animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        return;
    }
    
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
          } else if (animatedPos && !user) { 
            delete nextPositions[userId];
            needsUpdate = true;
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

  // useEffect for emoji/chat cleanup ( 그대로 사용 )
  useEffect(() => {
    const emojiInterval = setInterval(() => {
      setEmojis((prev) => prev.filter((e) => Date.now() < e.expiresAt));
    }, 1000);
    const chatInterval = setInterval(() => {
      setChatMessages((prev) => prev.filter((m) => Date.now() < m.expiresAt));
    }, 1000);
    return () => {
      clearInterval(emojiInterval);
      clearInterval(chatInterval);
    };
  }, []);

  // getSpriteDetails ( 그대로 사용 )
  const getSpriteDetails = useCallback((userId: string, direction: string, currentX: number, currentY: number, targetX: number, targetY: number) => {
    const isVisuallyMoving = Math.abs(targetX * CELL_SIZE - currentX) > 1 || Math.abs(targetY * CELL_SIZE - currentY) > 1;
    const animState = isVisuallyMoving ? "run" : "idle";
    const spriteKey = `${animState}_${direction.toLowerCase()}`;
    
    let spriteAsset = userImageCache[spriteKey];
    if (!spriteAsset || !spriteAsset.loaded) {
      spriteAsset = userImageCache["default"]; 
      if (!spriteAsset || !spriteAsset.loaded) return null;
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
  }, []);

  // Canvas Drawing Logic (useEffect) ( 그대로 사용 )
  useEffect(() => {
    if (!canvasRef.current || !criticalImagesLoaded) return; 
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const { width: gridW, height: gridH } = gridSize;
    canvasRef.current.width = gridW * CELL_SIZE;
    canvasRef.current.height = gridH * CELL_SIZE;

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    if (backgroundImgRef.current && backgroundImgRef.current.complete && backgroundImgRef.current.naturalHeight !== 0) {
      ctx.drawImage(backgroundImgRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
    } else { 
      ctx.fillStyle = "#1a202c"; 
      ctx.fillRect(0,0, canvasRef.current.width, canvasRef.current.height);
      ctx.strokeStyle = "#2d3748"; 
      for (let x = 0; x <= gridW; x++) {
        ctx.beginPath(); ctx.moveTo(x * CELL_SIZE, 0); ctx.lineTo(x * CELL_SIZE, gridH * CELL_SIZE); ctx.stroke();
      }
      for (let y = 0; y <= gridH; y++) {
        ctx.beginPath(); ctx.moveTo(0, y * CELL_SIZE); ctx.lineTo(gridW * CELL_SIZE, y * CELL_SIZE); ctx.stroke();
      }
    }

    spaceElements.forEach((e) => {
      const cache = elementImageCache[e.elementDefinition.id];
      if (cache?.loaded && cache.img.complete && cache.img.naturalHeight !== 0) {
        ctx.drawImage(cache.img, e.x, e.y, e.elementDefinition.width, e.elementDefinition.height);
      } else { 
        ctx.fillStyle = "rgba(100, 100, 100, 0.5)";
        ctx.fillRect(e.x, e.y, e.elementDefinition.width, e.elementDefinition.height);
        ctx.strokeStyle = "rgba(200, 200, 200, 0.7)";
        ctx.strokeRect(e.x, e.y, e.elementDefinition.width, e.elementDefinition.height);
      }
    });
    
    Object.keys(animatedUserPositions).sort((a, b) => { 
        const userA = animatedUserPositions[a];
        const userB = animatedUserPositions[b];
        if (!userA || !userB) return 0;
        return userA.currentPixelY - userB.currentPixelY;
    }).forEach((userId) => {
      const user = users[userId];
      const animPos = animatedUserPositions[userId];
      if (!user || !animPos) return;

      const spriteDetails = getSpriteDetails(user.id, user.direction, animPos.currentPixelX, animPos.currentPixelY, user.x, user.y);

      if (spriteDetails && spriteDetails.img && spriteDetails.img.complete && spriteDetails.img.naturalHeight !==0) {
        try {
            ctx.drawImage(
              spriteDetails.img,
              spriteDetails.sourceX, spriteDetails.sourceY,
              spriteDetails.sourceWidth, spriteDetails.sourceHeight,
              animPos.currentPixelX, animPos.currentPixelY,
              RENDER_CHARACTER_WIDTH, RENDER_CHARACTER_HEIGHT
            );
        } catch (e) {
            console.error(`Error drawing sprite for user ${userId}:`, e, spriteDetails);
            ctx.fillStyle = userId === selfId ? "rgba(99, 102, 241, 0.8)" : "rgba(239, 68, 68, 0.8)"; 
            ctx.fillRect(animPos.currentPixelX + 2, animPos.currentPixelY + 2, RENDER_CHARACTER_WIDTH - 4, RENDER_CHARACTER_HEIGHT - 4);
        }
      } else { 
        ctx.fillStyle = userId === selfId ? "rgba(99, 102, 241, 0.8)" : "rgba(239, 68, 68, 0.8)"; 
        ctx.fillRect(animPos.currentPixelX + 2, animPos.currentPixelY + 2, RENDER_CHARACTER_WIDTH - 4, RENDER_CHARACTER_HEIGHT - 4);
      }
      
      const activeEmoji = emojis.find(e => e.userId === userId);
      if (activeEmoji) {
        ctx.font = "24px Arial";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.shadowColor = "rgba(255, 255, 255, 0.7)";
        ctx.shadowBlur = 5;
        ctx.fillText(activeEmoji.emoji, animPos.currentPixelX + RENDER_CHARACTER_WIDTH / 2, animPos.currentPixelY - 15);
        ctx.shadowColor = "transparent"; 
        ctx.shadowBlur = 0;
      }

      const userChatMessages = chatMessages.filter(msg => msg.userId === userId);
      userChatMessages.forEach((msg, index) => {
        const yOffset = - (activeEmoji ? 45 : 15) - (index * 25); 
        
        ctx.font = "bold 13px 'Segoe UI', sans-serif";
        const textWidth = ctx.measureText(msg.message).width;
        const bubblePadding = 8;
        const bubbleHeight = 20;
        const bubbleX = animPos.currentPixelX + RENDER_CHARACTER_WIDTH / 2 - textWidth / 2 - bubblePadding;
        const bubbleY = animPos.currentPixelY + yOffset - bubbleHeight;

        ctx.fillStyle = "rgba(255, 255, 255, 0.9)"; 
        ctx.strokeStyle = "rgba(0,0,0,0.3)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(bubbleX + 5, bubbleY);
        ctx.lineTo(bubbleX + textWidth + bubblePadding * 2 - 5, bubbleY);
        ctx.quadraticCurveTo(bubbleX + textWidth + bubblePadding * 2, bubbleY, bubbleX + textWidth + bubblePadding * 2, bubbleY + 5);
        ctx.lineTo(bubbleX + textWidth + bubblePadding * 2, bubbleY + bubbleHeight -5);
        ctx.quadraticCurveTo(bubbleX + textWidth + bubblePadding * 2, bubbleY + bubbleHeight, bubbleX + textWidth + bubblePadding * 2 - 5, bubbleY + bubbleHeight);
        ctx.lineTo(bubbleX + 5, bubbleY + bubbleHeight);
        ctx.quadraticCurveTo(bubbleX, bubbleY + bubbleHeight, bubbleX, bubbleY + bubbleHeight - 5);
        ctx.lineTo(bubbleX, bubbleY + 5);
        ctx.quadraticCurveTo(bubbleX, bubbleY, bubbleX + 5, bubbleY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#1e293b"; 
        ctx.textAlign = "center";
        ctx.fillText(msg.message, animPos.currentPixelX + RENDER_CHARACTER_WIDTH / 2, animPos.currentPixelY + yOffset - bubblePadding / 2);
      });
    });
  }, [animatedUserPositions, users, spaceElements, criticalImagesLoaded, gridSize, selfId, emojis, chatMessages, getSpriteDetails]);

  // isPositionValid ( 그대로 사용 )
  const isPositionValid = useCallback((x: number, y: number) => {
    const userPixelLeft = x * CELL_SIZE;
    const userPixelRight = userPixelLeft + RENDER_CHARACTER_WIDTH;
    const userPixelTop = y * CELL_SIZE;
    const userPixelBottom = userPixelTop + RENDER_CHARACTER_HEIGHT;

    if (userPixelLeft < 0 || userPixelRight > gridSize.width * CELL_SIZE || 
        userPixelTop < 0 || userPixelBottom > gridSize.height * CELL_SIZE) {
      return false;
    }
    
    // const staticCollision = spaceElements.some(e => {
    //   if (!e.elementDefinition.static) return false;
    //   const elLeft = e.x;
    //   const elRight = elLeft + e.elementDefinition.width;
    //   const elTop = e.y;
    //   const elBottom = elTop + e.elementDefinition.height;
    //   console.log(elLeft,elBottom,elTop,elRight)
    //   return userPixelLeft < elRight && userPixelRight > elLeft && userPixelTop < elBottom && userPixelBottom > elTop;
    // });
    // if (staticCollision) return false;
    return true;
  }, [spaceElements, gridSize, selfId]);


  // Key Actions (movement and panel toggles)
  const keyActions = useCallback(() => ({
    ArrowLeft: () => { if (selfId && users[selfId] && !isMovingSelf) { const nx = users[selfId].x - 1; const ny = users[selfId].y; if (isPositionValid(nx, ny)) moveUser(nx, ny); }},
    ArrowRight: () => { if (selfId && users[selfId] && !isMovingSelf) { const nx = users[selfId].x + 1; const ny = users[selfId].y; if (isPositionValid(nx, ny)) moveUser(nx, ny); }},
    ArrowUp: () => { if (selfId && users[selfId] && !isMovingSelf) { const nx = users[selfId].x; const ny = users[selfId].y - 1; if (isPositionValid(nx, ny)) moveUser(nx, ny); }},
    ArrowDown: () => { if (selfId && users[selfId] && !isMovingSelf) { const nx = users[selfId].x; const ny = users[selfId].y + 1; if (isPositionValid(nx, ny)) moveUser(nx, ny); }},
    h: () => setShowEmojiPanel(prev => !prev), // Toggle emoji panel
    i: () => { // Open message input
        if (!showMessageInput) {
            setShowMessageInput(true);
            setShowEmojiPanel(false); // Close emoji panel if opening message input
        }
    },
  }), [selfId, users, moveUser, isPositionValid, isMovingSelf, showMessageInput, setShowMessageInput, setShowEmojiPanel]);

  // Centralized KeyDown Handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLCanvasElement>) => {
    if (!connected || !selfId || !users[selfId]) return;

    // Priority 1: Message input is open
    if (showMessageInput) {
        if (e.key === "Escape") {
            setShowMessageInput(false);
            setMessageInput("");
            e.preventDefault();
        }
        // Allow text input, Enter/Escape are handled by the input's onKeyDown prop
        return;
    }

    // Priority 2: Emoji panel is open
    if (showEmojiPanel) {
        const keyNumber = parseInt(e.key, 10);
        if (!isNaN(keyNumber) && keyNumber >= 1 && keyNumber <= EMOJI_OPTIONS.length) {
            const selectedEmoji = EMOJI_OPTIONS[keyNumber - 1];
            sendAction("show-emoji", selectedEmoji);
            setShowEmojiPanel(false);
            e.preventDefault();
        } else if (e.key.toLowerCase() === 'h' || e.key === "Escape") {
            setShowEmojiPanel(false);
            e.preventDefault();
        } else {
            // Prevent other game actions (like movement) while emoji panel is open
            e.preventDefault();
        }
        return; // Key handled (or intentionally blocked)
    }

    // Priority 3: General game controls (movement, opening panels)
    const actionsForKey = keyActions();
    const action = actionsForKey[e.key.toLowerCase() as keyof typeof actionsForKey] || actionsForKey[e.key as keyof typeof actionsForKey] ;

    if (action) {
        action();
        e.preventDefault();
    }
  }, [
    connected, selfId, users,
    showMessageInput, setShowMessageInput, setMessageInput,
    showEmojiPanel, setShowEmojiPanel, sendAction,
    keyActions
  ]);

  // UI States ( 그대로 사용, 이전 버전의 개선된 UI )
  if (!token || !spaceId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
        <Card className="w-96 bg-slate-800 border border-slate-700 text-slate-100">
          <CardHeader><CardTitle className="text-red-400">Connection Issue</CardTitle></CardHeader>
          <CardContent><p>Missing token or Space ID. Please check and try again.</p></CardContent>
        </Card>
      </div>
    );
  }

  if (!isConnecting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 selection:bg-indigo-500 selection:text-white">
        <Card className="w-96 bg-slate-800/80 backdrop-blur-md border border-slate-700 text-slate-100 shadow-xl">
          <CardHeader><CardTitle className="text-indigo-400 text-center text-2xl">Join Space: <span className="font-semibold text-slate-50">{spaceId}</span></CardTitle></CardHeader>
          <CardContent className="flex flex-col items-center space-y-6">
            <p className="text-slate-300">Ready to enter this digital arena?</p>
            <button
              onClick={() => setIsConnecting(true)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75"
            >
              Connect to Arena
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!criticalImagesLoaded && !imageLoadError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
        <Card className="w-80 bg-slate-800 border border-slate-700 text-slate-100">
          <CardHeader><CardTitle className="text-indigo-400">Loading Assets...</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 bg-indigo-500 rounded-full animate-pulse delay-0"></div>
            <div className="w-4 h-4 bg-indigo-500 rounded-full animate-pulse delay-150"></div>
            <div className="w-4 h-4 bg-indigo-500 rounded-full animate-pulse delay-300"></div>
            <p className="text-slate-300">Preparing your space...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (imageLoadError && !connected) { 
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
        <Card className="w-96 bg-slate-800 border border-slate-700 text-slate-100">
          <CardHeader><CardTitle className="text-red-400">Asset Loading Issue</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-red-300">{imageLoadError}</p>
            <p className="text-sm text-slate-400">There was a problem loading essential assets. This might affect your experience.</p>
            <button
              onClick={() => { setIsConnecting(false); setImageLoadError(null); setCriticalImagesLoaded(false); }}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded-md transition-colors"
            >
              Attempt Reconnect
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!connected && !wsError && isConnecting) { 
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
        <Card className="w-96 bg-slate-800 border border-slate-700 text-slate-100">
          <CardHeader><CardTitle className="text-indigo-400">Establishing Connection</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 bg-indigo-500 rounded-full animate-ping"></div>
            <p className="text-slate-300">Connecting to "{spaceId}"...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (wsError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
        <Card className="w-96 bg-slate-800 border border-slate-700 text-slate-100">
          <CardHeader><CardTitle className="text-red-400">Connection Error</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-red-300 mb-4">{wsError}</p>
            <button
              onClick={() => {setIsConnecting(false); setCriticalImagesLoaded(false); setImageLoadError(null);}}
              className="w-full bg-slate-600 hover:bg-slate-500 text-white py-2 px-4 rounded-md transition-colors"
            >
              Go Back
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main Arena View
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 pt-24 selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Emoji Panel */}
      <div
        className={`fixed bottom-0 left-1/2 transform -translate-x-1/2 mb-5 z-50 transition-all duration-300 ease-out
          ${showEmojiPanel ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"}`}
      >
        <div className="bg-slate-700/80 backdrop-blur-md p-3 rounded-xl shadow-2xl flex flex-wrap gap-2 items-center justify-center border border-slate-600 min-w-[300px]">
          {EMOJI_OPTIONS.map((emoji, index) => (
            <button
              key={emoji}
              onClick={() => {
                sendAction("show-emoji", emoji);
                setShowEmojiPanel(false);
              }}
              className="relative text-3xl p-2.5 rounded-lg hover:bg-slate-600/70 active:bg-slate-500/90 transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              title={`Send ${emoji} (Press ${index + 1})`}
            >
              {emoji}
              <span
                className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center bg-indigo-600 text-white text-xs font-semibold rounded-full shadow-sm pointer-events-none border-2 border-slate-700"
                aria-hidden="true"
              >
                {index + 1}
              </span>
            </button>
          ))}
          <button
            onClick={() => setShowEmojiPanel(false)}
            className="p-2 rounded-lg hover:bg-slate-600/70 active:bg-slate-500/90 transition-colors text-slate-300 hover:text-white"
            title="Close Emoji Panel (Esc or H)"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Message Input Modal ( 그대로 사용 ) */}
      {showMessageInput && (
        <div
          className={`fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 transition-opacity duration-300 ease-out
            ${showMessageInput ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          onClick={() => setShowMessageInput(false)}
        >
          <div
            className={`bg-slate-800 p-5 rounded-xl shadow-xl border border-slate-700 w-full max-w-md mx-4 transform transition-all duration-300 ease-out
              ${showMessageInput ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-indigo-300">Send a Message</h3>
              <button onClick={() => setShowMessageInput(false)} className="text-slate-400 hover:text-slate-200 transition-colors">
                <X size={24} />
              </button>
            </div>
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && messageInput.trim()) {
                  sendMessage(messageInput);
                  setShowMessageInput(false);
                  setMessageInput("");
                } else if (e.key === "Escape") {
                  setShowMessageInput(false);
                  setMessageInput("");
                }
              }}
              className="border border-slate-600 bg-slate-700 text-slate-100 p-3 rounded-md w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none placeholder-slate-400"
              placeholder="Type your message (max 50 chars)..."
              autoFocus
              maxLength={50}
            />
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowMessageInput(false);
                  setMessageInput("");
                }}
                className="px-5 py-2 rounded-md text-slate-300 bg-slate-600 hover:bg-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (messageInput.trim()) {
                    sendMessage(messageInput);
                    setShowMessageInput(false);
                    setMessageInput("");
                  }
                }}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-400"
                disabled={!messageInput.trim()}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
      
      <canvas
        ref={canvasRef}
        tabIndex={0}
        autoFocus
        className="border-2 border-slate-600/50 rounded-xl shadow-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/70 my-4"
        onKeyDown={handleKeyDown} // Centralized handler
        style={{ imageRendering: "pixelated" }}
      />
      
      {/* Controls Info Box ( 그대로 사용 ) */}
       <div className="mt-2 p-4 bg-slate-800/70 backdrop-blur-md border border-slate-700/80 rounded-lg shadow-xl text-sm text-slate-300 w-full max-w-lg flex flex-col space-y-2">
        <div className="flex justify-between items-center">
            <div className="font-bold text-indigo-300 text-base">Controls:</div>
            {selfId && users[selfId] && (
              <div className="text-xs text-slate-400">
                Pos: ({users[selfId].x}, {users[selfId].y}) | Dir: {users[selfId].direction}
              </div>
            )}
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <span className="flex items-center gap-1.5"><span className="font-mono w-8 text-center px-2 py-1 bg-slate-700 border border-slate-600 rounded-md text-indigo-300 shadow-sm">←</span> Move Left</span>
            <span className="flex items-center gap-1.5"><span className="font-mono w-8 text-center px-2 py-1 bg-slate-700 border border-slate-600 rounded-md text-indigo-300 shadow-sm">↑</span> Move Up</span>
            <span className="flex items-center gap-1.5"><span className="font-mono w-8 text-center px-2 py-1 bg-slate-700 border border-slate-600 rounded-md text-indigo-300 shadow-sm">→</span> Move Right</span>
            <span className="flex items-center gap-1.5"><span className="font-mono w-8 text-center px-2 py-1 bg-slate-700 border border-slate-600 rounded-md text-indigo-300 shadow-sm">↓</span> Move Down</span>
        </div>
        <div className="flex items-center gap-4 pt-2 border-t border-slate-700/50">
          <span className="flex items-center gap-1.5"><span className="font-mono w-8 text-center px-2 py-1 bg-slate-700 border border-slate-600 rounded-md text-indigo-300 shadow-sm">H</span> Toggle Emojis <SmilePlus size={16} className="inline text-yellow-400"/></span>
          <span className="flex items-center gap-1.5"><span className="font-mono w-8 text-center px-2 py-1 bg-slate-700 border border-slate-600 rounded-md text-indigo-300 shadow-sm">I</span> Send Message <MessageSquareText size={16} className="inline text-sky-400"/></span>
        </div>
        <div className="text-xs text-slate-400 pt-1">When emoji panel is open, use <span className="font-mono text-indigo-300">1-{EMOJI_OPTIONS.length}</span> to select, <span className="font-mono text-indigo-300">Esc</span> or <span className="font-mono text-indigo-300">H</span> to close.</div>
        {imageLoadError && !connected && <p className="text-xs text-amber-400 mt-1">Note: {imageLoadError} Some visuals may be affected.</p>}
      </div>
    </div>
  );
}