import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useEditor } from '../context/EditorContext';

export const ResetConfirmModal: React.FC = () => {
  const { isResetConfirmOpen, setIsResetConfirmOpen, resetAll } = useEditor();

  if (!isResetConfirmOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-100">
      <div className="w-full max-w-sm bg-[#121317] border border-[#272933] rounded-none shadow-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[#20222a] flex items-center justify-between bg-[#0a0b0e]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-none bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-syne text-white">RESET EDITOR?</h2>
              <p className="text-xs text-zinc-400">Clear all edits and start over</p>
            </div>
          </div>
          <button
            onClick={() => setIsResetConfirmOpen(false)}
            className="text-zinc-400 hover:text-white p-1.5 rounded-none hover:bg-[#1f2128] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 text-xs text-zinc-300 space-y-2">
          <p>
            This action will clear all redactions, watermark text/logo, adjustments, crop, and undo history.
          </p>
          <p className="text-zinc-500 text-[11px]">
            You will return to the landing screen to upload a new image.
          </p>
        </div>

        <div className="p-3.5 border-t border-[#20222a] bg-[#0a0b0e] flex items-center justify-end space-x-2">
          <button
            onClick={() => setIsResetConfirmOpen(false)}
            className="px-3.5 py-2 rounded-none text-xs font-semibold text-zinc-400 hover:text-white hover:bg-[#1f2128] transition"
          >
            Cancel
          </button>
          <button
            onClick={resetAll}
            className="px-4 py-2 rounded-none text-xs font-bold font-syne text-white bg-rose-600 hover:bg-rose-500 transition"
          >
            RESET EVERYTHING
          </button>
        </div>
      </div>
    </div>
  );
};
