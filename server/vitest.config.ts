import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: './tests/setup.ts',
    include: ['tests/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    env: {
      DATABASE_URL: process.env.DATABASE_URL || 'file:./skavtech.db',
      NODE_ENV: 'test',
    },
  },
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },
});