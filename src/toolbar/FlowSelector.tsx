import type { FlowListState } from '../hooks/useFlowList';

interface FlowSelectorProps {
  state: FlowListState;
  activeSlug: string | null;
  onSelectFlow: (slug: string) => void;
}

function FlowSelector({ state, activeSlug, onSelectFlow }: FlowSelectorProps) {
  if (state.status !== 'ready') {
    return (
      <select className="flow-selector" disabled>
        <option>{state.status === 'error' ? 'Failed to load flows' : 'Loading…'}</option>
      </select>
    );
  }

  if (state.flows.length === 0) {
    return (
      <select className="flow-selector" disabled>
        <option>No flows yet</option>
      </select>
    );
  }

  return (
    <select
      className="flow-selector"
      value={activeSlug ?? ''}
      onChange={(event) => onSelectFlow(event.target.value)}
    >
      {state.flows.map((flow) => (
        <option key={flow.slug} value={flow.slug}>
          {flow.name}
        </option>
      ))}
    </select>
  );
}

export default FlowSelector;
