import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [path.resolve(__dirname, './src/__tests__/setup.ts')],
    environmentOptions: {
      jsdom: {
        resources: 'usable',
      },
    },
  },
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
});
