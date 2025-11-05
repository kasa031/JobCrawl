import prisma from './config/database';

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        email: true,
        fullName: true,
        emailVerified: true,
      },
    });

    console.log('\n' + '='.repeat(60));
    console.log('👤 BRUKERE I DATABASEN');
    console.log('='.repeat(60));
    
    if (users.length === 0) {
      console.log('Ingen brukere funnet i databasen.');
    } else {
      users.forEach(u => {
        console.log(`- ${u.email}`);
        console.log(`  Navn: ${u.fullName}`);
        console.log(`  Verifisert: ${u.emailVerified ? '✅' : '❌'}`);
      });
    }
    
    console.log('='.repeat(60) + '\n');
  } catch (error: any) {
    console.error('❌ Feil:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();

