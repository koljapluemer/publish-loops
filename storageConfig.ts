import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { parse } from 'yaml';

const CONFIG_FILENAME = 'config.yml';

export interface StorageConfig {
  basePath: string;
}

export function resolveBasePath(projectRoot: string, configuredPath: string): string {
  const value = configuredPath.trim();

  if (value === '~') {
    return os.homedir();
  }

  if (value.startsWith('~/')) {
    return path.resolve(os.homedir(), value.slice(2));
  }

  if (value.startsWith('~')) {
    throw new Error(`${CONFIG_FILENAME} basePath does not support user-home syntax such as "~user". Use an absolute path instead.`);
  }

  return path.resolve(projectRoot, value);
}

export function readStorageConfig(projectRoot: string): StorageConfig {
  const configPath = path.join(projectRoot, CONFIG_FILENAME);

  let source: string;
  try {
    source = fs.readFileSync(configPath, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`Missing ${CONFIG_FILENAME}. Copy config.example.yml to ${CONFIG_FILENAME} and set basePath.`);
    }
    throw error;
  }

  let config: unknown;
  try {
    config = parse(source);
  } catch (error) {
    throw new Error(`Could not parse ${CONFIG_FILENAME}: ${(error as Error).message}`, { cause: error });
  }

  const basePath = (config as { basePath?: unknown } | null)?.basePath;
  if (typeof basePath !== 'string' || !basePath.trim()) {
    throw new Error(`${CONFIG_FILENAME} must define a non-empty basePath.`);
  }

  return { basePath: resolveBasePath(projectRoot, basePath) };
}
