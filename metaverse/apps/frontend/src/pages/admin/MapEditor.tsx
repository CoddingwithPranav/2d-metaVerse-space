import React, { useState, useRef, useEffect, type FC } from "react";
import { Stage, Layer, Image as KonvaImage, Transformer } from "react-konva";

// Assuming you have these UI components available from your project setup, e.g., Shadcn UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Icons from Lucide React
import {
  Layers,
  Ruler,
  Download,
  Eye,
  Trash2,
  XCircle,
  Square,
  Maximize,
  Minimize,
} from "lucide-react"; // Added Square, Maximize, Minimize for icons

// ---------------------------
// 1. Type Definitions (No change, just here for context)
// ---------------------------
export interface Asset {
  id: string;
  url: string;
  width: number;
  height: number;
}
export interface Background {
  id: string;
  url: string;
}
export interface ElementData {
  id: string;
  assetId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface CanvasJSON {
  background: string;
  width: number;
  height: number;
  elements: ElementData[];
}

// ---------------------------
// 2. Custom Hook: useImage (No change)
// ---------------------------
function useImage(url: string) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    const image = new Image();
    image.src = url;
    image.onload = () => setImg(image);
    image.onerror = () => setImg(null); // Added error handling for images
  }, [url]);
  return img;
}

// ---------------------------
// 3. AssetPalette Component (Styled)
// ---------------------------
const AssetPalette: FC<{ assets: Asset[] }> = ({ assets }) => (
  <div className="w-56 bg-gray-50 border-r border-gray-200 p-4 flex flex-col space-y-4 overflow-y-auto custom-scrollbar shadow-lg">
    <h4 className="text-xl font-semibold text-black flex items-center gap-2 pb-2 border-b border-gray-200">
      <Layers className="h-5 w-5 text-[#9ef01a]" /> Assets
    </h4>
    {assets.length === 0 ? (
      <p className="text-gray-500 text-sm text-center py-4 px-2">
        No assets available. Drag here from another source or add in your asset
        manager!
      </p>
    ) : (
      <div className="grid grid-cols-2 gap-3">
        {assets.map((a) => (
          <div
            key={a.id}
            className="group relative bg-white p-2 rounded-lg border border-gray-200 cursor-grab active:cursor-grabbing
                        transition-all duration-200 hover:scale-105 hover:border-[#9ef01a] hover:shadow-md flex flex-col items-center justify-center"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("assetId", a.id);
              // Create a custom drag image that is smaller and cleaner
              const dragImage = new Image();
              dragImage.src = a.url;
              dragImage.style.width = "50px";
              dragImage.style.height = "50px";
              dragImage.style.objectFit = "contain";
              dragImage.style.borderRadius = "4px";
              dragImage.style.backgroundColor = "var(--gray-100)"; // Use CSS variable for consistency
              document.body.appendChild(dragImage); // Temporarily append to body
              e.dataTransfer.setDragImage(dragImage, 25, 25); // Position it centrally
              setTimeout(() => document.body.removeChild(dragImage), 0); // Remove it after drag starts
            }}
          >
            <img
              src={a.url}
              width={80}
              height={80}
              className="w-full h-20 object-contain rounded-md mb-1 bg-gray-100 transition-transform duration-200 group-hover:scale-105"
              alt={a.id}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src =
                  "https://placehold.co/80x80/f0f0f0/cccccc?text=Error"; // Placeholder on error
              }}
            />
            <p className="text-xs text-gray-500 truncate w-full text-center">
              {a.id.substring(0, 6)}...
            </p>
          </div>
        ))}
      </div>
    )}
  </div>
);

// ---------------------------
// 4. DraggableImage Component (Styled Konva elements)
// ---------------------------
const DraggableImage: FC<{
  element: ElementData;
  imageUrl: string;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newData: Partial<ElementData>) => void;
  onDelete: () => void;
}> = ({ element, imageUrl, isSelected, onSelect, onChange, onDelete }) => {
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const img = useImage(imageUrl);

  // This effect attaches/detaches the transformer when selection changes
  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    } else if (trRef.current) {
      // Detach transformer when not selected to clean up
      trRef.current.nodes([]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]); // Only depend on isSelected to prevent infinite loops

  if (!img) return null; // Don't render if image hasn't loaded
  return (
    <>
      <KonvaImage
        image={img}
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
        draggable
        ref={shapeRef}
        onClick={onSelect}
        onTap={onSelect} // For touch devices
        onDblClick={onDelete} // Double click to delete (existing logic)
        onDragEnd={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
        onTransformEnd={() => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          onChange({
            x: node.x(), // Update position after transform too
            y: node.y(),
            width: Math.max(10, node.width() * scaleX), // Min size 10px
            height: Math.max(10, node.height() * scaleY), // Min size 10px
          });
          // Reset scale and rotation to 1 and 0 for future transformations
          node.scaleX(1);
          node.scaleY(1);
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            // limit resize to 10px minimum
            if (newBox.width < 10 || newBox.height < 10) {
              return oldBox;
            }
            return newBox;
          }}
          rotateEnabled={false} // Disable rotation for simplicity, can be enabled
          resizeEnabled={true}
          anchorFill="#9ef01a" // Tailwind green hex
          anchorStroke="#9ef01a" // Tailwind green hex
          borderStroke="#9ef01a" // Tailwind green hex
          borderDash={[6, 3]} // Dotted border
        />
      )}
    </>
  );
};

// ---------------------------
// 5. PreviewElement Component (No change, just using useImage)
// ---------------------------
const PreviewElement: FC<{ el: ElementData; assetUrl: string }> = ({
  el,
  assetUrl,
}) => {
  const img = useImage(assetUrl);
  if (!img) return null;
  return (
    <KonvaImage
      image={img}
      x={el.x}
      y={el.y}
      width={el.width}
      height={el.height}
    />
  );
};

// ---------------------------
// 6. PreviewCanvas Component (Styled)
// ---------------------------
const PreviewCanvas: FC<{
  data: CanvasJSON;
  assets: Asset[];
  backgrounds: Background[];
  onClose: () => void;
  isFullScreen: boolean;
  toggleFullScreen: () => void;
}> = ({
  data,
  assets,
  backgrounds,
  onClose,
  isFullScreen,
  toggleFullScreen,
}) => {
  const bg = backgrounds.find((b) => b.id === data.background);
  const bgImg = useImage(bg?.url ?? "");

  const previewWidth = isFullScreen
    ? window.innerWidth * 0.9
    : Math.min(data.width, 300);
  const previewHeight = isFullScreen
    ? window.innerHeight * 0.9
    : Math.min(data.height, 200);

  return (
    <div
      className={`flex flex-col space-y-4 p-4 bg-white rounded-lg border border-gray-200 shadow-xl ${isFullScreen ? "fixed inset-0 z-50 m-auto max-w-full max-h-full overflow-auto" : "max-w-sm w-full"}`}
    >
      <div className="flex justify-between items-center pb-2 border-b border-gray-200">
        <h4 className="text-xl font-semibold text-black flex items-center gap-2">
          <Eye className="h-5 w-5 text-[#9ef01a]" /> Map Preview
        </h4>
        <div className="flex gap-2">
          <Button
            onClick={toggleFullScreen}
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-black hover:bg-gray-100"
            title={isFullScreen ? "Exit Full Screen" : "Full Screen Preview"}
          >
            {isFullScreen ? (
              <Minimize className="h-5 w-5" />
            ) : (
              <Maximize className="h-5 w-5" />
            )}
          </Button>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
            title="Close Preview"
          >
            <XCircle className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div
        className="border border-gray-300 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center"
        style={{ width: previewWidth, height: previewHeight }}
      >
        <Stage
          width={data.width}
          height={data.height}
          style={{
            backgroundColor: "#f5f5f5",
            maxWidth: "100%",
            maxHeight: "100%",
          }}
        >
          <Layer>
            {bgImg && (
              <KonvaImage
                image={bgImg}
                x={0}
                y={0}
                width={data.width}
                height={data.height}
              />
            )}
            {data.elements.map((el) => {
              const asset = assets.find((a) => a.id === el.assetId);
              return asset ? (
                <PreviewElement key={el.id} el={el} assetUrl={asset.url} />
              ) : null;
            })}
          </Layer>
        </Stage>
      </div>

      <Label
        htmlFor="json-data"
        className="text-gray-600 text-sm flex items-center gap-2"
      >
        <Download className="h-4 w-4 text-[#9ef01a]" /> Canvas JSON Data
      </Label>
      <textarea
        id="json-data"
        readOnly
        className="w-full h-48 bg-gray-50 border border-gray-300 text-gray-700 rounded-md p-3 font-mono text-xs overflow-auto resize-y focus:outline-none focus:ring-1 focus:ring-[#9ef01a]"
        value={JSON.stringify(data, null, 2)}
      />
    </div>
  );
};

// ---------------------------
// 7. Main CanvasEditor Component (Styled)
// ---------------------------
export const CanvasEditor: FC<{
  assets: Asset[];
  backgrounds: Background[];
  onUpdateCanvas: (data: CanvasJSON) => void;
}> = ({ assets, backgrounds, onUpdateCanvas }) => {
  const [elements, setElements] = useState<ElementData[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [bgId, setBgId] = useState(backgrounds[0]?.id || "");
  const [size, setSize] = useState({ width: 800, height: 600 });
  const [previewData, setPreviewData] = useState<CanvasJSON | null>(null);
  const [showPreview, setShowPreview] = useState(false); // State for preview visibility
  const [isFullScreen, setIsFullScreen] = useState(false); // State for full screen preview
  const stageRef = useRef<any>(null);

  // Set initial background if backgrounds array is loaded
  useEffect(() => {
    if (backgrounds.length > 0 && !bgId) {
      setBgId(backgrounds[0].id);
    }
  }, [backgrounds, bgId]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const assetId = e.dataTransfer.getData("assetId");
    const asset = assets.find((a) => a.id === assetId);
    if (!asset) return;

    const stage = stageRef.current;
    if (!stage) return; // Ensure stage is available

    const rect = stage.container().getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if drop is within the canvas bounds
    if (x >= 0 && y >= 0 && x <= size.width && y <= size.height) {
      // Generate a unique ID for the new element
      const newId = `el_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      setElements((prev) => [
        ...prev,
        { id: newId, assetId, x, y, width: asset.width, height: asset.height },
      ]);
      setSelectedId(newId); // Select the newly added element
    }
  };

  const removeElement = (id: string) => {
    setElements((prev) => prev.filter((e) => e.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const exportForPreview = () => {
    const data: CanvasJSON = {
      background: bgId,
      width: size.width,
      height: size.height,
      elements,
    };
    setPreviewData(data);
    onUpdateCanvas(data); // Pass the updated data to the parent
    setShowPreview(true); // Show the preview when exported
  };

  const bg = backgrounds.find((b) => b.id === bgId);
  const bgImage = useImage(bg?.url ?? "");

  const togglePreview = () => {
    setShowPreview((prev) => !prev);
    if (!showPreview && !previewData) {
      // If toggling on and no data, export it
      exportForPreview();
    }
  };

  const closePreview = () => {
    setShowPreview(false);
    setIsFullScreen(false); // Also exit full screen when closing
  };

  const toggleFullScreen = () => {
    setIsFullScreen((prev) => !prev);
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-250px)] bg-white rounded-lg overflow-hidden shadow-2xl">
      <AssetPalette assets={assets} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Canvas Controls */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-wrap items-center gap-6 shadow-md">
          <div className="flex items-center gap-2">
            <Label
              htmlFor="background-select"
              className="text-gray-700 text-sm flex items-center gap-2 font-medium"
            >
              <Layers className="h-4 w-4 text-[#9ef01a]" /> Background:
            </Label>
            <Select
              value={bgId}
              onValueChange={setBgId}
              disabled={backgrounds.length === 0}
            >
              <SelectTrigger className="w-[180px] bg-white border-gray-200 text-black focus:ring-[#9ef01a] data-[placeholder]:text-gray-400">
                <SelectValue placeholder="Select a background" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200 text-black">
                {backgrounds.length === 0 ? (
                  <SelectItem
                    value="no-background"
                    disabled
                    className="text-gray-500"
                  >
                    No backgrounds available
                  </SelectItem>
                ) : (
                  backgrounds.map((b) => (
                    <SelectItem
                      key={b.id}
                      value={b.id}
                      className="hover:bg-gray-100 focus:bg-gray-100"
                    >
                      {b.id.substring(0, 8)}...
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label
              htmlFor="width-input"
              className="text-gray-700 text-sm flex items-center gap-2 font-medium"
            >
              <Ruler className="h-4 w-4 text-[#9ef01a]" /> Width:
            </Label>
            <Input
              id="width-input"
              type="number"
              value={size.width}
              onChange={(e) =>
                setSize({ ...size, width: Math.max(1, Number(e.target.value)) })
              }
              className="w-24 bg-white border-gray-200 text-black focus:border-[#9ef01a]"
              min={100}
              placeholder="Width"
            />
          </div>

          <div className="flex items-center gap-2">
            <Label
              htmlFor="height-input"
              className="text-gray-700 text-sm flex items-center gap-2 font-medium"
            >
              <Ruler className="h-4 w-4 text-[#9ef01a]" /> Height:
            </Label>
            <Input
              id="height-input"
              type="number"
              value={size.height}
              onChange={(e) =>
                setSize({
                  ...size,
                  height: Math.max(1, Number(e.target.value)),
                })
              }
              className="w-24 bg-white border-gray-200 text-black focus:border-[#9ef01a]"
              min={100}
              placeholder="Height"
            />
          </div>

          <div className="flex items-center gap-2">
            <Label
              htmlFor="num-elements"
              className="text-gray-700 text-sm flex items-center gap-2 font-medium"
            >
              <Square className="h-4 w-4 text-[#9ef01a]" /> Elements:
            </Label>
            <span id="num-elements" className="text-black font-bold">
              {elements.length}
            </span>
          </div>

          <Button
            onClick={exportForPreview}
            className="px-5 py-2 bg-gradient-to-r from-[#9ef01a] to-[#8dd919] hover:from-[#8dd919] hover:to-[#7bc618] text-black font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
            title="Export current canvas data and show preview"
          >
            <Download className="h-4 w-4 mr-2" /> Export & Preview
          </Button>

          <Button
            onClick={togglePreview}
            className="px-5 py-2 bg-gradient-to-r from-[#9ef01a] to-blue-500 hover:from-[#8dd919] hover:to-blue-600 text-black font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
            title={showPreview ? "Hide Preview Panel" : "Show Preview Panel"}
          >
            {showPreview ? (
              <>
                <Eye className="h-4 w-4 mr-2" /> Hide Preview
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" /> Show Preview
              </>
            )}
          </Button>

          <Button
            onClick={() => selectedId && removeElement(selectedId)}
            disabled={!selectedId}
            variant="destructive"
            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
            title="Delete selected element (double click on element to delete)"
          >
            <Trash2 className="h-4 w-4 mr-2" /> Delete Selected
          </Button>
        </div>

        {/* Canvas Area */}
        <div
          className="flex-1 p-6 flex justify-center items-center bg-gray-100 overflow-auto relative"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={(e) => {
            // Deselect by clicking empty space within the stage container
            if (stageRef.current && e.target === stageRef.current.container()) {
              setSelectedId(null);
            }
          }}
        >
          {elements.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-lg pointer-events-none">
              Drag assets from the left palette onto the canvas to start
              designing!
            </div>
          )}
          <Stage
            width={size.width}
            height={size.height}
            ref={stageRef}
            className="border border-gray-300 rounded-lg shadow-xl bg-white"
            style={{ minWidth: size.width, minHeight: size.height }}
          >
            <Layer>
              {bgImage && (
                <KonvaImage
                  image={bgImage}
                  x={0}
                  y={0}
                  width={size.width}
                  height={size.height}
                />
              )}
              {elements.map((el) => (
                <DraggableImage
                  key={el.id}
                  element={el}
                  imageUrl={assets.find((a) => a.id === el.assetId)!.url}
                  isSelected={selectedId === el.id}
                  onSelect={() => setSelectedId(el.id)}
                  onChange={(upd) =>
                    setElements((prev) =>
                      prev.map((e) => (e.id === el.id ? { ...e, ...upd } : e)),
                    )
                  }
                  onDelete={() => removeElement(el.id)}
                />
              ))}
            </Layer>
          </Stage>
        </div>
      </div>

      {/* Preview Section - Conditional rendering and responsive styling */}
      {showPreview && previewData && (
        <div
          className={`w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-gray-200 p-4 flex flex-col space-y-4 overflow-y-auto custom-scrollbar shadow-lg ${isFullScreen ? "fixed inset-0 z-50" : ""}`}
        >
          <PreviewCanvas
            data={previewData}
            assets={assets}
            backgrounds={backgrounds}
            onClose={closePreview}
            isFullScreen={isFullScreen}
            toggleFullScreen={toggleFullScreen}
          />
        </div>
      )}
    </div>
  );
};
