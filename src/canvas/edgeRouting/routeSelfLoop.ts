import type { InternalNode, XYPosition } from '@xyflow/react';
import { getNodeBounds } from './nodeBounds';
import { cubicPath, cubicPoint, type RoutedEdge } from './pathMath';

const BASE_LOOP_RADIUS = 64;
const LOOP_SPACING = 28;

export function routeSelfLoop(node: InternalNode, loopIndex: number, curveShift: XYPosition): RoutedEdge {
  const bounds = getNodeBounds(node);
  const radius = BASE_LOOP_RADIUS + loopIndex * LOOP_SPACING;
  const sourcePoint = {
    x: bounds.x + bounds.width,
    y: bounds.y + bounds.height * 0.68,
  };
  const targetPoint = {
    x: bounds.x + bounds.width,
    y: bounds.y + bounds.height * 0.32,
  };
  const firstControl = {
    x: sourcePoint.x + radius + curveShift.x,
    y: sourcePoint.y + radius * 0.35 + curveShift.y,
  };
  const secondControl = {
    x: targetPoint.x + radius + curveShift.x,
    y: targetPoint.y - radius * 0.35 + curveShift.y,
  };

  return {
    path: cubicPath(sourcePoint, firstControl, secondControl, targetPoint),
    labelPoint: cubicPoint(sourcePoint, firstControl, secondControl, targetPoint, 0.5),
    sourcePoint,
    targetPoint,
  };
}
