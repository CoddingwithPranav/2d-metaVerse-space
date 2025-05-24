import React, { useEffect, useState, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Rnd } from 'react-rnd';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import UploadExample from '@/components/ui/imageupload';
import { elementService } from '@/service/elementService';
import { mapService } from '@/service/mapservice';

interface Element {
  id: string;
  imageUrl: string;
  width: number;   // in grid cells
  height: number;  // in grid cells
  static: boolean;
}

interface PlacedItem {
  id: string;
  element: Element;
  x: number;       // px
  y: number;       // px
  width: number;   // px
  height: number;  // px
}

interface MapItem {
  id: string;
  name: string;
  thumbnail: string;
  dimensions: string;
}

const CELL_SIZE = 20;  // each grid cell is 20px

const DraggablePaletteItem: React.FC<{ el: Element }> = ({ el }) => {
  const [, dragRef] = useDrag(
    () => ({ type: 'ELEMENT', item: { element: el } }),
    [el]
  );
  return (
    <img
    ref={(node) => {
      if (node) {
        dragRef(node);
      }}}
      src={el.imageUrl}
      alt={el.id}
      className="w-12 h-12 cursor-pointer"
    />
  );
};

const MapDashboard: React.FC = () => {
  const [elements, setElements] = useState<Element[]>([]);
  const [maps, setMaps] = useState<MapItem[]>([]);
  const [editing, setEditing] = useState(false);
  // grid dimensions in cells
  const [gridSize, setGridSize] = useState<{ cols: number; rows: number }>({ cols: 10, rows: 10 });
  const [placed, setPlaced] = useState<PlacedItem[]>([]);
  const [mapName, setMapName] = useState('');
  const [mapDimensions, setMapDimensions] = useState('10x10');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const canvasRef = useRef<HTMLDivElement>(null);

  // parse "colsxrows" into gridSize
  useEffect(() => {
    const [c, r] = mapDimensions.split('x').map(n => parseInt(n, 10) || 0);
    if (c > 0 && r > 0) setGridSize({ cols: c, rows: r });
  }, [mapDimensions]);

  useEffect(() => {
    elementService.list().then(setElements).catch(console.error);
    mapService.list().then(setMaps).catch(console.error);
  }, []);

  const [, dropRef] = useDrop(
    () => ({
      accept: 'ELEMENT',
      drop: (item: { element: Element }, monitor) => {
        const offset = monitor.getClientOffset();
        const rect = canvasRef.current?.getBoundingClientRect();
        if (offset && rect) {
          // align to grid
          const rawX = offset.x - rect.left;
          const rawY = offset.y - rect.top;
          const gx = Math.round(rawX / CELL_SIZE);
          const gy = Math.round(rawY / CELL_SIZE);
          const x = gx * CELL_SIZE;
          const y = gy * CELL_SIZE;
          const newItem: PlacedItem = {
            id: `${item.element.id}_${Date.now()}`,
            element: item.element,
            x,
            y,
            width: item.element.width * CELL_SIZE,
            height: item.element.height * CELL_SIZE,
          };
          setPlaced(prev => [...prev, newItem]);
        }
      },
    }),
    [setPlaced]
  );

  const saveMap = async () => {
    // convert back to grid coordinates
    const defaultElements = placed.map(p => ({ elementId: p.element.id, x: p.x / CELL_SIZE, y: p.y / CELL_SIZE }));
    try {
      await mapService.create({
        name: mapName || `Custom Map ${Date.now()}`,
        thumbnail: thumbnailUrl,
        dimensions: `${gridSize.cols}x${gridSize.rows}`,
        defaultElements,
      });
      setEditing(false);
      setPlaced([]);
      mapService.list().then(setMaps).catch(console.error);
    } catch (err) {
      console.error('Failed to save map:', err);
      alert('Failed to save map');
    }
  };

  // pixel sizes for wrapper
  const pixelWidth = gridSize.cols * CELL_SIZE;
  const pixelHeight = gridSize.rows * CELL_SIZE;

  return (
    <div className="p-8 space-y-6">
      <h2 className="text-3xl font-bold">Maps Management</h2>

      {!editing ? (
        <>
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-semibold">Existing Maps</h3>
            <Button onClick={() => setEditing(true)}>Add New Map</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {maps.map(m => (
              <Card key={m.id} className="hover:shadow-lg transition-shadow">
                <CardHeader><CardTitle>{m.name}</CardTitle></CardHeader>
                <CardContent>
                  <img src={m.thumbnail} alt={m.name} className="w-full h-40 object-cover rounded" />
                  <p className="mt-2">Dimensions: {m.dimensions}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium">Map Name</label>
              <input
                type="text"
                value={mapName}
                onChange={e => setMapName(e.target.value)}
                className="mt-1 block w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Dimensions (e.g. 10x10)</label>
              <input
                type="text"
                value={mapDimensions}
                onChange={e => setMapDimensions(e.target.value)}
                className="mt-1 block w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Thumbnail Upload</label>
              <UploadExample onUpload={url => setThumbnailUrl(url)} />
              {thumbnailUrl && <p className="mt-2 text-sm break-all">{thumbnailUrl}</p>}
            </div>
          </div>

          <div className="flex space-x-6 pt-6">
            {/* Palette */}
            <div className="w-1/4 p-4 border rounded space-y-4">
              <h4 className="font-semibold">Palette</h4>
              <div className="flex flex-wrap gap-2">
                {elements.map(el => <DraggablePaletteItem key={el.id} el={el} />)}
              </div>
            </div>

            {/* Canvas Wrapper with scroll and grid */}
            <div className="flex-1 border rounded overflow-auto" style={{ maxHeight: '80vh' }}>
              <div
                ref={node => { dropRef(node); canvasRef.current = node; }}
                className="relative"
                style={{
                  width: pixelWidth,
                  height: pixelHeight,
                  backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
                  backgroundImage:
                    'linear-gradient(to right, #ddd 1px, transparent 1px),\n                     linear-gradient(to bottom, #ddd 1px, transparent 1px)',
                }}
              >
                {placed.map(item => (
                  <Rnd
                    key={item.id}
                    size={{ width: item.width, height: item.height }}
                    position={{ x: item.x, y: item.y }}
                    bounds="parent"
                    grid={[CELL_SIZE, CELL_SIZE]}
                    onDragStop={(_e, d) => {
                      setPlaced(prev => prev.map(x => x.id===item.id?{...x,x:d.x,y:d.y}:x));
                    }}
                    onResizeStop={(_e,_dir,ref,_delta,pos) => {
                      setPlaced(prev => prev.map(x => x.id===item.id?{
                        ...x,
                        x: pos.x,
                        y: pos.y,
                        width: ref.offsetWidth,
                        height: ref.offsetHeight,
                      }:x));
                    }}
                  >
                    <img src={item.element.imageUrl} alt={item.element.id} className="w-full h-full" />
                  </Rnd>
                ))}
              </div>
            </div>
          </div>

          <div className="flex space-x-4 mt-4">
            <Button onClick={saveMap}>Save Map</Button>
            <Button variant="outline" onClick={()=>setEditing(false)}>Cancel</Button>
          </div>
        </>
      )}
    </div>
  );
};

export default MapDashboard;