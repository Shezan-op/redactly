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
    <aside className="w-16 bg-[#0e0f12]/95 backdrop-blur-md border-r border-[#1f2128] flex flex-col items-center py-3 select-none z-20 shrink-0 overflow-y-auto">
      {/* Primary Selection */}
      <div className="flex flex-col items-center space-y-1 w-full px-2">
        <button
          onClick={() => handleToolClick('select')}
          title="Select & Move (V)"
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
            activeTool === 'select'
              ? 'bg-white text-zinc-950 shadow-md shadow-white/10 ring-1 ring-zinc-300'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1c22]'
          }`}
        >
          <MousePointer2 className="w-5 h-5" />
        </button>
      </div>

      <div className="w-8 h-[1px] bg-[#1f2128] my-2.5" />

      {/* Redaction Shapes Section */}
      <div className="flex flex-col items-center space-y-1 w-full px-2">
        {/* Rectangle */}
        <button
          onClick={() => {
            setRedactionShape('rectangle');
            setActiveTool('rectangle');
          }}
          title="Rectangle Redact (R)"
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all relative ${
            activeTool === 'rectangle' && redactionShape === 'rectangle'
              ? 'bg-white text-zinc-950 shadow-md shadow-white/10 ring-1 ring-zinc-300'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1c22]'
          }`}
        >
          <Square className="w-5 h-5" />
          <span className="absolute bottom-1 right-1.5 text-[8px] font-mono font-bold opacity-60">R</span>
        </button>

        {/* Circle / Ellipse */}
        <button
          onClick={() => {
            setRedactionShape('circle');
            setActiveTool('circle');
          }}
          title="Circle / Oval Redact (C)"
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all relative ${
            activeTool === 'circle' && redactionShape === 'circle'
              ? 'bg-white text-zinc-950 shadow-md shadow-white/10 ring-1 ring-zinc-300'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1c22]'
          }`}
        >
          <Circle className="w-5 h-5" />
          <span className="absolute bottom-1 right-1.5 text-[8px] font-mono font-bold opacity-60">C</span>
        </button>

        {/* Freehand Brush */}
        <button
          onClick={() => {
            setRedactionShape('brush');
            setActiveTool('brush');
          }}
          title="Freehand Brush Redact (B)"
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all relative ${
            activeTool === 'brush'
              ? 'bg-white text-zinc-950 shadow-md shadow-white/10 ring-1 ring-zinc-300'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1c22]'
          }`}
        >
          <Paintbrush className="w-5 h-5" />
          <span className="absolute bottom-1 right-1.5 text-[8px] font-mono font-bold opacity-60">B</span>
        </button>
      </div>

      <div className="w-8 h-[1px] bg-[#1f2128] my-2.5" />

      {/* Redaction Styles Quick Select */}
      <div className="flex flex-col items-center space-y-1 w-full px-2">
        {/* Blur Style */}
        <button
          onClick={() => setRedactionStyle('blur')}
          title="Blur Redaction Style (1)"
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
            redactionStyle === 'blur'
              ? 'bg-[#22242b] text-zinc-100 ring-1 ring-zinc-500 shadow-inner'
              : 'text-zinc-500 hover:text-zinc-300 hover:bg-[#16171b]'
          }`}
        >
          <EyeOff className="w-4 h-4" />
        </button>

        {/* Pixelate Style */}
        <button
          onClick={() => setRedactionStyle('pixelate')}
          title="Pixelate / Mosaic Style (2)"
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
            redactionStyle === 'pixelate'
              ? 'bg-[#22242b] text-zinc-100 ring-1 ring-zinc-500 shadow-inner'
              : 'text-zinc-500 hover:text-zinc-300 hover:bg-[#16171b]'
          }`}
        >
          <Grid className="w-4 h-4" />
        </button>

        {/* Solid / Blackout Style */}
        <button
          onClick={() => setRedactionStyle('blackout')}
          title="Solid Blackout Style (3)"
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
            redactionStyle === 'blackout'
              ? 'bg-[#22242b] text-zinc-100 ring-1 ring-zinc-500 shadow-inner'
              : 'text-zinc-500 hover:text-zinc-300 hover:bg-[#16171b]'
          }`}
        >
          <div className="w-4 h-4 bg-zinc-300 rounded-sm" />
        </button>
      </div>

      <div className="w-8 h-[1px] bg-[#1f2128] my-2.5" />

      {/* Smart & Privacy Features */}
      <div className="flex flex-col items-center space-y-1 w-full px-2">
        {/* Smart Redact */}
        <button
          onClick={() => handleToolClick('smart_redact')}
          title="Smart Redact (Auto-detect sensitive info)"
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all relative ${
            isDetecting
              ? 'animate-pulse bg-amber-950/40 text-amber-300 border border-amber-500/50'
              : 'text-zinc-400 hover:text-amber-300 hover:bg-[#1a1c22]'
          }`}
        >
          <Zap className="w-5 h-5 text-amber-400" />
        </button>

        {/* Face Privacy */}
        <button
          onClick={() => {
            setActiveTool('face_hide');
            setRedactionShape('ellipse');
            setRedactionStyle('blur');
          }}
          title="Face Privacy / Hide Faces"
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
            activeTool === 'face_hide'
              ? 'bg-white text-zinc-950 shadow-md shadow-white/10 ring-1 ring-zinc-300'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1c22]'
          }`}
        >
          <UserX className="w-5 h-5" />
        </button>
      </div>

      <div className="w-8 h-[1px] bg-[#1f2128] my-2.5" />

      {/* Watermarks & Tools */}
      <div className="flex flex-col items-center space-y-1 w-full px-2">
        {/* Text Watermark */}
        <button
          onClick={() => handleToolClick('watermark')}
          title="Text Watermark (W)"
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all relative ${
            activeTool === 'watermark'
              ? 'bg-white text-zinc-950 shadow-md shadow-white/10 ring-1 ring-zinc-300'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1c22]'
          }`}
        >
          <Type className="w-5 h-5" />
          <span className="absolute bottom-1 right-1.5 text-[8px] font-mono font-bold opacity-60">W</span>
        </button>

        {/* Logo Watermark */}
        <button
          onClick={() => handleToolClick('logo')}
          title="Logo Watermark"
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
            activeTool === 'logo'
              ? 'bg-white text-zinc-950 shadow-md shadow-white/10 ring-1 ring-zinc-300'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1c22]'
          }`}
        >
          <ImageIcon className="w-5 h-5" />
        </button>

        {/* Crop Tool */}
        <button
          onClick={() => handleToolClick('crop')}
          title="Crop Image"
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
            activeTool === 'crop'
              ? 'bg-white text-zinc-950 shadow-md shadow-white/10 ring-1 ring-zinc-300'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1c22]'
          }`}
        >
          <Crop className="w-5 h-5" />
        </button>

        {/* Image Adjustments */}
        <button
          onClick={() => handleToolClick('adjust')}
          title="Image Adjustments (Brightness, Contrast, Sharpness)"
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
            activeTool === 'adjust'
              ? 'bg-white text-zinc-950 shadow-md shadow-white/10 ring-1 ring-zinc-300'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1c22]'
          }`}
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
};
