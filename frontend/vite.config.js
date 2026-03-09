import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 5173,
    proxy: {
      '/api/external-faceswap': {
        target: 'https://model-osprey-487816-m4.uc.r.appspot.com',
        changeOrigin: true,
        secure: true,
        rewrite: () => '/api/v1/faceswap',
      },
      '/api': {
        target: process.env.VITE_API_PROXY || 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor:  ['react', 'react-dom', 'react-router-dom'],
          ui:      ['lucide-react', 'recharts'],
          state:   ['zustand'],
          radix:   [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 700,
    minify: 'esbuild',
  },
});
