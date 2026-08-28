import React from 'react';
import { CanvasWorkspace } from './components/CanvasWorkspace';
import { ExportModal } from './components/ExportModal';
import { Header } from './components/Header';
import { LandingUpload } from './components/LandingUpload';
import { PropertiesPanel } from './components/PropertiesPanel';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { ShortcutsGuideModal } from './components/ShortcutsGuideModal';
import { SmartRedactModal } from './components/SmartRedactModal';
import { Toolbar } from './components/Toolbar';
import { EditorProvider, useEditor } from './context/EditorContext';

const MainApp: React.FC = () => {
  const { originalImage } = useEditor();

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Top Application Header */}
      <Header />

      {/* Main Workspace or Landing View */}
      {originalImage ? (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          {/* Left Vertical Toolbar */}
          <Toolbar />

          {/* Center Interactive Canvas Viewport */}
          <CanvasWorkspace />

          {/* Right Properties & Settings Panel */}
          <PropertiesPanel />
        </div>
      ) : (
        <LandingUpload />
      )}

      {/* Global Modals & Dialogs */}
      <SmartRedactModal />
      <ExportModal />
      <ResetConfirmModal />
      <ShortcutsGuideModal />
    </div>
  );
};

export function App() {
  return (
    <EditorProvider>
      <MainApp />
    </EditorProvider>
  );
}

export default App;
