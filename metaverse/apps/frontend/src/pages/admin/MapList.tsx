import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// UI & Wrapper Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// Services & Config
import { spaceService } from "@/service/spaceService";
import { BACKEND_URL } from "@/config";
import { AnimatedPageWrapper } from "@/components/ui/AnimatedPageWrapper";

// Define the structure of a Map object
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
  const [search, setSearch] = useState("");
  const [selectedMap, setSelectedMap] = useState<Map | null>(null);

  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [isLoading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Fetch map data on component mount
  useEffect(() => {
    const fetchMaps = async () => {
      setLoading(true);
      try {
        const data = await spaceService.allMap();
        // Support both .spaces and .maps payloads for flexibility
        const mapList: Map[] = data.spaces ?? data.maps ?? [];
        setMaps(mapList);
        setFilteredMaps(mapList);
      } catch (err) {
        console.error("Failed to load maps", err);
        // Optionally set an error state to show in the UI
      } finally {
        setLoading(false);
      }
    };
    fetchMaps();
  }, []);

  // Filter maps based on search query
  useEffect(() => {
    const lowercasedQuery = search.toLowerCase();
    const filtered = maps.filter((m) =>
      m.name.toLowerCase().includes(lowercasedQuery),
    );
    setFilteredMaps(filtered);
  }, [search, maps]);

  // Handlers to open dialogs
  const openCreateDialog = (map: Map) => {
    setSelectedMap(map);
    setCreateDialogOpen(true);
  };

  const openDetailsDialog = (map: Map) => {
    setSelectedMap(map);
    setDetailsDialogOpen(true);
  };

  // Handler to create a new space from a map
  const handleConfirmCreate = async () => {
    if (!selectedMap) return;
    try {
      // Assuming 'authToken' is stored in localStorage after login
      const authToken = localStorage.getItem("authToken");
      await axios.post(
        `${BACKEND_URL}/space`,
        { mapId: selectedMap.id, name: selectedMap.name },
        { headers: { Authorization: `Bearer ${authToken}` } },
      );
      // Navigate to the user's spaces page after creation
      navigate(`/user/spaces`);
    } catch (err) {
      console.error("Failed to create space", err);
      // You could show a toast notification here
      alert("Failed to create space. Please try again.");
    } finally {
      setCreateDialogOpen(false);
    }
  };

  const renderMapCards = () => {
    if (isLoading) {
      return (
        <p className="col-span-full text-center text-gray-400">
          Loading maps...
        </p>
      );
    }
    if (filteredMaps.length === 0) {
      return (
        <Card className="col-span-full p-6 text-center text-gray-500 border-dashed border-2 bg-gray-50 border-gray-200">
          No maps found.
        </Card>
      );
    }
    return filteredMaps.map((map) => (
      <Card
        key={map.id}
        className="bg-white border-gray-200 rounded-xl shadow-lg overflow-hidden flex flex-col"
      >
        <img
          src={map.thumbnail}
          alt={map.name}
          className="w-full h-40 object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              `https://placehold.co/600x400/e5e7eb/d1d5db?text=Image+Error`;
          }}
        />
        <CardContent className="p-4 flex flex-col flex-grow">
          <h3 className="text-lg font-semibold text-black flex-grow">
            {map.name}
          </h3>
          <Badge variant="secondary" className="mt-2 self-start">
            {map.width} x {map.height}
          </Badge>
          <div className="flex gap-2 pt-4 mt-auto">
            <Button className="flex-1 bg-[#9ef01a] hover:opacity-90 text-black" onClick={() => openCreateDialog(map)}>
              Create Space
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-gray-200 text-black hover:bg-gray-50"
              onClick={() => openDetailsDialog(map)}
            >
              Details
            </Button>
          </div>
        </CardContent>
      </Card>
    ));
  };

  return (
    <>
      <AnimatedPageWrapper
        id="maps"
        className="bg-white"
      >
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-black">
          Discover Maps
        </h2>
        <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Journey through diverse landscapes. Each map offers a unique
          foundation for your own space.
        </p>
        <div className="max-w-md mx-auto mb-12">
          <Input
            placeholder="Search maps by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border-gray-200 placeholder:text-gray-400 focus:border-[#9ef01a] focus:ring-[#9ef01a]"
          />
        </div>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {renderMapCards()}
        </div>
      </AnimatedPageWrapper>

      {/* Create Space Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogTitle>Create Space from Map</DialogTitle>
          <DialogDescription>
            You are about to create a new space using the "{selectedMap?.name}"
            map template.
          </DialogDescription>
          {selectedMap && (
            <div className="mt-4 space-y-4">
              <img
                src={selectedMap.thumbnail}
                alt={selectedMap.name}
                className="w-full h-48 object-cover rounded-md"
              />
              <div className="text-sm text-gray-600">
                Map Dimensions:{" "}
                <Badge variant="outline">
                  {selectedMap.width} x {selectedMap.height}
                </Badge>
              </div>
            </div>
          )}
          <DialogFooter className="pt-4">
            <Button
              variant="outline"
              className="border-gray-200 text-black hover:bg-gray-50"
              onClick={() => setCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button className="bg-[#9ef01a] hover:opacity-90 text-black" onClick={handleConfirmCreate}>Confirm & Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent>
          <DialogTitle>{selectedMap?.name}</DialogTitle>
          <DialogDescription>
            Map Dimensions: {selectedMap?.width} x {selectedMap?.height}
          </DialogDescription>
          {selectedMap && (
            <img
              src={selectedMap.thumbnail}
              alt={selectedMap.name}
              className="w-full mt-4 rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
