import { Handle, Position, useConnection, type NodeProps } from '@xyflow/react';
import { GripVertical } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { FlowNode } from '../shared/flowTypes';
import { useFlowInteraction } from './FlowInteractionContext';
import { DRAG_HANDLE_CLASS_NAME } from './createTextNode';

function TextNode({ id, data }: NodeProps<FlowNode>) {
  const { mode, updateNodeText } = useFlowInteraction();
  const connection = useConnection();
  // Whole-card "drop here" cue: lights up any node that's a legal target
  // while a connection is actively being dragged from a different node.
  const isConnectionTarget = connection.inProgress && connection.fromNode?.id !== id;

  return (
    <div className={`text-node text-node--${mode} ${isConnectionTarget ? 'text-node--connection-target' : ''}`}>
      {/* Target can't start a drag (isConnectableStart=false), so it stays
          pointer-events:none — and thus fully click-through to the header/
          textarea beneath it — until a connection is already in progress.
          That's what makes it safe to size it to cover the whole card: you
          only need to drop anywhere on the destination node, not hit a
          precise handle, while idle interactions are untouched. */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectableStart={false}
        className="text-node-handle-target"
      />
      <Handle type="source" position={Position.Bottom} className="text-node-handle-source" />
      {mode === 'edit' ? (
        <>
          <div className={`text-node-header ${DRAG_HANDLE_CLASS_NAME}`}>
            <GripVertical size={14} />
          </div>
          <textarea
            className="nodrag nopan text-node-textarea"
            value={data.text}
            onChange={(event) => updateNodeText(id, event.target.value)}
            placeholder="Node text..."
          />
        </>
      ) : (
        <div className="text-node-markdown">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.text}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}

export default TextNode;
