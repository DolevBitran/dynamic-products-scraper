import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

import { viteStaticCopy } from 'vite-plugin-static-copy';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, './src/components'),
      '@background': path.resolve(__dirname, './src/background'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@service': path.resolve(__dirname, './src/service'),
      '@utils': path.resolve(__dirname, './src/utils')
    },
  },
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'public/manifest.json',
          dest: '.',
        }
      ],
    }),
    tailwindcss(),
  ],
  build: {
    outDir: 'build',
    rollupOptions: {
      input: {
        main: './index.html',
        background: path.resolve(__dirname, 'src/background/background.ts'),
        contentScript: path.resolve(__dirname, 'src/content/contentScript.ts')
      },
      output: {
        entryFileNames: (chunkInfo) => {
          // Put background and contentScript into correct folders
          if (chunkInfo.name === 'background') {
            return 'background/[name].js';
          }
          if (chunkInfo.name === 'contentScript') {
            return 'content/[name].js';
          }
          return '[name].js';
        }
      }
    },
  },
});