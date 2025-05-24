import React, { useState, useEffect } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { spaceService } from '@/service/spaceService';

interface Map {
  id: string;
  name: string;
  thumbnail: string;
  width: number;
  height: number;
}

export const MapList: React.FC = () => {
  const [maps, setMaps] = useState<Map[]>([]);
  const [filteredMaps, setFilteredMaps] = useState<Map[]>([]);
  const [search, setSearch] = useState('');
  const [selectedMap, setSelectedMap] = useState<Map | null>(null);

  useEffect(() => {
    // Replace this with actual API call
    const fetchMaps = async () => {
      const data = await spaceService.allMap();
      setMaps(data.maps);
      setFilteredMaps(data.maps);
    };

    fetchMaps();
  }, []);

  useEffect(() => {
    const lowerSearch = search.toLowerCase();
    setFilteredMaps(
      maps.filter(map => map.name.toLowerCase().includes(lowerSearch))
    );
  }, [search, maps]);

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Available Maps</h2>
      <Input
        placeholder="Search maps..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md"
      />

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {filteredMaps.length > 0 ? (
          filteredMaps.map(map => (
            <Card key={map.id} className="rounded-2xl shadow-lg">
              <img
                src={map.thumbnail}
                alt={map.name}
                className="w-full h-40 object-cover rounded-t-2xl"
              />
              <CardContent className="p-4 space-y-2">
                <div className="text-lg font-semibold">{map.name}</div>
                <Badge variant="outline">{map.width} x {map.height}</Badge>
                <div className="flex gap-2 pt-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" onClick={() => setSelectedMap(map)}>
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogTitle>{selectedMap?.name}</DialogTitle>
                      <DialogDescription>
                        Dimensions: {selectedMap?.width} x {selectedMap?.height}
                      </DialogDescription>
                      <img
                        src={selectedMap?.thumbnail}
                        alt="Map Preview"
                        className="w-full mt-4 rounded"
                      />
                    </DialogContent>
                  </Dialog>
                  <Button variant="default" onClick={() => alert(`Create space for map ${map.name}`)}>
                    Create Space
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full p-6 text-center text-muted-foreground border-dashed border-2">
            No maps available
          </Card>
        )}
      </div>
    </div>
  );
};
