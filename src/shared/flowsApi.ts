import type { FlowChartFile, FlowSummary } from './flowTypes';

export const FLOWS_CHANNELS = {
  list: 'flows:list',
  read: 'flows:read',
  save: 'flows:save',
  create: 'flows:create',
  selectImage: 'flows:selectImage',
  saveImageData: 'flows:saveImageData',
  readImage: 'flows:readImage',
  deleteImage: 'flows:deleteImage',
} as const;

export interface FlowsApi {
  list(): Promise<FlowSummary[]>;
  read(slug: string): Promise<FlowChartFile>;
  save(slug: string, flow: FlowChartFile): Promise<void>;
  create(name: string): Promise<FlowSummary>;
  /** Opens a native file dialog and copies the chosen image into the flows images dir. Returns its relative path, or null if canceled. */
  selectImage(): Promise<string | null>;
  /** Writes raw image bytes (e.g. from a clipboard paste) into the flows images dir. Returns its relative path. */
  saveImageData(bytes: ArrayBuffer, mimeType: string): Promise<string>;
  /** Reads an image by its relative path and returns it as a data URL. */
  readImage(relativePath: string): Promise<string>;
  deleteImage(relativePath: string): Promise<void>;
}
