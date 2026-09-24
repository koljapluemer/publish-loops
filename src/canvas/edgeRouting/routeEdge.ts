import type { InternalNode, XYPosition } from '@xyflow/react';
import { getBoundaryEndpoint } from './nodeBounds';
import type { RoutedEdge } from './pathMath';
import { routeNormalEdge } from './routeNormalEdge';
import { routeSelfLoop } from './routeSelfLoop';

interface RouteEdgeOptions {
  sourceNode: InternalNode;
  targetNode: InternalNode;
  curveShift: XYPosition;
  selfLoopAngle: number;
  selfLoopRadius: number;
}

export function routeEdge({
  sourceNode,
  targetNode,
  curveShift,
  selfLoopAngle,
  selfLoopRadius,
}: RouteEdgeOptions): RoutedEdge {
  if (sourceNode.id === targetNode.id) {
    return routeSelfLoop(sourceNode, selfLoopAngle, selfLoopRadius);
  }

  return routeNormalEdge(
    getBoundaryEndpoint(sourceNode, targetNode),
    getBoundaryEndpoint(targetNode, sourceNode),
    curveShift,
  );
}
