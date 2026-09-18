module.exports = function (eleventyConfig) {
  eleventyConfig.addWatchTarget('flows');
  eleventyConfig.addWatchTarget('flow-images');

  eleventyConfig.addPassthroughCopy({ 'site/assets': 'assets' });
  eleventyConfig.addPassthroughCopy('flow-images');

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
