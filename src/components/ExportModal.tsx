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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#121317] border border-[#272933] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#20222a] flex items-center justify-between bg-[#0a0b0e]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Export Protected Image</h2>
              <p className="text-xs text-zinc-400">
                Permanently flatten all privacy redactions and watermarks
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsExportModalOpen(false)}
            className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-[#1f2128] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Format Selector */}
          <div>
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
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
                      ? 'bg-white border-white text-zinc-950 shadow-md'
                      : 'bg-[#18191f] border-[#272932] text-zinc-400 hover:bg-[#20222a] hover:text-white'
                  }`}
                >
                  <div className="font-bold text-xs">{label}</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Quality Slider for JPEG / WebP */}
          {format !== 'png' && (
            <div className="bg-[#141519] p-3.5 rounded-xl border border-[#23252b] space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-200 font-medium">Compression Quality</span>
                <span className="font-mono text-zinc-400 font-bold">{Math.round(quality * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.4"
                max="1.0"
                step="0.05"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 pt-1">
                <span>Smaller (60%)</span>
                <span>Balanced (85%)</span>
                <span>Max (100%)</span>
              </div>
            </div>
          )}

          {/* Resolution Scale */}
          <div>
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
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
                  className={`p-2.5 rounded-xl border text-left transition ${
                    scale === scaleVal
                      ? 'bg-[#22242c] border-zinc-400 text-white shadow-sm'
                      : 'bg-[#18191f] border-[#272932] text-zinc-400 hover:bg-[#20222a] hover:text-white'
                  }`}
                >
                  <div className="font-bold text-xs text-zinc-100">{label}</div>
                  <div className="text-[10px] font-mono text-zinc-500 mt-0.5">{res} px</div>
                </button>
              ))}
            </div>
          </div>

          {/* Filename Preview */}
          <div className="bg-[#090a0c] p-3 rounded-xl border border-[#23252b] flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <FileCheck2 className="w-4 h-4 text-zinc-300 shrink-0" />
              <span className="font-mono text-xs text-zinc-200 truncate max-w-[340px]">
                {finalFilename}
              </span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">
              {outW}×{outH}
            </span>
          </div>

          {/* Safety Checklist */}
          <div className="bg-[#141519] border border-[#272933] rounded-xl p-3.5 space-y-2">
            <div className="flex items-center space-x-2 text-zinc-200 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Protection & Privacy Guarantee</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-zinc-400">
              <li className="flex items-center space-x-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  <strong className="text-zinc-200">{redactions.length} Redactions</strong> permanently baked into pixel matrix
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
        <div className="p-4 border-t border-[#20222a] bg-[#0a0b0e] flex items-center justify-between">
          <button
            onClick={handleCopyClipboard}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-200 bg-[#18191f] hover:bg-[#22242c] border border-[#2a2c38] transition"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Clipboard className="w-3.5 h-3.5 text-zinc-400" />
                <span>Copy PNG</span>
              </>
            )}
          </button>

          <div className="flex space-x-2">
            <button
              onClick={() => setIsExportModalOpen(false)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-[#1f2128] transition"
            >
              Cancel
            </button>
            <button
              disabled={isExporting}
              onClick={handleExport}
              className="px-5 py-2 rounded-xl text-xs font-bold text-zinc-950 bg-white hover:bg-zinc-200 shadow-lg shadow-white/5 transition flex items-center space-x-2 disabled:opacity-50"
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
