import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowRightCircle,
} from "lucide-react";
import { BACKEND_URL, WS_URL } from "@/config";

// Types for WebSocket messages
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
type SpaceElement = { id: string; elementId: string; x: number; y: number }; // Added elementId

const CELL_SIZE = 20;
const GRID_DEFAULT = { width: 50, height: 50 };

// Caches for images
const userImageCache: Record<
  string,
  { img: HTMLImageElement; loaded: boolean }
> = {};
const elementImageCache: Record<
  string,
  { img: HTMLImageElement; width:number; height:number; loaded: boolean }
> = {};

export default function Arena() {
  const [token, setToken] = useState("");
  const [spaceId, setSpaceId] = useState("");
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const [selfId, setSelfId] = useState<string | null>(null);
  const [users, setUsers] = useState<Record<string, UserState>>({});
  const [spaceElements, setSpaceElements] = useState<SpaceElement[]>([]);
  const [loadedCount, setLoadedCount] = useState(0); // To force re-render after image loads

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gridSize, setGridSize] = useState(GRID_DEFAULT);

  // Fetch space elements from backend
  const fetchSpace = async (id: string) => {
    try {
      const res = await axios.get(`${BACKEND_URL}/space/${id}`, {
        headers: { authorization: `Bearer ${token}` },
      });
      debugger
      // Ensure the elements from backend have elementId if they are meant to.
      // Assuming res.data.elements will have `id`, `elementId`, `x`, `y`
      const [width, height] = res.data.dimensions.toLowerCase().split("x").map(Number);

      setGridSize({ width: width, height: height })
      setSpaceElements(res.data.elements as SpaceElement[]);
    } catch (err) {
      console.error("Failed to fetch space:", err);
    }
  };

  // Join WebSocket and fetch space
  const handleJoin = () => {
    fetchSpace(spaceId);
    // Use wss for secure connection if your backend supports it, otherwise ws
    const ws = new WebSocket(WS_URL); // Or wss://your-backend.com:3001
    wsRef.current = ws;
    ws.onopen = () => {
      setConnected(true);
      const msg: OutgoingMessage = {
        type: "join",
        payload: { token, spaceId },
      };
      ws.send(JSON.stringify(msg));
    };
  };

  // WebSocket message handling
  useEffect(() => {
    const ws = wsRef.current;
    if (!ws) return;
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data) as IncomingMessage;
      switch (msg.type) {
        case "space-joined": {
          const { userId, spawn, users: others } = msg.payload;
          setSelfId(userId);
          setUsers(() => {
            const all: Record<string, UserState> = {};
            all[userId] = { id: userId, x: spawn.x, y: spawn.y };
            others.forEach((u) => {
              all[u.id] = { id: u.id, x: u.x, y: u.y };
            });
            return all;
          });
          break;
        }
        case "user-joined": {
          setUsers((prev) => ({
            ...prev,
            [msg.payload.userId]: {
              id: msg.payload.userId,
              x: msg.payload.x,
              y: msg.payload.y,
            },
          }));
          break;
        }
        case "user-moved": {
          setUsers((prev) => ({
            ...prev,
            [msg.payload.id]: {
              id: msg.payload.id,
              x: msg.payload.x,
              y: msg.payload.y,
            },
          }));
          break;
        }
        case "movement-rejected": {
          if (selfId) {
            setUsers((prev) => ({
              ...prev,
              [selfId]: { id: selfId, x: msg.payload.x, y: msg.payload.y },
            }));
          }
          break;
        }
        case "user-left": {
          setUsers((prev) => {
            const c = { ...prev };
            delete c[msg.payload.userId];
            return c;
          });
          break;
        }
      }
    };
    ws.onclose = () => setConnected(false);
    // You might want to keep the websocket open for reconnect attempts or clear on unmount
    // return () => { ws.close(); };
  }, [wsRef.current, token, selfId]);

  // Draw grid, space elements, and users
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = gridSize;
    canvas.width = width * CELL_SIZE;
    canvas.height = height * CELL_SIZE;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Grid
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

    // Space elements (draw first so users can be on top)
    // spaceElements.forEach(async e => {
    //   const xPx = e.x * CELL_SIZE;
    //   const yPx = e.y * CELL_SIZE;
    //   const cache = elementImageCache[e.id]; // Use elementId for caching
    //   if (cache && cache.loaded) {
    //     ctx.drawImage(cache.img, xPx, yPx, CELL_SIZE, CELL_SIZE);
    //   } else {
    //     // Placeholder
    //     ctx.fillStyle = '#999';
    //     ctx.fillRect(xPx + 1, yPx + 1, CELL_SIZE - 2, CELL_SIZE - 2);

    //     if (!cache) {
    //       const img = new Image();
    //       debugger
    //       // Assuming the backend endpoint for element images is /element/:elementId/image
    //       const response = await axios.get(`${BACKEND_URL}/element/${e.id}`);

    //       console.log(response)
    //       debugger
    //       img.src = `${BACKEND_URL}/element/${e.elementId}`;
    //       img.onload = () => {
    //         elementImageCache[e.elementId] = { img, loaded: true };
    //         setLoadedCount(c => c + 1); // Trigger re-render
    //       };
    //       img.onerror = (err) => {
    //         console.error(`Failed to load element image for ${e.elementId}:`, err);
    //         elementImageCache[e.elementId] = { img, loaded: false }; // Mark as not loaded to avoid retrying continuously
    //       };
    //       elementImageCache[e.elementId] = { img, loaded: false };
    //     }
    //   }
    // });

    // Space elements (draw first so users can be on top)
    spaceElements.forEach(async (e) => {
      debugger
      let xPx = e.x * CELL_SIZE;
      let yPx = e.y * CELL_SIZE;
    
      let cache = elementImageCache[e.elementId];
    
      if (cache && cache.loaded) {
        ctx.drawImage(
          cache.img,
          xPx,
          yPx,
          cache.width * CELL_SIZE,
          cache.height * CELL_SIZE
        );
      } else {
        ctx.fillStyle = "#999";
        ctx.fillRect(xPx + 1, yPx + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    
        if (!cache) {
          const img = new Image();
          try {
            const response = await axios.get(`${BACKEND_URL}/element/${e.id}`);
            const element = response.data.element;
    
            const imageUrl = element.mapElement?.imageUrl;
            const width = element.width ?? 1;
            const height = element.height ?? 1;
    
            if (imageUrl) {
              img.src = imageUrl;
              elementImageCache[e.elementId] = { img, loaded: false, width, height };
    
              img.onload = () => {
                elementImageCache[e.elementId].loaded = true;
                setLoadedCount((c) => c + 1);
              };
              img.onerror = () => {
                console.error(`Image failed to load for ${e.elementId}`);
                setLoadedCount((c) => c + 1);
              };
            } else {
              elementImageCache[e.elementId] = { img: new Image(), loaded: false, width, height };
            }
          } catch (err) {
            console.error(`Error loading element details for ${e.id}`, err);
            elementImageCache[e.elementId] = { img: new Image(), loaded: false, width: 1, height: 1 };
            setLoadedCount((c) => c + 1);
          }
        }
      }
    });
    
    // Users (draw second so they are on top of elements)
    Object.values(users).forEach((u) => {
      debugger
      const xPx = u.x * CELL_SIZE;
      const yPx = u.y * CELL_SIZE;
      const cache = userImageCache[u.id];
      if (cache && cache.loaded) {
        ctx.drawImage(cache.img, xPx, yPx, CELL_SIZE, CELL_SIZE);
      } else {
        // Placeholder (e.g., colored square)
        ctx.fillStyle = u.id === selfId ? "#3b82f6" : "#ef4444"; // Blue for self, red for others
        ctx.fillRect(xPx + 1, yPx + 1, CELL_SIZE - 2, CELL_SIZE - 2);

        if (!cache) {
          const img = new Image();
          // Using a generic avatar URL. Replace with your actual user avatar endpoint if available.
          // Example: `${BACKEND_URL}/user/${u.id}/avatar`
          img.src =
            "https://www.pngplay.com/wp-content/uploads/12/Anime-Profile-Pictures-Transparent-File.png"; // Example avatar image
          img.onload = () => {
            userImageCache[u.id] = { img, loaded: true };
            setLoadedCount((c) => c + 1); // Trigger re-render
          };
          img.onerror = (err) => {
            console.error(`Failed to load user avatar for ${u.id}:`, err);
            userImageCache[u.id] = { img, loaded: false }; // Mark as not loaded
          };
          userImageCache[u.id] = { img, loaded: false };
        }
      }
    });
  }, [users, spaceElements, loadedCount, selfId]); // Added selfId to dependencies

  // Handle move by keys
  const handleKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    if (!connected || !selfId) return;
    const me = users[selfId]; // Use optional chaining to safely access me
    if (!me) return; // If `me` is undefined, return early

    let nx = me.x,
      ny = me.y;
    if (e.key === "ArrowUp") ny--;
    if (e.key === "ArrowDown") ny++;
    if (e.key === "ArrowLeft") nx--;
    if (e.key === "ArrowRight") nx++;

    // Optimistic update: update local state immediately
    setUsers((prev) => ({ ...prev, [selfId]: { id: selfId, x: nx, y: ny } }));

    // Send move to server
    const msg: OutgoingMessage = { type: "move", payload: { x: nx, y: ny } };
    wsRef.current?.send(JSON.stringify(msg));
    e.preventDefault();      debugger

  };

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      {!connected ? (
        <Card className="w-80">
          <CardHeader>
            <CardTitle>Join Space</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Input
              placeholder="JWT Token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
            <Input
              placeholder="Space ID"
              value={spaceId}
              onChange={(e) => setSpaceId(e.target.value)}
            />
            <Button onClick={handleJoin} className="w-full">
              <div className="flex justify-center items-center gap-2">
                <ArrowRightCircle className="w-4 h-4" /> Join
              </div>
            </Button>
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

// import React, { useState, useRef, useEffect } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ArrowRightCircle } from 'lucide-react';

// type IncomingMessage =
//   | { type: 'space-joined'; payload: { userId: string; spawn: { x: number; y: number }; users: { id: string; x: number; y: number }[] } }
//   | { type: 'user-joined'; payload: { userId: string; x: number; y: number } }
//   | { type: 'user-moved'; payload: { id: string; x: number; y: number } }
//   | { type: 'movement-rejected'; payload: { x: number; y: number } }
//   | { type: 'user-left'; payload: { userId: string } };

// type OutgoingMessage =
//   | { type: 'join'; payload: { token: string; spaceId: string } }
//   | { type: 'move'; payload: { x: number; y: number } };

// type UserState = { id: string; x: number; y: number };

// const CELL_SIZE = 20;
// const GRID_DEFAULT = { width: 50, height: 50 };
// const imageCache: Record<string, { img: HTMLImageElement; loaded: boolean }> = {};

// export default function Arena() {
//   const [token, setToken] = useState('');
//   const [spaceId, setSpaceId] = useState('');
//   const [connected, setConnected] = useState(false);
//   const wsRef = useRef<WebSocket | null>(null);
//   const [selfId, setSelfId] = useState<string | null>(null);
//   const [users, setUsers] = useState<Record<string, UserState>>({});
//   const [gridSize] = useState(GRID_DEFAULT);
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);

//   const [loadedCount, setLoadedCount] = useState(0); ///Image to rer


//   // Setup WebSocket and message handlers once
//   useEffect(() => {
//     if (!wsRef.current) return;
//     const ws = wsRef.current;

//     ws.onmessage = (ev) => {
//       const msg = JSON.parse(ev.data) as IncomingMessage;
//       switch (msg.type) {
//         case 'space-joined': {
//           const { userId, spawn, users: others } = msg.payload;
//           setSelfId(userId);
//           setUsers(() => {
//             const all: Record<string, UserState> = {};
//             all[userId] = { id: userId, x: spawn.x, y: spawn.y };
//             others.forEach((u) => { all[u.id] = { id: u.id, x: u.x, y: u.y }; });
//             debugger
//             return all;
//           });
//           break;
//         }
//         case 'user-joined': {
//           const { userId, x, y } = msg.payload;
//           setUsers((prev) => ({ ...prev, [userId]: { id: userId, x, y } }));
//           console.log(users)
//           break;
//         }
//         case 'user-moved': {
//           const { id, x, y } = msg.payload;
//           setUsers((prev) => ({ ...prev, [id]: { id, x, y } }));
//           break;
//         }
//         case 'movement-rejected': {
//           const { x, y } = msg.payload;
//           if (selfId) {
//             setUsers((prev) => ({ ...prev, [selfId]: { id: selfId, x, y } }));
//           }
//           break;
//         }
//         case 'user-left': {
//           setUsers((prev) => {
//             const copy = { ...prev };
//             delete copy[msg.payload.userId];
//             return copy;
//           });
//           break;
//         }
//       }
//     };

//     ws.onclose = (ev) => {
//       console.log(`Connection closed: ${ev.code}`);
//       setConnected(false);
//     };

//     return () => {
//       ws.onmessage = null;
//       ws.onclose = null;
//       ws.close();
//     };
//   }, [wsRef.current]);

//   // Draw grid and users to canvas
//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext('2d');
//     if (!ctx) return;
//     const { width, height } = gridSize;
//     canvas.width = width * CELL_SIZE;
//     canvas.height = height * CELL_SIZE;

//     // Clear
//     ctx.clearRect(0, 0, canvas.width, canvas.height);

//     // Grid lines
//     ctx.strokeStyle = '#eee';
//     for (let x = 0; x <= width; x++) {
//       ctx.beginPath(); ctx.moveTo(x * CELL_SIZE, 0);
//       ctx.lineTo(x * CELL_SIZE, height * CELL_SIZE);
//       ctx.stroke();
//     }
//     for (let y = 0; y <= height; y++) {
//       ctx.beginPath(); ctx.moveTo(0, y * CELL_SIZE);
//       ctx.lineTo(width * CELL_SIZE, y * CELL_SIZE);
//       ctx.stroke();
//     }
//     Object.values(users).forEach((u) => {
//       const xPx = u.x * CELL_SIZE;
//       const yPx = u.y * CELL_SIZE;
//       const url = `https://www.pngplay.com/wp-content/uploads/12/Anime-Profile-Pictures-Transparent-File.png`;
    
//       // Create or reuse image entry
//       if (!imageCache[u.id]) {
//         const img = new Image();
//         img.src = url;
    
//         imageCache[u.id] = { img, loaded: false };
    
//         img.onload = () => {
//           imageCache[u.id].loaded = true;
//           setLoadedCount((prev) => prev + 1);  // force redraw
//         };
    
//         img.onerror = () => {
//           imageCache[u.id].loaded = false;
//           setLoadedCount((prev) => prev + 1);  // fallback case
//         };
//       }
    
//       const { img, loaded } = imageCache[u.id];
    
//       if (loaded) {
//         ctx.drawImage(img, xPx, yPx, CELL_SIZE, CELL_SIZE);
//       } else {
//         // fallback default image or box
//         ctx.fillStyle = u.id === selfId ? '#3b82f6' : '#ef4444';
//         ctx.fillRect(xPx + 1, yPx + 1, CELL_SIZE - 2, CELL_SIZE - 2);
//       }
//     });
//   }, [users, selfId, loadedCount]);

//   // Handle Join button: open socket & send join
//   const handleJoin = () => {
//     const ws = new WebSocket('ws://localhost:3001');
//     wsRef.current = ws;
//     ws.onopen = () => {
//       setConnected(true);
//       const msg: OutgoingMessage = { type: 'join', payload: { token, spaceId } };
//       ws.send(JSON.stringify(msg));
//     };
//   };

//   // Arrow-key movement with optimistic update
//   const handleKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
//     if (!connected || !selfId) return;
//     const me = users[selfId]!;
//     let newX = me.x;
//     let newY = me.y;
//     if (e.key === 'ArrowUp')    newY--;
//     if (e.key === 'ArrowDown')  newY++;
//     if (e.key === 'ArrowLeft')  newX--;
//     if (e.key === 'ArrowRight') newX++;
//     // local-first update
//     setUsers(prev => ({ ...prev, [selfId]: { id: selfId, x: newX, y: newY } }));
//     // then server
//     const moveMsg: OutgoingMessage = { type: 'move', payload: { x: newX, y: newY } };
//     wsRef.current?.send(JSON.stringify(moveMsg));
//     e.preventDefault();
//   };

//   return (
//     <div className="flex flex-col items-center gap-6 p-6">
//       {!connected ? (
//         <Card className="w-80">
//           <CardHeader><CardTitle>Join Space</CardTitle></CardHeader>
//           <CardContent className="flex flex-col gap-4">
//             <Input placeholder="JWT Token" value={token} onChange={e => setToken(e.target.value)} />
//             <Input placeholder="Space ID" value={spaceId} onChange={e => setSpaceId(e.target.value)} />
//             <Button onClick={handleJoin} className="w-full">
//               <div className="flex justify-center items-center gap-2">
//                 <ArrowRightCircle className="w-4 h-4" /> Join
//               </div>
//             </Button>
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







