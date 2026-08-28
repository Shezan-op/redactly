import React, { useEffect, useState } from 'react';
import {
  Code,
  FileSpreadsheet,
  LayoutDashboard,
  Lock,
  MessageSquare,
  Sparkles,
  Upload,
} from 'lucide-react';
import { useEditor } from '../context/EditorContext';
import { generateSampleImage } from '../engine/presets';

export const LandingUpload: React.FC = () => {
  const { loadImage } = useEditor();
  const [isDragging, setIsDragging] = useState(false);
  const [isLoadingSample, setIsLoadingSample] = useState(false);

  // File Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      loadImage(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadImage(file);
    }
  };

  // Paste from Clipboard
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            loadImage(file, `pasted-screenshot-${Date.now()}.png`);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [loadImage]);

  // Load Built-in Demo Samples
  const handleSampleClick = async (type: 'dashboard' | 'invoice' | 'chat' | 'code', label: string) => {
    setIsLoadingSample(true);
    try {
      const dataUrl = await generateSampleImage(type);
      if (dataUrl) {
        await loadImage(dataUrl, `${label.toLowerCase().replace(/\s+/g, '-')}-sample.png`);
      }
    } finally {
      setIsLoadingSample(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-6 bg-radial from-slate-900 to-slate-950 text-slate-100">
      <div className="max-w-3xl w-full flex flex-col items-center text-center space-y-7 my-auto py-8">
        {/* Top Privacy Tag */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-semibold shadow-inner">
          <Lock className="w-3.5 h-3.5 text-indigo-400" />
          <span>100% Client-Side Processing · Zero Server Uploads</span>
        </div>

        {/* Hero Headlines */}
        <div className="space-y-3 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Protect your screenshots <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-300">
              before you share them.
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 font-normal leading-relaxed">
            Redact sensitive information, blur private details, and add professional watermarks in seconds.
          </p>
        </div>

        {/* Primary Drag & Drop Upload Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`w-full max-w-xl p-8 sm:p-10 rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer flex flex-col items-center justify-center ${
            isDragging
              ? 'border-indigo-400 bg-indigo-950/40 scale-[1.01] shadow-2xl shadow-indigo-500/20'
              : 'border-slate-700/80 bg-slate-900/50 hover:bg-slate-900/80 hover:border-slate-600 shadow-xl'
          }`}
          onClick={() => document.getElementById('file-upload-input')?.click()}
        >
          <input
            id="file-upload-input"
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={handleFileInput}
            className="hidden"
          />

          <div className="w-16 h-16 rounded-2xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center mb-4 text-indigo-400 shadow-lg group-hover:scale-110 transition">
            <Upload className="w-8 h-8" />
          </div>

          <p className="text-base font-semibold text-slate-200 mb-1">
            Drop an image here
          </p>
          <p className="text-xs text-slate-400 mb-4">
            or <span className="text-indigo-400 font-medium underline underline-offset-2">choose an image</span> from your computer
          </p>

          <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-500 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
            <span>PNG</span>
            <span>·</span>
            <span>JPG / JPEG</span>
            <span>·</span>
            <span>WebP</span>
            <span>·</span>
            <span>Paste (Ctrl+V)</span>
          </div>
        </div>

        {/* Capability Labels */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400 font-medium">
          <span className="flex items-center space-x-1.5 bg-slate-900/80 border border-slate-800 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span>Redact</span>
          </span>
          <span className="flex items-center space-x-1.5 bg-slate-900/80 border border-slate-800 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <span>Blur</span>
          </span>
          <span className="flex items-center space-x-1.5 bg-slate-900/80 border border-slate-800 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>Pixelate</span>
          </span>
          <span className="flex items-center space-x-1.5 bg-slate-900/80 border border-slate-800 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Watermark</span>
          </span>
          <span className="flex items-center space-x-1.5 bg-slate-900/80 border border-slate-800 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Permanent Flattened Export</span>
          </span>
        </div>

        {/* Demo Samples Section */}
        <div className="w-full max-w-xl pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-semibold text-slate-400 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Or try with a sample screenshot:</span>
            </span>
            {isLoadingSample && <span className="text-indigo-400 animate-pulse">Loading sample...</span>}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { type: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard, desc: 'Revenue & Clients' },
              { type: 'invoice' as const, label: 'Invoice', icon: FileSpreadsheet, desc: 'Banking & Address' },
              { type: 'chat' as const, label: 'Support Chat', icon: MessageSquare, desc: 'Phone & Passport' },
              { type: 'code' as const, label: 'API Keys', icon: Code, desc: 'Secrets & DB URL' },
            ].map(({ type, label, icon: Icon, desc }) => (
              <button
                key={type}
                disabled={isLoadingSample}
                onClick={() => handleSampleClick(type, label)}
                className="p-2.5 rounded-xl bg-slate-900/70 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/50 flex flex-col items-center text-center transition group active:scale-95 disabled:opacity-50"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-800 group-hover:bg-indigo-600/20 text-slate-400 group-hover:text-indigo-300 flex items-center justify-center mb-1.5 transition">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="font-semibold text-xs text-slate-200 group-hover:text-white">{label}</span>
                <span className="text-[10px] text-slate-500">{desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center space-x-4 text-xs text-slate-500 pt-2">
          <span className="font-semibold text-slate-400">Redactly</span>
          <span>·</span>
          <span>100% Client-Side</span>
          <span>·</span>
          <a
            href="https://github.com/Shezan-op/redactly"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition"
          >
            GitHub Repository
          </a>
        </div>
      </div>
    </div>
  );
};


