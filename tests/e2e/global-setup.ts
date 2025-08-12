import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default async function globalSetup() {
  console.log('🚀 Setting up E2E test environment...');

  try {
    // Start Docker Compose
    console.log('📦 Starting PostgreSQL test database...');
    await execAsync('docker compose -f docker-compose.test.yaml up -d');

    // Wait for database to be ready
    console.log('⏳ Waiting for database to be ready...');
    await new Promise((resolve) => setTimeout(resolve, 10000));

    // Set test environment variables
    process.env.DATABASE_URL =
      'postgresql://testuser:testpass@localhost:5433/testdb';

    // Run Prisma migrations
    console.log('🔄 Running Prisma migrations...');
    await execAsync(
      'npx prisma migrate deploy --schema=./prisma/schema.prisma',
    );

    // Generate Prisma client
    console.log('🔧 Generating Prisma client...');
    await execAsync('npx prisma generate --schema=./prisma/schema.prisma');

    // Seed test data
    console.log('🌱 Seeding test data...');
    await execAsync('tsx tests/e2e/seed.ts');

    console.log('✅ E2E test environment setup complete!');
  } catch (error) {
    console.error('❌ Failed to setup E2E test environment:', error);
    throw error;
  }
}
