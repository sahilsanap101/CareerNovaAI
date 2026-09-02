import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@pathforge/shared-enums': path.resolve(__dirname, '../../packages/shared-enums/src/index.ts'),
      '@pathforge/shared-constants': path.resolve(__dirname, '../../packages/shared-constants/src/index.ts'),
      '@pathforge/shared-types': path.resolve(__dirname, '../../packages/shared-types/src/index.ts'),
      '@pathforge/shared-zod': path.resolve(__dirname, '../../packages/shared-zod/src/index.ts'),
      '@pathforge/shared-utils': path.resolve(__dirname, '../../packages/shared-utils/src/index.ts'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          query: ['@tanstack/react-query'],
          forms: ['react-hook-form', 'zod', '@hookform/resolvers'],
        },
      },
    },
  },
});
