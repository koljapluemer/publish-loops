import { useCallback, useMemo } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import {
  Background,
  Controls,
  MarkerType,
  ReactFlow,
  useReactFlow,
  type DefaultEdgeOptions,
  type EdgeTypes,
  type NodeTypes,
} from '@xyflow/react';
import { useFlowDocument } from '../hooks/useFlowDocument';
import type { AppMode } from '../shared/appMode';
import AddNodeButton from './AddNodeButton';
import AutoSavePreview from './AutoSavePreview';
import { createTextNode } from './createTextNode';
import { FlowInteractionProvider } from './FlowInteractionContext';
import FloatingConnectionLine from './FloatingConnectionLine';
import FloatingEdge from './FloatingEdge';
import TextNode from './TextNode';
import UndoToast from './UndoToast';

// Module-level constants: nodeTypes/edgeTypes must keep a stable identity
// across renders, otherwise React Flow remounts every node/edge (which would
// drop textarea focus when toggling edit/preview mode).
const nodeTypes: NodeTypes = { text: TextNode };
const edgeTypes: EdgeTypes = { floating: FloatingEdge };
const defaultEdgeOptions: DefaultEdgeOptions = { markerEnd: { type: MarkerType.ArrowClosed } };

interface FlowCanvasProps {
  slug: string;
  mode: AppMode;
}

function FlowCanvas({ slug, mode }: FlowCanvasProps) {
  const {
    state,
    saveStatus,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    updateNodeText,
    setNodeImage,
    setNodeImagePosition,
    updateEdgeLabel,
    deleteNode,
    deleteEdge,
    pendingUndo,
    undoDelete,
    dismissUndo,
  } = useFlowDocument(slug);
  const { screenToFlowPosition } = useReactFlow();
  const isEdit = mode === 'edit';

  // React Flow's onPaneClick fires on every click; a native `detail` of 2
  // (browser-reported double-click) is what tells single- and double-click
  // apart, so no manual timing/threshold tracking is needed.
  const handlePaneDoubleClick = useCallback(
    (event: ReactMouseEvent) => {
      if (!isEdit || event.detail < 2) return;
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      addNode(createTextNode(position));
    },
    [isEdit, screenToFlowPosition, addNode],
  );

  // Kept referentially stable so that editing one node/edge doesn't force
  // every other node/edge on the canvas to re-render along with it.
  const interaction = useMemo(
    () => ({ mode, updateNodeText, setNodeImage, setNodeImagePosition, updateEdgeLabel, deleteNode, deleteEdge }),
    [mode, updateNodeText, setNodeImage, setNodeImagePosition, updateEdgeLabel, deleteNode, deleteEdge],
  );

  if (state.status === 'idle' || state.status === 'loading') {
    return <div className="flow-canvas-message">Loading…</div>;
  }

  if (state.status === 'error') {
    return <div className="flow-canvas-message flow-canvas-message--error">Failed to load flow: {state.message}</div>;
  }

  return (
    <FlowInteractionProvider value={interaction}>
      <div className="flow-canvas">
        <ReactFlow
          nodes={state.nodes}
          edges={state.edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onPaneClick={handlePaneDoubleClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          connectionLineComponent={FloatingConnectionLine}
          connectionRadius={40}
          defaultMarkerColor={null}
          nodesDraggable={isEdit}
          nodesConnectable={isEdit}
          elementsSelectable={isEdit}
          zoomOnDoubleClick={!isEdit}
          proOptions={{ hideAttribution: true }}
        >
          {isEdit && <Background />}
          {isEdit && <Controls />}
        </ReactFlow>
        <AutoSavePreview mode={mode} slug={slug} />
        {isEdit && <AddNodeButton onAdd={addNode} />}
        <div className="top-right-stack">
          {saveStatus === 'saving' && <div className="save-status">Saving…</div>}
          {saveStatus === 'error' && <div className="save-status save-status--error">Save failed</div>}
          {pendingUndo && <UndoToast pendingUndo={pendingUndo} onUndo={undoDelete} onDismiss={dismissUndo} />}
        </div>
      </div>
    </FlowInteractionProvider>
  );
}

export default FlowCanvas;
