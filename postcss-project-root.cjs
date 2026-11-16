const path = require('node:path');
const postcss = require('postcss');
const tailwind = require('@tailwindcss/postcss');
const projectRoot = path.dirname(require.resolve('./package.json'));

module.exports = function projectTailwind() {
  return {
    postcssPlugin: 'project-tailwind',
    async Once(root, { result }) {
      root.walkAtRules('import', rule => {
        for (const [request, file] of [
          ['tailwindcss', require.resolve('tailwindcss/index.css')],
          ['tw-animate-css', require.resolve('tw-animate-css')],
        ]) {
          if (rule.params.startsWith(`"${request}"`)) {
            rule.params = JSON.stringify(file) + rule.params.slice(request.length + 2);
          }
        }
      });
      const processed = await postcss([tailwind({ base: projectRoot })]).process(root, result.opts);
      result.messages.push(...processed.messages);
    },
  };
};
module.exports.postcss = true;
