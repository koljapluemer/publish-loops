import type { XYPosition } from '@xyflow/react';
import type { FlowNode } from '../shared/flowTypes';

export const DRAG_HANDLE_CLASS_NAME = 'custom-drag-handle';
export const DRAG_HANDLE_SELECTOR = `.${DRAG_HANDLE_CLASS_NAME}`;

export function createTextNode(position: XYPosition): FlowNode {
  return {
    id: crypto.randomUUID(),
    type: 'text',
    position,
    data: { text: '' },
    dragHandle: DRAG_HANDLE_SELECTOR,
  };
}
