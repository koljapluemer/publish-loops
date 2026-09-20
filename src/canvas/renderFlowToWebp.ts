import { toCanvas } from 'html-to-image';
import type { PreviewExportLayout } from './previewExportLayout';

const WEBP_MIME = 'image/webp';
// 1 is still lossy in canvas WebP encoding, but visually near-identical and keeps alpha.
const WEBP_QUALITY = 1;

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        // Browsers silently fall back to PNG for unsupported types.
        if (blob && blob.type === WEBP_MIME) resolve(blob);
        else reject(new Error('Canvas could not encode WebP'));
      },
      WEBP_MIME,
      WEBP_QUALITY,
    );
  });
}

/** Rasterizes the React Flow viewport into a square, transparent WebP. */
export async function renderFlowToWebp(viewportElement: HTMLElement, { side, viewport }: PreviewExportLayout): Promise<Blob> {
  const canvas = await toCanvas(viewportElement, {
    // No backgroundColor: the canvas stays transparent.
    // Fixed ratio so the output size doesn't depend on the display's DPI.
    pixelRatio: 1,
    width: side,
    height: side,
    style: {
      width: `${side}px`,
      height: `${side}px`,
      transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
    },
  });
  return canvasToBlob(canvas);
}
