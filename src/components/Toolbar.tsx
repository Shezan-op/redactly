import React from 'react';
import {
  Circle,
  Crop,
  EyeOff,
  Grid,
  Image as ImageIcon,
  MousePointer2,
  Paintbrush,
  SlidersHorizontal,
  Square,
  Type,
  UserX,
  Zap,
} from 'lucide-react';
import { useEditor } from '../context/EditorContext';
import type { ToolType } from '../engine/types';

export const Toolbar: React.FC = () => {
  const {
    activeTool,
    setActiveTool,
    redactionShape,
    setRedactionShape,
    redactionStyle,
    setRedactionStyle,
    updateWatermark,
    runSmartDetection,
    isDetecting,
  } = useEditor();

  const handleToolClick = (tool: ToolType) => {
    setActiveTool(tool);

    if (tool === 'rectangle' || tool === 'square') {
      setRedactionShape(tool);
    } else if (tool === 'circle' || tool === 'ellipse') {
      setRedactionShape(tool);
    } else if (tool === 'brush') {
      setRedactionShape('brush');
    } else if (tool === 'watermark') {
      updateWatermark({ enabled: true });
    } else if (tool === 'smart_redact') {
      runSmartDetection();
    }
  };

  return (
    <aside className="w-14 bg-[#0c0d10] border-r border-[#1f2128] flex flex-col items-center py-2.5 select-none z-20 shrink-0 overflow-y-auto">
      {/* Primary Selection */}
      <div className="flex flex-col items-center space-y-1 w-full px-1.5">
        <button
          onClick={() => handleToolClick('select')}
          title="Select & Move (V)"
          className={`w-10 h-10 rounded-none flex items-center justify-center transition-all ${
            activeTool === 'select'
              ? 'bg-white text-zinc-950 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1c22]'
          }`}
        >
          <MousePointer2 className="w-4.5 h-4.5" />
        </button>
      </div>

      <div className="w-6 h-[1px] bg-[#1f2128] my-2" />

      {/* Redaction Shapes Section */}
      <div className="flex flex-col items-center space-y-1 w-full px-1.5">
        {/* Rectangle */}
        <button
          onClick={() => {
            setRedactionShape('rectangle');
            setActiveTool('rectangle');
          }}
          title="Rectangle Redact (R)"
          className={`w-10 h-10 rounded-none flex items-center justify-center transition-all relative ${
            activeTool === 'rectangle' && redactionShape === 'rectangle'
              ? 'bg-white text-zinc-950 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1c22]'
          }`}
        >
          <Square className="w-4.5 h-4.5" />
          <span className="absolute bottom-0.5 right-1 text-[7px] font-mono font-bold opacity-60">R</span>
        </button>

        {/* Circle / Ellipse */}
        <button
          onClick={() => {
            setRedactionShape('circle');
            setActiveTool('circle');
          }}
          title="Circle / Oval Redact (C)"
          className={`w-10 h-10 rounded-none flex items-center justify-center transition-all relative ${
            activeTool === 'circle' && redactionShape === 'circle'
              ? 'bg-white text-zinc-950 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1c22]'
          }`}
        >
          <Circle className="w-4.5 h-4.5" />
          <span className="absolute bottom-0.5 right-1 text-[7px] font-mono font-bold opacity-60">C</span>
        </button>

        {/* Freehand Brush */}
        <button
          onClick={() => {
            setRedactionShape('brush');
            setActiveTool('brush');
          }}
          title="Freehand Brush Redact (B)"
          className={`w-10 h-10 rounded-none flex items-center justify-center transition-all relative ${
            activeTool === 'brush'
              ? 'bg-white text-zinc-950 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1c22]'
          }`}
        >
          <Paintbrush className="w-4.5 h-4.5" />
          <span className="absolute bottom-0.5 right-1 text-[7px] font-mono font-bold opacity-60">B</span>
        </button>
      </div>

      <div className="w-6 h-[1px] bg-[#1f2128] my-2" />

      {/* Redaction Styles Quick Select */}
      <div className="flex flex-col items-center space-y-1 w-full px-1.5">
        {/* Blur Style */}
        <button
          onClick={() => setRedactionStyle('blur')}
          title="Blur Redaction Style (1)"
          className={`w-10 h-10 rounded-none flex items-center justify-center transition-all ${
            redactionStyle === 'blur'
              ? 'bg-[#22242b] text-zinc-100 ring-1 ring-zinc-500'
              : 'text-zinc-500 hover:text-zinc-300 hover:bg-[#16171b]'
          }`}
        >
          <EyeOff className="w-4 h-4" />
        </button>

        {/* Pixelate Style */}
        <button
          onClick={() => setRedactionStyle('pixelate')}
          title="Pixelate / Mosaic Style (2)"
          className={`w-10 h-10 rounded-none flex items-center justify-center transition-all ${
            redactionStyle === 'pixelate'
              ? 'bg-[#22242b] text-zinc-100 ring-1 ring-zinc-500'
              : 'text-zinc-500 hover:text-zinc-300 hover:bg-[#16171b]'
          }`}
        >
          <Grid className="w-4 h-4" />
        </button>

        {/* Solid / Blackout Style */}
        <button
          onClick={() => setRedactionStyle('blackout')}
          title="Solid Blackout Style (3)"
          className={`w-10 h-10 rounded-none flex items-center justify-center transition-all ${
            redactionStyle === 'blackout'
              ? 'bg-[#22242b] text-zinc-100 ring-1 ring-zinc-500'
              : 'text-zinc-500 hover:text-zinc-300 hover:bg-[#16171b]'
          }`}
        >
          <div className="w-3.5 h-3.5 bg-zinc-300 rounded-none" />
        </button>
      </div>

      <div className="w-6 h-[1px] bg-[#1f2128] my-2" />

      {/* Smart & Privacy Features */}
      <div className="flex flex-col items-center space-y-1 w-full px-1.5">
        {/* Smart Redact */}
        <button
          onClick={() => handleToolClick('smart_redact')}
          title="Smart Redact (Auto-detect sensitive info)"
          className={`w-10 h-10 rounded-none flex items-center justify-center transition-all relative ${
            isDetecting
              ? 'animate-pulse bg-amber-950/40 text-amber-300 border border-amber-500/50'
              : 'text-zinc-400 hover:text-amber-300 hover:bg-[#1a1c22]'
          }`}
        >
          <Zap className="w-4.5 h-4.5 text-amber-400" />
        </button>

        {/* Face Privacy */}
        <button
          onClick={() => {
            setActiveTool('face_hide');
            setRedactionShape('ellipse');
            setRedactionStyle('blur');
          }}
          title="Face Privacy / Hide Faces"
          className={`w-10 h-10 rounded-none flex items-center justify-center transition-all ${
            activeTool === 'face_hide'
              ? 'bg-white text-zinc-950 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1c22]'
          }`}
        >
          <UserX className="w-4.5 h-4.5" />
        </button>
      </div>

      <div className="w-6 h-[1px] bg-[#1f2128] my-2" />

      {/* Watermarks & Tools */}
      <div className="flex flex-col items-center space-y-1 w-full px-1.5">
        {/* Text Watermark */}
        <button
          onClick={() => handleToolClick('watermark')}
          title="Text Watermark (W)"
          className={`w-10 h-10 rounded-none flex items-center justify-center transition-all relative ${
            activeTool === 'watermark'
              ? 'bg-white text-zinc-950 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1c22]'
          }`}
        >
          <Type className="w-4.5 h-4.5" />
          <span className="absolute bottom-0.5 right-1 text-[7px] font-mono font-bold opacity-60">W</span>
        </button>

        {/* Logo Watermark */}
        <button
          onClick={() => handleToolClick('logo')}
          title="Logo Watermark"
          className={`w-10 h-10 rounded-none flex items-center justify-center transition-all ${
            activeTool === 'logo'
              ? 'bg-white text-zinc-950 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1c22]'
          }`}
        >
          <ImageIcon className="w-4.5 h-4.5" />
        </button>

        {/* Crop Tool */}
        <button
          onClick={() => handleToolClick('crop')}
          title="Crop Image"
          className={`w-10 h-10 rounded-none flex items-center justify-center transition-all ${
            activeTool === 'crop'
              ? 'bg-white text-zinc-950 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1c22]'
          }`}
        >
          <Crop className="w-4.5 h-4.5" />
        </button>

        {/* Image Adjustments */}
        <button
          onClick={() => handleToolClick('adjust')}
          title="Image Adjustments (Brightness, Contrast, Sharpness)"
          className={`w-10 h-10 rounded-none flex items-center justify-center transition-all ${
            activeTool === 'adjust'
              ? 'bg-white text-zinc-950 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1c22]'
          }`}
        >
          <SlidersHorizontal className="w-4.5 h-4.5" />
        </button>
      </div>
    </aside>
  );
};
