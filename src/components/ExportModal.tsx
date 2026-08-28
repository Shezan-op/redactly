import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  Clipboard,
  Download,
  FileCheck2,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useEditor } from '../context/EditorContext';
import {
  copyToClipboard,
  exportProtectedImage,
  generateProtectedFilename,
} from '../engine/exportEngine';
import type { ExportSettings } from '../engine/types';

export const ExportModal: React.FC = () => {
  const {
    originalImage,
    fileName,
    imageDimensions,
    redactions,
    watermark,
    logo,
    adjustments,
    crop,
    logoImgElement,
    isExportModalOpen,
    setIsExportModalOpen,
  } = useEditor();

  const [format, setFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [quality, setQuality] = useState<number>(0.92);
  const [scale, setScale] = useState<number>(1);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isExportModalOpen || !originalImage) return null;

  const croppedW = crop.active ? crop.width : imageDimensions.width;
  const croppedH = crop.active ? crop.height : imageDimensions.height;
  const outW = Math.round(croppedW * scale);
  const outH = Math.round(croppedH * scale);

  const finalFilename = generateProtectedFilename(fileName, format);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const settings: ExportSettings = {
        format,
        quality,
        scale,
        includeWatermark: watermark.enabled,
        stripMetadata: true,
      };

      await exportProtectedImage(
        {
          originalImage,
          redactions,
          watermark,
          logo,
          adjustments,
          crop,
          logoImgElement,
        },
        settings,
        fileName
      );

      setIsExportModalOpen(false);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyClipboard = async () => {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Export Protected Image</h2>
              <p className="text-xs text-slate-400">
                Permanently flatten all privacy redactions and watermarks
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsExportModalOpen(false)}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Format Selector */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Export Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'png', label: 'PNG', desc: 'Lossless · Crisp Quality' },
                { id: 'jpeg', label: 'JPEG', desc: 'Small file size' },
                { id: 'webp', label: 'WebP', desc: 'Modern Web standard' },
              ].map(({ id, label, desc }) => (
                <button
                  key={id}
                  onClick={() => setFormat(id as 'png' | 'jpeg' | 'webp')}
                  className={`p-3 rounded-xl border text-left transition ${
                    format === id
                      ? 'bg-indigo-600/15 border-indigo-500/80 text-indigo-300 ring-1 ring-indigo-500/50'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <div className="font-bold text-xs text-slate-100">{label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Quality Slider for JPEG / WebP */}
          {format !== 'png' && (
            <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">Compression Quality</span>
                <span className="font-mono text-slate-400">{Math.round(quality * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.4"
                max="1.0"
                step="0.05"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 pt-1">
                <span>Smaller Size (60%)</span>
                <span>Balanced (85%)</span>
                <span>Max Quality (100%)</span>
              </div>
            </div>
          )}

          {/* Resolution Scale */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Output Resolution
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { scaleVal: 1, label: 'Original (1x)', res: `${croppedW} × ${croppedH}` },
                { scaleVal: 2, label: 'High-Res (2x)', res: `${croppedW * 2} × ${croppedH * 2}` },
                { scaleVal: 0.5, label: 'Half (0.5x)', res: `${Math.round(croppedW * 0.5)} × ${Math.round(croppedH * 0.5)}` },
              ].map(({ scaleVal, label, res }) => (
                <button
                  key={scaleVal}
                  onClick={() => setScale(scaleVal)}
                  className={`p-2.5 rounded-lg border text-left transition ${
                    scale === scaleVal
                      ? 'bg-indigo-600/15 border-indigo-500/80 text-indigo-300'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <div className="font-semibold text-xs text-slate-200">{label}</div>
                  <div className="text-[10px] font-mono text-slate-500 mt-0.5">{res} px</div>
                </button>
              ))}
            </div>
          </div>

          {/* Filename Preview */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <FileCheck2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-mono text-xs text-slate-200 truncate max-w-[340px]">
                {finalFilename}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              {outW}×{outH}
            </span>
          </div>

          {/* Safety Checklist (Feature 19) */}
          <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>Protection & Privacy Guarantee</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-300">
              <li className="flex items-center space-x-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  <strong>{redactions.length} Redactions</strong> permanently baked into pixel matrix (unrecoverable)
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  {watermark.enabled || logo.enabled ? 'Watermarks flattened' : 'No watermarks active'}
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>EXIF and sensitive device metadata completely stripped</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>100% processed locally in browser memory</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            onClick={handleCopyClipboard}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Clipboard className="w-3.5 h-3.5 text-slate-300" />
                <span>Copy PNG</span>
              </>
            )}
          </button>

          <div className="flex space-x-2">
            <button
              onClick={() => setIsExportModalOpen(false)}
              className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              disabled={isExporting}
              onClick={handleExport}
              className="px-5 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition flex items-center space-x-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Processing...' : 'Download Image'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
