import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import { getEnvVars, getPath } from './utils';
dotenv.config();

export default defineConfig({
  outputDir: 'results',
  use: {
    baseURL: getEnvVars(['base_url'], { useActiveEnv: true })[0],
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
      testMatch: getPath('setup/auth.setup.ts'),
    },
    {
      name: 'Электронные рецепты',
    },
  ],
});
