import { defineConfig, devices } from '@playwright/test';
require('dotenv').config();

export default defineConfig({
  outputDir: 'results',
  use: {
    baseURL: process.env.baseURL,
    ...devices['Desktop Chrome'],
    browserName: 'chromium',
    channel: 'chrome',
    ignoreHTTPSErrors: true,
    video: 'on',
    viewport: {
      width: 1710,
      height: 1120,
    },
  },
  projects: [
    {
      name: 'Авторизация',
      testDir: 'setup',
      testMatch: 'setup/auth.setup.ts',
    },
    {
      name: 'Электронные рецепты',
    },
  ],
});
