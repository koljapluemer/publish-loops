import { Handle, Position, type NodeProps } from '@xyflow/react';
import { GripVertical } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { FlowNode } from '../shared/flowTypes';
import { useFlowInteraction } from './FlowInteractionContext';
import { DRAG_HANDLE_CLASS_NAME } from './createTextNode';

function TextNode({ id, data }: NodeProps<FlowNode>) {
  const { mode, updateNodeText } = useFlowInteraction();

  return (
    <div className={`text-node text-node--${mode}`}>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
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
