import { BaseEdge, EdgeLabelRenderer, Position, useEdges, useInternalNode, useReactFlow, type EdgeProps, type InternalNode } from '@xyflow/react';
import { GripVertical, Trash2 } from 'lucide-react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { FlowEdge } from '../shared/flowTypes';
import { useEditableValue } from '../hooks/useEditableValue';
import { getEdgeParams } from './edgeGeometry';
import { useFlowInteraction } from './FlowInteractionContext';

function getOutwardDirection(position: Position) {
  switch (position) {
    case Position.Left:
      return { x: -1, y: 0 };
    case Position.Right:
      return { x: 1, y: 0 };
    case Position.Top:
      return { x: 0, y: -1 };
    case Position.Bottom:
      return { x: 0, y: 1 };
  }
}

function normalize(x: number, y: number) {
  const length = Math.hypot(x, y) || 1;
  return { x: x / length, y: y / length };
}

function controlLength(distance: number) {
  return Math.min(90, Math.max(18, distance / 3));
}

function offsetEndpoint(
  node: InternalNode,
  position: Position,
  point: { x: number; y: number },
  curveShift: { x: number; y: number },
  amount: number,
) {
  if (amount === 0) return point;

  const { x, y } = node.internals.positionAbsolute;
  const width = node.measured?.width ?? 0;
  const height = node.measured?.height ?? 0;
  const margin = Math.min(12, width / 4, height / 4);

  if (position === Position.Left || position === Position.Right) {
    return {
      x: point.x,
      y: Math.min(y + height - margin, Math.max(y + margin, point.y + Math.sign(curveShift.y) * amount)),
    };
  }

  return {
    x: Math.min(x + width - margin, Math.max(x + margin, point.x + Math.sign(curveShift.x) * amount)),
    y: point.y,
  };
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

  const edgeParams = getEdgeParams(sourceNode, targetNode);

  const relatedEdges = edges.filter(
    (edge) =>
      (edge.source === source && edge.target === target) ||
      (edge.source === target && edge.target === source),
  );
  const sameDirectionEdges = relatedEdges.filter((edge) => edge.source === source && edge.target === target);
  const directionIndex = sameDirectionEdges.findIndex((edge) => edge.id === id);
  const hasReverseEdge = relatedEdges.some((edge) => edge.source === target && edge.target === source);

  // A lone transition stays straight. Parallel transitions fan out, while
  // reverse transitions naturally land on the other side because reversing
  // the endpoints also reverses the perpendicular vector.
  const curveOffset = hasReverseEdge
    ? 32 + Math.max(directionIndex, 0) * 24
    : sameDirectionEdges.length > 1
      ? (directionIndex - (sameDirectionEdges.length - 1) / 2) * 48
      : 0;
  const baseDx = edgeParams.tx - edgeParams.sx;
  const baseDy = edgeParams.ty - edgeParams.sy;
  const baseDistance = Math.hypot(baseDx, baseDy) || 1;
  const automaticCurveShift = {
    x: (-baseDy / baseDistance) * curveOffset,
    y: (baseDx / baseDistance) * curveOffset,
  };
  const curveShift = data?.labelOffset ?? automaticCurveShift;
  const hasCurveShift = Math.abs(curveShift.x) > 0.5 || Math.abs(curveShift.y) > 0.5;
  const endpointOffset = hasCurveShift ? Math.min(28, 14 + Math.max(directionIndex, 0) * 6) : 0;
  const sourcePoint = offsetEndpoint(
    sourceNode,
    edgeParams.sourcePos,
    { x: edgeParams.sx, y: edgeParams.sy },
    curveShift,
    endpointOffset,
  );
  const targetPoint = offsetEndpoint(
    targetNode,
    edgeParams.targetPos,
    { x: edgeParams.tx, y: edgeParams.ty },
    curveShift,
    endpointOffset,
  );
  const { x: sx, y: sy } = sourcePoint;
  const { x: tx, y: ty } = targetPoint;
  const baseMidpointX = (edgeParams.sx + edgeParams.tx) / 2;
  const baseMidpointY = (edgeParams.sy + edgeParams.ty) / 2;
  const manualLabelX = baseMidpointX + (data?.labelOffset?.x ?? 0);
  const manualLabelY = baseMidpointY + (data?.labelOffset?.y ?? 0);
  const endpointDx = tx - sx;
  const endpointDy = ty - sy;
  const endpointDistance = Math.hypot(endpointDx, endpointDy) || 1;
  const labelX = data?.labelOffset
    ? manualLabelX
    : (sx + tx) / 2 + (-endpointDy / endpointDistance) * curveOffset * 0.5;
  const labelY = data?.labelOffset
    ? manualLabelY
    : (sy + ty) / 2 + (endpointDx / endpointDistance) * curveOffset * 0.5;

  const sourceToLabel = normalize(labelX - sx, labelY - sy);
  const labelToTarget = normalize(tx - labelX, ty - labelY);
  const chordDirection = normalize(endpointDx, endpointDy);
  const tangentSumX = sourceToLabel.x + labelToTarget.x;
  const tangentSumY = sourceToLabel.y + labelToTarget.y;
  const midpointTangent = Math.hypot(tangentSumX, tangentSumY) > 0.001
    ? normalize(tangentSumX, tangentSumY)
    : chordDirection;
  const sourceDirection = getOutwardDirection(edgeParams.sourcePos);
  const targetDirection = getOutwardDirection(edgeParams.targetPos);
  const sourceDistance = Math.hypot(labelX - sx, labelY - sy);
  const targetDistance = Math.hypot(tx - labelX, ty - labelY);
  const sourceControlLength = controlLength(sourceDistance);
  const targetControlLength = controlLength(targetDistance);

  const sourceControl = {
    x: sx + sourceDirection.x * sourceControlLength,
    y: sy + sourceDirection.y * sourceControlLength,
  };
  const labelIncomingControl = {
    x: labelX - midpointTangent.x * sourceControlLength,
    y: labelY - midpointTangent.y * sourceControlLength,
  };
  const labelOutgoingControl = {
    x: labelX + midpointTangent.x * targetControlLength,
    y: labelY + midpointTangent.y * targetControlLength,
  };
  const targetControl = {
    x: tx + targetDirection.x * targetControlLength,
    y: ty + targetDirection.y * targetControlLength,
  };
  const path = [
    `M ${sx},${sy}`,
    `C ${sourceControl.x},${sourceControl.y} ${labelIncomingControl.x},${labelIncomingControl.y} ${labelX},${labelY}`,
    `C ${labelOutgoingControl.x},${labelOutgoingControl.y} ${targetControl.x},${targetControl.y} ${tx},${ty}`,
  ].join(' ');

  const handleLabelDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.buttons !== 1) return;
    event.preventDefault();
    event.stopPropagation();
    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    updateEdgeLabelPosition(id, {
      x: position.x - baseMidpointX,
      y: position.y - baseMidpointY,
    });
  };

  const handleDragStart = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    handleLabelDrag(event);
  };

  const showLabel = mode === 'edit' || label.length > 0;

  return (
    <>
      <BaseEdge id={id} path={path} style={style} markerEnd={markerEnd} />
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
                <button
                  type="button"
                  className="edge-label-drag-handle"
                  onPointerDown={handleDragStart}
                  onPointerMove={handleLabelDrag}
                  onDoubleClick={() => updateEdgeLabelPosition(id, null)}
                  title="Drag to bend edge; double-click to reset"
                  aria-label="Drag edge label"
                >
                  <GripVertical size={14} />
                </button>
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
