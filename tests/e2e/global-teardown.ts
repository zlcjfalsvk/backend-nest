import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default async function globalTeardown() {
  console.log('🧹 Tearing down E2E test environment...');

  try {
    // Stop and remove Docker containers
    console.log('🛑 Stopping PostgreSQL test database...');
    await execAsync('docker compose -f docker-compose.test.yaml down -v');

    console.log('✅ E2E test environment teardown complete!');
  } catch (error) {
    console.error('❌ Failed to teardown E2E test environment:', error);
    // Don't throw error on teardown failure
  }
}
