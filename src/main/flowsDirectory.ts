import { app } from 'electron';
import path from 'node:path';
import fs from 'node:fs/promises';
import { readStorageConfig } from '../../storageConfig';

// Dev runs read config.yml from the repo; an installed app has no writable repo root
// (its app path is inside app.asar), so it reads config.yml from the per-user config dir.
function getConfigRoot(): string {
  return app.isPackaged ? app.getPath('userData') : app.getAppPath();
}

function getStorageBasePath(): string {
  return readStorageConfig(getConfigRoot()).basePath;
}

export function getFlowsDir(): string {
  return path.join(getStorageBasePath(), 'flows');
}

export async function ensureFlowsDir(): Promise<string> {
  const dir = getFlowsDir();
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

export function getImagesDir(): string {
  return path.join(getFlowsDir(), 'images');
}

export async function ensureImagesDir(): Promise<string> {
  const dir = getImagesDir();
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

export function getPreviewImagesDir(): string {
  return path.join(getStorageBasePath(), 'flow-images');
}

export async function ensurePreviewImagesDir(): Promise<string> {
  const dir = getPreviewImagesDir();
  await fs.mkdir(dir, { recursive: true });
  return dir;
}
