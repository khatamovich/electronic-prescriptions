import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import { getEnvVars, getPath } from './utils';
dotenv.config();

const [baseURL] = getEnvVars(['base_url'], { useActiveEnv: true });

export default defineConfig({
  outputDir: 'results',
  timeout: 15000,
  use: {
    baseURL,
    ...devices['Desktop Chrome'],
    browserName: 'chromium',
    channel: 'chrome',
    video: {
      mode: 'on',
      size: {
        width: 1920,
        height: 1080,
      },
    },
    viewport: {
      width: 1920,
      height: 1080,
    },
    ignoreHTTPSErrors: true,
    storageState: getPath(`storage/.auth/${process.env.ENV}.json`),
  },
  projects: [
    {
      name: 'Auth setup',
      testDir: 'setup',
      testMatch: getPath('auth.setup.ts'),
    },
    {
      name: 'Patient setup',
      dependencies: ['Auth setup'],
      testDir: 'setup',
      testMatch: getPath('patient.setup.ts'),
    },
    {
      name: ' Electronic Prescriptions',
    },
  ],
});
