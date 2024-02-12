/* eslint-disable */
import axios from 'axios';
import { getApiUrl } from './get-api.url';
var __TEARDOWN_MESSAGE__: string;

module.exports = async function () {
  // Start services that that the app needs to run (e.g. database, docker-compose, etc.).
  console.log('\nSetting up...\n');
  // start career-pilot
  const apiRunning = await ensureApiRunning();
  if (!apiRunning) {
    throw new Error('Could not start api');
  }
  // Hint: Use `globalThis` to pass variables to global teardown.
  globalThis.__TEARDOWN_MESSAGE__ = '\nTearing down...\n';
};
// Put setup logic here (e.g. starting services, docker-compose, etc.).

async function ensureApiRunning() {
  console.log('Checking if API is running...');
  const apiUrl = getApiUrl();
  console.log('apiUrl', apiUrl);
  try {
    await axios.get(`${apiUrl}/api`);
    console.log('API is running at', apiUrl, '\n');
    return true;
  } catch (error) {
    if (process.env.CI) {
      return await startApi();
    }
    return false;
  }
}

export function startApi(): Promise<boolean> {
  console.log(`Starting API at ${getApiUrl()}\n`);
  return new Promise<boolean>((resolve) => {
    const childProcess = require('child_process');
    const child = childProcess.spawn('pnpm', ['start'], {
      stdio: 'pipe',
    });
    globalThis.pid = child.pid;
    child.stdout.on('data', (data: any) => {
      const output = data.toString();
      console.log(output);
      if (output.includes('Application is running on')) {
        console.log('API is started at', getApiUrl(), '\n');
        resolve(true);
      }
    });
    child.stderr.on('data', (data: any) => {
      const output = data.toString();
      console.log(output);
    });
    child.on('close', () => {
      console.log(`child process exited`);
      resolve(false);
    });
  });
}
