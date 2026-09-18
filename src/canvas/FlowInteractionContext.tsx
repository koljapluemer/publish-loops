import { createContext, useContext } from 'react';
import type { AppMode } from '../shared/appMode';
import type { ImagePosition, NodeImage } from '../shared/flowTypes';
import type { XYPosition } from '@xyflow/react';

export interface FlowInteraction {
  mode: AppMode;
  updateNodeText: (nodeId: string, text: string) => void;
  setNodeImage: (nodeId: string, image: NodeImage | null) => void;
  setNodeImagePosition: (nodeId: string, position: ImagePosition) => void;
  updateEdgeLabel: (edgeId: string, label: string) => void;
  updateEdgeLabelPosition: (edgeId: string, offset: XYPosition | null) => void;
  deleteNode: (nodeId: string) => void;
  deleteEdge: (edgeId: string) => void;
}

const FlowInteractionContext = createContext<FlowInteraction | null>(null);

export const FlowInteractionProvider = FlowInteractionContext.Provider;

export function useFlowInteraction(): FlowInteraction {
  const value = useContext(FlowInteractionContext);
  if (!value) {
    throw new Error('useFlowInteraction must be used within a FlowInteractionProvider');
  }
  return value;
}
