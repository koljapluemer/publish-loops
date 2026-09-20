const path = require('node:path');
const { readStorageConfig } = require('./storageConfig');

module.exports = function (eleventyConfig) {
  const { basePath } = readStorageConfig(__dirname);
  const flowsDirectory = path.join(basePath, 'flows');
  const previewImagesDirectory = path.join(basePath, 'flow-images');

  eleventyConfig.addWatchTarget(flowsDirectory);
  eleventyConfig.addWatchTarget(previewImagesDirectory);

  eleventyConfig.addPassthroughCopy({ 'site/assets': 'assets' });
  eleventyConfig.addPassthroughCopy({ [previewImagesDirectory]: 'flow-images' });

  return {
    dir: {
      input: 'site',
      output: '_site',
      includes: '_includes',
      data: '_data',
    },
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk',
  };
};
