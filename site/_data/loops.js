const fs = require('node:fs');
const path = require('node:path');
const { readStorageConfig } = require('../../storageConfig');

const projectRoot = path.resolve(__dirname, '../..');
const { basePath } = readStorageConfig(projectRoot);
const flowsDirectory = path.join(basePath, 'flows');
const previewImagesDirectory = path.join(basePath, 'flow-images');

/**
 * Maps the editor's on-disk flow format to the smaller public loop model used
 * by the website. Keeping this translation here prevents templates from
 * depending on editor implementation details.
 */
module.exports = function loadLoops() {
  return fs
    .readdirSync(flowsDirectory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => {
      const slug = path.basename(entry.name, '.json');
      const flow = JSON.parse(fs.readFileSync(path.join(flowsDirectory, entry.name), 'utf8'));
      const previewImage = path.join(previewImagesDirectory, `${slug}.png`);

      if (!flow.name) {
        throw new Error(`Loop source "${entry.name}" is missing a name.`);
      }

      if (!fs.existsSync(previewImage)) {
        throw new Error(`Loop "${slug}" is missing its preview image: flow-images/${slug}.png`);
      }

      return {
        slug,
        title: flow.name,
        url: `/loops/${slug}/`,
        imageUrl: `/flow-images/${slug}.png`,
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
};
