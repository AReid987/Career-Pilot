import axios from 'axios';
import { spawn } from 'child_process';
import { getApiUrl } from './get-api.url';

/* eslint-disable */
var __TEARDOWN_MESSAGE__: string;

module.exports = async function () {
  // Start services that that the app needs to run (e.g. database, docker-compose, etc.).
  console.log('\nSetting up...\n');

  const apiRunning = await ensureApiRunning();
  if (!apiRunning) {
    throw new Error('\nSetup Failed: API not running');
  }
  // Hint: Use `globalThis` to pass variables to global teardown.
  globalThis.__TEARDOWN_MESSAGE__ = '\nTearing down...\n';
};

async function ensureApiRunning() {
  const apiUrl = getApiUrl();
  console.log('Checking if API is running at: ', apiUrl);
  try {
    await axios.get(`${apiUrl}/api`);
    console.log('API is running at: ', apiUrl);
    return true;
  } catch (error) {
    console.log('API is not running');
    await startApi();
  }
  return false;
}

export function startApi(): Promise<boolean> {
  console.log(`\nStarting server at ${getApiUrl()}\n`);
  return new Promise((resolve) => {
    const child = spawn('pnpm', ['start'], { stdio: 'pipe' });
    globalThis.pid = child.pid;

    child.stdout.on('data', (data: any) => {
      console.log(data.toString());
      if (data.toString().includes('Application is running on')) {
        console.log('API is running at : ', getApiUrl());
        resolve(true);
      }
    });
    child.stderr.on('data', (data: any) => {
      console.log(data.toString());
    });
    child.on('close', () => {
      resolve(false);
    });
  });
}
// run pnpm start
// console.log('\nRunning pnpm start...\n');
// const child = spawn('pnpm', ['start'], { stdio: 'pipe' });
