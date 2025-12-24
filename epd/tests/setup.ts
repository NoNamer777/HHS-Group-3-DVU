// Global test setup
// Set test environment variables before any tests run
process.env.NODE_ENV = 'test';

// Auth0 M2M configuration for tests
// These should be set in your .env file or CI/CD environment
if (!process.env.AUTH0_ISSUER_BASE_URL) {
  console.warn('⚠️  AUTH0_ISSUER_BASE_URL not set - Auth0 tests will fail');
}
if (!process.env.AUTH0_AUDIENCE) {
  console.warn('⚠️  AUTH0_AUDIENCE not set - Auth0 tests will fail');
}
if (!process.env.AUTH0_CLIENT_ID) {
  console.warn('⚠️  AUTH0_CLIENT_ID not set - Auth0 tests will fail');
}
if (!process.env.AUTH0_CLIENT_SECRET) {
  console.warn('⚠️  AUTH0_CLIENT_SECRET not set - Auth0 tests will fail');
}

// Set test API URL (defaults to localhost)
if (!process.env.API_BASE_URL) {
  process.env.API_BASE_URL = 'http://localhost:3002';
}
