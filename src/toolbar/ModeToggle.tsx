import { Eye, Pencil } from 'lucide-react';
import type { AppMode } from '../shared/appMode';

interface ModeToggleProps {
  mode: AppMode;
  onChange: (mode: AppMode) => void;
}

function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="mode-toggle" role="group" aria-label="Mode">
      <button
        type="button"
        className={mode === 'edit' ? 'mode-toggle-active' : ''}
        onClick={() => onChange('edit')}
      >
        <Pencil size={14} /> Edit
      </button>
      <button
        type="button"
        className={mode === 'preview' ? 'mode-toggle-active' : ''}
        onClick={() => onChange('preview')}
      >
        <Eye size={14} /> Preview
      </button>
    </div>
  );
}

export default ModeToggle;
