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
    <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-6 bg-[#090a0c] text-zinc-100">
      <div className="max-w-3xl w-full flex flex-col items-center text-center space-y-7 my-auto py-8">
        {/* Top Privacy Tag */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-none bg-[#141519] border border-[#272932] text-zinc-300 text-xs font-mono font-medium">
          <Lock className="w-3.5 h-3.5 text-zinc-400" />
          <span>100% CLIENT-SIDE PROCESSING · ZERO SERVER UPLOADS</span>
        </div>

        {/* Hero Headlines */}
        <div className="space-y-3 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-syne tracking-tight text-white leading-tight">
            Protect your screenshots <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-500">
              before you share them.
            </span>
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 font-normal leading-relaxed">
            Permanently redact sensitive details, blur private data, and stamp custom watermarks in seconds.
          </p>
        </div>

        {/* Primary Drag & Drop Upload Zone (Sharp Architectural Border) */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`w-full max-w-xl p-8 sm:p-10 rounded-none border-2 border-dashed transition-all duration-150 cursor-pointer flex flex-col items-center justify-center ${
            isDragging
              ? 'border-white bg-[#1a1b22]'
              : 'border-[#272932] bg-[#121317] hover:bg-[#181920] hover:border-zinc-500 shadow-xl'
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

          <div className="w-14 h-14 rounded-none bg-gradient-to-b from-zinc-700 to-zinc-900 border border-zinc-700 flex items-center justify-center mb-4 text-white shadow-sm">
            <Upload className="w-6 h-6" />
          </div>

          <p className="text-base font-bold font-syne text-zinc-100 mb-1">
            Drop an image here
          </p>
          <p className="text-xs text-zinc-400 mb-4">
            or <span className="text-white font-semibold underline underline-offset-2 hover:text-zinc-200">choose an image</span> from your computer
          </p>

          <div className="flex items-center space-x-2 text-[11px] font-mono text-zinc-400 bg-[#090a0c] px-3.5 py-1.5 rounded-none border border-[#23252c]">
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
        <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-zinc-300 font-medium">
          <span className="flex items-center space-x-1.5 bg-[#141519] border border-[#262830] px-3 py-1 rounded-none font-mono text-[11px]">
            <span className="w-1.5 h-1.5 bg-zinc-300 rounded-none" />
            <span>REDACT</span>
          </span>
          <span className="flex items-center space-x-1.5 bg-[#141519] border border-[#262830] px-3 py-1 rounded-none font-mono text-[11px]">
            <span className="w-1.5 h-1.5 bg-zinc-400 rounded-none" />
            <span>BLUR</span>
          </span>
          <span className="flex items-center space-x-1.5 bg-[#141519] border border-[#262830] px-3 py-1 rounded-none font-mono text-[11px]">
            <span className="w-1.5 h-1.5 bg-zinc-300 rounded-none" />
            <span>PIXELATE</span>
          </span>
          <span className="flex items-center space-x-1.5 bg-[#141519] border border-[#262830] px-3 py-1 rounded-none font-mono text-[11px]">
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-none" />
            <span>WATERMARK</span>
          </span>
          <span className="flex items-center space-x-1.5 bg-[#141519] border border-[#262830] px-3 py-1 rounded-none font-mono text-[11px]">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-none" />
            <span>PERMANENT FLATTENED EXPORT</span>
          </span>
        </div>

        {/* Demo Samples Section */}
        <div className="w-full max-w-xl pt-2 border-t border-[#1f2128]">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-bold font-syne text-zinc-400 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>TRY WITH A SAMPLE SCREENSHOT:</span>
            </span>
            {isLoadingSample && <span className="text-zinc-200 font-semibold font-mono animate-pulse">Loading sample...</span>}
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
                className="p-3 rounded-none bg-[#141519] hover:bg-[#1c1e25] border border-[#23252b] hover:border-zinc-500 flex flex-col items-center text-center transition group active:scale-95 disabled:opacity-50 shadow-sm"
              >
                <div className="w-8 h-8 rounded-none bg-[#202229] group-hover:bg-white group-hover:text-zinc-950 text-zinc-300 flex items-center justify-center mb-1.5 transition">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="font-bold font-syne text-xs text-zinc-200 group-hover:text-white">{label}</span>
                <span className="text-[10px] text-zinc-500">{desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center space-x-4 text-xs text-zinc-500 pt-2 font-mono">
          <span className="font-bold font-syne text-zinc-400">Redactly</span>
          <span>·</span>
          <span>100% Client-Side</span>
          <span>·</span>
          <a
            href="https://github.com/Shezan-op/redactly"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-300 hover:text-white underline underline-offset-2 transition"
          >
            GitHub Repository
          </a>
        </div>
      </div>
    </div>
  );
};
