// import React, { useState, useRef, useEffect } from "react";
// import axios from "axios";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import {
//   ArrowUp,
//   ArrowDown,
//   ArrowLeft,
//   ArrowRight,
// } from "lucide-react";
// import { BACKEND_URL, WS_URL } from "@/config";
// import useAuth from "@/utils/Authhook";
// import { useParams } from "react-router-dom";

// // ### Types for WebSocket Messages
// type IncomingMessage =
//   | {
//       type: "space-joined";
//       payload: {
//         userId: string;
//         spawn: { x: number; y: number };
//         users: { id: string; x: number; y: number }[];
//       };
//     }
//   | { type: "user-joined"; payload: { userId: string; x: number; y: number } }
//   | { type: "user-moved"; payload: { id: string; x: number; y: number } }
//   | { type: "movement-rejected"; payload: { x: number; y: number } }
//   | { type: "user-left"; payload: { userId: string } };

// type OutgoingMessage =
//   | { type: "join"; payload: { token: string; spaceId: string } }
//   | { type: "move"; payload: { x: number; y: number } };

// type UserState = { id: string; x: number; y: number };
// type SpaceElement = { id: string; elementId: string; x: number; y: number };

// // ### Constants
// const CELL_SIZE = 20;
// const GRID_DEFAULT = { width: 50, height: 50 };

// // ### Image Caches
// const userImageCache: Record<string, { img: HTMLImageElement; loaded: boolean }> = {};
// const elementImageCache: Record<string, { img: HTMLImageElement; width: number; height: number; loaded: boolean }> = {};

// // ### Custom WebSocket Hook
// const useWebSocket = (url: string, token: string, spaceId: string) => {
//   const wsRef = useRef<WebSocket | null>(null);
//   const [connected, setConnected] = useState(false);
//   const [selfId, setSelfId] = useState<string | null>(null);
//   const [users, setUsers] = useState<Record<string, UserState>>({});
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const connect = () => {
//       const ws = new WebSocket(url);
//       wsRef.current = ws;

//       ws.onopen = () => {
//         setConnected(true);
//         setError(null);
//         ws.send(JSON.stringify({ type: "join", payload: { token, spaceId } }));
//       };

//       ws.onmessage = (ev) => {
//         const msg = JSON.parse(ev.data) as IncomingMessage;
//         switch (msg.type) {
//           case "space-joined":
//             setSelfId(msg.payload.userId);
//             setUsers(() => {
//               const all: Record<string, UserState> = {
//                 [msg.payload.userId]: { id: msg.payload.userId, x: msg.payload.spawn.x, y: msg.payload.spawn.y },
//               };
//               msg.payload.users.forEach(u => { all[u.id] = u; });
//               return all;
//             });
//             break;
//           case "user-joined":
//             setUsers((prev:any) => ({ ...prev, [msg.payload.userId]: msg.payload }));
//             break;
//           case "user-moved":
//             setUsers(prev => ({ ...prev, [msg.payload.id]: msg.payload }));
//             break;
//           case "movement-rejected":
//             if (selfId) setUsers(prev => ({ ...prev, [selfId]: { id: selfId, x: msg.payload.x, y: msg.payload.y } }));
//             break;
//           case "user-left":
//             setUsers(prev => { const c = { ...prev }; delete c[msg.payload.userId]; return c; });
//             break;
//         }
//       };

//       ws.onclose = () => {
//         setConnected(false);
//         setError("Connection lost. Attempting to reconnect...");
//         setTimeout(connect, 1000); // Reconnect after 1s
//       };

//       ws.onerror = () => setError("WebSocket error occurred");
//     };

//     connect();
//     return () => { wsRef.current?.close(); };
//   }, [url, token, spaceId]);

//   const moveUser = (x: number, y: number) => {
//     if (!selfId) return;
//     setUsers(prev => {
//       if (!prev[selfId]) return prev;
//       return { ...prev, [selfId]: { ...prev[selfId], x, y } };
//     });
//     wsRef.current?.send(JSON.stringify({ type: "move", payload: { x, y } }));
//   };

//   return { connected, selfId, users, moveUser, error };
// };

// // ### Main Arena Component
// export default function Arena() {
//   const { spaceId } = useParams<{ spaceId: string }>();
//   const { token } = useAuth();
//   const { connected, selfId, users, moveUser, error } = useWebSocket(WS_URL, token || "", spaceId || "");
//   const [spaceElements, setSpaceElements] = useState<SpaceElement[]>([]);
//   const [gridSize, setGridSize] = useState(GRID_DEFAULT);
//   const [imagesLoaded, setImagesLoaded] = useState(false);
//   const canvasRef = useRef<HTMLCanvasElement>(null);

//   // Fetch space data and preload images
//   useEffect(() => {
//     if (!spaceId) return;

//     const fetchSpace = async () => {
//       try {
//         const res = await axios.get(`${BACKEND_URL}/space/${spaceId}`, {
//           headers: { authorization: `Bearer ${token}` },
//         });
//         const [width, height] = res.data.dimensions.toLowerCase().split("x").map(Number);
//         setGridSize({ width, height });
//         setSpaceElements(res.data.elements);

//         // Preload element images
//         const elementPromises = res.data.elements.map(async (e: SpaceElement) => {
//           if (!elementImageCache[e.elementId]) {
//             const img = new Image();
//             const response = await axios.get(`${BACKEND_URL}/element/${e.id}`);
//             const { width = 1, height = 1, mapElement } = response.data.element;
//             img.src = mapElement?.imageUrl || "";
//             elementImageCache[e.elementId] = { img, width, height, loaded: false };
//             return new Promise<void>(resolve => {
//               img.onload = () => {
//                 elementImageCache[e.elementId].loaded = true;
//                 resolve();
//               };
//               img.onerror = () => resolve();
//             });
//           }
//         });

//         // Preload user image (initially just self)
//         if (selfId && !userImageCache[selfId]) {
//           const img = new Image();
//           img.src = "https://www.pngplay.com/wp-content/uploads/12/Anime-Profile-Pictures-Transparent-File.png";
//           userImageCache[selfId] = { img, loaded: false };
//           elementPromises.push(new Promise<void>(resolve => {
//             img.onload = () => { userImageCache[selfId].loaded = true; resolve(); };
//             img.onerror = () => resolve();
//           }));
//         }

//         await Promise.all(elementPromises || []);
//         setImagesLoaded(true);
//       } catch (err) {
//         console.error("Failed to fetch space:", err);
//       }
//     };

//     fetchSpace();
//   }, [spaceId, token, selfId]);

//   // Render the canvas
//   useEffect(() => {
//     if (!canvasRef.current || !imagesLoaded) return;
//     const ctx = canvasRef.current.getContext("2d");
//     if (!ctx) return;

//     const { width, height } = gridSize;
//     canvasRef.current.width = width * CELL_SIZE;
//     canvasRef.current.height = height * CELL_SIZE;

//     ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

//     // Draw grid
//     ctx.strokeStyle = "#eee";
//     for (let x = 0; x <= width; x++) {
//       ctx.beginPath();
//       ctx.moveTo(x * CELL_SIZE, 0);
//       ctx.lineTo(x * CELL_SIZE, height * CELL_SIZE);
//       ctx.stroke();
//     }
//     for (let y = 0; y <= height; y++) {
//       ctx.beginPath();
//       ctx.moveTo(0, y * CELL_SIZE);
//       ctx.lineTo(width * CELL_SIZE, y * CELL_SIZE);
//       ctx.stroke();
//     }

//     // Draw space elements
//     spaceElements.forEach(e => {
//       const xPx = e.x * CELL_SIZE;
//       const yPx = e.y * CELL_SIZE;
//       const cache = elementImageCache[e.id];
//       console.log(elementImageCache)
//       debugger
//       if (cache?.loaded) {
//         ctx.drawImage(cache.img, xPx, yPx, cache.width * CELL_SIZE, cache.height * CELL_SIZE);
//       } else {
//         ctx.fillStyle = "#999";
//         ctx.fillRect(xPx + 1, yPx + 1, CELL_SIZE - 2, CELL_SIZE - 2);
//       }
//     });

//     // Draw users
//     Object.values(users).forEach(u => {
//       const xPx = u.x * CELL_SIZE;
//       const yPx = u.y * CELL_SIZE;
//       const cache = userImageCache[u.id];
//       if (cache?.loaded) {
//         ctx.drawImage(cache.img, xPx, yPx, CELL_SIZE, CELL_SIZE);
//       } else {
//         ctx.fillStyle = u.id === selfId ? "#3b82f6" : "#ef4444";
//         ctx.fillRect(xPx + 1, yPx + 1, CELL_SIZE - 2, CELL_SIZE - 2);
//       }
//     });
//   }, [users, spaceElements, imagesLoaded, gridSize, selfId]);

//   // Handle keyboard movement
//   const handleKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
//     if (!connected || !selfId || !users[selfId]) return;
//     const me = users[selfId];
//     let nx = me.x, ny = me.y;

//     switch (e.key) {
//       case "ArrowUp": ny--; break;
//       case "ArrowDown": ny++; break;
//       case "ArrowLeft": nx--; break;
//       case "ArrowRight": nx++; break;
//       default: return;
//     }

//     moveUser(nx, ny);
//     e.preventDefault();
//   };

//   return (
//     <div className="flex flex-col items-center gap-6 p-6">
//       {!connected ? (
//         <Card className="w-80">
//           <CardHeader>
//             <CardTitle>{error ? "Connection Error" : "Connecting to Space"}</CardTitle>
//           </CardHeader>
//           <CardContent>
//             {error && <p className="text-red-500">{error}</p>}
//             {!error && <p>Establishing connection...</p>}
//           </CardContent>
//         </Card>
//       ) : (
//         <div className="relative">
//           <canvas
//             ref={canvasRef}
//             tabIndex={0}
//             autoFocus
//             className="border rounded shadow-lg focus:outline-none"
//             onKeyDown={handleKeyDown}
//           />
//           <div className="absolute top-2 left-2 bg-white p-2 rounded opacity-75">
//             <div className="font-semibold">Controls:</div>
//             <div className="flex gap-2 mt-1">
//               <ArrowUp /> <ArrowDown /> <ArrowLeft /> <ArrowRight />
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



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

type OutgoingMessage =
  | { type: "join"; payload: { token: string; spaceId: string } }
  | { type: "move"; payload: { x: number; y: number } };

type UserState = { id: string; x: number; y: number };
type SpaceElement = { id: string; elementId: string; x: number; y: number };

// ### Constants
const CELL_SIZE = 20;
const GRID_DEFAULT = { width: 50, height: 50 };

// ### Image Caches
const userImageCache: Record<string, { img: HTMLImageElement; loaded: boolean }> = {};
const elementImageCache: Record<string, { img: HTMLImageElement; width: number; height: number; loaded: boolean }> = {};

// ### Custom WebSocket Hook
const useWebSocket = (url: string, token: string, spaceId: string) => {
  const wsRef = useRef<WebSocket | null>(null);
  const selfIdRef = useRef<string | null>(null);
  const spawnLocationRef = useRef<{ x: number; y: number } | null>(null); // Store spawn location
  const [connected, setConnected] = useState(false);
  const [users, setUsers] = useState<Record<string, UserState>>({});
  const [error, setError] = useState<string | null>(null);
  const messageQueue = useRef<IncomingMessage[]>([]);

  useEffect(() => {
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const connect = () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        console.log("WebSocket already open, skipping connect");
        return;
      }

      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket opened, instance:", ws);
        setConnected(true);
        setError(null);
        ws.send(JSON.stringify({ type: "join", payload: { token, spaceId } }));
      };

      ws.onmessage = (ev) => {
        const msg = JSON.parse(ev.data) as IncomingMessage;
        console.log("Received message:", msg, "selfId:", selfIdRef.current);

        if (!msg.payload) {
          console.error("Invalid payload:", msg);
          return;
        }

        if (msg.type === "space-joined") {
          if (!msg.payload.userId || typeof msg.payload.spawn?.x !== 'number' || typeof msg.payload.spawn?.y !== 'number') {
            console.error("Invalid space-joined payload:", msg.payload);
            return;
          }
          selfIdRef.current = msg.payload.userId;
          spawnLocationRef.current = { x: msg.payload.spawn.x, y: msg.payload.spawn.y }; // Store spawn
          setUsers(() => {
            const all: Record<string, UserState> = {
              [msg.payload.userId]: { id: msg.payload.userId, x: msg.payload.spawn.x, y: msg.payload.spawn.y },
            };
            msg.payload.users.forEach(u => {
              if (u.id) all[u.id] = u;
            });
            return all;
          });
          console.log("Processing queued messages:", messageQueue.current);
          messageQueue.current.forEach(queuedMsg => processMessage(queuedMsg));
          messageQueue.current = [];
        } else if (!selfIdRef.current && msg.type === "movement-rejected") {
          console.log("Queuing movement-rejected, selfId is null");
          messageQueue.current.push(msg);
        } else {
          processMessage(msg);
        }
      };

      const processMessage = (msg: IncomingMessage) => {
        switch (msg.type) {
          case "user-joined":
            if (!msg.payload.userId) {
              console.error("Invalid user-joined payload:", msg.payload);
              return;
            }
            setUsers((prev:any) => ({ ...prev, [msg.payload.userId]: msg.payload }));
            break;
          case "user-moved":
            if (!msg.payload.id) {
              console.error("Invalid user-moved payload:", msg.payload);
              return;
            }
            setUsers(prev => ({ ...prev, [msg.payload.id]: msg.payload }));
            break;
          case "movement-rejected":
            if (typeof msg.payload.x !== 'number' || typeof msg.payload.y !== 'number') {
              console.error("Invalid movement-rejected payload:", msg.payload);
              // Fallback to spawn location if available
              if (selfIdRef.current && spawnLocationRef.current) {
                console.warn("Reverting to spawn location:", spawnLocationRef.current);
                setUsers(prev => ({
                  ...prev,
                  [parseInt(selfIdRef.current ?? '0')]: {
                    id: selfIdRef.current,
                    x: spawnLocationRef.current!.x,
                    y: spawnLocationRef.current!.y,
                  },
                }));
              }
              return;
            }
            if (selfIdRef.current) {
              console.log("Reverting player to:", { x: msg.payload.x, y: msg.payload.y });
              setUsers(prev => ({
                ...prev,
                [parseInt(selfIdRef.current ?? '0')]: { id: selfIdRef.current, x: msg.payload.x, y: msg.payload.y },
              }));
            } else {
              console.warn("selfId is null in movement-rejected, queuing");
              messageQueue.current.push(msg);
            }
            break;
          case "user-left":
            if (!msg.payload.userId) {
              console.error("Invalid user-left payload:", msg.payload);
              return;
            }
            setUsers(prev => {
              const c = { ...prev };
              delete c[msg.payload.userId];
              return c;
            });
            break;
          default:
            console.warn("Unknown message type:", msg.type);
        }
      };

      ws.onclose = () => {
        console.log("WebSocket closed, selfId:", selfIdRef.current);
        setConnected(false);
        setError("Connection lost. Attempting to reconnect...");
        reconnectTimeout = setTimeout(connect, 1000);
      };

      ws.onerror = () => setError("WebSocket error occurred");
    };

    connect();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [url, token, spaceId]);

  const moveUser = (x: number, y: number) => {
    if (!selfIdRef.current) {
      console.warn("moveUser: selfId is null");
      return;
    }
    setUsers(prev => {
      if (!prev[parseInt(selfIdRef.current ?? '0')]) return prev;
      return { ...prev, [parseInt(selfIdRef.current ?? '0')]: { ...prev[parseInt(selfIdRef.current ?? '0')], x, y } };
    });
    console.log("moveUser:", { users, selfId: selfIdRef.current });
    wsRef.current?.send(JSON.stringify({ type: "move", payload: { x, y } }));
  };

  return { connected, selfId: selfIdRef.current, users, moveUser, error };
};
// ### Main Arena Component
export default function Arena() {
  const { spaceId } = useParams<{ spaceId: string }>();
  const { token } = useAuth();
  const { connected, selfId, users, moveUser, error } = useWebSocket(WS_URL, token || "", spaceId || "");
  const [spaceElements, setSpaceElements] = useState<SpaceElement[]>([]);
  const [gridSize, setGridSize] = useState(GRID_DEFAULT);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Fetch space data and preload images
  useEffect(() => {
    if (!spaceId) return;

    const fetchSpace = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/space/${spaceId}`, {
          headers: { authorization: `Bearer ${token}` },
        });
        const [width, height] = res.data.dimensions.toLowerCase().split("x").map(Number);
        setGridSize({ width, height });
        setSpaceElements(res.data.elements);

        // Preload element images
        const elementPromises = res.data.elements.map(async (e: SpaceElement) => {
          if (!elementImageCache[e.id]) {
            const img = new Image();
            const response = await axios.get(`${BACKEND_URL}/element/${e.id}`);
            const { mapElement } = response.data.element;
            img.src = mapElement?.imageUrl || "";
            let width = mapElement?.width || 1;
            let height = mapElement?.height || 1;

            elementImageCache[e.id] = { img, width, height, loaded: false };
            return new Promise<void>(resolve => {
              img.onload = () => {
                elementImageCache[e.id].loaded = true;
                resolve();
              };
              img.onerror = () => resolve();
            });
          }
        });

        // Preload user image (initially just self)
        if (selfId && !userImageCache[selfId]) {
          const img = new Image();
          img.src = "https://www.pngplay.com/wp-content/uploads/12/Anime-Profile-Pictures-Transparent-File.png";
          userImageCache[selfId] = { img, loaded: false };
          elementPromises.push(new Promise<void>(resolve => {
            img.onload = () => { userImageCache[selfId].loaded = true; resolve(); };
            img.onerror = () => resolve();
          }));
        }

        await Promise.all(elementPromises || []);
        setImagesLoaded(true);
      } catch (err) {
        console.error("Failed to fetch space:", err);
      }
    };

    fetchSpace();
  }, [spaceId, token, selfId]);

  // Render the canvas
  useEffect(() => {
    if (!canvasRef.current || !imagesLoaded) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const { width, height } = gridSize;
    canvasRef.current.width = width * CELL_SIZE;
    canvasRef.current.height = height * CELL_SIZE;

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Draw grid
    ctx.strokeStyle = "#eee";
    for (let x = 0; x <= width; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL_SIZE, 0);
      ctx.lineTo(x * CELL_SIZE, height * CELL_SIZE);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL_SIZE);
      ctx.lineTo(width * CELL_SIZE, y * CELL_SIZE);
      ctx.stroke();
    }
    // Draw space elements
    spaceElements.forEach(e => {
      const xPx = e.x * CELL_SIZE;
      const yPx = e.y * CELL_SIZE;
      const cache = elementImageCache[e.id];
      if (cache?.loaded) {
        ctx.drawImage(cache.img, xPx, yPx, cache.width * CELL_SIZE, cache.height * CELL_SIZE);
      } else {
        ctx.fillStyle = "#999";
        ctx.fillRect(xPx + 1, yPx + 1, CELL_SIZE - 2, CELL_SIZE - 2);
      }
    });

    // Draw users
    Object.values(users).forEach(u => {
      const xPx = u.x * CELL_SIZE;
      const yPx = u.y * CELL_SIZE;
      const cache = userImageCache[u.id];
      if (cache?.loaded) {
        ctx.drawImage(cache.img, xPx, yPx, CELL_SIZE, CELL_SIZE);
      } else {
        ctx.fillStyle = u.id === selfId ? "#3b82f6" : "#ef4444";
        ctx.fillRect(xPx + 1, yPx + 1, CELL_SIZE - 2, CELL_SIZE - 2);
      }
    });
  }, [users, spaceElements, imagesLoaded, gridSize, selfId]);

  // Handle keyboard movement
  const handleKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    if (!connected || !selfId || !users[selfId]) return;
    const me = users[selfId];
    let nx = me.x, ny = me.y;

    switch (e.key) {
      case "ArrowUp": ny--; break;
      case "ArrowDown": ny++; break;
      case "ArrowLeft": nx--; break;
      case "ArrowRight": nx++; break;
      default: return;
    }

    moveUser(nx, ny);
    e.preventDefault();
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      {!connected ? (
        <Card className="w-80">
          <CardHeader>
            <CardTitle>{error ? "Connection Error" : "Connecting to Space"}</CardTitle>
          </CardHeader>
          <CardContent>
            {error && <p className="text-red-500">{error}</p>}
            {!error && <p>Establishing connection...</p>}
          </CardContent>
        </Card>
      ) : (
        <div className="relative">
          <canvas
            ref={canvasRef}
            tabIndex={0}
            autoFocus
            className="border rounded shadow-lg focus:outline-none"
            onKeyDown={handleKeyDown}
          />
          <div className="absolute top-2 left-2 bg-white p-2 rounded opacity-75">
            <div className="font-semibold">Controls:</div>
            <div className="flex gap-2 mt-1">
              <ArrowUp /> <ArrowDown /> <ArrowLeft /> <ArrowRight />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}