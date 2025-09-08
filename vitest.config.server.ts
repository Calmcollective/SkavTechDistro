import { defineConfig } from 'vitest/config';
import path from 'path';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

export default defineConfig({
  test: {
    // Run tests in a node environment
    environment: 'node',
    // Look for test files in the server directory
    include: ['server/tests/**/*.test.ts'],
    // Exclude client tests
    exclude: ['client/**'],
    // Set environment variables for tests
    env: {
      DATABASE_URL: process.env.DATABASE_URL || 'file:./skavtech.db',
      NODE_ENV: 'test',
    },
  },
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'shared'),
    },
  },
});