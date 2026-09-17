import type { Node, Edge } from '@xyflow/react';

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
}

export type FlowNode = Node<TextNodeData, 'text'>;
export type FlowEdge = Edge<FloatingEdgeData, 'floating'>;

export interface FlowChartFile {
  name: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
}
