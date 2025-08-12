export default async function globalTeardown() {
  // Global teardown is handled by the e2e:teardown script
  // This file is kept for vitest configuration compatibility
  console.log('🧹 E2E Global Teardown - delegating to e2e:teardown script');
}
