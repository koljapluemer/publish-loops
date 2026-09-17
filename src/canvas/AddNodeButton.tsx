import { Plus } from 'lucide-react';
import { useReactFlow } from '@xyflow/react';
import type { FlowNode } from '../shared/flowTypes';
import { createTextNode } from './createTextNode';

interface AddNodeButtonProps {
  onAdd: (node: FlowNode) => void;
}

function AddNodeButton({ onAdd }: AddNodeButtonProps) {
  const { screenToFlowPosition } = useReactFlow();

  const handleClick = () => {
    const position = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    onAdd(createTextNode(position));
  };

  return (
    <button type="button" className="add-node-button" onClick={handleClick} title="Add node">
      <Plus size={18} />
    </button>
  );
}

export default AddNodeButton;
