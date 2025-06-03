import React, { useState, useRef, useEffect, type FC } from 'react';
import { Stage, Layer, Image as KonvaImage, Transformer } from 'react-konva';

// ---------------------------
// 1. Type Definitions
// ---------------------------
export interface Asset { id: string; url: string; width: number; height: number; }
export interface Background { id: string; url: string; }
export interface ElementData { id: string; assetId: string; x: number; y: number; width: number; height: number; }
export interface CanvasJSON { background: string; width: number; height: number; elements: ElementData[]; }

// ---------------------------
// 2. Custom Hook: useImage
// ---------------------------
function useImage(url: string) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    const image = new Image();
    image.src = url;
    image.onload = () => setImg(image);
  }, [url]);
  return img;
}

// ---------------------------
// 3. AssetPalette Component
// ---------------------------
const AssetPalette: FC<{ assets: Asset[] }> = ({ assets }) => (
  <div style={{ width: 120, padding: 8, borderRight: '1px solid #ccc' }}>
    <h4>Assets</h4>
    {assets.map(a => (
      <img
        key={a.id}
        src={a.url}
        width={60}
        draggable
        style={{ margin: 4, cursor: 'grab' }}
        onDragStart={e => e.dataTransfer.setData('assetId', a.id)}
        alt={a.id}
      />
    ))}
  </div>
);

// ---------------------------
// 4. DraggableImage Component
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

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, img]);

  if (!img) return null;
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
        onDblClick={onDelete}
        onDragEnd={e => onChange({ x: e.target.x(), y: e.target.y() })}
        onTransformEnd={() => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          onChange({
            width: Math.max(10, node.width() * scaleX),
            height: Math.max(10, node.height() * scaleY),
          });
          node.scaleX(1);
          node.scaleY(1);
        }}
      />
      {isSelected && <Transformer ref={trRef} />}
    </>
  );
};

// ---------------------------
// 5. PreviewElement Component
// ---------------------------
const PreviewElement: FC<{ el: ElementData; assetUrl: string }> = ({ el, assetUrl }) => {
  const img = useImage(assetUrl);
  if (!img) return null;
  return (
    <KonvaImage image={img} x={el.x} y={el.y} width={el.width} height={el.height} />
  );
};

// ---------------------------
// 6. PreviewCanvas Component
// ---------------------------
const PreviewCanvas: FC<{
  data: CanvasJSON;
  assets: Asset[];
  backgrounds: Background[];
}> = ({ data, assets, backgrounds }) => {
  const bg = backgrounds.find(b => b.id === data.background);
  const bgImg = useImage(bg?.url ?? '');

  return (
    <div style={{ marginLeft: 16 }}>
      <h4>Preview</h4>
      <Stage width={data.width} height={data.height} style={{ border: '1px solid #ccc' }}>
        <Layer>
          {bgImg && <KonvaImage image={bgImg} x={0} y={0} width={data.width} height={data.height} />}
          {data.elements.map(el => {
            const asset = assets.find(a => a.id === el.assetId);
            return asset ? <PreviewElement key={el.id} el={el} assetUrl={asset.url} /> : null;
          })}
        </Layer>
      </Stage>
      <textarea readOnly style={{ width: '100%', height: 150, marginTop: 8 }} value={JSON.stringify(data, null, 2)} />
    </div>
  );
};

// ---------------------------
// 7. Main CanvasEditor Component
// ---------------------------
export const CanvasEditor: FC<{ assets: Asset[]; backgrounds: Background[]; onUpdateCanvas: (data: CanvasJSON) => void }> = ({ assets, backgrounds, onUpdateCanvas }) => {
  const [elements, setElements] = useState<ElementData[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [bgId, setBgId] = useState(backgrounds[0]?.id || '');
  const [size, setSize] = useState({ width: 800, height: 600 });
  const [previewData, setPreviewData] = useState<CanvasJSON | null>(null);
  const stageRef = useRef<any>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const assetId = e.dataTransfer.getData('assetId');
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return;
    // compute drop position relative to the canvas
    const stage = stageRef.current;
    const rect = stage.container().getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // only drop if within bounds
    if (x >= 0 && y >= 0 && x <= size.width && y <= size.height) {
      setElements(prev => [...prev, { id: `el${prev.length + 1}`, assetId, x, y, width: asset.width, height: asset.height }]);
    }
  };

  const removeElement = (id: string) => {
    setElements(prev => prev.filter(e => e.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const exportForPreview = () => {
    const data: CanvasJSON = { background: bgId, width: size.width, height: size.height, elements };

    setPreviewData(data);
    onUpdateCanvas(data);
  };

  const bg = backgrounds.find(b => b.id === bgId);
  const bgImage = useImage(bg?.url ?? '');

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <AssetPalette assets={assets} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: 8, borderBottom: '1px solid #ccc', display: 'flex', gap: 16 }}>
          <label>Background:<select value={bgId} onChange={e => setBgId(e.target.value)} style={{ marginLeft: 4 }}>{backgrounds.map(b => <option key={b.id} value={b.id}>{b.id}</option>)}</select></label>
          <label>W:<input type="number" value={size.width} onChange={e => setSize({ ...size, width: +e.target.value })} style={{ width: 60, marginLeft: 4 }}/></label>
          <label>H:<input type="number" value={size.height} onChange={e => setSize({ ...size, height: +e.target.value })} style={{ width: 60, marginLeft: 4 }}/></label>
          <button onClick={exportForPreview}>Export & Preview</button>
        </div>
        <div style={{ flex: 1, display: 'flex' }} onDragOver={e => e.preventDefault()} onDrop={handleDrop}>
          <Stage width={size.width} height={size.height} ref={stageRef} style={{ border: '1px solid #888' }}>
            <Layer>
              {bgImage && <KonvaImage image={bgImage} x={0} y={0} width={size.width} height={size.height} />}
              {elements.map(el => (
                <DraggableImage
                  key={el.id}
                  element={el}
                  imageUrl={assets.find(a => a.id === el.assetId)!.url}
                  isSelected={selectedId === el.id}
                  onSelect={() => setSelectedId(el.id)}
                  onChange={upd => setElements(prev => prev.map(e => e.id === el.id ? { ...e, ...upd } : e))}
                  onDelete={() => removeElement(el.id)}
                />
              ))}
            </Layer>
          </Stage>
         <div>
         {previewData && <PreviewCanvas data={previewData} assets={assets} backgrounds={backgrounds} />}
         </div>
        </div>
      </div>
    </div>
  );
};

