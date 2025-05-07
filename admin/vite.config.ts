import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, './src/components'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@service': path.resolve(__dirname, './src/service'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@store': path.resolve(__dirname, './src/store'),
      '@views': path.resolve(__dirname, './src/views'),
      '@styles': path.resolve(__dirname, './src/styles')
    },
  },
  plugins: [react()],
})
