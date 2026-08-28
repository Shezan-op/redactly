import confetti from 'canvas-confetti';
import { applyImageAdjustments, renderRedactionLayer } from './pixelProcessing';
import type { CropState, ExportSettings, ImageAdjustments, LogoWatermarkConfig, RedactionLayer, WatermarkConfig } from './types';
import { renderLogoWatermark, renderTextWatermark } from './watermarkRenderer';

export interface RenderFullImageOptions {
  originalImage: HTMLImageElement;
  redactions: RedactionLayer[];
  watermark: WatermarkConfig;
  logo: LogoWatermarkConfig;
  adjustments: ImageAdjustments;
  crop: CropState;
  logoImgElement?: HTMLImageElement | null;
  targetScale?: number;
  customWidth?: number;
  customHeight?: number;
}

/**
 * Creates a fully baked, flattened canvas containing the cropped image,
 * destructive redactions, image adjustments, and watermark layers.
 */
export function renderFlattenedCanvas(options: RenderFullImageOptions): HTMLCanvasElement {
  const { originalImage, redactions, watermark, logo, adjustments, crop, logoImgElement, targetScale = 1, customWidth, customHeight } = options;

  // 1. Determine Source Dimensions & Crop
  const imgW = originalImage.naturalWidth || originalImage.width;
  const imgH = originalImage.naturalHeight || originalImage.height;

  const cropX = crop.active ? Math.max(0, crop.x) : 0;
  const cropY = crop.active ? Math.max(0, crop.y) : 0;
  const cropW = crop.active ? Math.min(imgW - cropX, crop.width) : imgW;
  const cropH = crop.active ? Math.min(imgH - cropY, crop.height) : imgH;

  // 2. Base Canvas (native cropped dimensions)
  const baseCanvas = document.createElement('canvas');
  baseCanvas.width = cropW;
  baseCanvas.height = cropH;
  const baseCtx = baseCanvas.getContext('2d', { willReadFrequently: true });
  if (!baseCtx) return baseCanvas;

  // 3. Draw cropped source image
  baseCtx.drawImage(
    originalImage,
    cropX, cropY, cropW, cropH,
    0, 0, cropW, cropH
  );

  // 4. Apply Image Adjustments to the raw pixel buffer
  applyImageAdjustments(baseCtx, cropW, cropH, adjustments);

  // 5. Destructively Bake Redactions onto the pixel buffer
  // Note: Adjust redaction coordinates relative to crop offset
  redactions.forEach((layer) => {
    if (!layer.visible) return;

    // Clone layer with crop offset applied
    const adjustedLayer: RedactionLayer = {
      ...layer,
      x: layer.x - cropX,
      y: layer.y - cropY,
      points: layer.points ? layer.points.map(p => ({ x: p.x - cropX, y: p.y - cropY })) : undefined,
    };

    renderRedactionLayer(baseCtx, adjustedLayer);
  });

  // 6. Scale canvas if custom width/height or targetScale is requested
  let outputCanvas = baseCanvas;
  let outW = cropW;
  let outH = cropH;

  if (customWidth && customHeight && (customWidth !== cropW || customHeight !== cropH)) {
    outW = customWidth;
    outH = customHeight;
  } else if (targetScale !== 1) {
    outW = Math.round(cropW * targetScale);
    outH = Math.round(cropH * targetScale);
  }

  if (outW !== cropW || outH !== cropH) {
    outputCanvas = document.createElement('canvas');
    outputCanvas.width = outW;
    outputCanvas.height = outH;
    const outCtx = outputCanvas.getContext('2d');
    if (outCtx) {
      outCtx.imageSmoothingEnabled = true;
      outCtx.imageSmoothingQuality = 'high';
      outCtx.drawImage(baseCanvas, 0, 0, outW, outH);
    }
  }

  const outCtx = outputCanvas.getContext('2d');
  if (outCtx) {
    // 7. Render Text Watermark
    if (watermark.enabled) {
      renderTextWatermark(outCtx, outW, outH, watermark);
    }

    // 8. Render Logo Watermark
    if (logo.enabled && logoImgElement) {
      renderLogoWatermark(outCtx, outW, outH, logoImgElement, logo);
    }
  }

  return outputCanvas;
}

/**
 * Formats a clean, safe output filename:
 * e.g., "dashboard-metrics.png" -> "dashboard-metrics-protected.png"
 */
export function generateProtectedFilename(
  originalFilename: string,
  targetFormat: 'png' | 'jpeg' | 'webp'
): string {
  const cleanName = originalFilename.trim() || 'image';
  const dotIndex = cleanName.lastIndexOf('.');
  const baseName = dotIndex !== -1 ? cleanName.substring(0, dotIndex) : cleanName;
  
  const ext = targetFormat === 'jpeg' ? 'jpg' : targetFormat;
  return `${baseName}-protected.${ext}`;
}

/**
 * Exports the processed image as a downloadable file with metadata stripped.
 */
export async function exportProtectedImage(
  options: RenderFullImageOptions,
  settings: ExportSettings,
  originalFilename: string
): Promise<{ success: boolean; blob?: Blob; filename?: string; error?: string }> {
  try {
    const canvas = renderFlattenedCanvas({
      ...options,
      targetScale: settings.scale,
      customWidth: settings.customWidth,
      customHeight: settings.customHeight,
    });

    const mimeType = settings.format === 'png' ? 'image/png' : settings.format === 'jpeg' ? 'image/jpeg' : 'image/webp';
    const quality = settings.format === 'png' ? undefined : settings.quality;

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve({ success: false, error: 'Failed to generate image buffer' });
            return;
          }

          const filename = generateProtectedFilename(originalFilename, settings.format);

          // Trigger browser download
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(url), 2000);

          // Confetti celebration
          try {
            confetti({
              particleCount: 75,
              spread: 60,
              origin: { y: 0.85 },
              colors: ['#ffffff', '#e4e4e7', '#a1a1aa', '#f59e0b', '#71717a'],
            });
          } catch {
            // ignore if confetti fails
          }

          resolve({ success: true, blob, filename });
        },
        mimeType,
        quality
      );
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown export error';
    return { success: false, error: errorMsg };
  }
}

/**
 * Copies the protected PNG directly to the system clipboard for immediate pasting.
 */
export async function copyToClipboard(options: RenderFullImageOptions): Promise<boolean> {
  try {
    const canvas = renderFlattenedCanvas(options);
    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          resolve(false);
          return;
        }

        try {
          if (navigator.clipboard && window.ClipboardItem) {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob }),
            ]);

            try {
              confetti({
                particleCount: 40,
                spread: 40,
                origin: { y: 0.85 },
              });
            } catch {
              // ignore
            }

            resolve(true);
          } else {
            resolve(false);
          }
        } catch {
          resolve(false);
        }
      }, 'image/png');
    });
  } catch {
    return false;
  }
}
