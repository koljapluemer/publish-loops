import { useEffect } from 'react';
import { getNodesBounds, useReactFlow } from '@xyflow/react';
import type { AppMode } from '../shared/appMode';
import { computePreviewExportLayout } from './previewExportLayout';
import { renderFlowToWebp } from './renderFlowToWebp';

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

/** Writes a square, transparent WebP in the background each time this flow enters preview mode. */
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

      const layout = computePreviewExportLayout(getNodesBounds(getNodes()));
      const blob = await renderFlowToWebp(viewportElement, layout);

      if (cancelled) return;
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
