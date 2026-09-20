export interface StorageConfig {
  basePath: string;
}

export function readStorageConfig(projectRoot: string): StorageConfig;
