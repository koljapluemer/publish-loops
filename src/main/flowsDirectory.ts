import { app } from 'electron';
import path from 'node:path';
import fs from 'node:fs/promises';

// app.getAppPath() resolves to the project root (directory containing
// package.json) only when the app is run unpackaged via `electron-forge
// start`. This app is personal-use and dev-only (see spec.md); no packaged
// build is in scope, so this is intentional and not a bug to "fix" later.
export function getFlowsDir(): string {
  return path.join(app.getAppPath(), 'flows');
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
  return path.join(app.getAppPath(), 'flow-images');
}

export async function ensurePreviewImagesDir(): Promise<string> {
  const dir = getPreviewImagesDir();
  await fs.mkdir(dir, { recursive: true });
  return dir;
}
