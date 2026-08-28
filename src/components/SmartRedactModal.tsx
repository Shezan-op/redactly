import React, { useState } from 'react';
import {
  Check,
  CheckSquare,
  EyeOff,
  Grid,
  Key,
  Mail,
  Phone,
  ShieldAlert,
  Square,
  User,
  X,
  Zap,
} from 'lucide-react';
import { useEditor } from '../context/EditorContext';
import type { RedactionStyle, SensitiveDataType } from '../engine/types';

export const SmartRedactModal: React.FC = () => {
  const {
    isSmartRedactModalOpen,
    setIsSmartRedactModalOpen,
    smartDetections,
    applySmartDetections,
  } = useEditor();

  const [selectedIds, setSelectedIds] = useState<string[]>(
    smartDetections.map((d) => d.id)
  );
  const [chosenStyle, setChosenStyle] = useState<RedactionStyle>('blur');

  if (!isSmartRedactModalOpen) return null;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === smartDetections.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(smartDetections.map((d) => d.id));
    }
  };

  const handleApply = () => {
    applySmartDetections(selectedIds, chosenStyle);
  };

  const getTypeIcon = (type: SensitiveDataType) => {
    switch (type) {
      case 'email':
        return <Mail className="w-3.5 h-3.5 text-cyan-400" />;
      case 'phone':
        return <Phone className="w-3.5 h-3.5 text-emerald-400" />;
      case 'api_key':
        return <Key className="w-3.5 h-3.5 text-amber-400" />;
      case 'face':
        return <User className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                Potential Sensitive Information Detected
              </h2>
              <p className="text-xs text-slate-400">
                {smartDetections.length > 0
                  ? `Found ${smartDetections.length} candidate sensitive regions in screenshot`
                  : 'No sensitive patterns detected automatically'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSmartRedactModalOpen(false)}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {smartDetections.length === 0 ? (
            <div className="text-center py-6 text-slate-400 space-y-2">
              <p>No obvious email addresses or API keys were detected.</p>
              <p className="text-slate-500 text-[11px]">
                You can still manually draw rectangles, circles, or brush strokes over any area!
              </p>
            </div>
          ) : (
            <>
              {/* Redaction Style Choice */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Apply Style to Detected Regions
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'blur', label: 'Blur', icon: EyeOff },
                    { id: 'pixelate', label: 'Pixelate', icon: Grid },
                    { id: 'blackout', label: 'Blackout', icon: Square },
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setChosenStyle(id as RedactionStyle)}
                      className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg border font-medium transition ${
                        chosenStyle === id
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Detected Items List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Detected Items ({selectedIds.length}/{smartDetections.length} selected)
                  </span>
                  <button
                    onClick={selectAll}
                    className="text-[11px] text-indigo-400 hover:underline flex items-center space-x-1"
                  >
                    <CheckSquare className="w-3 h-3" />
                    <span>{selectedIds.length === smartDetections.length ? 'Deselect All' : 'Select All'}</span>
                  </button>
                </div>

                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {smartDetections.map((item) => {
                    const isSelected = selectedIds.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleSelect(item.id)}
                        className={`flex items-center justify-between p-2.5 rounded-lg border transition cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-950/40 border-indigo-500/60 text-slate-200'
                            : 'bg-slate-800/30 border-slate-800 text-slate-500 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(item.id)}
                            className="rounded text-indigo-600 bg-slate-700 border-slate-600 cursor-pointer"
                          />
                          <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center shrink-0">
                            {getTypeIcon(item.type)}
                          </div>
                          <div className="truncate">
                            <div className="font-semibold text-xs text-slate-200 truncate">
                              {item.label}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono truncate">
                              {item.previewText}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 shrink-0 ml-2">
                          {item.width}×{item.height}px
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            onClick={() => setIsSmartRedactModalOpen(false)}
            className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            Ignore & Close
          </button>

          {smartDetections.length > 0 && (
            <div className="flex space-x-2">
              <button
                disabled={selectedIds.length === 0}
                onClick={handleApply}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition disabled:opacity-40 shadow-md shadow-indigo-600/30 flex items-center space-x-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>
                  {selectedIds.length === smartDetections.length
                    ? `Redact All (${smartDetections.length})`
                    : `Redact Selected (${selectedIds.length})`}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
