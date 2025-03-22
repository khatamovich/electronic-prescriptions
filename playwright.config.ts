import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import { getEnvVars, getPath } from './utils';
dotenv.config();

const [baseURL] = getEnvVars(['base_url'], { useActiveEnv: true });

export default defineConfig({
  outputDir: 'results',
  use: {
    baseURL,
    ...devices['Desktop Chrome'],
    browserName: 'chromium',
    channel: 'chrome',
    video: 'on',
    ignoreHTTPSErrors: true,
    viewport: {
      width: 1710,
      height: 1120,
    },
  },
  projects: [
    {
      name: 'Setup',
      testDir: 'setup',
      testMatch: getPath('*setup.ts'),
    },
    {
      name: ' Electronic Prescriptions',
      use: {
        storageState: getPath(`storage/.auth/${process.env.ENV}.json`),
      },
    },
  ],
});
