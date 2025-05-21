import React, { useEffect, useState, useRef } from 'react';
import {  useDrag, useDrop } from 'react-dnd';
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
  width: number;
  height: number;
  static: boolean;
}

interface PlacedItem {
  id: string;
  element: Element;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface MapItem {
  id: string;
  name: string;
  thumbnail: string;
  dimensions: string;
}

const DraggablePaletteItem: React.FC<{ el: Element }> = ({ el }) => {
  const [, dragRef] = useDrag(
    () => ({
      type: 'ELEMENT',
      item: { element: el },
    }),
    [el]
  );

  return (
    <img
    ref={(node) => {
      if (node) {
        dragRef(node);
      }
    }}
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
  const [placed, setPlaced] = useState<PlacedItem[]>([]);
  const [mapName, setMapName] = useState('');
  const [mapDimensions, setMapDimensions] = useState('800x600');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const canvasRef = useRef<HTMLDivElement>(null);

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
          const x = offset.x - rect.left;
          const y = offset.y - rect.top;
          const newItem: PlacedItem = {
            id: `${item.element.id}_${Date.now()}`,
            element: item.element,
            x,
            y,
            width: item.element.width * 40,
            height: item.element.height * 40,
          };
          setPlaced(prev => [...prev, newItem]);
        }
      },
    }),
    [setPlaced]
  );

  const saveMap = async () => {
    const defaultElements = placed.map(p => ({ elementId: p.element.id, x: p.x, y: p.y }));
    try {
      await mapService.create({
        name: mapName || `Custom Map ${Date.now()}`,
        thumbnail: thumbnailUrl,
        dimensions: mapDimensions,
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
                  <CardHeader>
                    <CardTitle>{m.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <img
                      src={m.thumbnail}
                      alt={m.name}
                      className="w-full h-40 object-cover rounded"
                    />
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
                <label className="block text-sm font-medium">Dimensions (e.g. 800x600)</label>
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
                {thumbnailUrl && (
                  <p className="mt-2 text-sm break-all">{thumbnailUrl}</p>
                )}
              </div>
            </div>

            <div className="flex space-x-6 pt-6">
              {/* Palette */}
              <div className="w-1/4 p-4 border rounded space-y-4">
                <h4 className="font-semibold">Palette</h4>
                <div className="flex flex-wrap gap-2">
                  {elements.map(el => (
                    <DraggablePaletteItem key={el.id} el={el} />
                  ))}
                </div>
              </div>

              {/* Canvas */}
              <div
                ref={node => {
                  dropRef(node);
                  canvasRef.current = node;
                }}
                className="relative w-full h-[600px] bg-gray-100 border rounded overflow-hidden"
              >
                {placed.map(item => (
                  <Rnd
                    key={item.id}
                    size={{ width: item.width, height: item.height }}
                    position={{ x: item.x, y: item.y }}
                    bounds="parent"
                    onDragStop={(_e, d) => {
                      setPlaced(prev =>
                        prev.map(x =>
                          x.id === item.id ? { ...x, x: d.x, y: d.y } : x
                        )
                      );
                    }}
                    onResizeStop={(_e, _dir, ref, _delta, pos) => {
                      const w = ref.offsetWidth;
                      const h = ref.offsetHeight;
                      setPlaced(prev =>
                        prev.map(x =>
                          x.id === item.id
                            ? { ...x, x: pos.x, y: pos.y, width: w, height: h }
                            : x
                        )
                      );
                    }}
                  >
                    <img
                      src={item.element.imageUrl}
                      alt={item.element.id}
                      className="w-full h-full"
                    />
                  </Rnd>
                ))}
              </div>
            </div>

            <div className="flex space-x-4 mt-4">
              <Button onClick={saveMap}>Save Map</Button>
              <Button variant="outline" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </>
        )}
      </div>
  );
};

export default MapDashboard;