import React from 'react';
import { Keyboard, X } from 'lucide-react';
import { useEditor } from '../context/EditorContext';

export const ShortcutsGuideModal: React.FC = () => {
  const { isShortcutsOpen, setIsShortcutsOpen } = useEditor();

  if (!isShortcutsOpen) return null;

  const shortcutGroups = [
    {
      category: 'Tools & Drawing',
      items: [
        { keys: ['V'], desc: 'Select & Move Tool' },
        { keys: ['R'], desc: 'Rectangle Redact' },
        { keys: ['C'], desc: 'Circle / Oval Redact' },
        { keys: ['B'], desc: 'Freehand Brush Redact' },
        { keys: ['W'], desc: 'Watermark Tool' },
        { keys: ['1'], desc: 'Switch to Blur Style' },
        { keys: ['2'], desc: 'Switch to Pixelate Style' },
        { keys: ['3'], desc: 'Switch to Blackout Style' },
      ],
    },
    {
      category: 'Canvas & Navigation',
      items: [
        { keys: ['Space', '+ Drag'], desc: 'Pan Canvas' },
        { keys: ['Scroll'], desc: 'Zoom In / Out' },
        { keys: ['Escape'], desc: 'Deselect / Cancel Action' },
      ],
    },
    {
      category: 'Editing & Export',
      items: [
        { keys: ['Ctrl/Cmd', 'Z'], desc: 'Undo' },
        { keys: ['Ctrl/Cmd', 'Shift', 'Z'], desc: 'Redo' },
        { keys: ['Delete / Backspace'], desc: 'Delete Selected Object' },
        { keys: ['Ctrl/Cmd', 'S'], desc: 'Export Protected Image' },
        { keys: ['?'], desc: 'Toggle Shortcuts Modal' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Keyboard Shortcuts</h2>
              <p className="text-xs text-slate-400">Boost your privacy workflow with hotkeys</p>
            </div>
          </div>
          <button
            onClick={() => setIsShortcutsOpen(false)}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {shortcutGroups.map((group) => (
            <div key={group.category} className="space-y-2">
              <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {group.category}
              </h3>
              <div className="bg-slate-950/60 rounded-xl border border-slate-800 divide-y divide-slate-800/80">
                {group.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5">
                    <span className="text-slate-300 font-medium">{item.desc}</span>
                    <div className="flex items-center space-x-1">
                      {item.keys.map((k, ki) => (
                        <kbd
                          key={ki}
                          className="px-2 py-0.5 text-[11px] font-mono font-semibold text-slate-200 bg-slate-800 border border-slate-700 rounded shadow-sm"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={() => setIsShortcutsOpen(false)}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-md shadow-indigo-600/30"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
