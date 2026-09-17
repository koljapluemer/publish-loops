// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';
import { FLOWS_CHANNELS } from './shared/flowsApi';
import type { FlowsApi } from './shared/flowsApi';

const flowsApi: FlowsApi = {
  list: () => ipcRenderer.invoke(FLOWS_CHANNELS.list),
  read: (slug) => ipcRenderer.invoke(FLOWS_CHANNELS.read, slug),
  save: (slug, flow) => ipcRenderer.invoke(FLOWS_CHANNELS.save, slug, flow),
  create: (name) => ipcRenderer.invoke(FLOWS_CHANNELS.create, name),
  selectImage: () => ipcRenderer.invoke(FLOWS_CHANNELS.selectImage),
  saveImageData: (bytes, mimeType) => ipcRenderer.invoke(FLOWS_CHANNELS.saveImageData, bytes, mimeType),
  readImage: (relativePath) => ipcRenderer.invoke(FLOWS_CHANNELS.readImage, relativePath),
  deleteImage: (relativePath) => ipcRenderer.invoke(FLOWS_CHANNELS.deleteImage, relativePath),
};

contextBridge.exposeInMainWorld('flowsApi', flowsApi);
