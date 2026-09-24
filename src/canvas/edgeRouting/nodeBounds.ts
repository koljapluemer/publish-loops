import { Position, type InternalNode, type XYPosition } from '@xyflow/react';

export interface NodeBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface EdgeEndpoint extends XYPosition {
  position: Position;
}

export function getNodeBounds(node: InternalNode): NodeBounds {
  return {
    x: node.internals.positionAbsolute.x,
    y: node.internals.positionAbsolute.y,
    width: node.measured?.width ?? 0,
    height: node.measured?.height ?? 0,
  };
}

function center(bounds: NodeBounds): XYPosition {
  return {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height / 2,
  };
}

export function getNodeCenter(node: InternalNode): XYPosition {
  return center(getNodeBounds(node));
}

/** Returns where a ray from the node's center in direction (dx, dy) exits its bounds. */
function boundaryPointForDirection(bounds: NodeBounds, dx: number, dy: number): EdgeEndpoint {
  const nodeCenter = center(bounds);

  if (dx === 0 && dy === 0) {
    return { x: bounds.x + bounds.width, y: nodeCenter.y, position: Position.Right };
  }

  const horizontalScale = dx === 0 ? Number.POSITIVE_INFINITY : bounds.width / 2 / Math.abs(dx);
  const verticalScale = dy === 0 ? Number.POSITIVE_INFINITY : bounds.height / 2 / Math.abs(dy);
  const scale = Math.min(horizontalScale, verticalScale);
  const x = nodeCenter.x + dx * scale;
  const y = nodeCenter.y + dy * scale;

  if (horizontalScale < verticalScale) {
    return { x, y, position: dx < 0 ? Position.Left : Position.Right };
  }
  return { x, y, position: dy < 0 ? Position.Top : Position.Bottom };
}

/** Returns where the center-to-center ray exits a rectangular node. */
export function getBoundaryEndpoint(node: InternalNode, otherNode: InternalNode): EdgeEndpoint {
  const bounds = getNodeBounds(node);
  const nodeCenter = center(bounds);
  const otherCenter = center(getNodeBounds(otherNode));
  return boundaryPointForDirection(bounds, otherCenter.x - nodeCenter.x, otherCenter.y - nodeCenter.y);
}

/** Returns where a ray from the node's center at the given angle (radians) exits its bounds. */
export function getBoundaryPointAtAngle(node: InternalNode, angle: number): EdgeEndpoint {
  const bounds = getNodeBounds(node);
  return boundaryPointForDirection(bounds, Math.cos(angle), Math.sin(angle));
}
