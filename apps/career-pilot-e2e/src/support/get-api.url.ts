export function getApiUrl(path = '') {
  // Configure axios for tests to use.
  const host = process.env.HOST ?? 'localhost';
  const port = process.env.PORT ?? '3000';
  return `http://${host}:${port}${path}`;
}
