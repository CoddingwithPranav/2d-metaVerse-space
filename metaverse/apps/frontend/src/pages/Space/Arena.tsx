import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { BACKEND_URL, WS_URL } from "@/config";
import useAuth from "@/utils/Authhook";
import { useParams } from "react-router-dom";

// ### Types for WebSocket Messages
type IncomingMessage =
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
  | { type: "user-left"; payload: { userId: string } };

// UserState from WebSocket (target grid positions)
type UserState = { id: string; x: number; y: number };

// SpaceElement type based on backend response
type SpaceElementInState = {
  id: string;
  x: number;
  y: number;
  elementDefinition: {
    id: string;
    imageUrl: string;
    width: number;
    height: number;
  };
};

// For storing animated pixel positions
type AnimatedUserDisplayState = {
  currentPixelX: number;
  currentPixelY: number;
};

// ### Constants
const CELL_SIZE = 20;
const GRID_DEFAULT = { width: 50, height: 50 };
const ANIMATION_SPEED = 0.15;
const DEFAULT_USER_IMAGE_URL = "https://api.dicebear.com/8.x/pixel-art/svg?seed=default";

// ### Image Caches
const userImageCache: { default?: { img: HTMLImageElement; loaded: boolean } } |any = {};
const elementImageCache: Record<string, { img: HTMLImageElement; width: number; height: number; loaded: boolean }> = {};

// ### Custom WebSocket Hook
const useWebSocket = (url: string, token: string, spaceId: string) => {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [selfId, setSelfId] = useState<string | null>(null);
  const [users, setUsers] = useState<Record<string, UserState>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !spaceId) return;
    const connect = () => {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        setError(null);
        ws.send(JSON.stringify({ type: "join", payload: { token, spaceId } }));
      };

      ws.onmessage = (ev) => {
        const msg = JSON.parse(ev.data) as IncomingMessage;
        switch (msg.type) {
          case "space-joined":
            setSelfId(msg.payload.userId);
            setUsers(() => {
              const allUsers: Record<string, UserState> = {
                [msg.payload.userId]: { id: msg.payload.userId, x: msg.payload.spawn.x, y: msg.payload.spawn.y },
              };
              msg.payload.users.forEach((u) => {
                allUsers[u.id] = { id: u.id, x: u.x, y: u.y };
              });
              return allUsers;
            });
            break;
          case "user-joined":
            setUsers((prev) => ({
              ...prev,
              [msg.payload.userId]: { id: msg.payload.userId, x: msg.payload.x, y: msg.payload.y },
            }));
            break;
          case "user-moved":
            setUsers((prev) => ({
              ...prev,
              [msg.payload.id]: { id: msg.payload.id, x: msg.payload.x, y: msg.payload.y },
            }));
            break;
          case "movement-rejected":
            if (selfId)
              setUsers((prev) => ({
                ...prev,
                [selfId]: { ...prev[selfId], x: msg.payload.x, y: msg.payload.y },
              }));
            break;
          case "user-left":
            setUsers((prev) => {
              const updatedUsers = { ...prev };
              delete updatedUsers[msg.payload.userId];
              return updatedUsers;
            });
            break;
        }
      };

      ws.onclose = () => {
        setConnected(false);
        if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSING) {
          setError("Connection lost. Attempting to reconnect...");
          setTimeout(connect, 3000);
        }
      };

      ws.onerror = (err) => {
        setError("WebSocket error occurred. Check console for details.");
        console.error("WebSocket error: ", err);
      };
    };

    connect();
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [url, token, spaceId]);

  const moveUser = (x: number, y: number) => {
    if (!selfId || !connected) return;
    setUsers((prev) => {
      if (!prev[selfId]) return prev;
      return { ...prev, [selfId]: { ...prev[selfId], x, y } };
    });
    wsRef.current?.send(JSON.stringify({ type: "move", payload: { x, y } }));
  };

  return { connected, selfId, users, moveUser, error };
};

// ### Main Arena Component
export default function Arena() {
  const { spaceId } = useParams<{ spaceId: string }>();
  const { token } = useAuth();
  const { connected, selfId, users, moveUser, error: wsError } = useWebSocket(WS_URL, token || "", spaceId || "");

  const [spaceElements, setSpaceElements] = useState<SpaceElementInState[]>([]);
  const [gridSize, setGridSize] = useState(GRID_DEFAULT);
  const [criticalImagesLoaded, setCriticalImagesLoaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const [animatedUserPositions, setAnimatedUserPositions] = useState<Record<string, AnimatedUserDisplayState>>({});
  const backgroundImgRef = useRef<HTMLImageElement | null>(null);

  // Fetch space data and preload images
  useEffect(() => {
    if (!spaceId || !token) return;

    const fetchSpaceAndElements = async () => {
      try {
        setCriticalImagesLoaded(false);
        const res = await axios.get(`${BACKEND_URL}/space/${spaceId}`, {
          headers: { authorization: `Bearer ${token}` },
        });
        const BackgroundImageUrl = res.data.backgroundUrl;
        const [width, height] = res.data.dimensions.toLowerCase().split("x").map(Number);
        setGridSize({ width, height });

        const fetchedElements: SpaceElementInState[] = res.data.elements.map((el: any) => ({
          id: el.id,
          x: el.x,
          y: el.y,
          elementDefinition: {
            id: el.element.id,
            imageUrl: el.element.imageUrl,
            width: Number(el.element.width),
            height: Number(el.element.height),
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
                console.error(`Failed to load element image: ${e.elementDefinition.imageUrl}`);
                resolve();
              };
            });
          }
          return Promise.resolve();
        });

        // Load default user image
        const userImagePromise = new Promise<void>((resolve) => {
          if (!userImageCache["default"]) {
            const img = new Image();
            img.src = DEFAULT_USER_IMAGE_URL;
            userImageCache["default"] = { img, loaded: false };
            img.onload = () => {
              userImageCache["default"].loaded = true;
              resolve();
            };
            img.onerror = () => {
              console.error("Failed to load default user image");
              resolve();
            };
          } else {
            resolve();
          }
        });

        const imagePromises = [...elementImagePromises, userImagePromise];

        // Load background image if available
        if (BackgroundImageUrl) {
          const bgImg = new Image();
          bgImg.src = BackgroundImageUrl;
          backgroundImgRef.current = bgImg;
          const bgPromise = new Promise<void>((resolve) => {
            bgImg.onload = () => resolve();
            bgImg.onerror = () => {
              console.error(`Failed to load background image: ${BackgroundImageUrl}`);
              resolve();
            };
          });
          imagePromises.push(bgPromise);
        }

        await Promise.all(imagePromises);
        setCriticalImagesLoaded(true);
      } catch (err) {
        console.error("Failed to fetch space:", err);
      }
    };

    fetchSpaceAndElements();
  }, [spaceId, token]);

  // Initialize and update animated positions
  useEffect(() => {
    const newAnimatedPositions = { ...animatedUserPositions };
    let positionsChanged = false;

    Object.values(users).forEach((user) => {
      if (!newAnimatedPositions[user.id]) {
        newAnimatedPositions[user.id] = {
          currentPixelX: user.x * CELL_SIZE,
          currentPixelY: user.y * CELL_SIZE,
        };
        positionsChanged = true;
      }
    });

    Object.keys(newAnimatedPositions).forEach((uid) => {
      if (!users[uid]) {
        delete newAnimatedPositions[uid];
        positionsChanged = true;
      }
    });

    if (positionsChanged) {
      setAnimatedUserPositions(newAnimatedPositions);
    }
  }, [users]);

  // Animation loop for smooth movement
  useEffect(() => {
    if (!connected || !criticalImagesLoaded) return;

    const animate = () => {
      setAnimatedUserPositions((prevPositions) => {
        const nextPositions = { ...prevPositions };
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
          } else if (user && !animatedPos) {
            nextPositions[userId] = {
              currentPixelX: user.x * CELL_SIZE,
              currentPixelY: user.y * CELL_SIZE,
            };
            needsUpdate = true;
          }
        });
        return needsUpdate ? nextPositions : prevPositions;
      });
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [connected, criticalImagesLoaded, users]);

  // Render the canvas
  useEffect(() => {
    if (!canvasRef.current || !criticalImagesLoaded) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const { width: gridW, height: gridH } = gridSize;
    canvasRef.current.width = gridW ;
    canvasRef.current.height = gridH ;

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Draw background image if available, otherwise draw grid
    if (backgroundImgRef.current) {
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

    // Draw space elements
    spaceElements.forEach((e) => {
      const xPx = e.x ;
      const yPx = e.y ;
      const cache = elementImageCache[e.elementDefinition.id];
      if (cache?.loaded) {
        ctx.drawImage(cache.img, xPx, yPx, cache.width , cache.height );
      } else {
        ctx.fillStyle = "#ccc";
        ctx.fillRect(xPx, yPx, e.elementDefinition.width * CELL_SIZE, e.elementDefinition.height * CELL_SIZE);
      }
    });

    // Draw users with default image
    const defaultImg = userImageCache["default"]?.img;
    Object.keys(animatedUserPositions).forEach((userId) => {
      const user = users[userId];
      const animatedPos = animatedUserPositions[userId];

      if (!user || !animatedPos) return;

      const xPx = animatedPos.currentPixelX;
      const yPx = animatedPos.currentPixelY;

      if (defaultImg && userImageCache["default"]?.loaded) {
        ctx.drawImage(defaultImg, xPx, yPx, CELL_SIZE, CELL_SIZE);
      } else {
        ctx.fillStyle = userId === selfId ? "#3b82f6" : "#ef4444";
        ctx.fillRect(xPx + 1, yPx + 1, CELL_SIZE - 2, CELL_SIZE - 2);
      }
    });
  }, [animatedUserPositions, users, spaceElements, criticalImagesLoaded, gridSize, selfId]);

  // Handle keyboard movement
  const handleKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    if (!connected || !selfId || !users[selfId]) return;
    const me = users[selfId];
    let nx = me.x,
      ny = me.y;

    switch (e.key) {
      case "ArrowUp":
        ny--;
        break;
      case "ArrowDown":
        ny++;
        break;
      case "ArrowLeft":
        nx--;
        break;
      case "ArrowRight":
        nx++;
        break;
      default:
        return;
    }

    moveUser(nx, ny);
    e.preventDefault();
  };

  const displayError = wsError || (!token && "Authentication token is missing.") || (!spaceId && "Space ID is missing.");

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      {!connected && displayError ? (
        <Card className="w-96">
          <CardHeader>
            <CardTitle>{displayError ? "Connection Issue" : "Connecting to Space"}</CardTitle>
          </CardHeader>
          <CardContent>
            {displayError && <p className="text-red-500">{displayError}</p>}
            {!displayError && <p>Establishing connection...</p>}
          </CardContent>
        </Card>
      ) : !criticalImagesLoaded ? (
        <Card className="w-80">
          <CardHeader>
            <CardTitle>Loading Space...</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Fetching elements and images...</p>
          </CardContent>
        </Card>
      ) : (
        <div className="relative">
          <canvas
            ref={canvasRef}
            tabIndex={0}
            autoFocus
            className="border rounded shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={handleKeyDown}
          />
          <div className="absolute top-2 left-2 bg-white p-2 rounded opacity-75 shadow">
            <div className="font-semibold">Controls:</div>
            <div className="flex items-center gap-1 mt-1 text-gray-700">
              <ArrowUp size={20} /> <ArrowDown size={20} /> <ArrowLeft size={20} /> <ArrowRight size={20} />
              <span className="ml-1 text-sm">(Arrow Keys)</span>
            </div>
            {selfId && users[selfId] && (
              <div className="mt-1 text-xs text-gray-600">
                Your Pos: ({users[selfId].x}, {users[selfId].y})
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}