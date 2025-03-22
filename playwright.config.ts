import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import { getEnvVars, getPath } from './utils';
dotenv.config();

const [baseURL] = getEnvVars(['base_url'], { useActiveEnv: true });

export default defineConfig({
  outputDir: 'results',
  globalTimeout: 10000,
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
      dependencies: ['Patient setup'],
    },
  ],
});
