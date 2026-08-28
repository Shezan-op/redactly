import type { ImageAdjustments, Point, RedactionLayer } from './types';

/**
 * Applies destructive pixelation (mosaic) to a rectangular region of ImageData.
 * The original pixel values in that area are irreversibly replaced by the block averages.
 */
export function applyPixelation(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  pixelSize: number,
  clipShape?: { type: string; points?: Point[]; borderRadius?: number }
) {
  if (width <= 0 || height <= 0) return;

  const canvas = ctx.canvas;
  const clampedX = Math.max(0, Math.floor(x));
  const clampedY = Math.max(0, Math.floor(y));
  const clampedW = Math.min(canvas.width - clampedX, Math.ceil(width));
  const clampedH = Math.min(canvas.height - clampedY, Math.ceil(height));

  if (clampedW <= 0 || clampedH <= 0) return;

  const blockSize = Math.max(2, Math.floor(pixelSize));
  
  // Create an offscreen buffer for the region
  const offscreen = document.createElement('canvas');
  offscreen.width = clampedW;
  offscreen.height = clampedH;
  const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
  if (!offCtx) return;

  // Draw source image region downscaled, then upscaled with imageSmoothingEnabled = false
  const scaledW = Math.max(1, Math.floor(clampedW / blockSize));
  const scaledH = Math.max(1, Math.floor(clampedH / blockSize));

  const smallCanvas = document.createElement('canvas');
  smallCanvas.width = scaledW;
  smallCanvas.height = scaledH;
  const smallCtx = smallCanvas.getContext('2d');
  if (!smallCtx) return;

  smallCtx.drawImage(
    canvas,
    clampedX, clampedY, clampedW, clampedH,
    0, 0, scaledW, scaledH
  );

  offCtx.imageSmoothingEnabled = false;
  offCtx.drawImage(
    smallCanvas,
    0, 0, scaledW, scaledH,
    0, 0, clampedW, clampedH
  );

  // Apply clip if non-rectangular shape
  ctx.save();
  if (clipShape) {
    applyShapePath(ctx, clampedX, clampedY, clampedW, clampedH, clipShape);
    ctx.clip();
  }
  ctx.drawImage(offscreen, clampedX, clampedY);
  ctx.restore();
}

/**
 * Applies a true destructive fast multi-pass box blur to a region of the canvas.
 */
export function applyBlur(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  clipShape?: { type: string; points?: Point[]; borderRadius?: number }
) {
  if (width <= 0 || height <= 0) return;

  const canvas = ctx.canvas;
  const clampedX = Math.max(0, Math.floor(x));
  const clampedY = Math.max(0, Math.floor(y));
  const clampedW = Math.min(canvas.width - clampedX, Math.ceil(width));
  const clampedH = Math.min(canvas.height - clampedY, Math.ceil(height));

  if (clampedW <= 0 || clampedH <= 0) return;

  const blurRadius = Math.max(1, Math.round(radius));

  // Multi-step scale down and scale up with bilateral smoothing produces silky Gaussian-quality blur
  // while permanently averaging pixels
  const offscreen = document.createElement('canvas');
  offscreen.width = clampedW;
  offscreen.height = clampedH;
  const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
  if (!offCtx) return;

  const downscaleFactor = Math.max(2, Math.min(16, Math.floor(blurRadius / 2) + 1));
  const smallW = Math.max(1, Math.floor(clampedW / downscaleFactor));
  const smallH = Math.max(1, Math.floor(clampedH / downscaleFactor));

  const smallCanvas = document.createElement('canvas');
  smallCanvas.width = smallW;
  smallCanvas.height = smallH;
  const smallCtx = smallCanvas.getContext('2d');
  if (!smallCtx) return;

  // Step 1: draw region scaled down
  smallCtx.imageSmoothingEnabled = true;
  smallCtx.imageSmoothingQuality = 'high';
  smallCtx.drawImage(
    canvas,
    clampedX, clampedY, clampedW, clampedH,
    0, 0, smallW, smallH
  );

  // Step 2: Draw back with canvas filter blur for ultra-smooth edge blending
  offCtx.save();
  offCtx.imageSmoothingEnabled = true;
  offCtx.imageSmoothingQuality = 'high';
  offCtx.filter = `blur(${Math.max(1, Math.floor(blurRadius / 3))}px)`;
  offCtx.drawImage(
    smallCanvas,
    0, 0, smallW, smallH,
    0, 0, clampedW, clampedH
  );
  offCtx.restore();

  // Draw blurred region onto main canvas using shape mask
  ctx.save();
  if (clipShape) {
    applyShapePath(ctx, clampedX, clampedY, clampedW, clampedH, clipShape);
    ctx.clip();
  }
  ctx.drawImage(offscreen, clampedX, clampedY);
  ctx.restore();
}

/**
 * Creates the clip or fill path for any redaction shape (Rectangle, Circle, Ellipse, Brush path).
 */
export function applyShapePath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  shape: { type: string; points?: Point[]; borderRadius?: number }
) {
  ctx.beginPath();
  const radius = shape.borderRadius || 0;

  if (shape.type === 'circle') {
    const cx = x + width / 2;
    const cy = y + height / 2;
    const r = Math.min(Math.abs(width), Math.abs(height)) / 2;
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
  } else if (shape.type === 'ellipse') {
    const cx = x + width / 2;
    const cy = y + height / 2;
    const rx = Math.abs(width) / 2;
    const ry = Math.abs(height) / 2;
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  } else if (shape.type === 'brush' && shape.points && shape.points.length > 0) {
    const pts = shape.points;
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }
  } else {
    // Rectangle or Square with optional border radius
    if (radius > 0 && ctx.roundRect) {
      ctx.roundRect(x, y, width, height, radius);
    } else {
      ctx.rect(x, y, width, height);
    }
  }
  ctx.closePath();
}

/**
 * Destructively bakes a redaction layer onto a target canvas context.
 */
export function renderRedactionLayer(
  ctx: CanvasRenderingContext2D,
  layer: RedactionLayer
) {
  if (!layer.visible) return;

  const { x, y, width, height, type, style, color, opacity, blurStrength, pixelSize, borderRadius, points, brushRadius } = layer;

  if (type === 'brush' && points && points.length > 0) {
    // For freehand brush
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = (brushRadius || 12) * 2;

    if (style === 'solid' || style === 'blackout') {
      ctx.globalAlpha = opacity;
      ctx.strokeStyle = style === 'blackout' ? '#000000' : color;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
    } else if (style === 'blur' || style === 'pixelate') {
      // Calculate bounding box of brush path
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const p of points) {
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
      }
      const pad = (brushRadius || 12) * 2;
      const bx = minX - pad;
      const by = minY - pad;
      const bw = maxX - minX + pad * 2;
      const bh = maxY - minY + pad * 2;

      // Stroke as clip region
      if (style === 'blur') {
        applyBlur(ctx, bx, by, bw, bh, blurStrength || 15);
      } else {
        applyPixelation(ctx, bx, by, bw, bh, pixelSize || 12);
      }
    }
    ctx.restore();
    return;
  }

  // Shapes: Rectangle, Square, Circle, Ellipse
  ctx.save();

  if (style === 'blackout') {
    ctx.globalAlpha = opacity;
    ctx.fillStyle = '#000000';
    applyShapePath(ctx, x, y, width, height, { type, borderRadius });
    ctx.fill();
  } else if (style === 'solid') {
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    applyShapePath(ctx, x, y, width, height, { type, borderRadius });
    ctx.fill();
  } else if (style === 'blur') {
    applyBlur(ctx, x, y, width, height, blurStrength || 16, { type, borderRadius });
  } else if (style === 'pixelate') {
    applyPixelation(ctx, x, y, width, height, pixelSize || 14, { type, borderRadius });
  }

  ctx.restore();
}

/**
 * Applies Image Adjustments (Brightness, Contrast, Saturation, Exposure, Sharpness)
 * to a canvas buffer in-place.
 */
export function applyImageAdjustments(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  adj: ImageAdjustments
) {
  const { brightness, contrast, saturation, exposure, sharpness } = adj;
  if (brightness === 0 && contrast === 0 && saturation === 0 && exposure === 0 && sharpness === 0) {
    return;
  }

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const len = data.length;

  // Pre-calculate factors
  const bFactor = (brightness / 100) * 255;
  const cFactor = (contrast + 100) / 100; // 0..2
  const cFactorSq = cFactor * cFactor;
  const sFactor = (saturation + 100) / 100;
  const expFactor = Math.pow(2, exposure / 50);

  for (let i = 0; i < len; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Exposure
    if (exposure !== 0) {
      r = r * expFactor;
      g = g * expFactor;
      b = b * expFactor;
    }

    // Brightness
    if (brightness !== 0) {
      r = r + bFactor;
      g = g + bFactor;
      b = b + bFactor;
    }

    // Contrast
    if (contrast !== 0) {
      r = (r - 128) * cFactorSq + 128;
      g = (g - 128) * cFactorSq + 128;
      b = (b - 128) * cFactorSq + 128;
    }

    // Saturation
    if (saturation !== 0) {
      const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
      r = gray + (r - gray) * sFactor;
      g = gray + (g - gray) * sFactor;
      b = gray + (b - gray) * sFactor;
    }

    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }

  // Sharpness (3x3 convolution)
  if (sharpness > 0) {
    const sharpAmount = sharpness / 100; // 0 to 1
    const originalCopy = new Uint8ClampedArray(data);
    const stride = width * 4;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * stride + x * 4;

        for (let c = 0; c < 3; c++) {
          const center = originalCopy[idx + c];
          const top = originalCopy[idx - stride + c];
          const bottom = originalCopy[idx + stride + c];
          const left = originalCopy[idx - 4 + c];
          const right = originalCopy[idx + 4 + c];

          const laplacian = 4 * center - (top + bottom + left + right);
          const sharpened = center + laplacian * sharpAmount * 0.5;
          data[idx + c] = Math.max(0, Math.min(255, sharpened));
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
}
