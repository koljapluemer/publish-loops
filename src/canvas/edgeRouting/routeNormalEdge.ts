import type { XYPosition } from '@xyflow/react';
import type { EdgeEndpoint } from './nodeBounds';
import { cubicPath, cubicPoint, outwardVector, type RoutedEdge } from './pathMath';

const MIN_CONTROL_LENGTH = 24;
const MAX_CONTROL_LENGTH = 120;

export function routeNormalEdge(
  source: EdgeEndpoint,
  target: EdgeEndpoint,
  curveShift: XYPosition,
): RoutedEdge {
  const distance = Math.hypot(target.x - source.x, target.y - source.y);
  const controlLength = Math.min(MAX_CONTROL_LENGTH, Math.max(MIN_CONTROL_LENGTH, distance / 3));
  const sourceDirection = outwardVector(source.position);
  const targetDirection = outwardVector(target.position);
  const firstControl = {
    x: source.x + sourceDirection.x * controlLength + curveShift.x,
    y: source.y + sourceDirection.y * controlLength + curveShift.y,
  };
  const secondControl = {
    x: target.x + targetDirection.x * controlLength + curveShift.x,
    y: target.y + targetDirection.y * controlLength + curveShift.y,
  };

  return {
    path: cubicPath(source, firstControl, secondControl, target),
    labelPoint: cubicPoint(source, firstControl, secondControl, target, 0.5),
    sourcePoint: source,
    targetPoint: target,
  };
}
