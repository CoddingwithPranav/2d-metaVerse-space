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
  width: number;
  height: number;
}

export const SpaceCreator: React.FC = () => {
  const navigate = useNavigate();
  const [maps, setMaps] = useState<MapOption[]>([]);
  const [selectedMap, setSelectedMap] = useState<string>("none");
  const [name, setName] = useState<string>("");
  const [dimensions, setDimensions] = useState<string>("50x50");
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch available maps
  useEffect(() => {
    mapService
      .list()
      .then((list) => {
        setMaps(
          list.map((m) => ({ id: m.id, name: m.name, width: m.width, height: m.height }))
        );
      })
      .catch(console.error);
  }, []);

  // Auto-fill dimensions when a map is selected
  useEffect(() => {
    if (selectedMap !== "none") {
      const map = maps.find((m) => m.id === selectedMap);
      if (map) {
        setDimensions(`${map.width}x${map.height}`);
      }
    } else {
      setDimensions("50x50");
    }
  }, [selectedMap, maps]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: any = { name };

      if (selectedMap !== "none") {
        // Creating space from an existing map
        payload.mapId = selectedMap;
      } else {
        // Creating custom space dimensions
        const [w, h] = dimensions.split("x").map((v) => parseInt(v, 10));
        payload.width = w;
        payload.height = h;
      }

      const res = await axios.post(
        `${BACKEND_URL}/space`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      navigate(`/user/spaces`);
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
            <Select onValueChange={setSelectedMap} value={selectedMap}>
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
              disabled={selectedMap !== "none"}
              placeholder="WidthxHeight"
              required={selectedMap === "none"}
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