import { useCallback, useEffect, useReducer } from 'react';
import type { FlowSummary } from '../shared/flowTypes';

export type FlowListState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; flows: FlowSummary[] }
  | { status: 'error'; message: string };

type FlowListAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; flows: FlowSummary[] }
  | { type: 'LOAD_ERROR'; message: string }
  | { type: 'FLOW_CREATED'; flow: FlowSummary };

function sortFlows(flows: FlowSummary[]): FlowSummary[] {
  return [...flows].sort((a, b) => a.name.localeCompare(b.name));
}

function reducer(state: FlowListState, action: FlowListAction): FlowListState {
  switch (action.type) {
    case 'LOAD_START':
      return { status: 'loading' };
    case 'LOAD_SUCCESS':
      return { status: 'ready', flows: sortFlows(action.flows) };
    case 'LOAD_ERROR':
      return { status: 'error', message: action.message };
    case 'FLOW_CREATED': {
      const existing = state.status === 'ready' ? state.flows : [];
      return { status: 'ready', flows: sortFlows([...existing, action.flow]) };
    }
    default:
      return state;
  }
}

export function useFlowList() {
  const [state, dispatch] = useReducer(reducer, { status: 'idle' });

  const refresh = useCallback(async () => {
    dispatch({ type: 'LOAD_START' });
    try {
      const flows = await window.flowsApi.list();
      dispatch({ type: 'LOAD_SUCCESS', flows });
    } catch (error) {
      dispatch({ type: 'LOAD_ERROR', message: (error as Error).message });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createFlow = useCallback(async (name: string): Promise<FlowSummary> => {
    const flow = await window.flowsApi.create(name);
    dispatch({ type: 'FLOW_CREATED', flow });
    return flow;
  }, []);

  return { state, refresh, createFlow };
}
