import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5000',
    supportFile: 'client/cypress/support/e2e.ts',
    specPattern: 'client/cypress/integration/**/*.spec.ts',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
})