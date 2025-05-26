import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { spaceService } from '@/service/spaceService';
import axios from 'axios';
import { BACKEND_URL } from '@/config';

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
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMaps = async () => {
      try {
        const data = await spaceService.allMap();
        // Support both .spaces and .maps payloads
        const list: Map[] = data.spaces ?? data.maps ?? [];
        setMaps(list);
        setFilteredMaps(list);
      } catch (err) {
        console.error('Failed to load maps', err);
      }
    };
    fetchMaps();
  }, []);

  useEffect(() => {
    const lower = search.toLowerCase();
    setFilteredMaps(maps.filter((m) => m.name.toLowerCase().includes(lower)));
  }, [search, maps]);

  const openCreateDialog = (map: Map) => {
    setSelectedMap(map);
    setCreateDialogOpen(true);
  };

  const openDetailsDialog = (map: Map) => {
    setSelectedMap(map);
    setDetailsDialogOpen(true);
  };

  const handleConfirmCreate = async () => {
    if (!selectedMap) return;
    try {
      const res = await axios.post(
        `${BACKEND_URL}/space`,
        { mapId: selectedMap.id, name: selectedMap.name },
        { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
      );
      navigate(`/user/spaces`);
    } catch (err) {
      console.error('Failed to create space', err);
      alert('Failed to create space');
    } finally {
      setCreateDialogOpen(false);
    }
  };

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
          filteredMaps.map((map) => (
            <Card key={map.id} className="rounded-2xl shadow-lg">
              <img
                src={map.thumbnail}
                alt={map.name}
                className="w-full h-40 object-cover rounded-t-2xl"
              />
              <CardContent className="p-4 space-y-2">
                <div className="text-lg font-semibold">{map.name}</div>
                <Badge variant="outline">
                  {map.width} x {map.height}
                </Badge>
                <div className="flex gap-2 pt-2">
                  <Button variant="default" onClick={() => openCreateDialog(map)}>
                    Create Space
                  </Button>
                  <Button variant="outline" onClick={() => openDetailsDialog(map)}>
                    View Details
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

      {/* Create Space Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogTitle>Create Space</DialogTitle>
          <DialogDescription>
            Are you sure you want to create a space from the map "{selectedMap?.name}"?
          </DialogDescription>
          <img
            src={selectedMap?.thumbnail}
            alt={selectedMap?.name}
            className="w-full h-40 object-cover rounded mt-4"
          />
          <div className="mt-2">
            Dimensions: {selectedMap?.width} x {selectedMap?.height}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmCreate}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent>
          <DialogTitle>{selectedMap?.name}</DialogTitle>
          <DialogDescription>
            Dimensions: {selectedMap?.width} x {selectedMap?.height}
          </DialogDescription>
          <img
            src={selectedMap?.thumbnail}
            alt={selectedMap?.name}
            className="w-full mt-4 rounded"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};