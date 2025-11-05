import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Load environment variables (works in ESM)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../env') });

const prisma = new PrismaClient();

async function checkSetup() {
  console.log('\n🔍 Checking setup...\n');
  
  let allGood = true;

  // Check environment variables
  console.log('📋 Environment Variables:');
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'PORT',
    'FRONTEND_URL',
  ];

  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar];
    if (value) {
      console.log(`  ✅ ${envVar}: ${envVar === 'JWT_SECRET' || envVar === 'DATABASE_URL' ? '***' : value}`);
    } else {
      console.log(`  ❌ ${envVar}: NOT SET`);
      allGood = false;
    }
  }

  // Check optional
  console.log(`  ${process.env.SMTP_HOST ? '✅' : '⚠️ '} SMTP_HOST: ${process.env.SMTP_HOST || 'NOT SET (emails will be logged to console only)'}`);
  console.log(`  ${process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_key_here' ? '✅' : '⚠️ '} OPENAI_API_KEY: ${process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_key_here' ? 'SET' : 'NOT SET (AI features will use mock)'}\n`);

  // Check database connection
  console.log('🗄️  Database:');
  try {
    await prisma.$connect();
    console.log('  ✅ Connection successful');
    
    // Try a simple query
    const userCount = await prisma.user.count();
    console.log(`  ✅ Database accessible (Users: ${userCount})`);
  } catch (error: any) {
    console.log(`  ❌ Connection failed: ${error.message}`);
    console.log('     Make sure PostgreSQL is running and DATABASE_URL is correct');
    allGood = false;
  }

  // Check uploads directory
  console.log('\n📁 Directories:');
  const uploadsDir = path.join(process.cwd(), 'uploads', 'cvs');
  if (fs.existsSync(uploadsDir)) {
    console.log('  ✅ uploads/cvs exists');
  } else {
    console.log('  ❌ uploads/cvs missing');
    allGood = false;
  }

  const logsDir = path.join(process.cwd(), 'logs');
  if (fs.existsSync(logsDir)) {
    console.log('  ✅ logs exists');
  } else {
    console.log('  ⚠️  logs directory will be created on first run');
  }

  // Check migrations
  console.log('\n🔄 Migrations:');
  const migrationsDir = path.join(process.cwd(), 'prisma', 'migrations');
  const migrationFiles = fs.existsSync(migrationsDir) 
    ? fs.readdirSync(migrationsDir).filter(f => f !== '.gitkeep')
    : [];
  
  if (migrationFiles.length > 0) {
    console.log(`  ✅ ${migrationFiles.length} migration(s) found`);
  } else {
    console.log('  ⚠️  No migrations found - run "npm run db:migrate"');
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  if (allGood) {
    console.log('✅ All critical checks passed!');
    console.log('🚀 Ready to start the application with: npm run dev');
  } else {
    console.log('⚠️  Some issues found. Please fix them before starting.');
  }
  console.log('='.repeat(50) + '\n');

  await prisma.$disconnect();
  
  process.exit(allGood ? 0 : 1);
}

checkSetup().catch((error) => {
  console.error('❌ Setup check failed:', error);
  process.exit(1);
});

