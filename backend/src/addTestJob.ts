import prisma from './config/database';

async function addTestJob() {
  try {
    // Sjekk antall stillinger
    const count = await prisma.jobListing.count();
    console.log(`\n📊 Antall stillinger i databasen: ${count}\n`);

    if (count === 0) {
      console.log('➕ Legger til teststilling...\n');
      
      const testJob = await prisma.jobListing.create({
        data: {
          title: 'Frontend Utvikler',
          company: 'Tech Solutions AS',
          location: 'Oslo',
          url: 'https://example.com/job/test-1',
          description: 'Vi søker en erfaren frontend utvikler med kunnskap i React, TypeScript og moderne web-teknologier. Du vil jobbe med spennende prosjekter og være del av et kreativt team.',
          requirements: ['React', 'TypeScript', 'JavaScript', 'CSS', 'HTML'],
          source: 'test',
        },
      });

      console.log('✅ Teststilling lagt til:');
      console.log(`   - ${testJob.title} hos ${testJob.company}`);
      console.log(`   - ID: ${testJob.id}\n`);
    } else {
      console.log('✅ Det finnes allerede stillinger i databasen.\n');
      
      // Vis de første 5
      const jobs = await prisma.jobListing.findMany({
        take: 5,
        orderBy: { scrapedAt: 'desc' },
      });
      
      console.log('📋 De første stillingene:');
      jobs.forEach(job => {
        console.log(`   - ${job.title} hos ${job.company} (${job.id.substring(0, 8)}...)`);
      });
      console.log('');
    }
  } catch (error: any) {
    console.error('❌ Feil:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addTestJob();

