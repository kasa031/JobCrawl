import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables (works in ESM)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../env') });

const prisma = new PrismaClient();

async function verifyDatabase() {
  console.log('\n🗄️  Verifying Database Connection and Schema...\n');

  // Check DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.log('❌ DATABASE_URL not set in backend/env');
    console.log('   Please set DATABASE_URL in backend/env file\n');
    await prisma.$disconnect();
    process.exit(1);
  }

  console.log('   DATABASE_URL:', databaseUrl.replace(/:[^:@]+@/, ':****@'));

  try {
    // Test connection
    console.log('\n   Testing database connection...');
    await prisma.$connect();
    console.log('   ✅ Database connection successful');

    // Check if database exists and is accessible
    console.log('\n   Checking database schema...');
    
    // Try to query User table (will fail if migrations not run)
    const userCount = await prisma.user.count();
    console.log('   ✅ Database schema verified');
    console.log(`   ✅ Users table accessible (${userCount} users)`);

    // Check other tables
    const jobCount = await prisma.jobListing.count();
    console.log(`   ✅ JobListings table accessible (${jobCount} jobs)`);

    const applicationCount = await prisma.application.count();
    console.log(`   ✅ Applications table accessible (${applicationCount} applications)`);

    const profileCount = await prisma.profile.count();
    console.log(`   ✅ Profiles table accessible (${profileCount} profiles)`);

    console.log('\n✅ Database verification PASSED');
    console.log('   Database is ready to use!\n');

    await prisma.$disconnect();
    return true;
  } catch (error: any) {
    console.log('\n❌ Database verification FAILED');

    if (error.code === 'P1001') {
      console.log('   Error: Cannot reach database server');
      console.log('   Solutions:');
      console.log('   1. Make sure PostgreSQL is running');
      console.log('   2. Check DATABASE_URL in backend/env');
      console.log('   3. Verify host, port, and credentials\n');
    } else if (error.code === 'P1000') {
      console.log('   Error: Authentication failed');
      console.log('   Solutions:');
      console.log('   1. Check database username and password');
      console.log('   2. Verify DATABASE_URL credentials\n');
    } else if (error.code === 'P2021') {
      console.log('   Error: Table does not exist');
      console.log('   Solution: Run migrations first:');
      console.log('   cd backend && npm run db:migrate\n');
    } else if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
      console.log('   Error: Database schema not initialized');
      console.log('   Solution: Run migrations first:');
      console.log('   cd backend && npm run db:migrate\n');
    } else {
      console.log('   Error:', error.message);
      console.log('   Code:', error.code || 'Unknown');
    }

    await prisma.$disconnect().catch(() => {});
    return false;
  }
}

verifyDatabase()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });

