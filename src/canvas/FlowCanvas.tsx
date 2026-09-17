import { Background, Controls, ReactFlow, type EdgeTypes, type NodeTypes } from '@xyflow/react';
import { useFlowDocument } from '../hooks/useFlowDocument';
import type { AppMode } from '../shared/appMode';
import AddNodeButton from './AddNodeButton';
import { FlowInteractionProvider } from './FlowInteractionContext';
import FloatingConnectionLine from './FloatingConnectionLine';
import FloatingEdge from './FloatingEdge';
import TextNode from './TextNode';

// Module-level constants: nodeTypes/edgeTypes must keep a stable identity
// across renders, otherwise React Flow remounts every node/edge (which would
// drop textarea focus when toggling edit/preview mode).
const nodeTypes: NodeTypes = { text: TextNode };
const edgeTypes: EdgeTypes = { floating: FloatingEdge };

interface FlowCanvasProps {
  slug: string;
  mode: AppMode;
}

function FlowCanvas({ slug, mode }: FlowCanvasProps) {
  const { state, saveStatus, onNodesChange, onEdgesChange, onConnect, addNode, updateNodeText, updateEdgeLabel } =
    useFlowDocument(slug);

  if (state.status === 'idle' || state.status === 'loading') {
    return <div className="flow-canvas-message">Loading…</div>;
  }

  if (state.status === 'error') {
    return <div className="flow-canvas-message flow-canvas-message--error">Failed to load flow: {state.message}</div>;
  }

  const isEdit = mode === 'edit';

  return (
    <FlowInteractionProvider value={{ mode, updateNodeText, updateEdgeLabel }}>
      <div className="flow-canvas">
        <ReactFlow
          nodes={state.nodes}
          edges={state.edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionLineComponent={FloatingConnectionLine}
          nodesDraggable={isEdit}
          nodesConnectable={isEdit}
          elementsSelectable={isEdit}
          proOptions={{ hideAttribution: true }}
        >
          {isEdit && <Background />}
          {isEdit && <Controls />}
        </ReactFlow>
        {isEdit && <AddNodeButton onAdd={addNode} />}
        {saveStatus === 'saving' && <div className="save-status">Saving…</div>}
        {saveStatus === 'error' && <div className="save-status save-status--error">Save failed</div>}
      </div>
    </FlowInteractionProvider>
  );
}

export default FlowCanvas;
