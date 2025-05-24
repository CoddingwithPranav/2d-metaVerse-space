import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { BACKEND_URL } from "@/config";
import { mapService } from "@/service/mapservice";

interface MapOption {
  id: string;
  name: string;
  dimensions: string;
}

export const SpaceCreator: React.FC = () => {
  const navigate = useNavigate();
  const [maps, setMaps] = useState<MapOption[]>([]);
  // Initialize selectedMap to "none" to match the default SelectItem
  const [selectedMap, setSelectedMap] = useState<string>("none");
  const [name, setName] = useState("");
  const [dimensions, setDimensions] = useState("50x50");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    mapService
      .list()
      .then((list) => {
        setMaps(
          list.map((m) => ({
            id: m.id,
            name: m.name,
            dimensions: m.dimensions,
          }))
        );
      })
      .catch(console.error);
  }, []);

  // When map is selected, auto-fill dimensions
  useEffect(() => {
    // Only update dimensions if a specific map is selected (not "none")
    if (selectedMap && selectedMap !== "none") {
      const map = maps.find((m) => m.id === selectedMap);
      if (map) setDimensions(map.dimensions);
    } else if (selectedMap === "none") {
      // Optionally reset dimensions if "None" is selected
      setDimensions("50x50"); // Or any other default you prefer
    }
  }, [selectedMap, maps]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: any = { name, dimensions };
      // Only include mapId if a specific map is selected
      if (selectedMap && selectedMap !== "none") {
        payload.mapId = selectedMap;
      }
      const res = await axios.post(`${BACKEND_URL}/space`, payload, {
        headers: {
          authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      const { spaceId } = res.data;
      navigate(`/space/${spaceId}`);
    } catch (err) {
      console.error("Failed to create space", err);
      alert("Failed to create space");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Create New Space</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Space Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="map">Select Map</Label>
            {/* Added value prop to make it a controlled component */}
            <Select onValueChange={setSelectedMap} value={selectedMap}>
              {/* Ensure SelectValue displays the currently selected map name or a default */}
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a map" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {maps.map((map) => (
                  <SelectItem key={map.id} value={map.id}>
                    {map.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="dimensions">Dimensions</Label>
            <Input
              id="dimensions"
              value={dimensions}
              onChange={(e) => setDimensions(e.target.value)}
              // required={selectedMap === "none"} // Only required if no map is selected
              // disabled={selectedMap !== "none"} // Optional: disable if using map dimensions
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating..." : "Create Space"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SpaceCreator;
