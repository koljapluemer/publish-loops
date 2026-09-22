import { BaseEdge, EdgeLabelRenderer, useEdges, useInternalNode, useReactFlow, type EdgeProps } from '@xyflow/react';
import { GripVertical, Trash2 } from 'lucide-react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { FlowEdge } from '../shared/flowTypes';
import { useEditableValue } from '../hooks/useEditableValue';
import { getBoundaryEndpoint } from './edgeRouting/nodeBounds';
import { routeEdge } from './edgeRouting/routeEdge';
import { useFlowInteraction } from './FlowInteractionContext';

interface EdgeLabelDragHandleProps {
  side: 'left' | 'right';
  onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onReset: () => void;
}

function EdgeLabelDragHandle({ side, onPointerDown, onPointerMove, onReset }: EdgeLabelDragHandleProps) {
  return (
    <button
      type="button"
      className="edge-label-drag-handle"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onDoubleClick={onReset}
      title="Drag to bend edge; double-click to reset"
      aria-label={`Drag edge label from ${side} side`}
    >
      <GripVertical size={14} />
    </button>
  );
}

function FloatingEdge({ id, source, target, data, style, markerEnd }: EdgeProps<FlowEdge>) {
  const { mode, updateEdgeLabel, updateEdgeLabelPosition, deleteEdge } = useFlowInteraction();
  const { screenToFlowPosition } = useReactFlow();
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);
  const edges = useEdges<FlowEdge>();
  const [label, setLabel, flushLabel] = useEditableValue(data?.label ?? '', (next) => updateEdgeLabel(id, next));

  if (!sourceNode || !targetNode) {
    return null;
  }

  const relatedEdges = edges.filter(
    (edge) =>
      (edge.source === source && edge.target === target) ||
      (edge.source === target && edge.target === source),
  );
  const sameDirectionEdges = relatedEdges.filter((edge) => edge.source === source && edge.target === target);
  const directionIndex = sameDirectionEdges.findIndex((edge) => edge.id === id);
  const isSelfLoop = source === target;
  const hasReverseEdge = !isSelfLoop
    && relatedEdges.some((edge) => edge.source === target && edge.target === source);

  // A lone transition stays straight. Parallel transitions fan out, while
  // reverse transitions naturally land on the other side because reversing
  // the endpoints also reverses the perpendicular vector.
  const curveOffset = hasReverseEdge
    ? 32 + Math.max(directionIndex, 0) * 24
    : sameDirectionEdges.length > 1
      ? (directionIndex - (sameDirectionEdges.length - 1) / 2) * 48
      : 0;
  const sourceEndpoint = isSelfLoop ? null : getBoundaryEndpoint(sourceNode, targetNode);
  const targetEndpoint = isSelfLoop ? null : getBoundaryEndpoint(targetNode, sourceNode);
  const baseDx = (targetEndpoint?.x ?? 0) - (sourceEndpoint?.x ?? 0);
  const baseDy = (targetEndpoint?.y ?? 0) - (sourceEndpoint?.y ?? 0);
  const baseDistance = Math.hypot(baseDx, baseDy) || 1;
  const automaticCurveShift = {
    x: (-baseDy / baseDistance) * curveOffset,
    y: (baseDx / baseDistance) * curveOffset,
  };
  const curveShift = data?.labelOffset ?? automaticCurveShift;
  const route = routeEdge({
    sourceNode,
    targetNode,
    curveShift,
    selfLoopIndex: Math.max(directionIndex, 0),
  });
  const unshiftedRoute = routeEdge({
    sourceNode,
    targetNode,
    curveShift: { x: 0, y: 0 },
    selfLoopIndex: Math.max(directionIndex, 0),
  });
  const { x: labelX, y: labelY } = route.labelPoint;

  const handleLabelDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.buttons !== 1) return;
    event.preventDefault();
    event.stopPropagation();
    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    updateEdgeLabelPosition(id, {
      // A cubic's two control points contribute 3/4 of their shared shift
      // at t=0.5, so invert that factor to keep the drag handle under the pointer.
      x: (position.x - unshiftedRoute.labelPoint.x) / 0.75,
      y: (position.y - unshiftedRoute.labelPoint.y) / 0.75,
    });
  };

  const handleDragStart = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    handleLabelDrag(event);
  };

  const showLabel = mode === 'edit' || label.length > 0;

  return (
    <>
      <BaseEdge id={id} path={route.path} style={style} markerEnd={markerEnd} />
      {showLabel && (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan edge-label"
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: mode === 'edit' ? 'all' : 'none',
            }}
          >
            {mode === 'edit' ? (
              <div className="edge-label-edit">
                <EdgeLabelDragHandle
                  side="left"
                  onPointerDown={handleDragStart}
                  onPointerMove={handleLabelDrag}
                  onReset={() => updateEdgeLabelPosition(id, null)}
                />
                <input
                  value={label}
                  onChange={(event) => setLabel(event.target.value)}
                  onBlur={flushLabel}
                  placeholder="Label..."
                />
                <button
                  type="button"
                  className="edge-delete-button"
                  onClick={() => deleteEdge(id)}
                  title="Delete edge"
                >
                  <Trash2 size={12} />
                </button>
                <EdgeLabelDragHandle
                  side="right"
                  onPointerDown={handleDragStart}
                  onPointerMove={handleLabelDrag}
                  onReset={() => updateEdgeLabelPosition(id, null)}
                />
              </div>
            ) : (
              <span>{label}</span>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export default FloatingEdge;
