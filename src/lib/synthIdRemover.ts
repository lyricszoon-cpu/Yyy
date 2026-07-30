import { ProcessingSettings } from "../types";

/**
 * Core HTML5 Canvas & Pixel Manipulation Engine to neutralize SynthID watermarks,
 * strip AI metadata, inject authentic camera sensor noise, and humanize AI photos.
 */
export async function processImageAndRemoveSynthId(
  imageSource: File | Blob | string,
  settings: ProcessingSettings
): Promise<{
  processedBlob: Blob;
  processedUrl: string;
  width: number;
  height: number;
  processingTimeMs: number;
}> {
  const startTime = performance.now();

  // Load image into HTMLImageElement
  const img = await loadImage(imageSource);
  const origWidth = img.naturalWidth || img.width;
  const origHeight = img.naturalHeight || img.height;

  // Determine target dimensions (Meta Facebook & Instagram HD limit is max 2048px on long edge)
  let width = origWidth;
  let height = origHeight;

  const isMetaMode = settings.metaSocialScale || settings.preset === "meta_facebook_insta";
  if (isMetaMode) {
    const maxDimension = 2048; // Max HD limit for Facebook & Instagram posts
    const maxCurrent = Math.max(origWidth, origHeight);
    if (maxCurrent > maxDimension) {
      const scale = maxDimension / maxCurrent;
      width = Math.round(origWidth * scale);
      height = Math.round(origHeight * scale);
    }
  }

  // Create canvas for processing
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    throw new Error("Could not initialize 2D Canvas Context");
  }

  // 1. Sub-pixel spatial shift & resampling (Grid Shift)
  const shiftFactor = 1 + (settings.resampleShift / 100) * 0.003; // max 0.3% scale change
  const shiftOffsetX = ((shiftFactor - 1) * width) / 2;
  const shiftOffsetY = ((shiftFactor - 1) * height) / 2;

  canvas.width = width;
  canvas.height = height;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Draw image with sub-pixel spatial shift to disrupt SynthID lattice coordinates
  if (settings.resampleShift > 0 || isMetaMode) {
    ctx.drawImage(
      img,
      -shiftOffsetX,
      -shiftOffsetY,
      width * shiftFactor,
      height * shiftFactor
    );
  } else {
    ctx.drawImage(img, 0, 0, width, height);
  }

  // Retrieve ImageData for pixel-level frequency perturbation
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const len = data.length;

  // 2. Chromatic Aberration Dispersion (Sub-pixel lens dispersion)
  if (settings.chromaticAberration > 0) {
    const shiftPx = Math.max(1, Math.floor((settings.chromaticAberration / 100) * 2));
    const copyData = new Uint8ClampedArray(data);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        // Shift Red channel to the right, Blue channel to the left
        const rx = Math.min(width - 1, x + shiftPx);
        const bx = Math.max(0, x - shiftPx);

        const rIdx = (y * width + rx) * 4;
        const bIdx = (y * width + bx) * 4;

        data[idx] = copyData[rIdx]; // Red from shifted pixel
        data[idx + 2] = copyData[bIdx + 2]; // Blue from shifted pixel
      }
    }
  }

  // 3. Camera Sensor ISO Noise, Color Dithering & Meta PDQ Hash Perturbation
  if (settings.noiseIntensity > 0 || settings.applyColorDither || isMetaMode) {
    const noiseLevel = (settings.noiseIntensity / 100) * 14; // max +-14 RGB delta
    const ditherVal = settings.applyColorDither ? 2 : 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        const lumWeight = 1 - Math.abs(lum - 128) / 128;

        let deltaR = 0;
        let deltaG = 0;
        let deltaB = 0;

        if (noiseLevel > 0) {
          const randG = (Math.random() + Math.random() + Math.random() - 1.5) * noiseLevel * (0.6 + lumWeight * 0.4);
          const randChromaR = (Math.random() - 0.5) * (noiseLevel * 0.3);
          const randChromaB = (Math.random() - 0.5) * (noiseLevel * 0.3);

          deltaR += randG + randChromaR;
          deltaG += randG;
          deltaB += randG + randChromaB;
        }

        if (ditherVal > 0) {
          deltaR += (Math.random() - 0.5) * ditherVal;
          deltaG += (Math.random() - 0.5) * ditherVal;
          deltaB += (Math.random() - 0.5) * ditherVal;
        }

        // Meta (Facebook & Instagram) PDQ Perceptual Hashing & Chrominance Anti-AI-Classifier Pass
        if (isMetaMode) {
          // Subtle sinusoidal spatial phase shift over 8x8 DCT blocks (matching Meta JPEG encoder)
          const dctPhase = Math.sin((x / 8) * Math.PI) * Math.cos((y / 8) * Math.PI) * 2.2;
          deltaR += dctPhase;
          deltaB -= dctPhase;
        }

        data[i] = clamp(r + deltaR);
        data[i + 1] = clamp(g + deltaG);
        data[i + 2] = clamp(b + deltaB);
      }
    }
  }

  // Put processed pixels back to canvas
  ctx.putImageData(imageData, 0, 0);

  // 4. Adaptive Unsharp Masking (Detail & Texture Sharpening)
  if (settings.sharpening > 0) {
    applyUnsharpMask(ctx, width, height, settings.sharpening / 100);
  }

  // 5. Canvas Export & Re-quantization (Strips EXIF, C2PA, PNG chunks)
  const mimeType = settings.outputFormat;
  const quality = settings.compressionQuality / 100;

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error("Failed to export canvas blob"));
      },
      mimeType,
      quality
    );
  });

  const processedUrl = URL.createObjectURL(blob);
  const endTime = performance.now();

  return {
    processedBlob: blob,
    processedUrl,
    width,
    height,
    processingTimeMs: Math.round(endTime - startTime),
  };
}

/**
 * Unsharp Masking filter implementation to restore realistic camera focal sharpness
 */
function applyUnsharpMask(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  amount: number
) {
  const originalData = ctx.getImageData(0, 0, width, height);
  const blurredCanvas = document.createElement("canvas");
  blurredCanvas.width = width;
  blurredCanvas.height = height;
  const blurredCtx = blurredCanvas.getContext("2d");
  if (!blurredCtx) return;

  // Simple 3x3 Box blur pass
  blurredCtx.putImageData(originalData, 0, 0);
  blurredCtx.filter = "blur(1.5px)";
  blurredCtx.drawImage(blurredCanvas, 0, 0);

  const blurredData = blurredCtx.getImageData(0, 0, width, height);
  const origPixels = originalData.data;
  const blurPixels = blurredData.data;
  const len = origPixels.length;

  for (let i = 0; i < len; i += 4) {
    // High-pass detail = Original - Blur
    const diffR = origPixels[i] - blurPixels[i];
    const diffG = origPixels[i + 1] - blurPixels[i + 1];
    const diffB = origPixels[i + 2] - blurPixels[i + 2];

    origPixels[i] = clamp(origPixels[i] + diffR * amount * 1.5);
    origPixels[i + 1] = clamp(origPixels[i + 1] + diffG * amount * 1.5);
    origPixels[i + 2] = clamp(origPixels[i + 2] + diffB * amount * 1.5);
  }

  ctx.putImageData(originalData, 0, 0);
}

function clamp(val: number): number {
  return Math.min(255, Math.max(0, Math.round(val)));
}

function loadImage(src: File | Blob | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);

    if (typeof src === "string") {
      img.src = src;
    } else {
      img.src = URL.createObjectURL(src);
    }
  });
}
