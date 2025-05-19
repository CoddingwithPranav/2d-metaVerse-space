import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ArrowRightCircle } from 'lucide-react';

type IncomingMessage =
  | { type: 'space-joined'; payload: { userId: string; spawn: { x: number; y: number }; users: { id: string; x: number; y: number }[] } }
  | { type: 'user-joined'; payload: { userId: string; x: number; y: number } }
  | { type: 'user-moved'; payload: { id: string; x: number; y: number } }
  | { type: 'movement-rejected'; payload: { x: number; y: number } }
  | { type: 'user-left'; payload: { userId: string } };

type OutgoingMessage =
  | { type: 'join'; payload: { token: string; spaceId: string } }
  | { type: 'move'; payload: { x: number; y: number } };

type UserState = { id: string; x: number; y: number };

const CELL_SIZE = 20;
const GRID_DEFAULT = { width: 50, height: 50 };

export default function App() {
  const [token, setToken] = useState('');
  const [spaceId, setSpaceId] = useState('');
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const [selfId, setSelfId] = useState<string | null>(null);
  const [users, setUsers] = useState<Record<string, UserState>>({});
  const [gridSize] = useState(GRID_DEFAULT);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (!connected || !wsRef.current) return;
    const ws = wsRef.current;
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data) as IncomingMessage;
      switch (msg.type) {
        case 'space-joined': {
          const { userId, spawn, users: others } = msg.payload;
          setSelfId(userId);
          setUsers(() => {
            const all: Record<string, UserState> = {};
            // add self
            all[userId] = { id: userId, x: spawn.x, y: spawn.y };
            // add others
            others.forEach((u) => {
              all[u.id] = { id: u.id, x: u.x, y: u.y };
            });
            return all;
          });
          break;
        }
        case 'user-joined': {
          const { userId, x, y } = msg.payload;
          setUsers((prev) => ({ ...prev, [userId]: { id: userId, x, y } }));
          break;
        }
        case 'user-moved': {
          const { id, x, y } = msg.payload;
          setUsers((prev) => ({ ...prev, [id]: { id, x, y } }));
          break;
        }
        case 'user-left': {
          setUsers((prev) => {
            const copy = { ...prev };
            delete copy[msg.payload.userId];
            return copy;
          });
          break;
        }
        case 'movement-rejected': {
          // Reset to server position if needed
          const { x, y } = msg.payload;
          if (selfId) {
            setUsers((prev) => ({ ...prev, [selfId]: { id: selfId, x, y } }));
          }
          break;
        }
      }
    };
    // return () => ws.close();
  }, [connected, selfId]);

  // Draw grid and users
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { width, height } = gridSize;
    canvas.width = width * CELL_SIZE;
    canvas.height = height * CELL_SIZE;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // grid lines
    ctx.strokeStyle = '#eee';
    for (let x = 0; x <= width; x++) {
      ctx.beginPath(); ctx.moveTo(x * CELL_SIZE, 0);
      ctx.lineTo(x * CELL_SIZE, height * CELL_SIZE); ctx.stroke();
    }
    for (let y = 0; y <= height; y++) {
      ctx.beginPath(); ctx.moveTo(0, y * CELL_SIZE);
      ctx.lineTo(width * CELL_SIZE, y * CELL_SIZE); ctx.stroke();
    }
    // users
    Object.values(users).forEach((u) => {
      ctx.fillStyle = u.id === selfId ? '#3b82f6' : '#ef4444';
      ctx.fillRect(u.x * CELL_SIZE + 1, u.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    });
  }, [users, selfId]);

  // Join handler
  const handleJoin = () => {
    const ws = new WebSocket('ws://localhost:3001');
    wsRef.current = ws;
    ws.onopen = () => {
      setConnected(true);
      const msg: OutgoingMessage = { type: 'join', payload: { token, spaceId } };
      ws.send(JSON.stringify(msg));
    };
  };

  // Movement controls via canvas keydown
  const handleKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    debugger
    if (!connected || !selfId) return;
    const me = users[selfId]; if (!me) return;
    let { x, y } = me;
    if (e.key === 'ArrowUp') y--;
    if (e.key === 'ArrowDown') y++;
    if (e.key === 'ArrowLeft') x--;
    if (e.key === 'ArrowRight') x++;
    const moveMsg: OutgoingMessage = { type: 'move', payload: { x, y } };
    wsRef.current?.send(JSON.stringify(moveMsg));
    e.preventDefault();
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      {!connected ? (
        <Card className="w-80">
          <CardHeader><CardTitle>Join Space</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Input placeholder="JWT Token" value={token} onChange={(e) => setToken(e.target.value)} />
            <Input placeholder="Space ID" value={spaceId} onChange={(e) => setSpaceId(e.target.value)} />
            <Button onClick={handleJoin} className="w-full">
              <div className="flex justify-center items-center gap-2">
                <ArrowRightCircle className="w-4 h-4" /> Join
              </div>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="relative">
          <canvas ref={canvasRef} tabIndex={0} autoFocus className="border rounded shadow-lg focus:outline-none" onKeyDown={handleKeyDown} />
          <div className="absolute top-2 left-2 bg-white p-2 rounded opacity-75">
            <div className="font-semibold">Controls:</div>
            <div className="flex gap-2 mt-1"><ArrowUp /><ArrowDown /><ArrowLeft /><ArrowRight /></div>
          </div>
        </div>
      )}
    </div>
  );
}
