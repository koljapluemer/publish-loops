const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { parse } = require('yaml');

const CONFIG_FILENAME = 'config.yml';

function resolveBasePath(projectRoot, configuredPath) {
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

function readStorageConfig(projectRoot) {
  const configPath = path.join(projectRoot, CONFIG_FILENAME);

  let source;
  try {
    source = fs.readFileSync(configPath, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Missing ${CONFIG_FILENAME}. Copy config.example.yml to ${CONFIG_FILENAME} and set basePath.`);
    }
    throw error;
  }

  let config;
  try {
    config = parse(source);
  } catch (error) {
    throw new Error(`Could not parse ${CONFIG_FILENAME}: ${error.message}`, { cause: error });
  }

  if (!config || typeof config !== 'object' || typeof config.basePath !== 'string' || !config.basePath.trim()) {
    throw new Error(`${CONFIG_FILENAME} must define a non-empty basePath.`);
  }

  return {
    basePath: resolveBasePath(projectRoot, config.basePath),
  };
}

module.exports = { readStorageConfig, resolveBasePath };
