import type { InternalNode, XYPosition } from '@xyflow/react';
import { getBoundaryEndpoint } from './nodeBounds';
import type { RoutedEdge } from './pathMath';
import { routeNormalEdge } from './routeNormalEdge';
import { routeSelfLoop } from './routeSelfLoop';

interface RouteEdgeOptions {
  sourceNode: InternalNode;
  targetNode: InternalNode;
  curveShift: XYPosition;
  selfLoopIndex: number;
}

export function routeEdge({ sourceNode, targetNode, curveShift, selfLoopIndex }: RouteEdgeOptions): RoutedEdge {
  if (sourceNode.id === targetNode.id) {
    return routeSelfLoop(sourceNode, selfLoopIndex, curveShift);
  }

  return routeNormalEdge(
    getBoundaryEndpoint(sourceNode, targetNode),
    getBoundaryEndpoint(targetNode, sourceNode),
    curveShift,
  );
}
