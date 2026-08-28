# 🛡️ Redactly — Privacy-First Screenshot Redaction & Watermark Studio

> **Protect your screenshots, dashboards, invoices, and sensitive documents before sharing them publicly.**  
> 100% Client-Side in browser · Zero Server Uploads · Permanent Destructive Pixel Scrambling

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FShezan-op%2Fredactly)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Shezan-op/redactly)
[![License: MIT](https://img.shields.io/badge/License-MIT-indigo.svg)](https://opensource.org/licenses/MIT)

---

## ✨ Features

- 🔒 **100% Local-First & Private**: Everything runs entirely in your browser using HTML5 Canvas. No image data, pixels, or analytics are ever transmitted to any remote server.
- 🧱 **Destructive Redaction**:
  - **Styles**: Gaussian Blur, Mosaic Pixelation, Solid Blackout (`#000000`), and Custom Colors.
  - **Shapes**: Rectangle, Square, Circle, Ellipse, and Freehand Brush.
  - **Permanent Pixel Alteration**: The underlying pixels are permanently scrambled in the image buffer — sensitive data cannot be recovered by inspecting the DOM or removing layers.
- 💧 **Professional Watermarking**:
  - **Text Watermark**: Custom text, 6 typography styles (Inter, JetBrains Mono, Jakarta Sans, Impact, Serif, Courier), opacity, rotation, and drop shadows.
  - **Layout Patterns**: Single, Diagonal Banner, Tiled Repeating Grid, Center, and Custom Patterns.
  - **Position Presets**: 9-grid alignment (Top-Left, Center, Bottom-Right, etc.) or free dragging.
  - **Logo Watermark**: Upload custom brand logos (PNG, JPG, WebP) with scale, opacity, and rotation.
  - **Quick Presets**: *Confidential*, *Draft*, *Client Copy*, *Internal Only*, *Proof*, and *Do Not Share*.
- ⚡ **Smart Redact & Face Privacy**:
  - Auto-detection heuristic for emails, phone numbers, API keys, tokens, account IDs, and faces with an interactive review dialog.
- 📐 **Crop & Lightweight Tuning**:
  - Aspect ratios (`1:1`, `4:5`, `16:9`, `9:16`, `4:3`, `Free`) with rule-of-thirds grid.
  - Fine-tune Brightness, Contrast, Saturation, Exposure, and Sharpness.
- 🪟 **Before / After Comparison**:
  - Interactive draggable curtain slider to review unredacted vs. protected views side-by-side.
- 📋 **One-Click Clipboard Copy**:
  - Instant `Copy PNG` button to paste directly into Slack, Teams, Discord, or Email without saving files.
- 💾 **Flattened Multi-Format Export**:
  - Export to PNG (lossless), JPEG (quality slider), or WebP with automatic privacy metadata stripping.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `V` | Select & Move Tool |
| `R` | Rectangle Redact |
| `C` | Circle / Oval Redact |
| `B` | Freehand Brush Redact |
| `W` | Watermark Tool |
| `1` / `2` / `3` | Switch Style (Blur / Pixelate / Blackout) |
| `Space + Drag` | Pan Canvas |
| `Mouse Wheel` | Zoom In / Out |
| `Ctrl / Cmd + Z` | Undo |
| `Ctrl / Cmd + Shift + Z` / `Ctrl + Y` | Redo |
| `Delete` / `Backspace` | Delete Selected Object |
| `Escape` | Deselect / Cancel Current Action |
| `Ctrl / Cmd + S` | Open Export Modal |
| `?` | Toggle Shortcuts Guide |

---

## 🚀 Quick Start (Local Development)

```bash
# Clone the repository
git clone https://github.com/Shezan-op/redactly.git
cd redactly

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📦 Build for Production

```bash
# Build optimized static bundle
npm run build

# Preview production build locally
npm run preview
```

The output in the `/dist` folder is 100% static and can be hosted on **Vercel**, **Netlify**, **Cloudflare Pages**, **GitHub Pages**, **AWS S3**, or any static web host.

---

## 🛡️ Privacy Architecture Guarantee

1. **Zero Network Requests**: Image files dropped into Redactly are loaded directly into browser memory via `URL.createObjectURL` or `FileReader`.
2. **True Canvas Rasterization**: Exported images are flattened onto an offscreen canvas where redactions overwrite the raw pixel buffer before generating the output Blob.
3. **EXIF / Metadata Stripping**: The export pipeline regenerates fresh image binaries, discarding device identifiers, GPS tags, camera metadata, and timestamps.

---

## 📄 License

MIT © [Redactly](https://github.com/Shezan-op/redactly)
