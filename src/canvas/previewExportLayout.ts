import { getViewportForBounds, type Rect, type Viewport } from '@xyflow/react';

/** Smallest export edge in px; small flows are scaled up to fill it. */
export const MIN_EXPORT_SIDE = 1080;
/** Largest export edge in px; bigger flows are scaled down to fit it. */
export const MAX_EXPORT_SIDE = 4096;

// Padding around the flow as a fraction of its size, applied on every side.
const PADDING = 0.1;
// Keeps a lone node from being blown up to fill the minimum square.
const MAX_ZOOM = 2;
// Effectively unbounded so oversized flows still fit inside MAX_EXPORT_SIDE.
const MIN_ZOOM = 0.01;

export interface PreviewExportLayout {
  /** Edge length of the square output, in px. */
  side: number;
  /** Viewport that centers the flow inside the square. */
  viewport: Viewport;
}

/**
 * Picks the square size and viewport for a flow: 1:1 scale when the padded flow
 * fits between MIN_EXPORT_SIDE and MAX_EXPORT_SIDE, otherwise the size is
 * clamped and the flow is zoomed to fit.
 */
export function computePreviewExportLayout(bounds: Rect): PreviewExportLayout {
  const naturalSide = Math.max(bounds.width, bounds.height) * (1 + PADDING * 2);
  const side = Math.round(Math.min(MAX_EXPORT_SIDE, Math.max(MIN_EXPORT_SIDE, naturalSide)));
  const viewport = getViewportForBounds(bounds, side, side, MIN_ZOOM, MAX_ZOOM, PADDING);
  return { side, viewport };
}
