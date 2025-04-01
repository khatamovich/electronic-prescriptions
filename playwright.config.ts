import { defineConfig, devices } from '@playwright/test';
import { getBaseURL, getPath } from './src/utils';

export default defineConfig({
  testDir: 'src/specs',
  testMatch: ['*.smoke.ts', '*.regress.ts', '*.spec.ts'],
  outputDir: 'results',
  timeout: 15000,
  maxFailures: 1,
  workers: 1,
  use: {
    baseURL: getBaseURL(process.env.ENV as string),
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
  },
  projects: [
    {
      name: 'Authorization setup',
      testDir: getPath('src/setup'),
      testMatch: 'authorization.ts',
    },
    {
      name: 'Patient setup',
      dependencies: ['Authorization setup'],
      testDir: getPath('src/setup'),
      testMatch: 'patient.ts',
      use: {
        storageState: getPath(`storage/authorization.json`),
      },
    },
    {
      name: 'prescriptions',
      use: {
        storageState: getPath(`storage/authorization.json`),
      },
    },
  ],
});
