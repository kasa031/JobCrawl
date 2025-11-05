import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../env') });

const prisma = new PrismaClient();

async function setupDatabase() {
  console.log('\n🗄️  Database Setup Assistant...\n');

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.log('❌ DATABASE_URL not set in backend/env');
    console.log('   Please set DATABASE_URL in backend/env file\n');
    process.exit(1);
  }

  console.log('   DATABASE_URL found:', databaseUrl.replace(/:[^:@]+@/, ':****@'));

  try {
    // Test connection
    console.log('\n   Step 1: Testing database connection...');
    await prisma.$connect();
    console.log('   ✅ Database connection successful');

    // Check if migrations needed
    console.log('\n   Step 2: Checking for migrations...');
    try {
      await prisma.user.findFirst();
      console.log('   ✅ Database schema appears to be initialized');
      
      // Count existing data
      const userCount = await prisma.user.count();
      const jobCount = await prisma.jobListing.count();
      console.log(`   📊 Current data: ${userCount} users, ${jobCount} jobs`);
    } catch (error: any) {
      if (error.code === 'P2021' || error.message?.includes('does not exist')) {
        console.log('   ⚠️  Database schema not initialized');
        console.log('\n   💡 To set up the database schema, run:');
        console.log('      cd backend');
        console.log('      npm run db:generate');
        console.log('      npm run db:migrate\n');
        
        // Optionally run migrations automatically?
        console.log('   Would you like to run migrations now? (y/n)');
        // For now, just provide instructions
      }
    }

    await prisma.$disconnect();
    return true;
  } catch (error: any) {
    console.log('\n❌ Database setup check failed');

    if (error.code === 'P1001') {
      console.log('\n   💡 PostgreSQL is not running or unreachable');
      console.log('   Steps to fix:');
      console.log('   1. Make sure PostgreSQL is installed');
      console.log('   2. Start PostgreSQL service');
      console.log('   3. Create database:');
      console.log('      psql -U postgres');
      console.log('      CREATE DATABASE jobcrawl;');
      console.log('      \\q\n');
    } else {
      console.log('   Error:', error.message);
    }

    await prisma.$disconnect().catch(() => {});
    return false;
  }
}

setupDatabase()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });

