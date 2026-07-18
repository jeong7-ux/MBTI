import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['**/*.{test,spec}.ts', '**/__tests__/**/*.ts'],
    exclude: ['node_modules', '.next', '_workspace'],
  },
  resolve: {
    alias: {
      '@contract': resolve(__dirname, 'lib/contract/index.ts'),
      '@scoring': resolve(__dirname, 'packages/scoring/index.ts'),
      '@': resolve(__dirname, '.'),
    },
  },
});
