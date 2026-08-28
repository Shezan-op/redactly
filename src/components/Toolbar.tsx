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
    <aside className="w-16 bg-slate-900/90 backdrop-blur-md border-r border-slate-800/80 flex flex-col items-center py-3 select-none z-20 shrink-0 overflow-y-auto">
      {/* Primary Selection */}
      <div className="flex flex-col items-center space-y-1 w-full px-2">
        <button
          onClick={() => handleToolClick('select')}
          title="Select & Move (V)"
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
            activeTool === 'select'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
          }`}
        >
          <MousePointer2 className="w-5 h-5" />
        </button>
      </div>

      <div className="w-8 h-[1px] bg-slate-800 my-2.5" />

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
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
          }`}
        >
          <Square className="w-5 h-5" />
          <span className="absolute bottom-1 right-1.5 text-[8px] font-mono text-slate-500 font-semibold">R</span>
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
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
          }`}
        >
          <Circle className="w-5 h-5" />
          <span className="absolute bottom-1 right-1.5 text-[8px] font-mono text-slate-500 font-semibold">C</span>
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
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
          }`}
        >
          <Paintbrush className="w-5 h-5" />
          <span className="absolute bottom-1 right-1.5 text-[8px] font-mono text-slate-500 font-semibold">B</span>
        </button>
      </div>

      <div className="w-8 h-[1px] bg-slate-800 my-2.5" />

      {/* Redaction Styles Quick Select */}
      <div className="flex flex-col items-center space-y-1 w-full px-2">
        {/* Blur Style */}
        <button
          onClick={() => setRedactionStyle('blur')}
          title="Blur Redaction Style"
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
            redactionStyle === 'blur'
              ? 'bg-slate-800 text-indigo-400 ring-2 ring-indigo-500/50'
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
          }`}
        >
          <EyeOff className="w-4 h-4" />
        </button>

        {/* Pixelate Style */}
        <button
          onClick={() => setRedactionStyle('pixelate')}
          title="Pixelate / Mosaic Style"
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
            redactionStyle === 'pixelate'
              ? 'bg-slate-800 text-indigo-400 ring-2 ring-indigo-500/50'
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
          }`}
        >
          <Grid className="w-4 h-4" />
        </button>

        {/* Solid / Blackout Style */}
        <button
          onClick={() => setRedactionStyle('blackout')}
          title="Solid Blackout Style"
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
            redactionStyle === 'blackout'
              ? 'bg-slate-800 text-indigo-400 ring-2 ring-indigo-500/50'
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
          }`}
        >
          <div className="w-4 h-4 bg-slate-200 rounded-sm" />
        </button>
      </div>

      <div className="w-8 h-[1px] bg-slate-800 my-2.5" />

      {/* Smart & Privacy Features */}
      <div className="flex flex-col items-center space-y-1 w-full px-2">
        {/* Smart Redact */}
        <button
          onClick={() => handleToolClick('smart_redact')}
          title="Smart Redact (Auto-detect sensitive text, emails, phones, keys)"
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all relative ${
            isDetecting ? 'animate-pulse bg-indigo-950 text-indigo-300 border border-indigo-500/50' : 'text-slate-400 hover:text-indigo-300 hover:bg-indigo-950/40'
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
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
          }`}
        >
          <UserX className="w-5 h-5" />
        </button>
      </div>

      <div className="w-8 h-[1px] bg-slate-800 my-2.5" />

      {/* Watermarks & Tools */}
      <div className="flex flex-col items-center space-y-1 w-full px-2">
        {/* Text Watermark */}
        <button
          onClick={() => handleToolClick('watermark')}
          title="Text Watermark (W)"
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all relative ${
            activeTool === 'watermark'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
          }`}
        >
          <Type className="w-5 h-5" />
          <span className="absolute bottom-1 right-1.5 text-[8px] font-mono text-slate-500 font-semibold">W</span>
        </button>

        {/* Logo Watermark */}
        <button
          onClick={() => handleToolClick('logo')}
          title="Logo Watermark"
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
            activeTool === 'logo'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
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
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
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
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
          }`}
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
};
