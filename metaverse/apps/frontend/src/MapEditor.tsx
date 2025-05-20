import React, {useState, useEffect, useRef} from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';

type Element = { id: string; imageUrl: string; width: number; height: number; static: boolean };
type Placed = { elementId: string; x: number; y: number };

type MapData = { name: string; dimensions: { width: number; height: number }; placed: Placed[] };

const CELL_SIZE = 32;

export default function MapEditor() {
  const [elements, setElements] = useState<Element[]>([]);
  const [selected, setSelected] = useState<Element | null>(null);
  const [mapName, setMapName] = useState('');
  const [dims, setDims] = useState({width:20,height:20});
  const [placed, setPlaced] = useState<Placed[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // fetch palette
    axios.get('/api/v1/admin/element', {headers:{authorization: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtYXZ3czRkYzAwMDRpMDZzZG9zdXBvdmkiLCJ1c2VybmFtZSI6Im5pa2VzQDEyczMzIiwicm9sZSI6IkFkbWluIiwiaWF0IjoxNzQ3NzA4OTQ3LCJleHAiOjE3NDc3NDQ5NDd9.Qrx5cr-98J3ne-ykP1ROiZ-S5OqJi5ZzzGutJ6ObA90'}})
      .then(r=>setElements(r.data.elements));
  },[]);

  // redraw grid + placed
  useEffect(() => {
    const c = canvasRef.current; if(!c) return;
    const ctx = c.getContext('2d'); if(!ctx) return;
    c.width = dims.width * CELL_SIZE;
    c.height = dims.height * CELL_SIZE;
    ctx.clearRect(0,0,c.width,c.height);
    // grid
    ctx.strokeStyle='#ccc';
    for(let x=0;x<=dims.width;x++){
      ctx.beginPath();ctx.moveTo(x*CELL_SIZE,0);ctx.lineTo(x*CELL_SIZE,c.height);ctx.stroke();
    }
    for(let y=0;y<=dims.height;y++){
      ctx.beginPath();ctx.moveTo(0,y*CELL_SIZE);ctx.lineTo(c.width,y*CELL_SIZE);ctx.stroke();
    }
    // placed
    placed.forEach(p => {
      const el = elements.find(e=>e.id===p.elementId);
      if(el){
        const img = new Image(); img.src = el.imageUrl;
        img.onload = ()=>{ ctx.drawImage(img, p.x*CELL_SIZE, p.y*CELL_SIZE, el.width*CELL_SIZE, el.height*CELL_SIZE); };
      }
    });
  },[placed, elements, dims]);

  const onCanvasClick = (e: React.MouseEvent) => {
    if(!selected) return;
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const x = Math.floor((e.clientX-rect.left)/CELL_SIZE);
    const y = Math.floor((e.clientY-rect.top)/CELL_SIZE);
    setPlaced(prev=>[...prev,{elementId:selected.id,x,y}]);
  };

  const saveMap = () => {
    const payload: MapData = { name: mapName, dimensions:dims, placed };
    axios.post('/api/v1/admin/map',{...payload}, {headers:{authorization:'Bearer TOKEN'}})
      .then(()=>alert('Saved'))
      .catch(e=>console.error(e));
  };

  return (
    <div className="flex gap-4 p-4">
      <aside className="w-64">
        <div className="space-y-2">
          <Label>Map Name</Label>
          <Input value={mapName} onChange={e=>setMapName(e.target.value)} />
          <Label>Dimensions (W×H)</Label>
          <div className="flex gap-2">
            <Input type="number" value={dims.width} onChange={e=>setDims(d=>({...d,width:+e.target.value}))} />
            <span>×</span>
            <Input type="number" value={dims.height} onChange={e=>setDims(d=>({...d,height:+e.target.value}))} />
          </div>
        </div>
        <h4 className="mt-4 font-semibold">Elements</h4>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {elements.map(el=> (
            <img
              key={el.id}
              src={el.imageUrl}
              onClick={()=>setSelected(el)}
              className={`border ${selected?.id===el.id?'border-blue-500':'border-transparent'} cursor-pointer`} />
          ))}
        </div>
        <Button className="mt-4 w-full" onClick={saveMap}>Save Map</Button>
      </aside>
      <main>
        <canvas
          ref={canvasRef}
          className="border"
          onClick={onCanvasClick}
        />
      </main>
    </div>
  );
}
