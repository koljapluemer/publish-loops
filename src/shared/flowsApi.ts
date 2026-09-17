import type { FlowChartFile, FlowSummary } from './flowTypes';

export const FLOWS_CHANNELS = {
  list: 'flows:list',
  read: 'flows:read',
  save: 'flows:save',
  create: 'flows:create',
} as const;

export interface FlowsApi {
  list(): Promise<FlowSummary[]>;
  read(slug: string): Promise<FlowChartFile>;
  save(slug: string, flow: FlowChartFile): Promise<void>;
  create(name: string): Promise<FlowSummary>;
}
