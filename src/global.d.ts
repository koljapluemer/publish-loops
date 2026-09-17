import type { FlowsApi } from './shared/flowsApi';

declare global {
  interface Window {
    flowsApi: FlowsApi;
  }
}

export {};
