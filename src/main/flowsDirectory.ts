import { app } from 'electron';
import path from 'node:path';
import fs from 'node:fs/promises';
import { readStorageConfig } from '../../storageConfig';

function getStorageBasePath(): string {
  return readStorageConfig(app.getAppPath()).basePath;
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
