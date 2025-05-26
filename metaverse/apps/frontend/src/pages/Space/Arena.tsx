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

// // UserState from WebSocket (target grid positions)
// type UserState = { id: string; x: number; y: number };

// // SpaceElement type based on backend response
// type SpaceElementInState = {
//   id: string; // Unique instance ID of this element in the space
//   x: number;
//   y: number;
//   elementDefinition: { // Data for the type of element
//     id: string;       // ID of the element type (e.g., from map_elements table, used as cache key)
//     imageUrl: string;
//     width: number;    // in grid units
//     height: number;   // in grid units
//   };
// };

// // For storing animated pixel positions in Arena component
// type AnimatedUserDisplayState = {
//     currentPixelX: number;
//     currentPixelY: number;
// };

// // ### Constants
// const CELL_SIZE = 20;
// const GRID_DEFAULT = { width: 50, height: 50 };
// const ANIMATION_SPEED = 0.15; // Adjust for movement smoothness (0.0 to 1.0)

// // ### Image Caches
// // User images: key is userId
// const userImageCache: Record<string, { img: HTMLImageElement; loaded: boolean }> = {};
// // Element images: key is elementDefinition.id
// const elementImageCache: Record<string, { img: HTMLImageElement; width: number; height: number; loaded: boolean }> = {};

// // ### Custom WebSocket Hook (largely unchanged, returns target grid positions)
// const useWebSocket = (url: string, token: string, spaceId: string) => {
//   const wsRef = useRef<WebSocket | null>(null);
//   const [connected, setConnected] = useState(false);
//   const [selfId, setSelfId] = useState<string | null>(null);
//   const [users, setUsers] = useState<Record<string, UserState>>({}); // Stores target grid positions
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (!token || !spaceId) { // Ensure token and spaceId are present
//         // setError("Missing token or space ID for WebSocket connection.");
//         return;
//     }
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
//               const allUsers: Record<string, UserState> = {
//                 [msg.payload.userId]: { id: msg.payload.userId, x: msg.payload.spawn.x, y: msg.payload.spawn.y },
//               };
//               msg.payload.users.forEach(u => { allUsers[u.id] = { id: u.id, x: u.x, y: u.y }; });
//               return allUsers;
//             });
//             break;
//           case "user-joined":
//             setUsers(prev => ({ ...prev, [msg.payload.userId]: {id: msg.payload.userId, x: msg.payload.x, y: msg.payload.y } }));
//             break;
//           case "user-moved":
//             setUsers(prev => ({ ...prev, [msg.payload.id]: {id: msg.payload.id, x: msg.payload.x, y: msg.payload.y } }));
//             break;
//           case "movement-rejected":
//             if (selfId) setUsers(prev => ({ ...prev, [selfId]: { ...prev[selfId], x: msg.payload.x, y: msg.payload.y } }));
//             break;
//           case "user-left":
//             setUsers(prev => { const updatedUsers = { ...prev }; delete updatedUsers[msg.payload.userId]; return updatedUsers; });
//             break;
//         }
//       };

//       ws.onclose = () => {
//         setConnected(false);
//         if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSING) {
//             setError("Connection lost. Attempting to reconnect...");
//             setTimeout(connect, 3000); // Reconnect after 3s
//         }
//       };

//       ws.onerror = (err) => {
//         setError("WebSocket error occurred. Check console for details.");
//         console.error("WebSocket error: ", err);
//       }
//     };

//     connect();
//     return () => {
//         if (wsRef.current) {
//             wsRef.current.close();
//         }
//     };
//   }, [url, token, spaceId]);

//   const moveUser = (x: number, y: number) => {
//     if (!selfId || !connected) return;
//     // Optimistically update target position for local user
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
//   const { token } = useAuth(); // Assuming useAuth provides a valid token string or null/undefined
//   const { connected, selfId, users, moveUser, error: wsError } = useWebSocket(WS_URL, token || "", spaceId || "");

//   const [spaceElements, setSpaceElements] = useState<SpaceElementInState[]>([]);
//   const [gridSize, setGridSize] = useState(GRID_DEFAULT);
//   const [criticalImagesLoaded, setCriticalImagesLoaded] = useState(false); // For elements
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const animationFrameRef = useRef<number>(0);

//   // State for animated user positions (pixel coordinates)
//   const [animatedUserPositions, setAnimatedUserPositions] = useState<Record<string, AnimatedUserDisplayState>>({});

//   // Fetch space data and preload element images
//   useEffect(() => {
//     if (!spaceId || !token) return;

//     const fetchSpaceAndElements = async () => {
//       try {
//         setCriticalImagesLoaded(false); // Reset loading state
//         const res = await axios.get(`${BACKEND_URL}/space/${spaceId}`, {
//           headers: { authorization: `Bearer ${token}` },
//         });
//         const [width, height] = res.data.dimensions.toLowerCase().split("x").map(Number);
//         setGridSize({ width, height });

//         const fetchedElements: SpaceElementInState[] = res.data.elements.map((el: any) => ({
//           id: el.id,
//           x: el.x,
//           y: el.y,
//           elementDefinition: {
//             id: el.element.id,
//             imageUrl: el.element.imageUrl,
//             width: Number(el.element.width),
//             height: Number(el.element.height),
//           }
//         }));
//         setSpaceElements(fetchedElements);

//         const elementImagePromises = fetchedElements.map(e => {
//           if (!elementImageCache[e.elementDefinition.id]) {
//             const img = new Image();
//             img.src = e.elementDefinition.imageUrl;
//             elementImageCache[e.elementDefinition.id] = {
//               img,
//               width: e.elementDefinition.width,
//               height: e.elementDefinition.height,
//               loaded: false
//             };
//             return new Promise<void>(resolve => {
//               img.onload = () => {
//                 if (elementImageCache[e.elementDefinition.id]) {
//                   elementImageCache[e.elementDefinition.id].loaded = true;
//                 }
//                 resolve();
//               };
//               img.onerror = () => {
//                 console.error(`Failed to load element image: ${e.elementDefinition.imageUrl}`);
//                 resolve(); // Resolve even on error so Promise.all completes
//               };
//             });
//           }
//           return Promise.resolve();
//         });

//         await Promise.all(elementImagePromises);
//         setCriticalImagesLoaded(true);
//       } catch (err) {
//         console.error("Failed to fetch space:", err);
//         // Consider setting an error state to display to the user
//       }
//     };

//     fetchSpaceAndElements();
//   }, [spaceId, token]);

//   // Preload user images & initialize animated positions
//   useEffect(() => {
//     const newAnimatedPositions = { ...animatedUserPositions };
//     let positionsChanged = false;

//     Object.values(users).forEach(user => {
//       // Preload user image
//       if (!userImageCache[user.id] || !userImageCache[user.id].img.src) { // Avoid re-triggering load for existing
//         const img = new Image();
//         // Using a placeholder avatar service; replace with your actual user avatar source
//         img.src = `https://api.dicebear.com/8.x/pixel-art/svg?seed=${user.id}&size=${CELL_SIZE}`;
//         userImageCache[user.id] = { img, loaded: false };
//         const currentUserId = user.id;
//         img.onload = () => {
//           if (userImageCache[currentUserId]) {
//             userImageCache[currentUserId].loaded = true;
//           }
//            // Trigger a redraw by updating state (even if it's the same object identity for animatedUserPositions initially)
//            // This helps ensure canvas redraws with the newly loaded image.
//           setAnimatedUserPositions(prev => ({...prev}));
//         };
//         img.onerror = () => console.error(`Failed to load image for user ${currentUserId}`);
//       }

//       // Initialize or update animated position store
//       if (!newAnimatedPositions[user.id]) {
//         newAnimatedPositions[user.id] = {
//           currentPixelX: user.x * CELL_SIZE,
//           currentPixelY: user.y * CELL_SIZE,
//         };
//         positionsChanged = true;
//       }
//     });

//     // Remove users from animatedUserPositions if they left
//     Object.keys(newAnimatedPositions).forEach(uid => {
//         if (!users[uid]) {
//             delete newAnimatedPositions[uid];
//             positionsChanged = true;
//         }
//     });

//     if (positionsChanged) {
//         setAnimatedUserPositions(newAnimatedPositions);
//     }

//   }, [users]);


//   // Animation loop
//   useEffect(() => {
//     if (!connected || !criticalImagesLoaded) return;

//     const animate = () => {
//       setAnimatedUserPositions(prevPositions => {
//         const nextPositions = { ...prevPositions };
//         let needsUpdate = false;

//         Object.keys(users).forEach(userId => {
//           const user = users[userId]; // Target grid position
//           const animatedPos = nextPositions[userId];

//           if (user && animatedPos) {
//             const targetPixelX = user.x * CELL_SIZE;
//             const targetPixelY = user.y * CELL_SIZE;

//             const diffX = targetPixelX - animatedPos.currentPixelX;
//             const diffY = targetPixelY - animatedPos.currentPixelY;

//             if (Math.abs(diffX) < 0.5 && Math.abs(diffY) < 0.5) {
//               if (animatedPos.currentPixelX !== targetPixelX || animatedPos.currentPixelY !== targetPixelY) {
//                 animatedPos.currentPixelX = targetPixelX;
//                 animatedPos.currentPixelY = targetPixelY;
//                 needsUpdate = true;
//               }
//             } else {
//               animatedPos.currentPixelX += diffX * ANIMATION_SPEED;
//               animatedPos.currentPixelY += diffY * ANIMATION_SPEED;
//               needsUpdate = true;
//             }
//           } else if (user && !animatedPos) {
//             // User just appeared, initialize their animated position
//              nextPositions[userId] = {
//                  currentPixelX: user.x * CELL_SIZE,
//                  currentPixelY: user.y * CELL_SIZE,
//              };
//              needsUpdate = true;
//           }
//         });
//         return needsUpdate ? nextPositions : prevPositions;
//       });
//       animationFrameRef.current = requestAnimationFrame(animate);
//     };

//     animationFrameRef.current = requestAnimationFrame(animate);

//     return () => {
//       if (animationFrameRef.current) {
//         cancelAnimationFrame(animationFrameRef.current);
//       }
//     };
//   }, [connected, criticalImagesLoaded, users]); // users dependency ensures loop restarts if target changes drastically

//   // Render the canvas
//   useEffect(() => {
//     if (!canvasRef.current || !criticalImagesLoaded) return;
//     const ctx = canvasRef.current.getContext("2d");
//     if (!ctx) return;

//     const { width: gridW, height: gridH } = gridSize;
//     canvasRef.current.width = gridW * CELL_SIZE;
//     canvasRef.current.height = gridH * CELL_SIZE;

//     ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

//     // Draw grid
//     ctx.strokeStyle = "#eee";
//     for (let x = 0; x <= gridW; x++) {
//       ctx.beginPath(); ctx.moveTo(x * CELL_SIZE, 0); ctx.lineTo(x * CELL_SIZE, gridH * CELL_SIZE); ctx.stroke();
//     }
//     for (let y = 0; y <= gridH; y++) {
//       ctx.beginPath(); ctx.moveTo(0, y * CELL_SIZE); ctx.lineTo(gridW * CELL_SIZE, y * CELL_SIZE); ctx.stroke();
//     }

//     // Draw space elements
//     spaceElements.forEach(e => {
//       const xPx = e.x * CELL_SIZE;
//       const yPx = e.y * CELL_SIZE;
//       const cache = elementImageCache[e.elementDefinition.id];
//       if (cache?.loaded) {
//         ctx.drawImage(cache.img, xPx, yPx, cache.width * CELL_SIZE, cache.height * CELL_SIZE);
//       } else {
//         ctx.fillStyle = "#ccc"; // Placeholder for elements
//         ctx.fillRect(xPx, yPx, e.elementDefinition.width * CELL_SIZE, e.elementDefinition.height * CELL_SIZE);
//       }
//     });

//     // Draw users using animated positions
//     Object.keys(animatedUserPositions).forEach(userId => {
//         const user = users[userId]; // For id and selfId check
//         const animatedPos = animatedUserPositions[userId];

//         if (!user || !animatedPos) return; // User might have left or not yet initialized

//         const xPx = animatedPos.currentPixelX;
//         const yPx = animatedPos.currentPixelY;
//         const userImgCache = userImageCache[userId];

//         if (userImgCache?.loaded) {
//             ctx.drawImage(userImgCache.img, xPx, yPx, CELL_SIZE, CELL_SIZE);
//         } else {
//             ctx.fillStyle = userId === selfId ? "#3b82f6" : "#ef4444"; // Blue for self, Red for others
//             ctx.fillRect(xPx + 1, yPx + 1, CELL_SIZE - 2, CELL_SIZE - 2); // Small padding
//         }
//     });

//   }, [animatedUserPositions, users, spaceElements, criticalImagesLoaded, gridSize, selfId]);

//   // Handle keyboard movement
//   const handleKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
//     if (!connected || !selfId || !users[selfId]) return;
//     const me = users[selfId]; // Current target grid position
//     let nx = me.x, ny = me.y;

//     switch (e.key) {
//       case "ArrowUp": ny--; break;
//       case "ArrowDown": ny++; break;
//       case "ArrowLeft": nx--; break;
//       case "ArrowRight": nx++; break;
//       default: return;
//     }

//     moveUser(nx, ny); // Send new target to WebSocket and update local target optimistically
//     e.preventDefault();
//   };
  
//   const displayError = wsError || (!token && "Authentication token is missing.") || (!spaceId && "Space ID is missing.");

//   return (
//     <div className="flex flex-col items-center gap-6 p-6">
//       {!connected && displayError ? (
//         <Card className="w-96"> {/* Increased width for potentially longer error messages */}
//           <CardHeader>
//             <CardTitle>{displayError ? "Connection Issue" : "Connecting to Space"}</CardTitle>
//           </CardHeader>
//           <CardContent>
//             {displayError && <p className="text-red-500">{displayError}</p>}
//             {!displayError && <p>Establishing connection...</p>}
//           </CardContent>
//         </Card>
//       ) : !criticalImagesLoaded && connected ? (
//          <Card className="w-80">
//           <CardHeader><CardTitle>Loading Space...</CardTitle></CardHeader>
//           <CardContent><p>Fetching elements and images...</p></CardContent>
//         </Card>
//       ) : (
//         <div className="relative">
//           <canvas
//             ref={canvasRef}
//             tabIndex={0} // Make canvas focusable
//             autoFocus
//             className="border rounded shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             onKeyDown={handleKeyDown}
//           />
//           <div className="absolute top-2 left-2 bg-white p-2 rounded opacity-75 shadow">
//             <div className="font-semibold">Controls:</div>
//             <div className="flex items-center gap-1 mt-1 text-gray-700">
//               <ArrowUp size={20}/> <ArrowDown size={20}/> <ArrowLeft size={20}/> <ArrowRight size={20}/>
//               <span className="ml-1 text-sm">(Arrow Keys)</span>
//             </div>
//              {selfId && users[selfId] && (
//                 <div className="mt-1 text-xs text-gray-600">
//                     Your Pos: ({users[selfId].x}, {users[selfId].y})
//                 </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }




import React, { useState, useRef, useEffect, useCallback } from "react";
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
type UserState = { id: string; x: number; y: number; prevX?: number; prevY?: number; }; // Added prevX/Y for direction detection

// SpaceElement type based on backend response
type SpaceElementInState = {
  id: string; // Unique instance ID of this element in the space
  x: number;
  y: number;
  elementDefinition: { // Data for the type of element
    id: string;       // ID of the element type (e.g., from map_elements table, used as cache key)
    imageUrl: string;
    width: number;    // in grid units
    height: number;   // in grid units
  };
};

// For storing animated pixel positions in Arena component
type AnimatedUserDisplayState = {
    currentPixelX: number;
    currentPixelY: number;
    currentFrame: number; // For sprite animation
    direction: 'down' | 'up' | 'left' | 'right'; // For sprite row
    animationTimer: number; // To control frame rate
};

// ### Constants
const CELL_SIZE = 20; // Keep this as your desired display size for the character
const GRID_DEFAULT = { width: 50, height: 50 };
const ANIMATION_SPEED = 0.15;
const SPRITE_SHEET_URL = "https://img.itch.zone/aW1nLzE4MTk4NTMxLmdpZg==/original/JS2h0d.gif";

// --- IMPORTANT: Adjust these based on the new sprite sheet ---
const SPRITE_WIDTH = 32;  // The width of a single character frame in the sprite sheet
const SPRITE_HEIGHT = 32; // The height of a single character frame in the sprite sheet
// --- END IMPORTANT ---

const ANIMATION_FRAME_RATE = 100;

// Sprite sheet layout for the provided URL:
// Row 0: Character 1 (looks like mostly down/idle)
// Row 1: Character 2 (looks like mostly up/idle)
// Row 2: Character 3 (looks like mostly left/idle)
// Row 3: Character 4 (looks like mostly right/idle)
// This particular sheet seems to have 12 columns, but not all are distinct animation frames for one character.
// For basic movement, we'll pick representative frames.
const SPRITE_FRAMES = {
  // Assuming the first character (top-left) for all directions
  // The sheet has 12 columns, but each "character" seems to be around 3 frames for a walk cycle.
  // We'll use the first 3 frames for a simple cycle.
  down: { row: 0, frames: 3 }, // First character, first 3 frames
  up: { row: 1, frames: 3 },   // Second character (up-facing), first 3 frames
  left: { row: 2, frames: 3 }, // Third character (left-facing), first 3 frames
  right: { row: 3, frames: 3 }, // Fourth character (right-facing), first 3 frames
};

// ### Image Caches
// User images: key is userId, will store the sprite sheet image
const userImageCache: Record<string, { img: HTMLImageElement; loaded: boolean }> = {};
// Element images: key is elementDefinition.id
const elementImageCache: Record<string, { img: HTMLImageElement; width: number; height: number; loaded: boolean }> = {};

// ### Custom WebSocket Hook (largely unchanged, returns target grid positions)
const useWebSocket = (url: string, token: string, spaceId: string) => {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [selfId, setSelfId] = useState<string | null>(null);
  const [users, setUsers] = useState<Record<string, UserState>>({}); // Stores target grid positions
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !spaceId) { // Ensure token and spaceId are present
        return;
    }
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
              msg.payload.users.forEach(u => { allUsers[u.id] = { id: u.id, x: u.x, y: u.y }; });
              return allUsers;
            });
            break;
          case "user-joined":
            setUsers(prev => ({ ...prev, [msg.payload.userId]: {id: msg.payload.userId, x: msg.payload.x, y: msg.payload.y } }));
            break;
          case "user-moved":
            setUsers(prev => {
                const existingUser = prev[msg.payload.id];
                return {
                    ...prev,
                    [msg.payload.id]: {
                        id: msg.payload.id,
                        x: msg.payload.x,
                        y: msg.payload.y,
                        prevX: existingUser ? existingUser.x : msg.payload.x,
                        prevY: existingUser ? existingUser.y : msg.payload.y,
                    }
                };
            });
            break;
          case "movement-rejected":
            if (selfId) setUsers(prev => ({ ...prev, [selfId]: { ...prev[selfId], x: msg.payload.x, y: msg.payload.y } }));
            break;
          case "user-left":
            setUsers(prev => { const updatedUsers = { ...prev }; delete updatedUsers[msg.payload.userId]; return updatedUsers; });
            break;
        }
      };

      ws.onclose = () => {
        setConnected(false);
        if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSING) {
            setError("Connection lost. Attempting to reconnect...");
            setTimeout(connect, 3000); // Reconnect after 3s
        }
      };

      ws.onerror = (err) => {
        setError("WebSocket error occurred. Check console for details.");
        console.error("WebSocket error: ", err);
      }
    };

    connect();
    return () => {
        if (wsRef.current) {
            wsRef.current.close();
        }
    };
  }, [url, token, spaceId]);

  const moveUser = (x: number, y: number) => {
    if (!selfId || !connected) return;
    // Optimistically update target position for local user, store previous for direction
    setUsers(prev => {
      if (!prev[selfId]) return prev;
      return { ...prev, [selfId]: { ...prev[selfId], x, y, prevX: prev[selfId].x, prevY: prev[selfId].y } };
    });
    wsRef.current?.send(JSON.stringify({ type: "move", payload: { x, y } }));
  };

  return { connected, selfId, users, moveUser, error };
};

// ### Main Arena Component
export default function Arena() {
  const { spaceId } = useParams<{ spaceId: string }>();
  const { token } = useAuth(); // Assuming useAuth provides a valid token string or null/undefined
  const { connected, selfId, users, moveUser, error: wsError } = useWebSocket(WS_URL, token || "", spaceId || "");

  const [spaceElements, setSpaceElements] = useState<SpaceElementInState[]>([]);
  const [gridSize, setGridSize] = useState(GRID_DEFAULT);
  const [criticalImagesLoaded, setCriticalImagesLoaded] = useState(false); // For elements
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);

  // State for animated user positions (pixel coordinates)
  const [animatedUserPositions, setAnimatedUserPositions] = useState<Record<string, AnimatedUserDisplayState>>({});

  // Function to load the sprite sheet
  const loadSpriteSheet = useCallback(() => {
    const spriteSheetId = "mainSpriteSheet"; // A common ID for the sprite sheet
    if (!userImageCache[spriteSheetId]) {
      const img = new Image();
      img.src = SPRITE_SHEET_URL;
      userImageCache[spriteSheetId] = { img, loaded: false };
      img.onload = () => {
        if (userImageCache[spriteSheetId]) {
          userImageCache[spriteSheetId].loaded = true;
        }
        // Trigger a redraw if the sprite sheet loads after initial render
        setAnimatedUserPositions(prev => ({...prev}));
      };
      img.onerror = () => console.error(`Failed to load sprite sheet: ${SPRITE_SHEET_URL}`);
    }
  }, []);

  // Fetch space data and preload element images
  useEffect(() => {
    if (!spaceId || !token) return;

    const fetchSpaceAndElements = async () => {
      try {
        setCriticalImagesLoaded(false); // Reset loading state
        const res = await axios.get(`${BACKEND_URL}/space/${spaceId}`, {
          headers: { authorization: `Bearer ${token}` },
        });
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
          }
        }));
        setSpaceElements(fetchedElements);

        const elementImagePromises = fetchedElements.map(e => {
          if (!elementImageCache[e.elementDefinition.id]) {
            const img = new Image();
            img.src = e.elementDefinition.imageUrl;
            elementImageCache[e.elementDefinition.id] = {
              img,
              width: e.elementDefinition.width,
              height: e.elementDefinition.height,
              loaded: false
            };
            return new Promise<void>(resolve => {
              img.onload = () => {
                if (elementImageCache[e.elementDefinition.id]) {
                  elementImageCache[e.elementDefinition.id].loaded = true;
                }
                resolve();
              };
              img.onerror = () => {
                console.error(`Failed to load element image: ${e.elementDefinition.imageUrl}`);
                resolve(); // Resolve even on error so Promise.all completes
              };
            });
          }
          return Promise.resolve();
        });

        await Promise.all(elementImagePromises);
        setCriticalImagesLoaded(true);
      } catch (err) {
        console.error("Failed to fetch space:", err);
        // Consider setting an error state to display to the user
      }
    };

    fetchSpaceAndElements();
    loadSpriteSheet(); // Load sprite sheet along with other elements
  }, [spaceId, token, loadSpriteSheet]);

  // Initialize animated positions and manage sprite sheet loading
  useEffect(() => {
    const newAnimatedPositions = { ...animatedUserPositions };
    let positionsChanged = false;

    Object.values(users).forEach(user => {
      // Initialize or update animated position store
      if (!newAnimatedPositions[user.id]) {
        newAnimatedPositions[user.id] = {
          currentPixelX: user.x * CELL_SIZE,
          currentPixelY: user.y * CELL_SIZE,
          currentFrame: 0,
          direction: 'down', // Default direction
          animationTimer: 0,
        };
        positionsChanged = true;
      }
    });

    // Remove users from animatedUserPositions if they left
    Object.keys(newAnimatedPositions).forEach(uid => {
        if (!users[uid]) {
            delete newAnimatedPositions[uid];
            positionsChanged = true;
        }
    });

    if (positionsChanged) {
        setAnimatedUserPositions(newAnimatedPositions);
    }

  }, [users]);


  // Animation loop for both movement and sprite frames
  useEffect(() => {
    if (!connected || !criticalImagesLoaded) return;
    const spriteSheetLoaded = userImageCache["mainSpriteSheet"]?.loaded;
    if (!spriteSheetLoaded) return;

    let lastFrameTime = performance.now();

    const animate = (currentTime: DOMHighResTimeStamp) => {
      const deltaTime = currentTime - lastFrameTime;
      lastFrameTime = currentTime;

      setAnimatedUserPositions(prevPositions => {
        const nextPositions = { ...prevPositions };
        let needsUpdate = false;

        Object.keys(users).forEach(userId => {
          const user = users[userId]; // Target grid position
          const animatedPos = nextPositions[userId];

          if (user && animatedPos) {
            const targetPixelX = user.x * CELL_SIZE;
            const targetPixelY = user.y * CELL_SIZE;

            const diffX = targetPixelX - animatedPos.currentPixelX;
            const diffY = targetPixelY - animatedPos.currentPixelY;

            const isMoving = Math.abs(diffX) > 0.5 || Math.abs(diffY) > 0.5;

            // Update pixel position
            if (isMoving) {
              animatedPos.currentPixelX += diffX * ANIMATION_SPEED;
              animatedPos.currentPixelY += diffY * ANIMATION_SPEED;
              needsUpdate = true;

              // Determine direction for sprite
              if (Math.abs(diffX) > Math.abs(diffY)) {
                animatedPos.direction = diffX > 0 ? 'right' : 'left';
              } else {
                animatedPos.direction = diffY > 0 ? 'down' : 'up';
              }

              // Animate sprite frame
              animatedPos.animationTimer += deltaTime;
              if (animatedPos.animationTimer >= ANIMATION_FRAME_RATE) {
                animatedPos.currentFrame = (animatedPos.currentFrame + 1) % SPRITE_FRAMES[animatedPos.direction].frames;
                animatedPos.animationTimer = 0;
              }
            } else {
              // Not moving, reset to first frame of current direction
              if (animatedPos.currentFrame !== 0) {
                animatedPos.currentFrame = 0;
                needsUpdate = true;
              }
              // Snap to exact target if very close and not moving
              if (Math.abs(diffX) < 0.5 && Math.abs(diffY) < 0.5 && (animatedPos.currentPixelX !== targetPixelX || animatedPos.currentPixelY !== targetPixelY)) {
                animatedPos.currentPixelX = targetPixelX;
                animatedPos.currentPixelY = targetPixelY;
                needsUpdate = true;
              }
            }

          } else if (user && !animatedPos) {
            // User just appeared, initialize their animated position
             nextPositions[userId] = {
                 currentPixelX: user.x * CELL_SIZE,
                 currentPixelY: user.y * CELL_SIZE,
                 currentFrame: 0,
                 direction: 'down',
                 animationTimer: 0,
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
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [connected, criticalImagesLoaded, users]); // users dependency ensures loop restarts if target changes drastically


  // Render the canvas
  useEffect(() => {
    if (!canvasRef.current || !criticalImagesLoaded) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const { width: gridW, height: gridH } = gridSize;
    canvasRef.current.width = gridW * CELL_SIZE;
    canvasRef.current.height = gridH * CELL_SIZE;

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Draw grid
    ctx.strokeStyle = "#eee";
    for (let x = 0; x <= gridW; x++) {
      ctx.beginPath(); ctx.moveTo(x * CELL_SIZE, 0); ctx.lineTo(x * CELL_SIZE, gridH * CELL_SIZE); ctx.stroke();
    }
    for (let y = 0; y <= gridH; y++) {
      ctx.beginPath(); ctx.moveTo(0, y * CELL_SIZE); ctx.lineTo(gridW * CELL_SIZE, y * CELL_SIZE); ctx.stroke();
    }

    // Draw space elements
    spaceElements.forEach(e => {
      const xPx = e.x * CELL_SIZE;
      const yPx = e.y * CELL_SIZE;
      const cache = elementImageCache[e.elementDefinition.id];
      if (cache?.loaded) {
        ctx.drawImage(cache.img, xPx, yPx, cache.width * CELL_SIZE, cache.height * CELL_SIZE);
      } else {
        ctx.fillStyle = "#ccc"; // Placeholder for elements
        ctx.fillRect(xPx, yPx, e.elementDefinition.width * CELL_SIZE, e.elementDefinition.height * CELL_SIZE);
      }
    });

    // Draw users using animated positions and sprite sheet
    const spriteSheetImage = userImageCache["mainSpriteSheet"]?.img;

    Object.keys(animatedUserPositions).forEach(userId => {
        const user = users[userId]; // For id and selfId check
        const animatedPos = animatedUserPositions[userId];

        if (!user || !animatedPos) return; // User might have left or not yet initialized

        const xPx = animatedPos.currentPixelX;
        const yPx = animatedPos.currentPixelY;

        if (spriteSheetImage && userImageCache["mainSpriteSheet"]?.loaded) {
            const { row, frames } = SPRITE_FRAMES[animatedPos.direction];
            const frameX = animatedPos.currentFrame * SPRITE_WIDTH;
            const frameY = row * SPRITE_HEIGHT;

            ctx.drawImage(
                spriteSheetImage,
                frameX,
                frameY,
                SPRITE_WIDTH,
                SPRITE_HEIGHT,
                xPx,
                yPx,
                CELL_SIZE, // Scale to CELL_SIZE
                CELL_SIZE  // Scale to CELL_SIZE
            );
        } else {
            // Fallback if sprite sheet not loaded
            ctx.fillStyle = userId === selfId ? "#3b82f6" : "#ef4444"; // Blue for self, Red for others
            ctx.fillRect(xPx + 1, yPx + 1, CELL_SIZE - 2, CELL_SIZE - 2); // Small padding
        }
    });

  }, [animatedUserPositions, users, spaceElements, criticalImagesLoaded, gridSize, selfId]);

  // Handle keyboard movement
  const handleKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    if (!connected || !selfId || !users[selfId]) return;
    const me = users[selfId]; // Current target grid position
    let nx = me.x, ny = me.y;

    switch (e.key) {
      case "ArrowUp": ny--; break;
      case "ArrowDown": ny++; break;
      case "ArrowLeft": nx--; break;
      case "ArrowRight": nx++; break;
      default: return;
    }

    moveUser(nx, ny); // Send new target to WebSocket and update local target optimistically
    e.preventDefault();
  };
  
  const displayError = wsError || (!token && "Authentication token is missing.") || (!spaceId && "Space ID is missing.");

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      {!connected && displayError ? (
        <Card className="w-96"> {/* Increased width for potentially longer error messages */}
          <CardHeader>
            <CardTitle>{displayError ? "Connection Issue" : "Connecting to Space"}</CardTitle>
          </CardHeader>
          <CardContent>
            {displayError && <p className="text-red-500">{displayError}</p>}
            {!displayError && <p>Establishing connection...</p>}
          </CardContent>
        </Card>
      ) : !criticalImagesLoaded || !userImageCache["mainSpriteSheet"]?.loaded ? (
         <Card className="w-80">
          <CardHeader><CardTitle>Loading Space...</CardTitle></CardHeader>
          <CardContent><p>Fetching elements and images...</p></CardContent>
        </Card>
      ) : (
        <div className="relative">
          <canvas
            ref={canvasRef}
            tabIndex={0} // Make canvas focusable
            autoFocus
            className="border rounded shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={handleKeyDown}
          />
          <div className="absolute top-2 left-2 bg-white p-2 rounded opacity-75 shadow">
            <div className="font-semibold">Controls:</div>
            <div className="flex items-center gap-1 mt-1 text-gray-700">
              <ArrowUp size={20}/> <ArrowDown size={20}/> <ArrowLeft size={20}/> <ArrowRight size={20}/>
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