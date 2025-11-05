import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables (ESM-safe __dirname)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../env') });

async function testSMTP() {
  console.log('\n📧 Testing SMTP Configuration...\n');

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;

  if (!smtpHost) {
    console.log('⚠️  SMTP not configured');
    console.log('   SMTP_HOST is not set in backend/env');
    console.log('   Email sending will be logged to console only\n');
    return false;
  }

  console.log('   SMTP_HOST:', smtpHost);
  console.log('   SMTP_PORT:', smtpPort || '587');
  console.log('   SMTP_USER:', smtpUser ? `${smtpUser.substring(0, 3)}...` : 'NOT SET');
  console.log('   SMTP_PASSWORD:', smtpPassword ? '***' : 'NOT SET');
  console.log('');

  try {
    const isMailHog = smtpHost === 'localhost';
    const needsAuth = smtpUser && smtpPassword;

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort || '587'),
      secure: false,
      auth: needsAuth ? {
        user: smtpUser,
        pass: smtpPassword,
      } : undefined,
      tls: isMailHog ? { rejectUnauthorized: false } : undefined,
    });

    // Test connection
    await transporter.verify();
    
    console.log('✅ SMTP Configuration VALID');
    console.log('   Connection test passed');
    console.log('   Email sending should work correctly\n');
    
    return true;
  } catch (error: any) {
    console.log('❌ SMTP Configuration INVALID');
    console.log('   Error:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n   Authentication failed. Check:');
      console.log('   - SMTP_USER is correct');
      console.log('   - SMTP_PASSWORD is correct (use app password for Gmail)');
    } else if (error.code === 'ECONNECTION') {
      console.log('\n   Connection failed. Check:');
      console.log('   - SMTP_HOST is correct');
      console.log('   - SMTP_PORT is correct');
      console.log('   - Firewall/network allows connection');
    } else {
      console.log('\n   Please verify all SMTP settings in backend/env');
    }
    
    console.log('');
    return false;
  }
}

testSMTP()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });

