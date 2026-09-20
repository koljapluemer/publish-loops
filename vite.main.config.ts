import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  build: {
    commonjsOptions: {
      // storageConfig.js is CommonJS so that eleventy can require() it too.
      include: [/node_modules/, /storageConfig\.js$/],
    },
  },
});
