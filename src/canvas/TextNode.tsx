import { Handle, Position, useConnection, type NodeProps } from '@xyflow/react';
import { GripVertical, ImageMinus, ImagePlus, Trash2 } from 'lucide-react';
import type { ClipboardEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { FlowNode, ImagePosition } from '../shared/flowTypes';
import { useFlowInteraction } from './FlowInteractionContext';
import { DRAG_HANDLE_CLASS_NAME } from './createTextNode';
import { useNodeImageSrc } from './useNodeImageSrc';

const IMAGE_POSITIONS: { value: ImagePosition; label: string }[] = [
  { value: 'above', label: 'Above' },
  { value: 'below', label: 'Below' },
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
];

function TextNode({ id, data }: NodeProps<FlowNode>) {
  const { mode, updateNodeText, setNodeImage, setNodeImagePosition, deleteNode } = useFlowInteraction();
  const connection = useConnection();
  // Whole-card "drop here" cue: lights up any node that's a legal target
  // while a connection is actively being dragged from a different node.
  const isConnectionTarget = connection.inProgress && connection.fromNode?.id !== id;

  const image = data.image;
  const imagePosition = image?.position ?? 'above';
  const imageSrc = useNodeImageSrc(image?.path);

  const handleAddImage = async () => {
    const path = await window.flowsApi.selectImage();
    if (path) setNodeImage(id, { path, position: imagePosition });
  };

  const handleRemoveImage = () => {
    if (image) void window.flowsApi.deleteImage(image.path);
    setNodeImage(id, null);
  };

  const handlePaste = async (event: ClipboardEvent<HTMLTextAreaElement>) => {
    const item = Array.from(event.clipboardData?.items ?? []).find((entry) => entry.type.startsWith('image/'));
    if (!item) return;
    event.preventDefault();
    const file = item.getAsFile();
    if (!file) return;
    const bytes = await file.arrayBuffer();
    const path = await window.flowsApi.saveImageData(bytes, file.type);
    setNodeImage(id, { path, position: imagePosition });
  };

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
      {mode === 'edit' && (
        <div className={`text-node-header ${DRAG_HANDLE_CLASS_NAME}`}>
          <GripVertical size={14} />
          <div className="text-node-header-actions">
            {image && (
              <select
                className="nodrag nopan text-node-image-position"
                value={imagePosition}
                onChange={(event) => setNodeImagePosition(id, event.target.value as ImagePosition)}
                title="Image position"
              >
                {IMAGE_POSITIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
            <button
              type="button"
              className="nodrag text-node-icon-button"
              onClick={handleAddImage}
              title="Add image"
            >
              <ImagePlus size={13} />
            </button>
            {image && (
              <button
                type="button"
                className="nodrag text-node-icon-button"
                onClick={handleRemoveImage}
                title="Remove image"
              >
                <ImageMinus size={13} />
              </button>
            )}
            <button
              type="button"
              className="nodrag text-node-icon-button text-node-icon-button--danger"
              onClick={() => deleteNode(id)}
              title="Delete node"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      )}
      <div className={`text-node-body text-node-body--${imagePosition}`}>
        {imageSrc && <img src={imageSrc} alt="" className="text-node-image" />}
        {mode === 'edit' ? (
          <textarea
            className="nodrag nopan text-node-textarea"
            value={data.text}
            onChange={(event) => updateNodeText(id, event.target.value)}
            onPaste={handlePaste}
            placeholder="Node text..."
          />
        ) : (
          <div className="text-node-markdown">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.text}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

export default TextNode;
