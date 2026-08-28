import React, { useState } from 'react';
import {
  Check,
  Clipboard,
  Columns,
  Download,
  HelpCircle,
  Image as ImageIcon,
  Minus,
  Plus,
  Redo2,
  RotateCcw,
  ShieldCheck,
  Undo2,
  ZoomIn,
} from 'lucide-react';
import { useEditor } from '../context/EditorContext';
import { copyToClipboard } from '../engine/exportEngine';

export const Header: React.FC = () => {
  const {
    originalImage,
    fileName,
    fileSize,
    imageDimensions,
    replaceImage,
    undo,
    redo,
    canUndo,
    canRedo,
    zoom,
    zoomIn,
    zoomOut,
    zoomTo100,
    fitToScreen,
    showBeforeAfter,
    setShowBeforeAfter,
    setIsExportModalOpen,
    setIsShortcutsOpen,
    setIsResetConfirmOpen,
    redactions,
    watermark,
    logo,
    adjustments,
    crop,
    logoImgElement,
  } = useEditor();

  const [copied, setCopied] = useState(false);

  const handleQuickCopy = async () => {
    if (!originalImage) return;
    const success = await copyToClipboard({
      originalImage,
      redactions,
      watermark,
      logo,
      adjustments,
      crop,
      logoImgElement,
    });
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formattedFileSize = fileSize > 0 
    ? fileSize > 1024 * 1024 
      ? `${(fileSize / (1024 * 1024)).toFixed(1)} MB` 
      : `${(fileSize / 1024).toFixed(0)} KB`
    : null;

  return (
    <header className="h-14 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 flex items-center justify-between select-none z-30 shrink-0">
      {/* Left: Branding & File Info */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-md shadow-indigo-500/20 ring-1 ring-white/20">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-sm text-slate-100 tracking-tight">Redactly</span>
            <span className="text-[10px] uppercase font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 px-1.5 py-0.5 rounded">
              Local-First
            </span>
          </div>
        </div>

        {originalImage && (
          <div className="hidden lg:flex items-center pl-3 border-l border-slate-800 space-x-2">
            <div className="flex items-center text-xs text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded-md border border-slate-700/50 max-w-[220px]">
              <ImageIcon className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
              <span className="truncate font-medium text-slate-200">{fileName}</span>
              <span className="mx-1.5 text-slate-600">·</span>
              <span className="shrink-0 text-slate-400">
                {imageDimensions.width}×{imageDimensions.height}
              </span>
              {formattedFileSize && (
                <>
                  <span className="mx-1.5 text-slate-600">·</span>
                  <span className="shrink-0 text-slate-400">{formattedFileSize}</span>
                </>
              )}
            </div>

            <button
              onClick={replaceImage}
              title="Replace current image with another"
              className="text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 px-2 py-1 rounded transition border border-transparent hover:border-slate-700"
            >
              Replace
            </button>
          </div>
        )}
      </div>

      {/* Center: Undo/Redo & Zoom Controls */}
      {originalImage && (
        <div className="flex items-center space-x-1.5 bg-slate-950/60 p-1 rounded-lg border border-slate-800/80">
          {/* Undo */}
          <button
            onClick={undo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className={`p-1.5 rounded-md transition ${
              canUndo
                ? 'text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95'
                : 'text-slate-600 cursor-not-allowed'
            }`}
          >
            <Undo2 className="w-4 h-4" />
          </button>

          {/* Redo */}
          <button
            onClick={redo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y or Ctrl+Shift+Z)"
            className={`p-1.5 rounded-md transition ${
              canRedo
                ? 'text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95'
                : 'text-slate-600 cursor-not-allowed'
            }`}
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <div className="h-4 w-[1px] bg-slate-800 mx-1" />

          {/* Zoom Out */}
          <button
            onClick={zoomOut}
            title="Zoom Out"
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          {/* Zoom Percentage */}
          <button
            onClick={zoomTo100}
            title="Reset to 100% Zoom"
            className="px-2 py-1 text-xs font-mono font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded transition min-w-[52px] text-center"
          >
            {Math.round(zoom * 100)}%
          </button>

          {/* Zoom In */}
          <button
            onClick={zoomIn}
            title="Zoom In"
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          {/* Fit */}
          <button
            onClick={fitToScreen}
            title="Fit to Screen"
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition text-xs font-medium"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-[1px] bg-slate-800 mx-1" />

          {/* Before / After Comparison */}
          <button
            onClick={() => setShowBeforeAfter((prev) => !prev)}
            title="Compare with Original Image"
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition ${
              showBeforeAfter
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Compare</span>
          </button>
        </div>
      )}

      {/* Right: Reset, Shortcuts, Copy & Export */}
      <div className="flex items-center space-x-2">
        {originalImage && (
          <>
            {/* Reset */}
            <button
              onClick={() => setIsResetConfirmOpen(true)}
              title="Reset all edits"
              className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border border-transparent hover:border-rose-900/50 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            {/* Quick Copy to Clipboard */}
            <button
              onClick={handleQuickCopy}
              title="Copy flattened protected image to clipboard"
              className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 hover:border-slate-600 transition active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Clipboard className="w-3.5 h-3.5 text-slate-300" />
                  <span>Copy</span>
                </>
              )}
            </button>

            {/* Main Export Action */}
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-md shadow-indigo-500/25 border border-indigo-400/30 transition active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Export Image</span>
            </button>
          </>
        )}

        {/* Keyboard Shortcuts trigger */}
        <button
          onClick={() => setIsShortcutsOpen(true)}
          title="Keyboard Shortcuts (?)"
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* GitHub Repo */}
        <a
          href="https://github.com/Shezan-op/redactly"
          target="_blank"
          rel="noopener noreferrer"
          title="View on GitHub"
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition flex items-center"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
        </a>
      </div>
    </header>
  );
};
