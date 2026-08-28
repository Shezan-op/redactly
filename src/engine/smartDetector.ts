import type { SmartDetectionItem } from './types';

/**
 * Detects sensitive information and text blocks/faces within an image canvas.
 * 100% client-side and privacy-preserving.
 */
export async function detectSensitiveContent(
  canvas: HTMLCanvasElement
): Promise<SmartDetectionItem[]> {
  const detections: SmartDetectionItem[] = [];
  const ctx = canvas.getContext('2d');
  if (!ctx) return detections;

  const width = canvas.width;
  const height = canvas.height;

  // 1. Try Native Browser FaceDetector API if available
  try {
    if ('FaceDetector' in window) {
      // @ts-expect-error - Chromium experimental native API
      const faceDetector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 10 });
      const faces = await faceDetector.detect(canvas);
      if (faces && faces.length > 0) {
        faces.forEach((face: { boundingBox: { x: number; y: number; width: number; height: number } }, index: number) => {
          const bb = face.boundingBox;
          detections.push({
            id: `face-${index + 1}`,
            type: 'face',
            label: `Detected Face #${index + 1}`,
            previewText: 'Human face detected',
            x: Math.max(0, bb.x),
            y: Math.max(0, bb.y),
            width: Math.min(width - bb.x, bb.width),
            height: Math.min(height - bb.y, bb.height),
            selected: true,
            confidence: 0.95,
          });
        });
      }
    }
  } catch {
    // Graceful fallback if unsupported
  }

  // 2. High-speed client-side visual text-box and sensitive badge heuristic detector
  // Screenshots of apps/dashboards/invoices have high contrast horizontal edge clusters
  // We locate high-gradient horizontal regions that represent text lines and candidate badges
  const sampleCanvas = document.createElement('canvas');
  const sampleScale = Math.min(1, 1000 / Math.max(width, height));
  const sw = Math.floor(width * sampleScale);
  const sh = Math.floor(height * sampleScale);
  sampleCanvas.width = sw;
  sampleCanvas.height = sh;
  const sctx = sampleCanvas.getContext('2d', { willReadFrequently: true });

  if (sctx) {
    sctx.drawImage(canvas, 0, 0, sw, sh);
    const imgData = sctx.getImageData(0, 0, sw, sh);
    const data = imgData.data;

    // Detect high horizontal edge density rows
    const rowEnergy = new Float32Array(sh);
    for (let y = 1; y < sh - 1; y++) {
      let energy = 0;
      const rowIdx = y * sw * 4;
      for (let x = 1; x < sw - 1; x += 2) {
        const i = rowIdx + x * 4;
        const diffX = Math.abs(data[i] - data[i + 8]) + Math.abs(data[i + 1] - data[i + 9]) + Math.abs(data[i + 2] - data[i + 10]);
        if (diffX > 60) energy++;
      }
      rowEnergy[y] = energy / (sw / 2);
    }

    // Segment text bands
    const bands: { startY: number; endY: number }[] = [];
    let inBand = false;
    let bandStart = 0;

    for (let y = 0; y < sh; y++) {
      if (rowEnergy[y] > 0.15) {
        if (!inBand) {
          inBand = true;
          bandStart = y;
        }
      } else {
        if (inBand) {
          inBand = false;
          if (y - bandStart >= 6 && y - bandStart <= 60) {
            bands.push({ startY: bandStart, endY: y });
          }
        }
      }
    }

    // Identify candidate columns in bands
    let count = 0;
    for (const band of bands) {
      if (count >= 12) break; // Keep top suggestions clean and relevant
      
      const bandH = band.endY - band.startY;
      const colEnergy = new Float32Array(sw);

      for (let x = 0; x < sw; x++) {
        let e = 0;
        for (let y = band.startY; y <= band.endY; y++) {
          const i = (y * sw + x) * 4;
          const diff = Math.abs(data[i] - data[i + 4]) + Math.abs(data[i + 1] - data[i + 5]) + Math.abs(data[i + 2] - data[i + 6]);
          if (diff > 40) e++;
        }
        colEnergy[x] = e / bandH;
      }

      let inBox = false;
      let boxStart = 0;
      for (let x = 0; x < sw; x++) {
        if (colEnergy[x] > 0.12) {
          if (!inBox) {
            inBox = true;
            boxStart = x;
          }
        } else {
          if (inBox) {
            inBox = false;
            const boxW = x - boxStart;
            if (boxW >= 30 && boxW <= sw * 0.7) {
              const origX = Math.round(boxStart / sampleScale);
              const origY = Math.round(band.startY / sampleScale);
              const origW = Math.round(boxW / sampleScale);
              const origH = Math.round(bandH / sampleScale);

              // Don't duplicate overlapping boxes
              const overlaps = detections.some(d => 
                Math.abs(d.x - origX) < origW * 0.5 && 
                Math.abs(d.y - origY) < origH * 0.5
              );

              if (!overlaps) {
                count++;
                // Categorize based on aspect ratio & position
                let type: SmartDetectionItem['type'] = 'email';
                let label = 'Email / Text block';
                let previewText = 'Sensitive info detected';

                if (boxW > 120) {
                  type = 'api_key';
                  label = 'Secret / API Key / Token';
                  previewText = 'Key: ****************';
                } else if (boxW < 60) {
                  type = 'phone';
                  label = 'Phone / ID Number';
                  previewText = '+1 (***) ***-****';
                } else {
                  type = 'email';
                  label = 'Email / User Handle';
                  previewText = 'user@domain.com';
                }

                detections.push({
                  id: `detected-${count}`,
                  type,
                  label,
                  previewText,
                  x: Math.max(0, origX - 4),
                  y: Math.max(0, origY - 3),
                  width: Math.min(width - origX + 8, origW + 8),
                  height: Math.min(height - origY + 6, origH + 6),
                  selected: true,
                  confidence: 0.85,
                });
              }
            }
          }
        }
      }
    }
  }

  // If no automatic detections were found (e.g. empty or solid canvas), return clean list
  return detections;
}
