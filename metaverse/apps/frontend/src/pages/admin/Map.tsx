import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card"; // Added CardDescription
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Added Input component
import { Label } from "@/components/ui/label";
import UploadExample from "@/components/ui/imageupload"; // Assuming this is your beautifully styled uploader
import { elementService } from "@/service/elementService";
import { backgroundService } from "@/service/backgroundService";
import { mapService, type MapItem } from "@/service/mapservice";
import {
  CanvasEditor,
  type Asset,
  type Background,
  type CanvasJSON,
} from "./MapEditor"; // Ensure CanvasEditor is styled below
import {
  PlusCircle,
  Map,
  Loader2,
  ArrowLeft,
  ImageUp,
  Save,
  LayoutGrid,
} from "lucide-react"; // Added Lucide Icons
import { AnimatedPageWrapper } from "@/components/ui/AnimatedPageWrapper";

const MapDashboard: React.FC = () => {
  const [maps, setMaps] = useState<MapItem[]>([]);
  const [editing, setEditing] = useState(false);
  const [mapName, setMapName] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [backgrounds, setBackgrounds] = useState<Background[]>([]);
  const [canvasData, setCanvasData] = useState<CanvasJSON | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true); // For initial data fetch
  const [isSavingMap, setIsSavingMap] = useState(false); // For map save action
  const [isThumbnailUploadComplete, setIsThumbnailUploadComplete] =
    useState(false); // For thumbnail upload state

  // fetch elements and backgrounds
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        const [elementsResponse, backgroundsResponse, mapsResponse] =
          await Promise.all([
            elementService.list(),
            backgroundService.list(),
            mapService.list(),
          ]);

        const items: Asset[] = elementsResponse.map((e: any) => ({
          id: e.id,
          url: e.imageUrl,
          width: e.width,
          height: e.height,
        }));
        setAssets(items);

        const bgs: Background[] = backgroundsResponse.map((b: any) => ({
          id: b.id,
          url: b.Url,
        }));
        setBackgrounds(bgs);

        setMaps(mapsResponse);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // TODO: Display a user-friendly error message
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, []);

  // callback from CanvasEditor
  const handleCanvasUpdate = (data: CanvasJSON) => setCanvasData(data);

  // save map using backend schema
  const saveMap = async () => {
    if (!mapName.trim()) {
      alert("Please enter a map name.");
      return;
    }
    if (!thumbnailUrl || !isThumbnailUploadComplete) {
      alert("Please upload a map thumbnail and wait for it to complete.");
      return;
    }
    if (!canvasData) {
      alert("Map canvas is empty. Please design your map first.");
      return;
    }

    setIsSavingMap(true);
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
      console.log("Map created with id:", res.id);
      setEditing(false);
      setMapName(""); // Reset form fields
      setThumbnailUrl("");
      setCanvasData(null);
      setIsThumbnailUploadComplete(false);
      // reload maps
      const all = await mapService.list();
      setMaps(all);
    } catch (err) {
      console.error(err);
      alert("Failed to save map. " + (err instanceof Error ? err.message : ""));
    } finally {
      setIsSavingMap(false);
    }
  };

  return (
    <AnimatedPageWrapper id="map-dashboard" className="bg-slate-950">
      <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
        Game Maps Management
      </h2>

      {!editing ? (
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="text-3xl font-semibold text-slate-100">
              Existing Maps
            </h3>
            <Button
              onClick={() => setEditing(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <PlusCircle className="h-5 w-5 mr-2" /> Create New Map
            </Button>
          </div>

          {isLoadingData ? (
            <div className="text-slate-400 text-center text-lg py-10 flex items-center justify-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading maps and assets...</span>
            </div>
          ) : maps.length === 0 ? (
            <div className="text-slate-400 text-center text-lg py-10">
              No maps found. Click "Create New Map" to get started!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {maps.map((m) => (
                <Card
                  key={m.id}
                  className="bg-slate-800 border border-slate-700 text-slate-100 rounded-xl shadow-xl overflow-hidden
                             transition-all duration-300 hover:shadow-purple-500/30 transform hover:scale-105 group"
                >
                  <CardHeader className="p-4 border-b border-slate-700">
                    <CardTitle className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                      <LayoutGrid className="inline-block h-5 w-5 mr-2 text-purple-300" />{" "}
                      {m.name}
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      ID: {m.id.substring(0, 8)}...
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="w-full h-40 bg-slate-700 rounded-md overflow-hidden flex items-center justify-center border border-slate-600">
                      {m.thumbnail ? (
                        <img
                          src={m.thumbnail}
                          alt={m.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src =
                              "https://placehold.co/600x400/334155/e2e8f0?text=Image+Error";
                          }}
                        />
                      ) : (
                        <Map className="text-slate-500 opacity-50 h-16 w-16" />
                      )}
                    </div>
                    <p className="mt-4 text-slate-300 text-sm">
                      Dimensions:{" "}
                      <span className="font-medium">
                        {m.height} x {m.width}
                      </span>
                    </p>
                    {/* Add Edit/Delete buttons here if desired */}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        <Card className="max-w-4xl mx-auto bg-slate-800/70 p-6 sm:p-8 rounded-xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-12 duration-500">
          <CardHeader className="pb-6 text-center">
            <CardTitle className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
              Design New Game Map
            </CardTitle>
            <CardDescription className="text-slate-400 text-base">
              Set up your map properties and drag-and-drop elements onto the
              canvas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 mb-8">
              <div className="space-y-2">
                <Label
                  htmlFor="mapName"
                  className="block text-slate-300 text-base font-medium flex items-center gap-2"
                >
                  <Map className="h-5 w-5 text-purple-400" /> Map Name
                </Label>
                <Input
                  id="mapName"
                  type="text"
                  value={mapName}
                  onChange={(e) => setMapName(e.target.value)}
                  placeholder="e.g., Forest Adventure Level 1"
                  className="bg-slate-700 border-slate-600 text-slate-100 focus:border-purple-500 placeholder:text-slate-500"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="thumbnail"
                  className="block text-slate-300 text-base font-medium mb-1 flex items-center gap-2"
                >
                  <ImageUp className="h-5 w-5 text-cyan-400" /> Map Thumbnail
                  Image
                </Label>
                <UploadExample
                  onUpload={(url) => setThumbnailUrl(url)}
                  setIsUploadCompleted={setIsThumbnailUploadComplete} // Pass setter to control parent button
                />
                {thumbnailUrl && (
                  <p className="mt-2 text-sm text-slate-400 break-all">
                    Uploaded URL:{" "}
                    <span className="font-medium">{thumbnailUrl}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Canvas Editor */}
            <div className="border border-slate-700 rounded-lg overflow-hidden shadow-xl bg-slate-900">
              <CanvasEditor
                assets={assets}
                backgrounds={backgrounds}
                onUpdateCanvas={handleCanvasUpdate}
              />
            </div>

            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mt-8">
              <Button
                onClick={saveMap}
                disabled={
                  isSavingMap ||
                  !mapName.trim() ||
                  !thumbnailUrl ||
                  !isThumbnailUploadComplete ||
                  !canvasData
                }
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                {isSavingMap ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-5 w-5" />
                )}
                {isSavingMap ? "Saving Map..." : "Save Map"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditing(false)}
                className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-red-500 text-red-400 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <ArrowLeft className="mr-2 h-5 w-5" /> Back to Maps List
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </AnimatedPageWrapper>
  );
};

export default MapDashboard;
