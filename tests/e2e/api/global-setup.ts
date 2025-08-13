import globalTeardown from './global-teardown';

export default async function globalSetup() {
  // Global setup is handled by the e2e:api:setup script
  // This file is kept for vitest configuration compatibility
  console.log('🚀 API E2E Global Setup - delegating to e2e:api:setup script');

  // teardown 함수 반환
  return async () => {
    console.log('🚀 API E2E Global Teardown');
    await globalTeardown();
  };
}
