import React from 'react';
import {
  Circle,
  Crop,
  EyeOff,
  Grid,
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
    isMobilePanelOpen,
    setIsMobilePanelOpen,
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
      // On mobile, auto open options so user can type watermark text
      if (window.innerWidth < 768) {
        setIsMobilePanelOpen(true);
      }
    } else if (tool === 'smart_redact') {
      runSmartDetection();
    } else if (tool === 'adjust' || tool === 'crop') {
      if (window.innerWidth < 768) {
        setIsMobilePanelOpen(true);
      }
    }
  };

  return (
    <aside className="w-full md:w-14 bg-[#0c0d10] border-t md:border-t-0 md:border-r border-[#1f2128] flex flex-row md:flex-col items-center justify-between md:justify-start px-2 py-1 md:py-2.5 select-none z-30 shrink-0 overflow-x-auto md:overflow-y-auto no-scrollbar order-last md:order-first h-14 md:h-full">
      {/* Primary Selection */}
      <div className="flex flex-row md:flex-col items-center space-x-1 md:space-x-0 md:space-y-1">
        <button
          onClick={() => handleToolClick('select')}
          title="Select & Move (V)"
          className={`min-w-[44px] min-h-[44px] w-10 h-10 flex items-center justify-center transition-all ${
            activeTool === 'select'
              ? 'bg-white text-zinc-950 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1c22]'
          }`}
        >
          <MousePointer2 className="w-4.5 h-4.5" />
        </button>
      </div>

      <div className="hidden md:block w-6 h-[1px] bg-[#1f2128] my-1.5" />
      <div className="block md:hidden h-6 w-[1px] bg-[#1f2128] mx-0.5" />

      {/* Redaction Shapes Section */}
      <div className="flex flex-row md:flex-col items-center space-x-1 md:space-x-0 md:space-y-1">
        {/* Rectangle */}
        <button
          onClick={() => {
            setRedactionShape('rectangle');
            setActiveTool('rectangle');
          }}
          title="Rectangle Redact (R)"
          className={`min-w-[44px] min-h-[44px] w-10 h-10 flex items-center justify-center transition-all relative ${
            activeTool === 'rectangle' && redactionShape === 'rectangle'
              ? 'bg-white text-zinc-950 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1c22]'
          }`}
        >
          <Square className="w-4.5 h-4.5" />
          <span className="hidden md:inline absolute bottom-0.5 right-1 text-[7px] font-mono font-bold opacity-60">R</span>
        </button>

        {/* Circle / Ellipse */}
        <button
          onClick={() => {
            setRedactionShape('circle');
            setActiveTool('circle');
          }}
          title="Circle / Oval Redact (C)"
          className={`min-w-[44px] min-h-[44px] w-10 h-10 flex items-center justify-center transition-all relative ${
            activeTool === 'circle' && redactionShape === 'circle'
              ? 'bg-white text-zinc-950 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1c22]'
          }`}
        >
          <Circle className="w-4.5 h-4.5" />
          <span className="hidden md:inline absolute bottom-0.5 right-1 text-[7px] font-mono font-bold opacity-60">C</span>
        </button>

        {/* Freehand Brush */}
        <button
          onClick={() => {
            setRedactionShape('brush');
            setActiveTool('brush');
          }}
          title="Freehand Brush Redact (B)"
          className={`min-w-[44px] min-h-[44px] w-10 h-10 flex items-center justify-center transition-all relative ${
            activeTool === 'brush'
              ? 'bg-white text-zinc-950 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1c22]'
          }`}
        >
          <Paintbrush className="w-4.5 h-4.5" />
          <span className="hidden md:inline absolute bottom-0.5 right-1 text-[7px] font-mono font-bold opacity-60">B</span>
        </button>
      </div>

      <div className="hidden md:block w-6 h-[1px] bg-[#1f2128] my-1.5" />
      <div className="block md:hidden h-6 w-[1px] bg-[#1f2128] mx-0.5" />

      {/* Redaction Styles Quick Select */}
      <div className="flex flex-row md:flex-col items-center space-x-1 md:space-x-0 md:space-y-1">
        {/* Blur Style */}
        <button
          onClick={() => setRedactionStyle('blur')}
          title="Blur Redaction Style (1)"
          className={`min-w-[44px] min-h-[44px] w-10 h-10 flex items-center justify-center transition-all ${
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
          className={`min-w-[44px] min-h-[44px] w-10 h-10 flex items-center justify-center transition-all ${
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
          className={`min-w-[44px] min-h-[44px] w-10 h-10 flex items-center justify-center transition-all ${
            redactionStyle === 'blackout'
              ? 'bg-[#22242b] text-zinc-100 ring-1 ring-zinc-500'
              : 'text-zinc-500 hover:text-zinc-300 hover:bg-[#16171b]'
          }`}
        >
          <div className="w-3.5 h-3.5 bg-zinc-300 rounded-none" />
        </button>
      </div>

      <div className="hidden md:block w-6 h-[1px] bg-[#1f2128] my-1.5" />
      <div className="block md:hidden h-6 w-[1px] bg-[#1f2128] mx-0.5" />

      {/* Smart & Watermark Features */}
      <div className="flex flex-row md:flex-col items-center space-x-1 md:space-x-0 md:space-y-1">
        {/* Smart Redact */}
        <button
          onClick={() => handleToolClick('smart_redact')}
          title="Smart Redact"
          className={`min-w-[44px] min-h-[44px] w-10 h-10 flex items-center justify-center transition-all relative ${
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
          title="Face Privacy"
          className={`min-w-[44px] min-h-[44px] w-10 h-10 flex items-center justify-center transition-all ${
            activeTool === 'face_hide'
              ? 'bg-white text-zinc-950 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1c22]'
          }`}
        >
          <UserX className="w-4.5 h-4.5" />
        </button>

        {/* Text Watermark */}
        <button
          onClick={() => handleToolClick('watermark')}
          title="Watermark (W)"
          className={`min-w-[44px] min-h-[44px] w-10 h-10 flex items-center justify-center transition-all relative ${
            activeTool === 'watermark'
              ? 'bg-white text-zinc-950 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1c22]'
          }`}
        >
          <Type className="w-4.5 h-4.5" />
          <span className="hidden md:inline absolute bottom-0.5 right-1 text-[7px] font-mono font-bold opacity-60">W</span>
        </button>

        {/* Crop Tool */}
        <button
          onClick={() => handleToolClick('crop')}
          title="Crop"
          className={`min-w-[44px] min-h-[44px] w-10 h-10 flex items-center justify-center transition-all ${
            activeTool === 'crop'
              ? 'bg-white text-zinc-950 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1c22]'
          }`}
        >
          <Crop className="w-4.5 h-4.5" />
        </button>

        {/* Options / Settings Drawer Toggle for Mobile */}
        <button
          onClick={() => setIsMobilePanelOpen(!isMobilePanelOpen)}
          title="Edit Options & Settings"
          className={`min-w-[44px] min-h-[44px] w-10 h-10 flex items-center justify-center transition-all ${
            isMobilePanelOpen
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
