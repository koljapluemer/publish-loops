import { useEffect } from 'react';
import { Undo2 } from 'lucide-react';
import type { PendingUndo } from '../hooks/useFlowDocument';

const AUTO_DISMISS_MS = 5000;

interface UndoToastProps {
  pendingUndo: PendingUndo;
  onUndo: () => void;
  onDismiss: () => void;
}

function messageFor(pendingUndo: PendingUndo): string {
  return pendingUndo.kind === 'node' ? 'Node deleted' : 'Edge deleted';
}

function UndoToast({ pendingUndo, onUndo, onDismiss }: UndoToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [pendingUndo, onDismiss]);

  return (
    <div className="undo-toast">
      <span>{messageFor(pendingUndo)}</span>
      <button type="button" className="undo-toast-button" onClick={onUndo}>
        <Undo2 size={14} />
        Undo
      </button>
    </div>
  );
}

export default UndoToast;
