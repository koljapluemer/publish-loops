export interface StorageConfig {
  basePath: string;
}

export function readStorageConfig(projectRoot: string): StorageConfig;
export function resolveBasePath(projectRoot: string, configuredPath: string): string;
