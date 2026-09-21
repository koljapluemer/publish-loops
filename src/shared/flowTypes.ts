import type { Node, Edge, XYPosition } from '@xyflow/react';

export interface FlowSummary {
  slug: string;
  name: string;
}

export type ImagePosition = 'left' | 'right' | 'above' | 'below';

export interface NodeImage {
  path: string;
  position: ImagePosition;
}

export interface TextNodeData extends Record<string, unknown> {
  text: string;
  image?: NodeImage;
}

export interface FloatingEdgeData extends Record<string, unknown> {
  label: string;
  labelOffset?: XYPosition;
}

export type FlowNode = Node<TextNodeData, 'text'>;
export type FlowEdge = Edge<FloatingEdgeData, 'floating'>;

export interface FlowChartFile {
  name: string;
  /** Whether the koljasam.com SSG should publish this flow. */
  published: boolean;
  /** Optional extra info about this loop, shown alongside it on the site. */
  body: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
}
