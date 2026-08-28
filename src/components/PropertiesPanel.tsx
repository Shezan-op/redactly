import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Circle,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Layers,
  Paintbrush,
  Sliders,
  Square,
  Trash2,
  Type,
  Upload,
} from 'lucide-react';
import { useEditor } from '../context/EditorContext';
import { WATERMARK_PRESETS } from '../engine/presets';
import type {
  AspectRatioType,
  PositionPreset,
  RedactionStyle,
  ShapeType,
  WatermarkLayoutMode,
} from '../engine/types';

type ActiveTab = 'tools' | 'watermark' | 'logo' | 'layers' | 'adjust';

export const PropertiesPanel: React.FC = () => {
  const {
    activeTool,
    setActiveTool,
    redactionStyle,
    setRedactionStyle,
    redactionShape,
    setRedactionShape,
    brushRadius,
    setBrushRadius,
    blurStrength,
    setBlurStrength,
    pixelSize,
    setPixelSize,
    solidColor,
    setSolidColor,
    solidOpacity,
    setSolidOpacity,
    redactions,
    selectedLayerId,
    setSelectedLayerId,
    updateRedaction,
    deleteRedaction,
    reorderRedactions,
    toggleLayerVisibility,
    watermark,
    updateWatermark,
    applyWatermarkPreset,
    logo,
    updateLogo,
    loadLogoImage,
    removeLogoImage,
    adjustments,
    updateAdjustments,
    resetAdjustments,
    crop,
    updateCrop,
    applyCrop,
    cancelCrop,
  } = useEditor();

  const [activeTab, setActiveTab] = useState<ActiveTab>('tools');

  // Find currently selected layer (if any)
  const selectedLayer = redactions.find((l) => l.id === selectedLayerId);

  const handleShapeChange = (shape: ShapeType) => {
    setRedactionShape(shape);
    if (selectedLayer) {
      updateRedaction(selectedLayer.id, { type: shape });
    }
  };

  const handleStyleChange = (style: RedactionStyle) => {
    setRedactionStyle(style);
    if (selectedLayer) {
      updateRedaction(selectedLayer.id, { style });
    }
  };

  const handleBlurStrengthChange = (val: number) => {
    setBlurStrength(val);
    if (selectedLayer) {
      updateRedaction(selectedLayer.id, { blurStrength: val });
    }
  };

  const handlePixelSizeChange = (val: number) => {
    setPixelSize(val);
    if (selectedLayer) {
      updateRedaction(selectedLayer.id, { pixelSize: val });
    }
  };

  const handleColorChange = (c: string) => {
    setSolidColor(c);
    if (selectedLayer) {
      updateRedaction(selectedLayer.id, { color: c });
    }
  };

  const handleOpacityChange = (o: number) => {
    setSolidOpacity(o);
    if (selectedLayer) {
      updateRedaction(selectedLayer.id, { opacity: o });
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadLogoImage(file);
    }
  };

  return (
    <aside className="w-80 bg-slate-900/90 backdrop-blur-md border-l border-slate-800/80 flex flex-col select-none z-20 shrink-0 overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex items-center border-b border-slate-800/80 bg-slate-950/40 p-1">
        <button
          onClick={() => setActiveTab('tools')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition ${
            activeTab === 'tools'
              ? 'bg-slate-800 text-indigo-400 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Square className="w-3.5 h-3.5" />
          <span>Redact</span>
        </button>

        <button
          onClick={() => setActiveTab('watermark')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition ${
            activeTab === 'watermark'
              ? 'bg-slate-800 text-indigo-400 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          <span>Watermark</span>
        </button>

        <button
          onClick={() => setActiveTab('logo')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition ${
            activeTab === 'logo'
              ? 'bg-slate-800 text-indigo-400 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Logo</span>
        </button>

        <button
          onClick={() => setActiveTab('layers')}
          className={`py-2 px-2.5 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1 transition relative ${
            activeTab === 'layers'
              ? 'bg-slate-800 text-indigo-400 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
          title="Layers"
        >
          <Layers className="w-3.5 h-3.5" />
          {redactions.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
              {redactions.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('adjust')}
          className={`py-2 px-2.5 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1 transition ${
            activeTab === 'adjust'
              ? 'bg-slate-800 text-indigo-400 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
          title="Adjustments"
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-slate-300 text-xs">
        {/* ===================== TAB 1: REDACTION TOOLS ===================== */}
        {activeTab === 'tools' && (
          <div className="space-y-4">
            {/* Shape Selection */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Redaction Shape
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'rectangle', label: 'Rectangle', icon: Square },
                  { id: 'circle', label: 'Circle', icon: Circle },
                  { id: 'brush', label: 'Brush', icon: Paintbrush },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => handleShapeChange(id as ShapeType)}
                    className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-lg border text-center transition ${
                      (selectedLayer ? selectedLayer.type === id : redactionShape === id)
                        ? 'bg-indigo-600/15 border-indigo-500/60 text-indigo-300'
                        : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-1" />
                    <span className="text-[11px] font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Redaction Style */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Privacy Style
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'blur', label: 'Blur', desc: 'Gaussian Smoothing' },
                  { id: 'pixelate', label: 'Pixelate', desc: 'Mosaic Blocks' },
                  { id: 'blackout', label: 'Blackout', desc: 'Solid #000000' },
                  { id: 'solid', label: 'Custom Color', desc: 'Colored Box' },
                ].map(({ id, label, desc }) => (
                  <button
                    key={id}
                    onClick={() => handleStyleChange(id as RedactionStyle)}
                    className={`p-2.5 rounded-lg border text-left transition ${
                      (selectedLayer ? selectedLayer.style === id : redactionStyle === id)
                        ? 'bg-indigo-600/15 border-indigo-500/60 text-indigo-300'
                        : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-semibold text-xs text-slate-200">{label}</div>
                    <div className="text-[10px] text-slate-500">{desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Contextual Sliders based on Style */}
            {(selectedLayer ? selectedLayer.style === 'blur' : redactionStyle === 'blur') && (
              <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-300">Blur Strength</span>
                  <span className="font-mono text-slate-400">
                    {selectedLayer ? selectedLayer.blurStrength : blurStrength}px
                  </span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="40"
                  value={selectedLayer ? selectedLayer.blurStrength : blurStrength}
                  onChange={(e) => handleBlurStrengthChange(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            )}

            {(selectedLayer ? selectedLayer.style === 'pixelate' : redactionStyle === 'pixelate') && (
              <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-300">Pixelation Block Size</span>
                  <span className="font-mono text-slate-400">
                    {selectedLayer ? selectedLayer.pixelSize : pixelSize}px
                  </span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="36"
                  value={selectedLayer ? selectedLayer.pixelSize : pixelSize}
                  onChange={(e) => handlePixelSizeChange(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            )}

            {(selectedLayer ? selectedLayer.style === 'solid' : redactionStyle === 'solid') && (
              <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-300">Custom Color</span>
                  <input
                    type="color"
                    value={selectedLayer ? selectedLayer.color : solidColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                  />
                </div>

                {/* Preset Color Swatches */}
                <div className="flex items-center space-x-1.5">
                  {['#000000', '#1e293b', '#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#ffffff'].map((hex) => (
                    <button
                      key={hex}
                      onClick={() => handleColorChange(hex)}
                      style={{ backgroundColor: hex }}
                      className="w-5 h-5 rounded-full border border-slate-600 hover:scale-110 transition"
                    />
                  ))}
                </div>

                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Opacity</span>
                    <span className="font-mono text-slate-400">
                      {Math.round((selectedLayer ? selectedLayer.opacity : solidOpacity) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={selectedLayer ? selectedLayer.opacity : solidOpacity}
                    onChange={(e) => handleOpacityChange(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Brush radius slider if brush is active */}
            {(selectedLayer ? selectedLayer.type === 'brush' : redactionShape === 'brush') && (
              <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-300">Brush Radius</span>
                  <span className="font-mono text-slate-400">{brushRadius}px</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="48"
                  value={brushRadius}
                  onChange={(e) => setBrushRadius(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            )}

            {/* Crop section toggle if Crop tool is active */}
            {activeTool === 'crop' && (
              <div className="bg-indigo-950/40 border border-indigo-500/40 p-3 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-indigo-300">Crop Tool Active</span>
                  <span className="text-[10px] text-slate-400">Drag to crop</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {(['free', '1:1', '4:5', '16:9', '9:16', '4:3'] as AspectRatioType[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => updateCrop({ aspectRatio: r })}
                      className={`py-1 text-[10px] font-semibold uppercase rounded border transition ${
                        crop.aspectRatio === r
                          ? 'bg-indigo-600 border-indigo-400 text-white'
                          : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <div className="flex space-x-2 pt-1">
                  <button
                    onClick={applyCrop}
                    className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded text-xs transition"
                  >
                    Apply Crop
                  </button>
                  <button
                    onClick={cancelCrop}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB 2: WATERMARK SETTINGS ===================== */}
        {activeTab === 'watermark' && (
          <div className="space-y-4">
            {/* Watermark Toggle */}
            <div className="flex items-center justify-between bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
              <div>
                <div className="font-semibold text-xs text-slate-200">Enable Text Watermark</div>
                <div className="text-[10px] text-slate-400">Display watermark over image</div>
              </div>
              <input
                type="checkbox"
                checked={watermark.enabled}
                onChange={(e) => updateWatermark({ enabled: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-700 border-slate-600 cursor-pointer"
              />
            </div>

            {/* Quick Presets */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Quick Presets
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {WATERMARK_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => applyWatermarkPreset(preset.id)}
                    className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 text-left transition group"
                  >
                    <div className="font-semibold text-xs text-slate-200 group-hover:text-indigo-400">
                      {preset.name}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">{preset.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Watermark Text */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Watermark Text
              </label>
              <input
                type="text"
                value={watermark.text}
                onChange={(e) => updateWatermark({ text: e.target.value })}
                placeholder="e.g. CONFIDENTIAL"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Layout Mode */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Layout Pattern
              </label>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { id: 'diagonal', label: 'Diagonal' },
                  { id: 'repeated', label: 'Tiled' },
                  { id: 'single', label: 'Single' },
                  { id: 'center', label: 'Center' },
                  { id: 'pattern', label: 'Pattern' },
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => updateWatermark({ layoutMode: id as WatermarkLayoutMode })}
                    className={`py-1.5 rounded text-xs font-medium border transition ${
                      watermark.layoutMode === id
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Position Presets (if single mode) */}
            {watermark.layoutMode === 'single' && (
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Position Preset
                </label>
                <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                  {(
                    [
                      'top-left',
                      'top-center',
                      'top-right',
                      'center',
                      'bottom-left',
                      'bottom-center',
                      'bottom-right',
                    ] as PositionPreset[]
                  ).map((pos) => (
                    <button
                      key={pos}
                      onClick={() => updateWatermark({ positionPreset: pos })}
                      className={`py-1 text-[10px] capitalize rounded font-medium transition ${
                        watermark.positionPreset === pos
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {pos.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Typography & Styling Controls */}
            <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800 space-y-3">
              {/* Font Family */}
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Font</span>
                <select
                  value={watermark.fontFamily}
                  onChange={(e) => updateWatermark({ fontFamily: e.target.value })}
                  className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Inter">Inter (Sans)</option>
                  <option value="JetBrains Mono">JetBrains Mono</option>
                  <option value="Plus Jakarta Sans">Jakarta Sans</option>
                  <option value="Impact">Impact (Heavy)</option>
                  <option value="Times New Roman">Times (Serif)</option>
                  <option value="Courier New">Courier (Typewriter)</option>
                </select>
              </div>

              {/* Font Size */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Font Size</span>
                  <span className="font-mono text-slate-400">{watermark.fontSize}pt</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="96"
                  value={watermark.fontSize}
                  onChange={(e) => updateWatermark({ fontSize: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Opacity */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Opacity</span>
                  <span className="font-mono text-slate-400">
                    {Math.round(watermark.opacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="1"
                  step="0.05"
                  value={watermark.opacity}
                  onChange={(e) => updateWatermark({ opacity: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Rotation */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Rotation</span>
                  <span className="font-mono text-slate-400">{watermark.rotation}°</span>
                </div>
                <input
                  type="range"
                  min="-90"
                  max="90"
                  value={watermark.rotation}
                  onChange={(e) => updateWatermark({ rotation: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between pt-1">
                  {[-45, -30, -15, 0, 15, 30, 45].map((deg) => (
                    <button
                      key={deg}
                      onClick={() => updateWatermark({ rotation: deg })}
                      className={`text-[9px] px-1 rounded ${
                        watermark.rotation === deg ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {deg}°
                    </button>
                  ))}
                </div>
              </div>

              {/* Color & Shadow */}
              <div className="flex justify-between items-center pt-1 border-t border-slate-700/60">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400">Color:</span>
                  <input
                    type="color"
                    value={watermark.color}
                    onChange={(e) => updateWatermark({ color: e.target.value })}
                    className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                  />
                </div>
                <label className="flex items-center space-x-1.5 cursor-pointer text-slate-400 hover:text-slate-200">
                  <input
                    type="checkbox"
                    checked={watermark.shadow}
                    onChange={(e) => updateWatermark({ shadow: e.target.checked })}
                    className="rounded text-indigo-600 bg-slate-700 border-slate-600"
                  />
                  <span className="text-[11px]">Drop Shadow</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 3: LOGO WATERMARK ===================== */}
        {activeTab === 'logo' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
              <div>
                <div className="font-semibold text-xs text-slate-200">Enable Logo Overlay</div>
                <div className="text-[10px] text-slate-400">Brand watermark badge</div>
              </div>
              <input
                type="checkbox"
                checked={logo.enabled}
                onChange={(e) => updateLogo({ enabled: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-700 border-slate-600 cursor-pointer"
              />
            </div>

            {/* Logo Uploader / Preview */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Logo Image (PNG, JPG, WebP)
              </label>

              {logo.imageSrc ? (
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img src={logo.imageSrc} alt="Logo" className="w-10 h-10 object-contain bg-slate-900 rounded p-1" />
                    <div>
                      <div className="font-medium text-xs text-slate-200 truncate max-w-[140px]">
                        {logo.fileName || 'logo.png'}
                      </div>
                      <span className="text-[10px] text-emerald-400">Loaded</span>
                    </div>
                  </div>
                  <button
                    onClick={removeLogoImage}
                    title="Remove Logo"
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-700 hover:border-indigo-500/80 bg-slate-950/40 hover:bg-slate-950/80 p-4 rounded-xl flex flex-col items-center justify-center cursor-pointer transition text-center">
                  <Upload className="w-6 h-6 text-slate-400 mb-1.5" />
                  <span className="text-xs font-semibold text-slate-200">Upload Brand Logo</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">Transparent PNG recommended</span>
                  <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleLogoUpload} className="hidden" />
                </label>
              )}
            </div>

            {/* Logo Settings */}
            {logo.imageSrc && (
              <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800 space-y-3">
                {/* Scale */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Logo Scale</span>
                    <span className="font-mono text-slate-400">{Math.round(logo.scale * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.5"
                    step="0.02"
                    value={logo.scale}
                    onChange={(e) => updateLogo({ scale: Number(e.target.value) })}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Opacity */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Opacity</span>
                    <span className="font-mono text-slate-400">{Math.round(logo.opacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={logo.opacity}
                    onChange={(e) => updateLogo({ opacity: Number(e.target.value) })}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Position Preset */}
                <div>
                  <span className="text-slate-400 block mb-1 text-xs">Position</span>
                  <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                    {(['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'] as PositionPreset[]).map(
                      (pos) => (
                        <button
                          key={pos}
                          onClick={() => updateLogo({ positionPreset: pos })}
                          className={`py-1 text-[10px] capitalize rounded font-medium transition ${
                            logo.positionPreset === pos
                              ? 'bg-indigo-600 text-white'
                              : 'text-slate-400 hover:bg-slate-800'
                          }`}
                        >
                          {pos.replace('-', ' ')}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB 4: LAYERS LIST ===================== */}
        {activeTab === 'layers' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Redactions ({redactions.length})
              </span>
              {redactions.length > 0 && (
                <button
                  onClick={() => redactions.forEach((l) => deleteRedaction(l.id))}
                  className="text-[10px] text-rose-400 hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>

            {redactions.length === 0 ? (
              <div className="text-center py-8 text-slate-500 bg-slate-950/40 rounded-lg border border-dashed border-slate-800 p-4">
                <Square className="w-6 h-6 mx-auto mb-2 text-slate-600" />
                <p className="font-medium text-slate-400">No redactions yet</p>
                <p className="text-[10px] mt-1 text-slate-600">
                  Draw rectangles, circles, or brush over sensitive areas.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
                {[...redactions].reverse().map((layer, index) => {
                  const actualIndex = redactions.length - 1 - index;
                  const isSelected = selectedLayerId === layer.id;

                  return (
                    <div
                      key={layer.id}
                      onClick={() => {
                        setSelectedLayerId(layer.id);
                        setActiveTool('select');
                      }}
                      className={`flex items-center justify-between p-2.5 rounded-lg border transition cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-950/50 border-indigo-500/80 shadow-sm'
                          : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center space-x-2 min-w-0">
                        {layer.type === 'circle' || layer.type === 'ellipse' ? (
                          <Circle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        ) : layer.type === 'brush' ? (
                          <Paintbrush className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        )}
                        <div className="truncate">
                          <div className="font-medium text-xs text-slate-200 truncate">{layer.name}</div>
                          <div className="text-[10px] text-slate-500 capitalize">{layer.style}</div>
                        </div>
                      </div>

                      {/* Layer Actions */}
                      <div className="flex items-center space-x-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        {/* Visibility Toggle */}
                        <button
                          onClick={() => toggleLayerVisibility(layer.id)}
                          title={layer.visible ? 'Hide' : 'Show'}
                          className="p-1 text-slate-400 hover:text-slate-200 transition"
                        >
                          {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-slate-600" />}
                        </button>

                        {/* Reorder Up */}
                        <button
                          disabled={actualIndex === redactions.length - 1}
                          onClick={() => reorderRedactions(actualIndex, actualIndex + 1)}
                          title="Move Forward"
                          className="p-1 text-slate-400 hover:text-slate-200 disabled:opacity-30"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>

                        {/* Reorder Down */}
                        <button
                          disabled={actualIndex === 0}
                          onClick={() => reorderRedactions(actualIndex, actualIndex - 1)}
                          title="Move Backward"
                          className="p-1 text-slate-400 hover:text-slate-200 disabled:opacity-30"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => deleteRedaction(layer.id)}
                          title="Delete"
                          className="p-1 text-slate-400 hover:text-rose-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB 5: ADJUSTMENTS ===================== */}
        {activeTab === 'adjust' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Lightweight Image Tuning
              </span>
              <button onClick={resetAdjustments} className="text-[10px] text-indigo-400 hover:underline">
                Reset
              </button>
            </div>

            <div className="bg-slate-800/40 p-3.5 rounded-lg border border-slate-800 space-y-3.5">
              {/* Brightness */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Brightness</span>
                  <span className="font-mono text-slate-400">{adjustments.brightness}</span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={adjustments.brightness}
                  onChange={(e) => updateAdjustments({ brightness: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Contrast */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Contrast</span>
                  <span className="font-mono text-slate-400">{adjustments.contrast}</span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={adjustments.contrast}
                  onChange={(e) => updateAdjustments({ contrast: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Saturation */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Saturation</span>
                  <span className="font-mono text-slate-400">{adjustments.saturation}</span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={adjustments.saturation}
                  onChange={(e) => updateAdjustments({ saturation: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Exposure */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Exposure</span>
                  <span className="font-mono text-slate-400">{adjustments.exposure}</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={adjustments.exposure}
                  onChange={(e) => updateAdjustments({ exposure: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Sharpness */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Sharpness</span>
                  <span className="font-mono text-slate-400">{adjustments.sharpness}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={adjustments.sharpness}
                  onChange={(e) => updateAdjustments({ sharpness: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
