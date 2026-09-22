import { getBezierPath, type ConnectionLineComponentProps, type InternalNode } from '@xyflow/react';
import { getBoundaryEndpoint } from './edgeRouting/nodeBounds';

function FloatingConnectionLine({ toX, toY, toPosition, fromNode }: ConnectionLineComponentProps) {
  if (!fromNode) {
    return null;
  }

  // Synthetic node standing in for the cursor position, shaped to satisfy
  // both edgeGeometry helpers (internals.positionAbsolute + measured/position).
  const targetNode = {
    id: 'connection-target',
    position: { x: toX, y: toY },
    measured: { width: 1, height: 1 },
    internals: { positionAbsolute: { x: toX, y: toY } },
  } as unknown as InternalNode;

  const sourceEndpoint = getBoundaryEndpoint(fromNode, targetNode);

  const [path] = getBezierPath({
    sourceX: sourceEndpoint.x,
    sourceY: sourceEndpoint.y,
    sourcePosition: sourceEndpoint.position,
    targetX: toX,
    targetY: toY,
    targetPosition: toPosition,
  });

  return (
    <g>
      <path fill="none" stroke="#222" strokeWidth={1.5} className="animated" d={path} />
      <circle cx={toX} cy={toY} fill="#fff" r={3} stroke="#222" strokeWidth={1.5} />
    </g>
  );
}

export default FloatingConnectionLine;
