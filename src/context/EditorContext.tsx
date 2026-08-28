import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { WATERMARK_PRESETS } from '../engine/presets';
import { detectSensitiveContent } from '../engine/smartDetector';
import type {
  CropState,
  HistorySnapshot,
  ImageAdjustments,
  LogoWatermarkConfig,
  RedactionLayer,
  RedactionStyle,
  ShapeType,
  SmartDetectionItem,
  ToolType,
  WatermarkConfig,
} from '../engine/types';

const DEFAULT_WATERMARK: WatermarkConfig = {
  enabled: false,
  text: 'CONFIDENTIAL',
  fontFamily: 'Inter',
  fontSize: 36,
  fontWeight: '700',
  color: '#ffffff',
  opacity: 0.35,
  rotation: -30,
  layoutMode: 'diagonal',
  positionPreset: 'center',
  customX: 0.5,
  customY: 0.5,
  spacingX: 120,
  spacingY: 90,
  shadow: true,
};

const DEFAULT_LOGO: LogoWatermarkConfig = {
  enabled: false,
  imageSrc: null,
  positionPreset: 'bottom-right',
  customX: 0.85,
  customY: 0.85,
  scale: 0.15,
  opacity: 0.85,
  rotation: 0,
};

const DEFAULT_ADJUSTMENTS: ImageAdjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  exposure: 0,
  sharpness: 0,
};

const DEFAULT_CROP: CropState = {
  active: false,
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  aspectRatio: 'free',
};

interface EditorContextValue {
  // Image
  originalImage: HTMLImageElement | null;
  imageSrc: string | null;
  fileName: string;
  fileSize: number;
  imageDimensions: { width: number; height: number };
  loadImage: (source: File | string, name?: string) => Promise<void>;
  replaceImage: () => void;
  resetAll: () => void;

  // Tools & Settings
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  redactionStyle: RedactionStyle;
  setRedactionStyle: (style: RedactionStyle) => void;
  redactionShape: ShapeType;
  setRedactionShape: (shape: ShapeType) => void;
  brushRadius: number;
  setBrushRadius: (r: number) => void;
  blurStrength: number;
  setBlurStrength: (b: number) => void;
  pixelSize: number;
  setPixelSize: (p: number) => void;
  solidColor: string;
  setSolidColor: (c: string) => void;
  solidOpacity: number;
  setSolidOpacity: (o: number) => void;

  // Redactions
  redactions: RedactionLayer[];
  selectedLayerId: string | null;
  setSelectedLayerId: (id: string | null) => void;
  addRedaction: (layer: Omit<RedactionLayer, 'id'>) => string;
  updateRedaction: (id: string, updates: Partial<RedactionLayer>) => void;
  deleteRedaction: (id: string) => void;
  reorderRedactions: (startIndex: number, endIndex: number) => void;
  toggleLayerVisibility: (id: string) => void;

  // Watermark
  watermark: WatermarkConfig;
  updateWatermark: (updates: Partial<WatermarkConfig>) => void;
  applyWatermarkPreset: (presetId: string) => void;

  // Logo
  logo: LogoWatermarkConfig;
  logoImgElement: HTMLImageElement | null;
  updateLogo: (updates: Partial<LogoWatermarkConfig>) => void;
  loadLogoImage: (file: File) => Promise<void>;
  removeLogoImage: () => void;

  // Adjustments & Crop
  adjustments: ImageAdjustments;
  updateAdjustments: (updates: Partial<ImageAdjustments>) => void;
  resetAdjustments: () => void;
  crop: CropState;
  updateCrop: (updates: Partial<CropState>) => void;
  applyCrop: () => void;
  cancelCrop: () => void;

  // Canvas Viewport & Zoom
  zoom: number;
  setZoom: (zoomOrFn: number | ((prev: number) => number)) => void;
  pan: { x: number; y: number };
  setPan: (panOrFn: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => void;
  fitToScreen: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomTo100: () => void;

  // Preview & Comparison
  showBeforeAfter: boolean;
  setShowBeforeAfter: (val: boolean | ((prev: boolean) => boolean)) => void;
  beforeAfterSplit: number;
  setBeforeAfterSplit: (val: number) => void;

  // History / Undo / Redo
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  // Smart Detection
  smartDetections: SmartDetectionItem[];
  isDetecting: boolean;
  runSmartDetection: () => Promise<void>;
  applySmartDetections: (selectedIds: string[], style: RedactionStyle) => void;
  setSmartDetections: React.Dispatch<React.SetStateAction<SmartDetectionItem[]>>;

  // Modals & Popups
  isExportModalOpen: boolean;
  setIsExportModalOpen: (open: boolean) => void;
  isSmartRedactModalOpen: boolean;
  setIsSmartRedactModalOpen: (open: boolean) => void;
  isShortcutsOpen: boolean;
  setIsShortcutsOpen: (open: boolean) => void;
  isResetConfirmOpen: boolean;
  setIsResetConfirmOpen: (open: boolean) => void;
}

const EditorContext = createContext<EditorContextValue | null>(null);

const MAX_HISTORY_STEPS = 40;

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Image State
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('screenshot.png');
  const [fileSize, setFileSize] = useState<number>(0);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Tool State
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [redactionStyle, setRedactionStyle] = useState<RedactionStyle>('blur');
  const [redactionShape, setRedactionShape] = useState<ShapeType>('rectangle');
  const [brushRadius, setBrushRadius] = useState<number>(16);
  const [blurStrength, setBlurStrength] = useState<number>(18);
  const [pixelSize, setPixelSize] = useState<number>(14);
  const [solidColor, setSolidColor] = useState<string>('#000000');
  const [solidOpacity, setSolidOpacity] = useState<number>(1.0);

  // Redaction Layers
  const [redactions, setRedactions] = useState<RedactionLayer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  // Watermarks
  const [watermark, setWatermark] = useState<WatermarkConfig>(DEFAULT_WATERMARK);
  const [logo, setLogo] = useState<LogoWatermarkConfig>(DEFAULT_LOGO);
  const [logoImgElement, setLogoImgElement] = useState<HTMLImageElement | null>(null);

  // Adjustments & Crop
  const [adjustments, setAdjustments] = useState<ImageAdjustments>(DEFAULT_ADJUSTMENTS);
  const [crop, setCrop] = useState<CropState>(DEFAULT_CROP);

  // Viewport
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showBeforeAfter, setShowBeforeAfter] = useState<boolean>(false);
  const [beforeAfterSplit, setBeforeAfterSplit] = useState<number>(0.5);

  // Smart Detection
  const [smartDetections, setSmartDetections] = useState<SmartDetectionItem[]>([]);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);

  // Modals
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isSmartRedactModalOpen, setIsSmartRedactModalOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);

  // History Engine
  const [history, setHistory] = useState<HistorySnapshot[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const isInternalHistoryUpdate = useRef(false);

  // Save Snapshot to History
  const pushHistorySnapshot = useCallback(
    (customSnapshot?: Partial<HistorySnapshot>) => {
      if (isInternalHistoryUpdate.current) return;

      const snapshot: HistorySnapshot = {
        redactions: customSnapshot?.redactions ?? redactions,
        watermark: customSnapshot?.watermark ?? watermark,
        logo: customSnapshot?.logo ?? logo,
        adjustments: customSnapshot?.adjustments ?? adjustments,
        crop: customSnapshot?.crop ?? crop,
        selectedLayerId: customSnapshot?.selectedLayerId ?? selectedLayerId,
      };

      setHistory((prev) => {
        const sliced = prev.slice(0, historyIndex + 1);
        const nextHistory = [...sliced, snapshot];
        if (nextHistory.length > MAX_HISTORY_STEPS) {
          nextHistory.shift();
        }
        return nextHistory;
      });

      setHistoryIndex((prev) => Math.min(prev + 1, MAX_HISTORY_STEPS - 1));
    },
    [redactions, watermark, logo, adjustments, crop, selectedLayerId, historyIndex]
  );

  // Undo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      isInternalHistoryUpdate.current = true;
      const targetSnapshot = history[historyIndex - 1];
      setRedactions(targetSnapshot.redactions);
      setWatermark(targetSnapshot.watermark);
      setLogo(targetSnapshot.logo);
      setAdjustments(targetSnapshot.adjustments);
      setCrop(targetSnapshot.crop);
      setSelectedLayerId(targetSnapshot.selectedLayerId);
      setHistoryIndex(historyIndex - 1);
      setTimeout(() => {
        isInternalHistoryUpdate.current = false;
      }, 50);
    }
  }, [history, historyIndex]);

  // Redo
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isInternalHistoryUpdate.current = true;
      const targetSnapshot = history[historyIndex + 1];
      setRedactions(targetSnapshot.redactions);
      setWatermark(targetSnapshot.watermark);
      setLogo(targetSnapshot.logo);
      setAdjustments(targetSnapshot.adjustments);
      setCrop(targetSnapshot.crop);
      setSelectedLayerId(targetSnapshot.selectedLayerId);
      setHistoryIndex(historyIndex + 1);
      setTimeout(() => {
        isInternalHistoryUpdate.current = false;
      }, 50);
    }
  }, [history, historyIndex]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Load Image Handler
  const loadImage = useCallback(async (source: File | string, name?: string) => {
    let srcUrl = '';
    let fname = name || 'screenshot.png';
    let fsize = 0;

    if (source instanceof File) {
      fname = source.name;
      fsize = source.size;
      srcUrl = URL.createObjectURL(source);
    } else {
      srcUrl = source;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    await new Promise<void>((resolve, reject) => {
      img.onload = () => {
        setOriginalImage(img);
        setImageSrc(srcUrl);
        setFileName(fname);
        setFileSize(fsize);
        setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        setRedactions([]);
        setSelectedLayerId(null);
        setWatermark(DEFAULT_WATERMARK);
        setLogo(DEFAULT_LOGO);
        setAdjustments(DEFAULT_ADJUSTMENTS);
        setCrop({
          active: false,
          x: 0,
          y: 0,
          width: img.naturalWidth,
          height: img.naturalHeight,
          aspectRatio: 'free',
        });

        // Initialize history with clean state
        const initialSnapshot: HistorySnapshot = {
          redactions: [],
          watermark: DEFAULT_WATERMARK,
          logo: DEFAULT_LOGO,
          adjustments: DEFAULT_ADJUSTMENTS,
          crop: {
            active: false,
            x: 0,
            y: 0,
            width: img.naturalWidth,
            height: img.naturalHeight,
            aspectRatio: 'free',
          },
          selectedLayerId: null,
        };
        setHistory([initialSnapshot]);
        setHistoryIndex(0);

        // Auto zoom fit
        setZoom(1);
        setPan({ x: 0, y: 0 });
        setActiveTool('select');
        resolve();
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = srcUrl;
    });
  }, []);

  // Replace current image without resetting settings
  const replaceImage = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png,image/jpeg,image/jpg,image/webp';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        loadImage(file);
      }
    };
    input.click();
  }, [loadImage]);

  // Reset entire editor
  const resetAll = useCallback(() => {
    setOriginalImage(null);
    setImageSrc(null);
    setFileName('screenshot.png');
    setFileSize(0);
    setImageDimensions({ width: 0, height: 0 });
    setRedactions([]);
    setSelectedLayerId(null);
    setWatermark(DEFAULT_WATERMARK);
    setLogo(DEFAULT_LOGO);
    setLogoImgElement(null);
    setAdjustments(DEFAULT_ADJUSTMENTS);
    setCrop(DEFAULT_CROP);
    setHistory([]);
    setHistoryIndex(-1);
    setActiveTool('select');
    setShowBeforeAfter(false);
    setIsResetConfirmOpen(false);
  }, []);

  // Redaction CRUD
  const addRedaction = useCallback(
    (layer: Omit<RedactionLayer, 'id'>): string => {
      const id = `layer-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newLayer: RedactionLayer = {
        ...layer,
        id,
      };

      const updated = [...redactions, newLayer];
      setRedactions(updated);
      setSelectedLayerId(id);
      pushHistorySnapshot({ redactions: updated, selectedLayerId: id });
      return id;
    },
    [redactions, pushHistorySnapshot]
  );

  const updateRedaction = useCallback(
    (id: string, updates: Partial<RedactionLayer>) => {
      const updated = redactions.map((l) => (l.id === id ? { ...l, ...updates } : l));
      setRedactions(updated);
      pushHistorySnapshot({ redactions: updated });
    },
    [redactions, pushHistorySnapshot]
  );

  const deleteRedaction = useCallback(
    (id: string) => {
      const updated = redactions.filter((l) => l.id !== id);
      setRedactions(updated);
      if (selectedLayerId === id) {
        setSelectedLayerId(null);
      }
      pushHistorySnapshot({ redactions: updated, selectedLayerId: null });
    },
    [redactions, selectedLayerId, pushHistorySnapshot]
  );

  const reorderRedactions = useCallback(
    (startIndex: number, endIndex: number) => {
      const result = Array.from(redactions);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      setRedactions(result);
      pushHistorySnapshot({ redactions: result });
    },
    [redactions, pushHistorySnapshot]
  );

  const toggleLayerVisibility = useCallback(
    (id: string) => {
      const updated = redactions.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l));
      setRedactions(updated);
      pushHistorySnapshot({ redactions: updated });
    },
    [redactions, pushHistorySnapshot]
  );

  // Watermark Updates
  const updateWatermark = useCallback(
    (updates: Partial<WatermarkConfig>) => {
      setWatermark((prev) => {
        const next = { ...prev, ...updates };
        pushHistorySnapshot({ watermark: next });
        return next;
      });
    },
    [pushHistorySnapshot]
  );

  const applyWatermarkPreset = useCallback(
    (presetId: string) => {
      const found = WATERMARK_PRESETS.find((p) => p.id === presetId);
      if (found) {
        setWatermark((prev) => {
          const next = { ...prev, ...found.config, enabled: true };
          pushHistorySnapshot({ watermark: next });
          return next;
        });
      }
    },
    [pushHistorySnapshot]
  );

  // Logo Updates
  const updateLogo = useCallback(
    (updates: Partial<LogoWatermarkConfig>) => {
      setLogo((prev) => {
        const next = { ...prev, ...updates };
        pushHistorySnapshot({ logo: next });
        return next;
      });
    },
    [pushHistorySnapshot]
  );

  const loadLogoImage = useCallback(
    async (file: File) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        setLogoImgElement(img);
        const next: LogoWatermarkConfig = {
          ...logo,
          enabled: true,
          imageSrc: url,
          fileName: file.name,
        };
        setLogo(next);
        pushHistorySnapshot({ logo: next });
      };
      img.src = url;
    },
    [logo, pushHistorySnapshot]
  );

  const removeLogoImage = useCallback(() => {
    setLogoImgElement(null);
    const next: LogoWatermarkConfig = {
      ...logo,
      enabled: false,
      imageSrc: null,
      fileName: undefined,
    };
    setLogo(next);
    pushHistorySnapshot({ logo: next });
  }, [logo, pushHistorySnapshot]);

  // Adjustments & Crop
  const updateAdjustments = useCallback(
    (updates: Partial<ImageAdjustments>) => {
      setAdjustments((prev) => {
        const next = { ...prev, ...updates };
        pushHistorySnapshot({ adjustments: next });
        return next;
      });
    },
    [pushHistorySnapshot]
  );

  const resetAdjustments = useCallback(() => {
    setAdjustments(DEFAULT_ADJUSTMENTS);
    pushHistorySnapshot({ adjustments: DEFAULT_ADJUSTMENTS });
  }, [pushHistorySnapshot]);

  const updateCrop = useCallback((updates: Partial<CropState>) => {
    setCrop((prev) => ({ ...prev, ...updates }));
  }, []);

  const applyCrop = useCallback(() => {
    setCrop((prev) => {
      const next = { ...prev, active: true };
      pushHistorySnapshot({ crop: next });
      return next;
    });
    setActiveTool('select');
  }, [pushHistorySnapshot]);

  const cancelCrop = useCallback(() => {
    setCrop((prev) => ({
      ...prev,
      active: false,
      x: 0,
      y: 0,
      width: imageDimensions.width,
      height: imageDimensions.height,
    }));
    setActiveTool('select');
  }, [imageDimensions]);

  // Zoom & Viewport
  const zoomIn = useCallback(() => setZoom((prev) => Math.min(4, +(prev * 1.2).toFixed(2))), []);
  const zoomOut = useCallback(() => setZoom((prev) => Math.max(0.15, +(prev / 1.2).toFixed(2))), []);
  const zoomTo100 = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);
  const fitToScreen = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Smart Redact Execution
  const runSmartDetection = useCallback(async () => {
    if (!originalImage) return;

    setIsDetecting(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = originalImage.naturalWidth;
      canvas.height = originalImage.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(originalImage, 0, 0);
        const results = await detectSensitiveContent(canvas);
        setSmartDetections(results);
        setIsSmartRedactModalOpen(true);
      }
    } finally {
      setIsDetecting(false);
    }
  }, [originalImage]);

  // Apply Smart Detections to Layers
  const applySmartDetections = useCallback(
    (selectedIds: string[], style: RedactionStyle) => {
      const toApply = smartDetections.filter((d) => selectedIds.includes(d.id));
      if (toApply.length === 0) return;

      const newLayers: RedactionLayer[] = toApply.map((item, idx) => ({
        id: `smart-${Date.now()}-${idx}`,
        name: `${item.label}`,
        type: item.type === 'face' ? 'ellipse' : 'rectangle',
        style,
        x: item.x,
        y: item.y,
        width: item.width,
        height: item.height,
        color: '#000000',
        opacity: 1.0,
        blurStrength: 20,
        pixelSize: 16,
        borderRadius: 4,
        visible: true,
      }));

      const updated = [...redactions, ...newLayers];
      setRedactions(updated);
      pushHistorySnapshot({ redactions: updated });
      setIsSmartRedactModalOpen(false);
    },
    [smartDetections, redactions, pushHistorySnapshot]
  );

  // Sync keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is inside an input, textarea or contenteditable element
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Undo: Ctrl+Z / Cmd+Z
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
        return;
      }

      // Redo: Ctrl+Y or Ctrl+Shift+Z / Cmd+Shift+Z
      if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        e.preventDefault();
        redo();
        return;
      }

      // Export: Ctrl+S / Cmd+S
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (originalImage) {
          setIsExportModalOpen(true);
        }
        return;
      }

      // Delete selected layer: Delete or Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedLayerId) {
          e.preventDefault();
          deleteRedaction(selectedLayerId);
        }
        return;
      }

      // Escape: Deselect / Exit tool
      if (e.key === 'Escape') {
        setSelectedLayerId(null);
        if (crop.active) {
          cancelCrop();
        }
        setActiveTool('select');
        return;
      }

      // Tool shortcuts (single keys)
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'v':
            setActiveTool('select');
            break;
          case 'r':
            setActiveTool('rectangle');
            setRedactionShape('rectangle');
            break;
          case 'c':
            setActiveTool('circle');
            setRedactionShape('circle');
            break;
          case 'b':
            setActiveTool('brush');
            setRedactionShape('brush');
            break;
          case 'w':
            setActiveTool('watermark');
            updateWatermark({ enabled: true });
            break;
          case '1':
            setRedactionStyle('blur');
            break;
          case '2':
            setRedactionStyle('pixelate');
            break;
          case '3':
            setRedactionStyle('blackout');
            break;
          case '?':
            setIsShortcutsOpen((prev) => !prev);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [
    originalImage,
    undo,
    redo,
    selectedLayerId,
    deleteRedaction,
    crop.active,
    cancelCrop,
    updateWatermark,
  ]);

  return (
    <EditorContext.Provider
      value={{
        originalImage,
        imageSrc,
        fileName,
        fileSize,
        imageDimensions,
        loadImage,
        replaceImage,
        resetAll,
        activeTool,
        setActiveTool,
        redactionStyle,
        setRedactionStyle,
        redactionShape,
        setRedactionShape,
        brushRadius,
        setBrushRadius,
        blurStrength,
        setBlurStrength,
        pixelSize,
        setPixelSize,
        solidColor,
        setSolidColor,
        solidOpacity,
        setSolidOpacity,
        redactions,
        selectedLayerId,
        setSelectedLayerId,
        addRedaction,
        updateRedaction,
        deleteRedaction,
        reorderRedactions,
        toggleLayerVisibility,
        watermark,
        updateWatermark,
        applyWatermarkPreset,
        logo,
        logoImgElement,
        updateLogo,
        loadLogoImage,
        removeLogoImage,
        adjustments,
        updateAdjustments,
        resetAdjustments,
        crop,
        updateCrop,
        applyCrop,
        cancelCrop,
        zoom,
        setZoom,
        pan,
        setPan,
        fitToScreen,
        zoomIn,
        zoomOut,
        zoomTo100,
        showBeforeAfter,
        setShowBeforeAfter,
        beforeAfterSplit,
        setBeforeAfterSplit,
        undo,
        redo,
        canUndo,
        canRedo,
        smartDetections,
        isDetecting,
        runSmartDetection,
        applySmartDetections,
        setSmartDetections,
        isExportModalOpen,
        setIsExportModalOpen,
        isSmartRedactModalOpen,
        setIsSmartRedactModalOpen,
        isShortcutsOpen,
        setIsShortcutsOpen,
        isResetConfirmOpen,
        setIsResetConfirmOpen,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};
