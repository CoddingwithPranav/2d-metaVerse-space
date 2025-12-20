import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
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
import { Loader2, PlusCircle, Map, Ruler } from "lucide-react"; // Re-importing icons
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
  const [maps, setMaps] = useState<MapOption[]>([]); // Stores available maps
  const [selectedMap, setSelectedMap] = useState<string>("none"); // "none" for custom dimensions
  const [name, setName] = useState<string>(""); // Space name input
  const [dimensions, setDimensions] = useState<string>("500x500"); // Custom dimensions input
  const [loading, setLoading] = useState<boolean>(false); // State for form submission loading
  const [fetchingMaps, setFetchingMaps] = useState<boolean>(true); // State for fetching maps loading
  const [nameError, setNameError] = useState<boolean>(false); // State for name validation error

  // Fetch available maps on component mount
  useEffect(() => {
    setFetchingMaps(true);
    mapService
      .list()
      .then((list) => {
        setMaps(
          list.map((m) => ({
            id: m.id,
            name: m.name,
            width: m.width,
            height: m.height,
          })),
        );
        // If maps are available and no map is yet selected, default to the first one
        if (list.length > 0 && selectedMap === "none") {
          setSelectedMap(list[0].id);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch maps:", error);
      })
      .finally(() => {
        setFetchingMaps(false);
      });
  }, []);

  // Auto-fill dimensions when a map is selected or reset for custom
  useEffect(() => {
    if (selectedMap !== "none") {
      const map = maps.find((m) => m.id === selectedMap);
      if (map) {
        setDimensions(`${map.width}x${map.height}`);
      }
    } else {
      // Only reset to default if it's not already a valid custom input
      if (
        !dimensions.match(/^\d+x\d+$/) ||
        (parseInt(dimensions.split("x")[0], 10) !== 500 &&
          parseInt(dimensions.split("x")[1], 10) !== 500)
      ) {
        setDimensions("500x500");
      }
    }
  }, [selectedMap, maps]); // `dimensions` is deliberately excluded here to avoid infinite loop with its own update

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNameError(false); // Reset name error on new submission attempt

    if (!name.trim()) {
      setNameError(true); // Set name error state
      setLoading(false);
      return;
    }

    let payload: any = { name };

    if (selectedMap !== "none") {
      payload.mapId = selectedMap;
    } else {
      const [widthStr, heightStr] = dimensions.split("x");
      const w = parseInt(widthStr, 10);
      const h = parseInt(heightStr, 10);

      if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
        setLoading(false);
        return;
      }
      payload.width = w;
      payload.height = h;
    }

    try {
      await axios.post(`${BACKEND_URL}/space`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      navigate(`/user/spaces`);
    } catch (err: any) {
      console.error("Failed to create space", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-gray-950 p-4">
      <Card className="w-full max-w-md bg-slate-800 text-slate-50 border-slate-700 shadow-xl rounded-lg">
        <CardHeader className="pb-6 border-b border-slate-700">
          <CardTitle className="text-3xl font-extrabold text-center text-purple-400 flex items-center justify-center gap-3">
            <PlusCircle className="w-8 h-8 text-cyan-400" /> Create New Space
          </CardTitle>
          <CardDescription className="text-center text-slate-400 mt-2">
            Design your ideal virtual environment. Choose a pre-built map or set
            custom dimensions.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Space Name Input */}
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-slate-300 flex items-center gap-2"
              >
                <Map className="w-4 h-4 text-emerald-400" /> Space Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError) setNameError(false); // Clear error on typing
                }}
                placeholder="e.g., My Awesome Office"
                className={`bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400 focus-visible:ring-offset-slate-900 focus-visible:ring-purple-500
                            ${nameError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                required
                aria-invalid={nameError ? "true" : "false"}
                aria-describedby={nameError ? "name-error" : undefined}
              />
              {nameError && (
                <p id="name-error" className="text-sm text-red-400">
                  Space name cannot be empty.
                </p>
              )}
            </div>

            {/* Select Base Map */}
            <div className="space-y-2">
              <Label
                htmlFor="map-select"
                className="text-slate-300 flex items-center gap-2"
              >
                <Map className="w-4 h-4 text-blue-400" /> Select Base Map
              </Label>
              <Select
                onValueChange={setSelectedMap}
                value={selectedMap}
                aria-label="Select a base map"
              >
                <SelectTrigger
                  id="map-select"
                  className="w-full bg-slate-700 border-slate-600 text-slate-50 focus-visible:ring-offset-slate-900 focus-visible:ring-purple-500"
                >
                  <SelectValue placeholder="Select a map or choose custom" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600 text-slate-50">
                  <SelectItem
                    value="none"
                    className="text-slate-300 hover:bg-slate-600 focus:bg-slate-600"
                  >
                    Custom Dimensions (No Base Map)
                  </SelectItem>
                  {fetchingMaps ? (
                    <SelectItem
                      value="loading"
                      disabled
                      className="text-slate-500"
                    >
                      <span className="flex items-center">
                        <Loader2
                          className="mr-2 h-4 w-4 animate-spin"
                          aria-label="Loading maps"
                        />{" "}
                        Loading maps...
                      </span>
                    </SelectItem>
                  ) : maps.length === 0 ? (
                    <SelectItem
                      value="no-maps"
                      disabled
                      className="text-slate-500"
                    >
                      No maps available
                    </SelectItem>
                  ) : (
                    maps.map((map) => (
                      <SelectItem
                        key={map.id}
                        value={map.id}
                        className="hover:bg-slate-600 focus:bg-slate-600"
                      >
                        {map.name} ({map.width}x{map.height}px)
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {selectedMap === "none" ? (
                <p className="text-sm text-slate-400 mt-1">
                  You've chosen **custom dimensions**. Define them below.
                </p>
              ) : (
                <p className="text-sm text-slate-400 mt-1">
                  Dimensions for your space will be inherited from the selected
                  map.
                </p>
              )}
            </div>

            {/* Dimensions Input */}
            <div className="space-y-2">
              <Label
                htmlFor="dimensions"
                className="text-slate-300 flex items-center gap-2"
              >
                <Ruler className="w-4 h-4 text-orange-400" /> Dimensions
              </Label>
              <Input
                id="dimensions"
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                disabled={selectedMap !== "none"}
                placeholder="WidthxHeight (e.g., 800x600)"
                className={`bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400 focus-visible:ring-offset-slate-900 focus-visible:ring-purple-500
                            ${selectedMap !== "none" ? "bg-slate-800 opacity-70 cursor-not-allowed" : ""}`}
                required={selectedMap === "none"}
              />
              {selectedMap === "none" && (
                <p className="text-sm text-slate-400 mt-1">
                  Enter dimensions in **WidthxHeight** format (e.g., `800x600`).
                </p>
              )}
            </div>
          </form>
        </CardContent>

        <CardFooter className="pt-6 border-t border-slate-700">
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={
              loading ||
              fetchingMaps ||
              !name.trim() ||
              (selectedMap === "none" && !dimensions.match(/^\d+x\d+$/))
            }
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-2.5 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            {loading ? (
              <span
                className="flex items-center justify-center"
                aria-live="polite"
                aria-busy="true"
              >
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Creating
                Space...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <PlusCircle className="mr-2 h-5 w-5" /> Create Space
              </span>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SpaceCreator;
