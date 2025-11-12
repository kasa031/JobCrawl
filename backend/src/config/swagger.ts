import swaggerJsdoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'JobCrawl API',
      version: '1.0.0',
      description: 'API dokumentasjon for JobCrawl - Intelligent job application assistant',
      contact: {
        name: 'JobCrawl Support',
        email: 'support@jobcrawl.local',
      },
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token fra /api/auth/login eller /api/auth/register',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Feilmelding',
            },
          },
        },
        JobListing: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            company: { type: 'string' },
            location: { type: 'string' },
            url: { type: 'string', format: 'uri' },
            description: { type: 'string' },
            requirements: { type: 'array', items: { type: 'string' } },
            source: { type: 'string' },
            publishedDate: { type: 'string', format: 'date-time', nullable: true },
            scrapedAt: { type: 'string', format: 'date-time' },
          },
        },
        Application: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            jobListingId: { type: 'string', format: 'uuid' },
            status: {
              type: 'string',
              enum: ['DRAFT', 'PENDING', 'SENT', 'VIEWED', 'REJECTED', 'ACCEPTED', 'INTERVIEW', 'OFFER'],
            },
            coverLetter: { type: 'string', nullable: true },
            notes: { type: 'string', nullable: true },
            sentDate: { type: 'string', format: 'date-time', nullable: true },
            responseDate: { type: 'string', format: 'date-time', nullable: true },
            response: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            fullName: { type: 'string' },
            emailVerified: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // Paths to files containing OpenAPI definitions
};

export const swaggerSpec = swaggerJsdoc(options);

