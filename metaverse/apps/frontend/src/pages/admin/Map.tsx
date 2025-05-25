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
import { mapService } from '@/service/mapservice';
import { CanvasEditor, type Asset, type Background, type CanvasJSON } from './MapEditor';

export interface MapItem {
  id: string;
  name: string;
  thumbnail: string;
  dimensions: string;
}

const MapDashboard: React.FC = () => {
  const [maps, setMaps] = useState<MapItem[]>([]);
  const [editing, setEditing] = useState(false);
  const [mapName, setMapName] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [backgrounds, setBackgrounds] = useState<Background[]>([]);
  const handleCanvasUpdate = (data: CanvasJSON) => {
    console.log('Canvas JSON updated:', data);
  };

  useEffect(() => {
    setAssets([{ id: 'tree', url: 'https://file.aiquickdraw.com/imgcompressed/img/compressed_0d9f4c7991615d1b327da9d7cb52cf65.webp', width: 64, height: 64 },
      { id: 'rock', url: 'https://static.vecteezy.com/system/resources/thumbnails/026/547/570/small/an-8-bit-retro-styled-pixel-art-illustration-of-a-dark-stone-rock-formation-free-png.png', width: 32, height: 32 }]);
    setBackgrounds([{ id: 'grass', url: 'https://i.imgur.com/grass.png' }, { id: 'stone', url: 'https://i.imgur.com/stone.png' }]);
  }, []);

  useEffect(() => {
    elementService.list().then((response)=>{
      console.log('Elements loaded:', response);
    }).catch(console.error);
    mapService.list().then(setMaps).catch(console.error);
  }, []);



  const saveMap = async () => {
  
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
              <label className="block text-sm font-medium mb-1">Thumbnail Upload</label>
              <UploadExample onUpload={url => setThumbnailUrl(url)} />
              {thumbnailUrl && <p className="mt-2 text-sm break-all">{thumbnailUrl}</p>}
            </div>
          </div>

          <div>
           <CanvasEditor assets={assets} backgrounds={backgrounds} onUpdateCanvas={handleCanvasUpdate}/>;
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





