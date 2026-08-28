import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useEditor } from '../context/EditorContext';

export const ResetConfirmModal: React.FC = () => {
  const { isResetConfirmOpen, setIsResetConfirmOpen, resetAll } = useEditor();

  if (!isResetConfirmOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Reset Editor?</h2>
              <p className="text-xs text-slate-400">Clear all edits and start over</p>
            </div>
          </div>
          <button
            onClick={() => setIsResetConfirmOpen(false)}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 text-xs text-slate-300 space-y-2">
          <p>
            This action will clear all redactions, watermark text/logo, adjustments, crop, and undo history.
          </p>
          <p className="text-slate-400 text-[11px]">
            You will return to the landing screen to upload a new image.
          </p>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end space-x-2">
          <button
            onClick={() => setIsResetConfirmOpen(false)}
            className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={resetAll}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/30 transition"
          >
            Reset Everything
          </button>
        </div>
      </div>
    </div>
  );
};
