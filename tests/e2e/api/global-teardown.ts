export default async function globalTeardown() {
  // Global teardown is handled by the e2e:api:teardown script
  // This file is kept for vitest configuration compatibility
  console.log('🧹 API E2E Global Teardown - delegating to e2e:api:teardown script');
}