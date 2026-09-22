import { Position, type XYPosition } from '@xyflow/react';

export interface RoutedEdge {
  path: string;
  labelPoint: XYPosition;
  sourcePoint: XYPosition;
  targetPoint: XYPosition;
}

export function outwardVector(position: Position): XYPosition {
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

export function cubicPoint(
  start: XYPosition,
  firstControl: XYPosition,
  secondControl: XYPosition,
  end: XYPosition,
  time: number,
): XYPosition {
  const inverse = 1 - time;
  return {
    x: inverse ** 3 * start.x
      + 3 * inverse ** 2 * time * firstControl.x
      + 3 * inverse * time ** 2 * secondControl.x
      + time ** 3 * end.x,
    y: inverse ** 3 * start.y
      + 3 * inverse ** 2 * time * firstControl.y
      + 3 * inverse * time ** 2 * secondControl.y
      + time ** 3 * end.y,
  };
}

export function cubicPath(
  start: XYPosition,
  firstControl: XYPosition,
  secondControl: XYPosition,
  end: XYPosition,
): string {
  return [
    `M ${start.x},${start.y}`,
    `C ${firstControl.x},${firstControl.y} ${secondControl.x},${secondControl.y} ${end.x},${end.y}`,
  ].join(' ');
}
