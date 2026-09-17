import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import {
  applyEdgeChanges,
  applyNodeChanges,
  addEdge,
  type Connection,
  type EdgeChange,
  type NodeChange,
} from '@xyflow/react';
import type { FlowChartFile, FlowEdge, FlowNode } from '../shared/flowTypes';

type FlowDocState =
  | { status: 'idle' }
  | { status: 'loading'; slug: string }
  | { status: 'ready'; slug: string; name: string; nodes: FlowNode[]; edges: FlowEdge[] }
  | { status: 'error'; slug: string; message: string };

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

type FlowDocAction =
  | { type: 'LOAD_START'; slug: string }
  | { type: 'LOAD_SUCCESS'; slug: string; name: string; nodes: FlowNode[]; edges: FlowEdge[] }
  | { type: 'LOAD_ERROR'; slug: string; message: string }
  | { type: 'RESET' }
  | { type: 'APPLY_NODE_CHANGES'; changes: NodeChange<FlowNode>[] }
  | { type: 'APPLY_EDGE_CHANGES'; changes: EdgeChange<FlowEdge>[] }
  | { type: 'CONNECT'; connection: Connection }
  | { type: 'ADD_NODE'; node: FlowNode }
  | { type: 'UPDATE_NODE_TEXT'; nodeId: string; text: string }
  | { type: 'UPDATE_EDGE_LABEL'; edgeId: string; label: string };

function reducer(state: FlowDocState, action: FlowDocAction): FlowDocState {
  switch (action.type) {
    case 'LOAD_START':
      return { status: 'loading', slug: action.slug };
    case 'LOAD_SUCCESS':
      return { status: 'ready', slug: action.slug, name: action.name, nodes: action.nodes, edges: action.edges };
    case 'LOAD_ERROR':
      return { status: 'error', slug: action.slug, message: action.message };
    case 'RESET':
      return { status: 'idle' };
    default:
      break;
  }

  if (state.status !== 'ready') return state;

  switch (action.type) {
    case 'APPLY_NODE_CHANGES':
      return { ...state, nodes: applyNodeChanges(action.changes, state.nodes) };
    case 'APPLY_EDGE_CHANGES':
      return { ...state, edges: applyEdgeChanges(action.changes, state.edges) };
    case 'CONNECT':
      return {
        ...state,
        edges: addEdge<FlowEdge>({ ...action.connection, type: 'floating', data: { label: '' } }, state.edges),
      };
    case 'ADD_NODE':
      return { ...state, nodes: [...state.nodes, action.node] };
    case 'UPDATE_NODE_TEXT':
      return {
        ...state,
        nodes: state.nodes.map((node) =>
          node.id === action.nodeId ? { ...node, data: { ...node.data, text: action.text } } : node,
        ),
      };
    case 'UPDATE_EDGE_LABEL':
      return {
        ...state,
        edges: state.edges.map((edge) =>
          edge.id === action.edgeId ? { ...edge, data: { ...edge.data, label: action.label } } : edge,
        ),
      };
    default:
      return state;
  }
}

function toPersistedNode(node: FlowNode): FlowNode {
  return { id: node.id, type: node.type, position: node.position, data: node.data, dragHandle: node.dragHandle };
}

function toPersistedEdge(edge: FlowEdge): FlowEdge {
  return { id: edge.id, type: edge.type, source: edge.source, target: edge.target, data: edge.data };
}

const AUTOSAVE_DELAY_MS = 500;

export function useFlowDocument(slug: string | null) {
  const [state, dispatch] = useReducer(reducer, { status: 'idle' });
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const latestSlugRef = useRef<string | null>(null);
  const skipNextAutosaveRef = useRef(false);

  useEffect(() => {
    latestSlugRef.current = slug;

    if (!slug) {
      dispatch({ type: 'RESET' });
      return;
    }

    dispatch({ type: 'LOAD_START', slug });

    window.flowsApi
      .read(slug)
      .then((flow: FlowChartFile) => {
        if (latestSlugRef.current !== slug) return;
        skipNextAutosaveRef.current = true;
        dispatch({ type: 'LOAD_SUCCESS', slug, name: flow.name, nodes: flow.nodes, edges: flow.edges });
        setSaveStatus('idle');
      })
      .catch((error: Error) => {
        if (latestSlugRef.current !== slug) return;
        dispatch({ type: 'LOAD_ERROR', slug, message: error.message });
      });
  }, [slug]);

  useEffect(() => {
    if (state.status !== 'ready') return undefined;

    if (skipNextAutosaveRef.current) {
      skipNextAutosaveRef.current = false;
      return undefined;
    }

    const { slug: readySlug, name, nodes, edges } = state;
    const timer = setTimeout(() => {
      const flow: FlowChartFile = { name, nodes: nodes.map(toPersistedNode), edges: edges.map(toPersistedEdge) };
      setSaveStatus('saving');
      window.flowsApi
        .save(readySlug, flow)
        .then(() => setSaveStatus('saved'))
        .catch(() => setSaveStatus('error'));
    }, AUTOSAVE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [state]);

  const onNodesChange = useCallback((changes: NodeChange<FlowNode>[]) => {
    dispatch({ type: 'APPLY_NODE_CHANGES', changes });
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange<FlowEdge>[]) => {
    dispatch({ type: 'APPLY_EDGE_CHANGES', changes });
  }, []);

  const onConnect = useCallback((connection: Connection) => {
    dispatch({ type: 'CONNECT', connection });
  }, []);

  const addNode = useCallback((node: FlowNode) => {
    dispatch({ type: 'ADD_NODE', node });
  }, []);

  const updateNodeText = useCallback((nodeId: string, text: string) => {
    dispatch({ type: 'UPDATE_NODE_TEXT', nodeId, text });
  }, []);

  const updateEdgeLabel = useCallback((edgeId: string, label: string) => {
    dispatch({ type: 'UPDATE_EDGE_LABEL', edgeId, label });
  }, []);

  return { state, saveStatus, onNodesChange, onEdgesChange, onConnect, addNode, updateNodeText, updateEdgeLabel };
}
