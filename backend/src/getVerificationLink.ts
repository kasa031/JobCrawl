import prisma from './config/database';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables (ESM-safe __dirname)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../env') });

async function getVerificationLink() {
  try {
    const email = process.argv[2] || 'ms.tery@icloud.com';
    
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        email: true,
        emailVerified: true,
        emailVerificationToken: true,
        fullName: true,
      },
    });

    if (!user) {
      console.log(`❌ Bruker ikke funnet: ${email}`);
      return;
    }

    if (user.emailVerified) {
      console.log(`✅ E-post allerede verifisert: ${email}`);
      return;
    }

    if (!user.emailVerificationToken) {
      console.log(`❌ Ingen verifiserings-token funnet for ${email}`);
      console.log(`   Du må registrere deg på nytt eller be om ny verifiseringsmail.`);
      return;
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verificationUrl = `${frontendUrl}/verify-email?token=${user.emailVerificationToken}`;

    console.log('\n' + '='.repeat(60));
    console.log('📧 VERIFISERINGSLENKE');
    console.log('='.repeat(60));
    console.log(`Bruker: ${user.fullName} (${user.email})`);
    console.log(`Status: Ikke verifisert`);
    console.log('\n' + '-'.repeat(60));
    console.log('Kopier og åpne denne lenken i nettleseren:');
    console.log(verificationUrl);
    console.log('-'.repeat(60));
    console.log('');

  } catch (error: any) {
    console.error('❌ Feil:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

getVerificationLink();

