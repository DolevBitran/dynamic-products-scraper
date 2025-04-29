import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

import { viteStaticCopy } from 'vite-plugin-static-copy';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
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