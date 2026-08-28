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
        return <Mail className="w-3.5 h-3.5 text-zinc-300" />;
      case 'phone':
        return <Phone className="w-3.5 h-3.5 text-emerald-400" />;
      case 'api_key':
        return <Key className="w-3.5 h-3.5 text-amber-400" />;
      case 'face':
        return <User className="w-3.5 h-3.5 text-zinc-300" />;
      default:
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-100">
      <div className="w-full max-w-lg bg-[#121317] border border-[#272933] rounded-none shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-[#20222a] flex items-center justify-between bg-[#0a0b0e]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-none bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Zap className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-syne text-white">
                SENSITIVE INFORMATION DETECTED
              </h2>
              <p className="text-xs text-zinc-400">
                {smartDetections.length > 0
                  ? `Found ${smartDetections.length} candidate sensitive regions in screenshot`
                  : 'No sensitive patterns detected automatically'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSmartRedactModalOpen(false)}
            className="text-zinc-400 hover:text-white p-1.5 rounded-none hover:bg-[#1f2128] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs">
          {smartDetections.length === 0 ? (
            <div className="text-center py-6 text-zinc-400 space-y-2">
              <p>No obvious email addresses or API keys were detected.</p>
              <p className="text-zinc-500 text-[11px]">
                You can still manually draw rectangles, circles, or brush strokes over any area!
              </p>
            </div>
          ) : (
            <>
              {/* Redaction Style Choice */}
              <div>
                <label className="text-[11px] font-bold font-syne text-zinc-400 uppercase tracking-wider block mb-2">
                  Apply Style to Detected Regions
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'blur', label: 'Blur', icon: EyeOff },
                    { id: 'pixelate', label: 'Pixelate', icon: Grid },
                    { id: 'blackout', label: 'Blackout', icon: Square },
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setChosenStyle(id as RedactionStyle)}
                      className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded-none border font-bold font-syne transition ${
                        chosenStyle === id
                          ? 'bg-white border-white text-zinc-950 shadow-sm'
                          : 'bg-[#18191f] border-[#272932] text-zinc-400 hover:bg-[#20222a] hover:text-white'
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
                  <span className="text-[11px] font-bold font-syne text-zinc-400 uppercase tracking-wider">
                    Detected Items ({selectedIds.length}/{smartDetections.length} selected)
                  </span>
                  <button
                    onClick={selectAll}
                    className="text-[11px] text-zinc-300 hover:text-white font-semibold flex items-center space-x-1"
                  >
                    <CheckSquare className="w-3 h-3" />
                    <span>{selectedIds.length === smartDetections.length ? 'Deselect All' : 'Select All'}</span>
                  </button>
                </div>

                <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                  {smartDetections.map((item) => {
                    const isSelected = selectedIds.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleSelect(item.id)}
                        className={`flex items-center justify-between p-2.5 rounded-none border transition cursor-pointer ${
                          isSelected
                            ? 'bg-[#1e2028] border-zinc-500 text-white'
                            : 'bg-[#141519] border-[#23252b] text-zinc-400 hover:bg-[#1a1b22]'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(item.id)}
                            className="rounded-none text-zinc-900 bg-zinc-800 border-zinc-700 cursor-pointer"
                          />
                          <div className="w-5 h-5 rounded-none bg-[#252731] flex items-center justify-center shrink-0">
                            {getTypeIcon(item.type)}
                          </div>
                          <div className="truncate">
                            <div className="font-bold text-xs text-zinc-100 truncate font-syne">
                              {item.label}
                            </div>
                            <div className="text-[10px] text-zinc-400 font-mono truncate">
                              {item.previewText}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500 shrink-0 ml-2">
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
        <div className="p-4 border-t border-[#20222a] bg-[#0a0b0e] flex items-center justify-between">
          <button
            onClick={() => setIsSmartRedactModalOpen(false)}
            className="px-3.5 py-2 rounded-none text-xs font-semibold text-zinc-400 hover:text-white hover:bg-[#1f2128] transition"
          >
            Ignore & Close
          </button>

          {smartDetections.length > 0 && (
            <div className="flex space-x-2">
              <button
                disabled={selectedIds.length === 0}
                onClick={handleApply}
                className="px-4 py-2 rounded-none text-xs font-bold font-syne text-zinc-950 bg-white hover:bg-zinc-200 transition disabled:opacity-40 shadow-sm flex items-center space-x-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>
                  {selectedIds.length === smartDetections.length
                    ? `REDACT ALL (${smartDetections.length})`
                    : `REDACT SELECTED (${selectedIds.length})`}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
