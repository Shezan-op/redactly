import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useEditor } from '../context/EditorContext';
import { applyImageAdjustments, renderRedactionLayer } from '../engine/pixelProcessing';
import type { Point, RedactionLayer } from '../engine/types';
import { renderLogoWatermark, renderTextWatermark } from '../engine/watermarkRenderer';

type ResizeHandleType = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

interface DragState {
  type: 'draw' | 'move' | 'resize' | 'pan' | 'split' | 'crop';
  startX: number;
  startY: number;
  origLayerX?: number;
  origLayerY?: number;
  origLayerW?: number;
  origLayerH?: number;
  handle?: ResizeHandleType;
  points?: Point[];
}

export const CanvasWorkspace: React.FC = () => {
  const {
    originalImage,
    activeTool,
    setActiveTool,
    redactionStyle,
    redactionShape,
    brushRadius,
    blurStrength,
    pixelSize,
    solidColor,
    solidOpacity,
    redactions,
    selectedLayerId,
    setSelectedLayerId,
    addRedaction,
    updateRedaction,
    deleteRedaction,
    watermark,
    logo,
    logoImgElement,
    adjustments,
    crop,
    updateCrop,
    zoom,
    setZoom,
    pan,
    setPan,
    showBeforeAfter,
    beforeAfterSplit,
    setBeforeAfterSplit,
  } = useEditor();

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Dragging & Interaction State
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [tempShape, setTempShape] = useState<Partial<RedactionLayer> | null>(null);
  const [cursorStyle, setCursorStyle] = useState<string>('default');
  const [isSpacePressed, setIsSpacePressed] = useState<boolean>(false);
  const [touchDistance, setTouchDistance] = useState<number | null>(null);

  // Convert client viewport coordinates to native image pixel coordinates
  const clientToImageCoords = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } | null => {
      if (!canvasRef.current || !originalImage) return null;
      const rect = canvasRef.current.getBoundingClientRect();
      const scaleX = originalImage.naturalWidth / rect.width;
      const scaleY = originalImage.naturalHeight / rect.height;

      const imgX = (clientX - rect.left) * scaleX;
      const imgY = (clientY - rect.top) * scaleY;
      return { x: imgX, y: imgY };
    },
    [originalImage]
  );

  // Main Canvas Render Loop
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !originalImage) return;

    const imgW = originalImage.naturalWidth;
    const imgH = originalImage.naturalHeight;

    canvas.width = imgW;
    canvas.height = imgH;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // 1. Draw base image
    ctx.drawImage(originalImage, 0, 0, imgW, imgH);

    // 2. Apply Adjustments
    applyImageAdjustments(ctx, imgW, imgH, adjustments);

    // 3. Render Permanent Redactions
    redactions.forEach((layer) => {
      renderRedactionLayer(ctx, layer);
    });

    // 4. Render Temp Shape currently being drawn
    if (tempShape && tempShape.visible !== false) {
      renderRedactionLayer(ctx, {
        id: 'temp-layer',
        name: 'Drawing',
        type: tempShape.type || redactionShape,
        style: tempShape.style || redactionStyle,
        x: tempShape.x || 0,
        y: tempShape.y || 0,
        width: tempShape.width || 0,
        height: tempShape.height || 0,
        points: tempShape.points,
        brushRadius: tempShape.brushRadius || brushRadius,
        color: tempShape.color || solidColor,
        opacity: tempShape.opacity ?? solidOpacity,
        blurStrength: tempShape.blurStrength || blurStrength,
        pixelSize: tempShape.pixelSize || pixelSize,
        borderRadius: 0,
        visible: true,
      });
    }

    // 5. Render Watermark Text
    if (watermark.enabled) {
      renderTextWatermark(ctx, imgW, imgH, watermark);
    }

    // 6. Render Logo Watermark
    if (logo.enabled && logoImgElement) {
      renderLogoWatermark(ctx, imgW, imgH, logoImgElement, logo);
    }

    // 7. If Before/After Comparison is active:
    if (showBeforeAfter) {
      const splitX = imgW * beforeAfterSplit;

      // Draw original image on the left half
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, splitX, imgH);
      ctx.clip();
      ctx.drawImage(originalImage, 0, 0, imgW, imgH);
      ctx.restore();

      // Draw divider line
      ctx.save();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(splitX, 0);
      ctx.lineTo(splitX, imgH);
      ctx.stroke();

      // Divider Handle Square (Sharp Architectural Style)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(splitX - 12, imgH / 2 - 12, 24, 24);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#090a0c';
      ctx.strokeRect(splitX - 12, imgH / 2 - 12, 24, 24);
      ctx.restore();
    }

    // 8. Crop Boundary Overlay
    if (activeTool === 'crop' || crop.active) {
      const cx = crop.x;
      const cy = crop.y;
      const cw = crop.width || imgW;
      const ch = crop.height || imgH;

      ctx.save();
      // Dim outside
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, imgW, cy);
      ctx.fillRect(0, cy + ch, imgW, imgH - (cy + ch));
      ctx.fillRect(0, cy, cx, ch);
      ctx.fillRect(cx + cw, cy, imgW - (cx + cw), ch);

      // Crop outline
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(cx, cy, cw, ch);

      // Rule of thirds grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx + cw / 3, cy);
      ctx.lineTo(cx + cw / 3, cy + ch);
      ctx.moveTo(cx + (cw * 2) / 3, cy);
      ctx.lineTo(cx + (cw * 2) / 3, cy + ch);
      ctx.moveTo(cx, cy + ch / 3);
      ctx.lineTo(cx + cw, cy + ch / 3);
      ctx.moveTo(cx, cy + (ch * 2) / 3);
      ctx.lineTo(cx + cw, cy + (ch * 2) / 3);
      ctx.stroke();
      ctx.restore();
    }
  }, [
    originalImage,
    adjustments,
    redactions,
    tempShape,
    redactionShape,
    redactionStyle,
    brushRadius,
    solidColor,
    solidOpacity,
    blurStrength,
    pixelSize,
    watermark,
    logo,
    logoImgElement,
    showBeforeAfter,
    beforeAfterSplit,
    activeTool,
    crop,
  ]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Handle Spacebar Pan toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Wheel Zoom Listener
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey || !isSpacePressed) {
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      setZoom((prev) => {
        const next = Math.max(0.15, Math.min(5, +(prev * zoomFactor).toFixed(2)));
        return next;
      });
    } else {
      setPan((prev) => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }));
    }
  };

  const getSelectedLayer = () => redactions.find((l) => l.id === selectedLayerId);

  // Common Pointer/Touch Down logic
  const handleStart = (clientX: number, clientY: number, isMiddleButton = false) => {
    if (!originalImage) return;

    if (isSpacePressed || isMiddleButton) {
      setDragState({
        type: 'pan',
        startX: clientX - pan.x,
        startY: clientY - pan.y,
      });
      return;
    }

    if (showBeforeAfter && canvasRef.current) {
      const coords = clientToImageCoords(clientX, clientY);
      if (coords) {
        const splitX = originalImage.naturalWidth * beforeAfterSplit;
        if (Math.abs(coords.x - splitX) < 25) {
          setDragState({
            type: 'split',
            startX: clientX,
            startY: clientY,
          });
          return;
        }
      }
    }

    const coords = clientToImageCoords(clientX, clientY);
    if (!coords) return;

    if (activeTool === 'select') {
      const selected = getSelectedLayer();
      if (selected) {
        const handle = getHandleUnderCursor(coords.x, coords.y, selected);
        if (handle) {
          setDragState({
            type: 'resize',
            startX: coords.x,
            startY: coords.y,
            origLayerX: selected.x,
            origLayerY: selected.y,
            origLayerW: selected.width,
            origLayerH: selected.height,
            handle,
          });
          return;
        }

        if (
          coords.x >= selected.x &&
          coords.x <= selected.x + selected.width &&
          coords.y >= selected.y &&
          coords.y <= selected.y + selected.height
        ) {
          setDragState({
            type: 'move',
            startX: coords.x,
            startY: coords.y,
            origLayerX: selected.x,
            origLayerY: selected.y,
          });
          return;
        }
      }

      const hitLayer = [...redactions].reverse().find((l) => {
        if (!l.visible) return false;
        return (
          coords.x >= l.x &&
          coords.x <= l.x + l.width &&
          coords.y >= l.y &&
          coords.y <= l.y + l.height
        );
      });

      if (hitLayer) {
        setSelectedLayerId(hitLayer.id);
        setDragState({
          type: 'move',
          startX: coords.x,
          startY: coords.y,
          origLayerX: hitLayer.x,
          origLayerY: hitLayer.y,
        });
        return;
      } else {
        setSelectedLayerId(null);
      }
      return;
    }

    if (activeTool === 'crop') {
      setDragState({
        type: 'crop',
        startX: coords.x,
        startY: coords.y,
      });
      return;
    }

    if (
      activeTool === 'rectangle' ||
      activeTool === 'square' ||
      activeTool === 'circle' ||
      activeTool === 'ellipse' ||
      activeTool === 'face_hide'
    ) {
      const shape = activeTool === 'face_hide' ? 'ellipse' : redactionShape;
      setDragState({
        type: 'draw',
        startX: coords.x,
        startY: coords.y,
      });
      setTempShape({
        type: shape,
        style: redactionStyle,
        x: coords.x,
        y: coords.y,
        width: 1,
        height: 1,
        color: solidColor,
        opacity: solidOpacity,
        blurStrength,
        pixelSize,
        borderRadius: 0,
        visible: true,
      });
    } else if (activeTool === 'brush') {
      setDragState({
        type: 'draw',
        startX: coords.x,
        startY: coords.y,
        points: [{ x: coords.x, y: coords.y }],
      });
      setTempShape({
        type: 'brush',
        style: redactionStyle,
        points: [{ x: coords.x, y: coords.y }],
        brushRadius,
        color: solidColor,
        opacity: solidOpacity,
        blurStrength,
        pixelSize,
        visible: true,
      });
    }
  };

  // Common Pointer/Touch Move logic
  const handleMove = (clientX: number, clientY: number) => {
    if (!originalImage) return;

    if (dragState?.type === 'pan') {
      setPan({
        x: clientX - dragState.startX,
        y: clientY - dragState.startY,
      });
      return;
    }

    if (dragState?.type === 'split' && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const fraction = Math.max(0.05, Math.min(0.95, (clientX - rect.left) / rect.width));
      setBeforeAfterSplit(fraction);
      return;
    }

    const coords = clientToImageCoords(clientX, clientY);
    if (!coords) return;

    if (dragState?.type === 'draw') {
      if (activeTool === 'brush') {
        const nextPoints = [...(dragState.points || []), coords];
        setDragState((prev) => (prev ? { ...prev, points: nextPoints } : null));
        setTempShape((prev) => (prev ? { ...prev, points: nextPoints } : null));
      } else {
        const dx = coords.x - dragState.startX;
        const dy = coords.y - dragState.startY;

        const x = dx < 0 ? coords.x : dragState.startX;
        const y = dy < 0 ? coords.y : dragState.startY;
        let width = Math.abs(dx);
        let height = Math.abs(dy);

        if (redactionShape === 'square' || redactionShape === 'circle') {
          const side = Math.max(width, height);
          width = side;
          height = side;
        }

        setTempShape((prev) => (prev ? { ...prev, x, y, width, height } : null));
      }
      return;
    }

    if (dragState?.type === 'move' && selectedLayerId) {
      const dx = coords.x - dragState.startX;
      const dy = coords.y - dragState.startY;
      const newX = (dragState.origLayerX || 0) + dx;
      const newY = (dragState.origLayerY || 0) + dy;
      updateRedaction(selectedLayerId, { x: Math.round(newX), y: Math.round(newY) });
      return;
    }

    if (dragState?.type === 'resize' && selectedLayerId && dragState.handle) {
      const dx = coords.x - dragState.startX;
      const dy = coords.y - dragState.startY;
      const { origLayerX = 0, origLayerY = 0, origLayerW = 10, origLayerH = 10, handle } = dragState;

      let newX = origLayerX;
      let newY = origLayerY;
      let newW = origLayerW;
      let newH = origLayerH;

      if (handle.includes('e')) newW = Math.max(10, origLayerW + dx);
      if (handle.includes('s')) newH = Math.max(10, origLayerH + dy);
      if (handle.includes('w')) {
        newW = Math.max(10, origLayerW - dx);
        newX = origLayerX + (origLayerW - newW);
      }
      if (handle.includes('n')) {
        newH = Math.max(10, origLayerH - dy);
        newY = origLayerY + (origLayerH - newH);
      }

      updateRedaction(selectedLayerId, {
        x: Math.round(newX),
        y: Math.round(newY),
        width: Math.round(newW),
        height: Math.round(newH),
      });
      return;
    }

    if (dragState?.type === 'crop') {
      const dx = coords.x - dragState.startX;
      const dy = coords.y - dragState.startY;
      const x = dx < 0 ? coords.x : dragState.startX;
      const y = dy < 0 ? coords.y : dragState.startY;
      const width = Math.abs(dx);
      const height = Math.abs(dy);
      updateCrop({ x, y, width, height });
      return;
    }

    if (isSpacePressed) {
      setCursorStyle('grab');
    } else if (activeTool === 'select') {
      const selected = getSelectedLayer();
      if (selected) {
        const handle = getHandleUnderCursor(coords.x, coords.y, selected);
        if (handle) {
          setCursorStyle(`${handle}-resize`);
          return;
        }
        if (
          coords.x >= selected.x &&
          coords.x <= selected.x + selected.width &&
          coords.y >= selected.y &&
          coords.y <= selected.y + selected.height
        ) {
          setCursorStyle('move');
          return;
        }
      }
      setCursorStyle('default');
    } else if (activeTool === 'brush') {
      setCursorStyle('crosshair');
    } else {
      setCursorStyle('crosshair');
    }
  };

  // End drag/touch
  const handleEnd = () => {
    if (dragState?.type === 'draw') {
      if (activeTool === 'brush' && tempShape?.points && tempShape.points.length > 1) {
        addRedaction({
          name: `Brush ${redactions.length + 1}`,
          type: 'brush',
          style: redactionStyle,
          x: 0,
          y: 0,
          width: originalImage?.naturalWidth || 100,
          height: originalImage?.naturalHeight || 100,
          points: tempShape.points,
          brushRadius,
          color: solidColor,
          opacity: solidOpacity,
          blurStrength,
          pixelSize,
          visible: true,
        });
      } else if (tempShape && (tempShape.width || 0) > 4 && (tempShape.height || 0) > 4) {
        const shape = activeTool === 'face_hide' ? 'ellipse' : redactionShape;
        addRedaction({
          name: `${shape.charAt(0).toUpperCase() + shape.slice(1)} ${redactions.length + 1}`,
          type: shape,
          style: redactionStyle,
          x: Math.round(tempShape.x || 0),
          y: Math.round(tempShape.y || 0),
          width: Math.round(tempShape.width || 10),
          height: Math.round(tempShape.height || 10),
          color: solidColor,
          opacity: solidOpacity,
          blurStrength,
          pixelSize,
          borderRadius: 0,
          visible: true,
        });
      }
      setTempShape(null);
      setActiveTool('select');
    }

    setDragState(null);
    setTouchDistance(null);
  };

  // Touch Event Listeners for Mobile Android & iOS
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch to Zoom
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setTouchDistance(dist);
    } else if (e.touches.length === 1) {
      handleStart(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchDistance !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / touchDistance;
      setZoom((prev) => Math.max(0.2, Math.min(4, +(prev * (factor > 1 ? 1.03 : 0.97)).toFixed(2))));
      setTouchDistance(dist);
    } else if (e.touches.length === 1) {
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const getHandleUnderCursor = (x: number, y: number, layer: RedactionLayer): ResizeHandleType | null => {
    const handleSize = 14 / zoom;
    const { x: lx, y: ly, width: lw, height: lh } = layer;

    const handles: { type: ResizeHandleType; hx: number; hy: number }[] = [
      { type: 'nw', hx: lx, hy: ly },
      { type: 'n', hx: lx + lw / 2, hy: ly },
      { type: 'ne', hx: lx + lw, hy: ly },
      { type: 'e', hx: lx + lw, hy: ly + lh / 2 },
      { type: 'se', hx: lx + lw, hy: ly + lh },
      { type: 's', hx: lx + lw / 2, hy: ly + lh },
      { type: 'sw', hx: lx, hy: ly + lh },
      { type: 'w', hx: lx, hy: ly + lh / 2 },
    ];

    for (const h of handles) {
      if (Math.abs(x - h.hx) <= handleSize && Math.abs(y - h.hy) <= handleSize) {
        return h.type;
      }
    }
    return null;
  };

  const selectedLayer = getSelectedLayer();

  return (
    <main
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={(e) => handleStart(e.clientX, e.clientY, e.button === 1)}
      onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleEnd}
      style={{ cursor: cursorStyle }}
      className="flex-1 w-full h-full relative bg-[#090a0c] overflow-hidden flex items-center justify-center canvas-checkerboard select-none touch-none"
    >
      {/* Before / After View Tag Indicator */}
      {showBeforeAfter && (
        <div className="absolute top-3 left-4 z-20 flex items-center space-x-2.5 bg-[#121316] px-3 py-1 border border-[#282a33] text-xs font-semibold shadow-lg">
          <span className="text-zinc-400 font-mono text-[10px] sm:text-[11px]">ORIGINAL</span>
          <span className="text-zinc-600">/</span>
          <span className="text-white font-mono text-[10px] sm:text-[11px]">PROTECTED</span>
        </div>
      )}

      {/* Floating Canvas Transform Wrapper */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          transition: dragState ? 'none' : 'transform 0.08s ease-out',
        }}
        className="relative shadow-2xl rounded-none ring-1 ring-zinc-800"
      >
        <canvas
          ref={canvasRef}
          className="block max-w-none"
          style={{ imageRendering: zoom > 2 ? 'pixelated' : 'auto' }}
        />

        {/* Selected Layer Interactive Transform Handles Overlay */}
        {selectedLayer && selectedLayer.visible && activeTool === 'select' && (
          <div
            style={{
              position: 'absolute',
              left: `${selectedLayer.x}px`,
              top: `${selectedLayer.y}px`,
              width: `${selectedLayer.width}px`,
              height: `${selectedLayer.height}px`,
              pointerEvents: 'none',
            }}
            className="ring-2 ring-white ring-offset-1 ring-offset-black/70"
          >
            {/* 8 Resize Corner Dots (Sharp Squares) */}
            {(['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'] as ResizeHandleType[]).map((handle) => {
              let posClass = '';
              switch (handle) {
                case 'nw': posClass = '-top-1.5 -left-1.5'; break;
                case 'n': posClass = '-top-1.5 left-1/2 -translate-x-1/2'; break;
                case 'ne': posClass = '-top-1.5 -right-1.5'; break;
                case 'e': posClass = 'top-1/2 -right-1.5 -translate-y-1/2'; break;
                case 'se': posClass = '-bottom-1.5 -right-1.5'; break;
                case 's': posClass = '-bottom-1.5 left-1/2 -translate-x-1/2'; break;
                case 'sw': posClass = '-bottom-1.5 -left-1.5'; break;
                case 'w': posClass = 'top-1/2 -left-1.5 -translate-y-1/2'; break;
              }

              return (
                <div
                  key={handle}
                  className={`absolute w-3.5 h-3.5 bg-white border border-zinc-950 rounded-none shadow-sm pointer-events-auto ${posClass}`}
                  style={{ cursor: `${handle}-resize` }}
                />
              );
            })}

            {/* Quick Delete & Layer Tag Badge */}
            <div
              style={{ pointerEvents: 'auto' }}
              className="absolute -top-8 left-0 flex items-center space-x-2 bg-[#121317] px-2 py-0.5 rounded-none border border-[#2b2d38]"
            >
              <span className="text-[11px] font-bold font-syne text-zinc-200 capitalize truncate max-w-[120px]">
                {selectedLayer.name} ({selectedLayer.style})
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteRedaction(selectedLayer.id);
                }}
                title="Delete Redaction"
                className="p-1 text-zinc-400 hover:text-rose-400 transition min-w-[28px] min-h-[28px] flex items-center justify-center"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};
