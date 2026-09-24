import type { InternalNode, XYPosition } from '@xyflow/react';
import { getBoundaryPointAtAngle } from './nodeBounds';
import { cubicPath, cubicPoint, type RoutedEdge } from './pathMath';

export const BASE_LOOP_RADIUS = 64;
export const LOOP_RADIUS_STEP = 12;
export const MIN_LOOP_RADIUS = 28;

const LOOP_ANGULAR_HALF_SPREAD = (26 * Math.PI) / 180;

/**
 * Routes a loop that bulges outward from the node at `loopAngle` (radians,
 * 0 = pointing right) by `radius` pixels. The two anchor points straddle
 * that angle, so distinct `loopAngle`s always produce distinct anchors —
 * unlike a fixed anchor pair that only grows in radius.
 */
export function routeSelfLoop(node: InternalNode, loopAngle: number, radius: number): RoutedEdge {
  const sourcePoint = getBoundaryPointAtAngle(node, loopAngle - LOOP_ANGULAR_HALF_SPREAD);
  const targetPoint = getBoundaryPointAtAngle(node, loopAngle + LOOP_ANGULAR_HALF_SPREAD);
  const bulge: XYPosition = {
    x: Math.cos(loopAngle) * radius,
    y: Math.sin(loopAngle) * radius,
  };
  const firstControl = { x: sourcePoint.x + bulge.x, y: sourcePoint.y + bulge.y };
  const secondControl = { x: targetPoint.x + bulge.x, y: targetPoint.y + bulge.y };

  return {
    path: cubicPath(sourcePoint, firstControl, secondControl, targetPoint),
    labelPoint: cubicPoint(sourcePoint, firstControl, secondControl, targetPoint, 0.5),
    sourcePoint,
    targetPoint,
  };
}

/** Radius for a self-loop that hasn't been manually dragged, spread out by index so stacked loops stay legible. */
export function defaultSelfLoopRadius(loopIndex: number): number {
  return BASE_LOOP_RADIUS + loopIndex * LOOP_RADIUS_STEP;
}
