import type { FlowListState } from '../hooks/useFlowList';
import type { AppMode } from '../shared/appMode';
import FlowSelector from './FlowSelector';
import ModeToggle from './ModeToggle';
import NewFlowButton from './NewFlowButton';

interface ToolbarProps {
  listState: FlowListState;
  activeSlug: string | null;
  mode: AppMode;
  onSelectFlow: (slug: string) => void;
  onCreateFlow: (name: string) => Promise<void>;
  onModeChange: (mode: AppMode) => void;
}

function Toolbar({
  listState,
  activeSlug,
  mode,
  onSelectFlow,
  onCreateFlow,
  onModeChange,
}: ToolbarProps) {
  return (
    <div className="toolbar">
      <FlowSelector state={listState} activeSlug={activeSlug} onSelectFlow={onSelectFlow} />
      <NewFlowButton onCreate={onCreateFlow} />
      <div className="toolbar-spacer" />
      <ModeToggle mode={mode} onChange={onModeChange} />
    </div>
  );
}

export default Toolbar;
