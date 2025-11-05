import prisma from './config/database';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables (ESM-safe __dirname)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../env') });

async function checkUserStatus() {
  try {
    const email = process.argv[2] || 'ms.tery@icloud.com';
    
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        email: true,
        emailVerified: true,
        emailVerificationToken: true,
        fullName: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      console.log(`❌ Bruker ikke funnet: ${email}`);
      return;
    }

    console.log('\n' + '='.repeat(60));
    console.log('👤 BRUKER STATUS');
    console.log('='.repeat(60));
    console.log(`E-post: ${user.email}`);
    console.log(`Navn: ${user.fullName}`);
    console.log(`E-post verifisert: ${user.emailVerified ? '✅ JA' : '❌ NEI'}`);
    console.log(`Verifiserings-token: ${user.emailVerificationToken ? 'Finnes' : 'Ingen (brukt/verifisert)'}`);
    console.log(`Bruker opprettet: ${user.createdAt}`);
    console.log(`Sist oppdatert: ${user.updatedAt}`);
    console.log('='.repeat(60));
    console.log('');
    
    if (user.emailVerified && !user.emailVerificationToken) {
      console.log('💡 E-posten er verifisert og token-en er fjernet (normal oppførsel)');
      console.log('   Dette betyr at verifiseringslenken har blitt brukt.');
    } else if (user.emailVerified && user.emailVerificationToken) {
      console.log('⚠️  ADVARSEL: E-post er markert som verifisert, men token finnes fortsatt');
      console.log('   Dette kan indikere et problem.');
    } else if (!user.emailVerified && user.emailVerificationToken) {
      console.log('ℹ️  E-post ikke verifisert ennå. Token er gyldig.');
    }

  } catch (error: any) {
    console.error('❌ Feil:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserStatus();

