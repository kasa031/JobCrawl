import { PrismaClient } from '@prisma/client';

// Initialize Prisma Client
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;

// Mock prisma for development without database
export const mockPrisma = {
  user: {
    findUnique: async () => null,
    findMany: async () => [],
    create: async (data: any) => ({ id: 'mock-id', ...data }),
  },
  jobListing: {
    findMany: async () => [
      {
        id: '1',
        title: 'Senior Full-Stack Developer',
        company: 'TechCorp AS',
        location: 'Oslo',
        url: 'https://example.com',
        description: 'We are looking for a skilled developer...',
        requirements: ['JavaScript', 'React', 'Node.js'],
        source: 'finn.no',
        scrapedAt: new Date(),
      },
    ],
    findUnique: async () => null,
  },
  application: {
    findMany: async () => [],
    create: async (data: any) => data,
  },
};

