import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const sharedAlias = {
  '@': fileURLToPath(new URL('./src', import.meta.url)),
} as const;

export default defineConfig({
  resolve: {
    alias: sharedAlias,
  },
  test: {
    globals: true,
    clearMocks: true,
    restoreMocks: true,
    projects: [
      {
        resolve: { alias: sharedAlias },
        test: {
          name: 'unit',
          globals: true,
          environment: 'node',
          include: ['src/**/*.test.ts'],
          clearMocks: true,
          restoreMocks: true,
        },
      },
      {
        resolve: { alias: sharedAlias },
        test: {
          name: 'component',
          globals: true,
          environment: 'jsdom',
          include: ['src/**/*.test.tsx'],
          setupFiles: ['./src/test/setup.ts'],
          clearMocks: true,
          restoreMocks: true,
        },
      },
    ],
  },
});
