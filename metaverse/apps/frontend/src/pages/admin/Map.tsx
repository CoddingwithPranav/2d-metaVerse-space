import React, { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import UploadExample from '@/components/ui/imageupload';
import { elementService } from '@/service/elementService';
import { backgroundService } from '@/service/backgroundService';
import { mapService, type MapItem } from '@/service/mapservice';
import { CanvasEditor, type Asset, type Background, type CanvasJSON } from './MapEditor';


const MapDashboard: React.FC = () => {
  const [maps, setMaps] = useState<MapItem[]>([]);
  const [editing, setEditing] = useState(false);
  const [mapName, setMapName] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [backgrounds, setBackgrounds] = useState<Background[]>([]);
  const [canvasData, setCanvasData] = useState<CanvasJSON | null>(null);

  // fetch elements and backgrounds
  useEffect(() => {
    elementService.list()
      .then((response) => {
        const items: Asset[] = response.map((e: any) => ({
          id: e.id,
          url: e.imageUrl,
          width: e.width,
          height: e.height,
        }));
        setAssets(items);
      })
      .catch(console.error);

    backgroundService.list()
      .then((response) => {
        const bgs: Background[] = response.map((b: any) => ({
          id: b.id,
          url: b.Url,
        }));
        setBackgrounds(bgs);
      })
      .catch(console.error);

    mapService.list()
      .then(setMaps)
      .catch(console.error);
  }, []);

  // callback from CanvasEditor
  const handleCanvasUpdate = (data: CanvasJSON) => setCanvasData(data);

  // save map using backend schema
  const saveMap = async () => {
    if (!canvasData) {
      alert('Canvas not ready');
      return;
    }
    try {
      const { width, height, background, elements } = canvasData;
      // map elements to defaultElements schema
      const defaultElements = elements.map((e) => ({
        id: e.id,
        assetId: e.assetId,
        x: Math.round(e.x),
        y: Math.round(e.y),
        width: Math.round(e.width),
        height: Math.round(e.height),
      }));
      const payload = {
        name: mapName,
        thumbnail: thumbnailUrl,
        width,
        height,
        background,
        defaultElements,
      };
      const res = await mapService.create(payload);
      console.log('Map created with id:', res.id);
      setEditing(false);
      // reload maps
      const all = await mapService.list();
      setMaps(all);
    } catch (err) {
      console.error(err);
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
            {maps.map((m) => (
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
                  <p className="mt-2">Dimensions: {m.height}x{m.width}</p>
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
                onChange={(e) => setMapName(e.target.value)}
                className="mt-1 block w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Thumbnail Upload</label>
              <UploadExample onUpload={(url) => setThumbnailUrl(url)} />
              {thumbnailUrl && <p className="mt-2 text-sm break-all">{thumbnailUrl}</p>}
            </div>
          </div>

          <div>
            <CanvasEditor
              assets={assets}
              backgrounds={backgrounds}
              onUpdateCanvas={handleCanvasUpdate}
            />
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