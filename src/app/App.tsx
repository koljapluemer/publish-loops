import { useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import FlowCanvas from '../canvas/FlowCanvas';
import { useFlowList } from '../hooks/useFlowList';
import type { AppMode } from '../shared/appMode';
import Toolbar from '../toolbar/Toolbar';

export function App() {
  const { state: listState, createFlow } = useFlowList();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [mode, setMode] = useState<AppMode>('edit');

  // Falls back to the first flow once the list loads, without needing an
  // effect: this is derived render-time state, not a side effect.
  const activeSlug =
    selectedSlug ?? (listState.status === 'ready' ? (listState.flows[0]?.slug ?? null) : null);

  const activeFlowName =
    listState.status === 'ready' ? (listState.flows.find((flow) => flow.slug === activeSlug)?.name ?? null) : null;

  const handleCreateFlow = async (name: string) => {
    const flow = await createFlow(name);
    setSelectedSlug(flow.slug);
  };

  return (
    <ReactFlowProvider>
      <div className="app">
        <Toolbar
          listState={listState}
          activeSlug={activeSlug}
          activeFlowName={activeFlowName}
          mode={mode}
          onSelectFlow={setSelectedSlug}
          onCreateFlow={handleCreateFlow}
          onModeChange={setMode}
        />
        <div className="app-canvas-area">
          {activeSlug ? (
            <FlowCanvas slug={activeSlug} mode={mode} />
          ) : (
            <div className="flow-canvas-message">
              {listState.status === 'ready' ? 'Create a flow chart to get started.' : 'Loading…'}
            </div>
          )}
        </div>
      </div>
    </ReactFlowProvider>
  );
}
