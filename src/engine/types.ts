export type ToolType = 
  | 'select'
  | 'rectangle'
  | 'square'
  | 'circle'
  | 'ellipse'
  | 'brush'
  | 'watermark'
  | 'logo'
  | 'smart_redact'
  | 'face_hide'
  | 'crop'
  | 'adjust';

export type RedactionStyle = 'solid' | 'blur' | 'pixelate' | 'blackout';

export type ShapeType = 'rectangle' | 'square' | 'circle' | 'ellipse' | 'brush';

export interface Point {
  x: number;
  y: number;
}

export interface RedactionLayer {
  id: string;
  name: string;
  type: ShapeType;
  style: RedactionStyle;
  x: number; // in image pixel coordinates
  y: number;
  width: number;
  height: number;
  points?: Point[]; // for freehand brush path
  brushRadius?: number;
  color: string; // hex or rgba
  opacity: number; // 0 to 1
  blurStrength: number; // 2 to 40
  pixelSize: number; // 4 to 32
  borderRadius?: number; // for rounded rectangles
  visible: boolean;
  locked?: boolean;
}

export type WatermarkLayoutMode = 'single' | 'repeated' | 'diagonal' | 'center' | 'pattern';

export type PositionPreset = 
  | 'top-left' 
  | 'top-center' 
  | 'top-right' 
  | 'center' 
  | 'bottom-left' 
  | 'bottom-center' 
  | 'bottom-right' 
  | 'custom';

export interface WatermarkConfig {
  enabled: boolean;
  text: string;
  fontFamily: string;
  fontSize: number; // in pt/px relative to image size
  fontWeight: '300' | '400' | '600' | '700' | '900';
  color: string;
  opacity: number; // 0 to 1
  rotation: number; // -180 to 180 degrees
  layoutMode: WatermarkLayoutMode;
  positionPreset: PositionPreset;
  customX: number; // normalized 0..1
  customY: number; // normalized 0..1
  spacingX: number; // for repeated/pattern mode
  spacingY: number; // for repeated/pattern mode
  shadow: boolean;
}

export interface LogoWatermarkConfig {
  enabled: boolean;
  imageSrc: string | null;
  fileName?: string;
  positionPreset: PositionPreset;
  customX: number; // normalized 0..1
  customY: number; // normalized 0..1
  scale: number; // 0.05 to 1.0 (relative to image width)
  opacity: number; // 0 to 1
  rotation: number; // -180 to 180 degrees
}

export interface ImageAdjustments {
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  saturation: number; // -100 to 100
  exposure: number; // -100 to 100
  sharpness: number; // 0 to 100
}

export type AspectRatioType = 'free' | '1:1' | '4:5' | '16:9' | '9:16' | '4:3';

export interface CropState {
  active: boolean;
  x: number; // in image pixel coordinates
  y: number;
  width: number;
  height: number;
  aspectRatio: AspectRatioType;
}

export type SensitiveDataType = 
  | 'email'
  | 'phone'
  | 'url'
  | 'api_key'
  | 'credit_card'
  | 'ip'
  | 'name'
  | 'face';

export interface SmartDetectionItem {
  id: string;
  type: SensitiveDataType;
  label: string;
  previewText: string;
  x: number;
  y: number;
  width: number;
  height: number;
  selected: boolean;
  confidence: number;
}

export interface HistorySnapshot {
  redactions: RedactionLayer[];
  watermark: WatermarkConfig;
  logo: LogoWatermarkConfig;
  adjustments: ImageAdjustments;
  crop: CropState;
  selectedLayerId: string | null;
}

export interface ExportSettings {
  format: 'png' | 'jpeg' | 'webp';
  quality: number; // 0.6 to 1.0
  scale: number; // 1 = original, 2 = 2x, etc.
  customWidth?: number;
  customHeight?: number;
  includeWatermark: boolean;
  stripMetadata: boolean;
}
