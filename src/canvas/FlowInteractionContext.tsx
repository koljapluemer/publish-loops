import { createContext, useContext } from 'react';
import type { AppMode } from '../shared/appMode';

export interface FlowInteraction {
  mode: AppMode;
  updateNodeText: (nodeId: string, text: string) => void;
  updateEdgeLabel: (edgeId: string, label: string) => void;
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
