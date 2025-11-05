import prisma from './config/database';

async function deleteUsers() {
  try {
    // Delete ms.tery@icloud.com
    try {
      const user1 = await prisma.user.deleteMany({
        where: { email: 'ms.tery@icloud.com' },
      });
      console.log('✅ Deleted ms.tery@icloud.com:', user1.count);
    } catch (error: any) {
      console.log('ℹ️  ms.tery@icloud.com not found');
    }

    // Delete k30991043@gmail.com
    try {
      const user2 = await prisma.user.deleteMany({
        where: { email: 'k30991043@gmail.com' },
      });
      console.log('✅ Deleted k30991043@gmail.com:', user2.count);
    } catch (error: any) {
      console.log('ℹ️  k30991043@gmail.com not found');
    }

    console.log('✅ All test users deleted');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

deleteUsers();

