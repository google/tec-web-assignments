import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        'contact-form/index': resolve(__dirname, 'contact-form/index.html'),
        'image-comment/index': resolve(__dirname, 'image-comment/index.html'),
        'movie-app/index': resolve(__dirname, 'movie-app/index.html'),
        'movie-app-alt-subscribe/index': resolve(
          __dirname,
          'movie-app-alt-subscribe/index.html',
        ),
        'movie-lookup/index': resolve(__dirname, 'movie-lookup/index.html'),
        picsum: resolve(__dirname, 'picsum/index.html'),
        'remembering-state/index': resolve(
          __dirname,
          'remembering-state/index.html',
        ),
        'reusable-component/index': resolve(
          __dirname,
          'reusable-component/index.html',
        ),
      },
    },
  },
});
