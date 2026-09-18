import { useEffect } from 'react';
import { getNodesBounds, getViewportForBounds, useReactFlow } from '@xyflow/react';
import { toBlob } from 'html-to-image';
import type { AppMode } from '../shared/appMode';

const EXPORT_WIDTH = 1920;
const EXPORT_HEIGHT = 1080;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;

function nextPaint(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}

async function waitForImages(element: HTMLElement): Promise<void> {
  const images = Array.from(element.querySelectorAll('img'));
  await Promise.all(images.map((image) => image.decode().catch((): void => undefined)));
}

interface AutoSavePreviewProps {
  mode: AppMode;
  slug: string;
}

/** Writes a PNG in the background each time this flow enters preview mode. */
function AutoSavePreview({ mode, slug }: AutoSavePreviewProps): null {
  const { getNodes } = useReactFlow();

  useEffect(() => {
    if (mode !== 'preview') return undefined;

    let cancelled = false;

    const savePreview = async () => {
      // Let React Flow finish applying its preview-only DOM and allow fonts and
      // asynchronously loaded node images to settle before rasterizing it.
      await nextPaint();
      await document.fonts.ready;

      const viewportElement = document.querySelector('.react-flow__viewport') as HTMLElement | null;
      if (!viewportElement || cancelled) return;
      await waitForImages(viewportElement);
      if (cancelled) return;

      const bounds = getNodesBounds(getNodes());
      const viewport = getViewportForBounds(bounds, EXPORT_WIDTH, EXPORT_HEIGHT, MIN_ZOOM, MAX_ZOOM, 0.1);
      const blob = await toBlob(viewportElement, {
        backgroundColor: '#ffffff',
        width: EXPORT_WIDTH,
        height: EXPORT_HEIGHT,
        style: {
          width: `${EXPORT_WIDTH}`,
          height: `${EXPORT_HEIGHT}`,
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
        },
      });

      if (!blob || cancelled) return;
      await window.flowsApi.savePreviewImage(slug, await blob.arrayBuffer());
    };

    void savePreview().catch((error: unknown) => {
      // Preview persistence is deliberately background-only; keep failures out
      // of the editing UI while leaving a diagnostic for development.
      console.warn(`Failed to save preview image for "${slug}":`, error);
    });

    return () => {
      cancelled = true;
    };
  }, [getNodes, mode, slug]);

  return null;
}

export default AutoSavePreview;
