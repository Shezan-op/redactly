import type { LogoWatermarkConfig, PositionPreset, WatermarkConfig } from './types';

/**
 * Calculates absolute coordinates on the canvas based on position presets or custom percentages.
 */
export function getPresetCoordinates(
  preset: PositionPreset,
  customX: number,
  customY: number,
  canvasWidth: number,
  canvasHeight: number,
  objectWidth: number,
  objectHeight: number,
  padding: number = 40
): { x: number; y: number } {
  switch (preset) {
    case 'top-left':
      return { x: padding, y: padding };
    case 'top-center':
      return { x: (canvasWidth - objectWidth) / 2, y: padding };
    case 'top-right':
      return { x: canvasWidth - objectWidth - padding, y: padding };
    case 'center':
      return { x: (canvasWidth - objectWidth) / 2, y: (canvasHeight - objectHeight) / 2 };
    case 'bottom-left':
      return { x: padding, y: canvasHeight - objectHeight - padding };
    case 'bottom-center':
      return { x: (canvasWidth - objectWidth) / 2, y: canvasHeight - objectHeight - padding };
    case 'bottom-right':
      return { x: canvasWidth - objectWidth - padding, y: canvasHeight - objectHeight - padding };
    case 'custom':
    default:
      return {
        x: customX * canvasWidth,
        y: customY * canvasHeight,
      };
  }
}

/**
 * Renders the configured text watermark onto the canvas context.
 */
export function renderTextWatermark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: WatermarkConfig
) {
  if (!config.enabled || !config.text.trim()) return;

  ctx.save();
  ctx.globalAlpha = config.opacity;
  ctx.fillStyle = config.color;

  const fontSize = Math.max(12, Math.round(config.fontSize * (width / 1000)));
  ctx.font = `${config.fontWeight} ${fontSize}px "${config.fontFamily}", sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';

  if (config.shadow) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
  }

  const textMetrics = ctx.measureText(config.text);
  const textWidth = textMetrics.width;
  const textHeight = fontSize * 1.2;

  const rad = (config.rotation * Math.PI) / 180;

  if (config.layoutMode === 'diagonal') {
    // Large diagonal banner across image center
    ctx.save();
    ctx.translate(width / 2, height / 2);
    // Standard diagonal angle or custom rotation
    const diagAngle = config.rotation !== 0 ? rad : -Math.atan2(height, width);
    ctx.rotate(diagAngle);
    
    // Scale font size dynamically for diagonal mode to fill nicely
    const diagFontSize = Math.max(fontSize, Math.round(Math.min(width, height) * 0.12));
    ctx.font = `${config.fontWeight} ${diagFontSize}px "${config.fontFamily}", sans-serif`;
    ctx.fillText(config.text, 0, 0);
    ctx.restore();

  } else if (config.layoutMode === 'center') {
    // Large centered watermark
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate(rad);
    ctx.fillText(config.text, 0, 0);
    ctx.restore();

  } else if (config.layoutMode === 'repeated' || config.layoutMode === 'pattern') {
    // Tiled repeating watermark grid across entire image
    const stepX = Math.max(textWidth + (config.spacingX || 120), 100);
    const stepY = Math.max(textHeight + (config.spacingY || 100), 80);

    ctx.save();
    // Expand bounds to cover rotated area
    const diag = Math.sqrt(width * width + height * height);
    ctx.translate(width / 2, height / 2);
    ctx.rotate(rad);
    ctx.translate(-diag / 2, -diag / 2);

    for (let y = 0; y < diag + stepY; y += stepY) {
      // Stagger alternating rows for beautiful pattern
      const offsetX = ((y / stepY) % 2 === 1) ? stepX / 2 : 0;
      for (let x = 0; x < diag + stepX; x += stepX) {
        ctx.fillText(config.text, x + offsetX, y);
      }
    }
    ctx.restore();

  } else {
    // Single watermark placed at preset or custom position
    const pos = getPresetCoordinates(
      config.positionPreset,
      config.customX,
      config.customY,
      width,
      height,
      textWidth,
      textHeight
    );

    ctx.save();
    ctx.translate(pos.x + textWidth / 2, pos.y + textHeight / 2);
    ctx.rotate(rad);
    ctx.fillText(config.text, 0, 0);
    ctx.restore();
  }

  ctx.restore();
}

/**
 * Renders a Logo Watermark image overlay.
 */
export function renderLogoWatermark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  logoImg: HTMLImageElement | null,
  config: LogoWatermarkConfig
) {
  if (!config.enabled || !logoImg || !logoImg.complete || logoImg.naturalWidth === 0) return;

  ctx.save();
  ctx.globalAlpha = config.opacity;

  // Scale relative to canvas width
  const targetWidth = Math.max(20, Math.round(width * config.scale));
  const aspectRatio = logoImg.naturalHeight / logoImg.naturalWidth;
  const targetHeight = targetWidth * aspectRatio;

  const pos = getPresetCoordinates(
    config.positionPreset,
    config.customX,
    config.customY,
    width,
    height,
    targetWidth,
    targetHeight
  );

  const rad = (config.rotation * Math.PI) / 180;

  ctx.translate(pos.x + targetWidth / 2, pos.y + targetHeight / 2);
  if (config.rotation !== 0) {
    ctx.rotate(rad);
  }

  ctx.drawImage(
    logoImg,
    -targetWidth / 2,
    -targetHeight / 2,
    targetWidth,
    targetHeight
  );

  ctx.restore();
}
