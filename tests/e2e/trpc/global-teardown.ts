export default async function globalTeardown() {
  // Global teardown is handled by the e2e:trpc:teardown script
  // This file is kept for vitest configuration compatibility
  console.log(
    '🧹 tRPC E2E Global Teardown - delegating to e2e:trpc:teardown script',
  );
}
