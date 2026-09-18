import { Download } from 'lucide-react';
import { getNodesBounds, getViewportForBounds, useReactFlow } from '@xyflow/react';
import { toPng } from 'html-to-image';
import type { AppMode } from '../shared/appMode';

interface ExportButtonProps {
  mode: AppMode;
  flowName: string | null;
}

const EXPORT_WIDTH = 1920;
const EXPORT_HEIGHT = 1080;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

function ExportButton({ mode, flowName }: ExportButtonProps) {
  const { getNodes } = useReactFlow();

  const handleExport = async () => {
    const viewportEl = document.querySelector('.react-flow__viewport') as HTMLElement | null;
    if (!viewportEl) {
      return;
    }

    await document.fonts.ready;

    const bounds = getNodesBounds(getNodes());
    const viewport = getViewportForBounds(bounds, EXPORT_WIDTH, EXPORT_HEIGHT, MIN_ZOOM, MAX_ZOOM, 0.1);

    const dataUrl = await toPng(viewportEl, {
      backgroundColor: '#ffffff',
      width: EXPORT_WIDTH,
      height: EXPORT_HEIGHT,
      style: {
        width: `${EXPORT_WIDTH}`,
        height: `${EXPORT_HEIGHT}`,
        transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
      },
    });

    downloadDataUrl(dataUrl, `${flowName ?? 'flow-chart'}.png`);
  };

  return (
    <button
      type="button"
      className="icon-button"
      onClick={() => void handleExport()}
      disabled={mode !== 'preview'}
      title={mode === 'preview' ? 'Export to PNG' : 'Switch to preview mode to export'}
    >
      <Download size={18} />
    </button>
  );
}

export default ExportButton;
