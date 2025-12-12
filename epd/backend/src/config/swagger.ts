import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EPD Backend API',
      version: '1.0.0',
      description: 'Mock Electronic Patient Record (EPD) backend API built with Express, TypeScript, Prisma, and PostgreSQL.',
      contact: {
        name: 'API Support',
        email: 'support@epd.nl'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token obtained from /api/auth/login'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { 
              type: 'string', 
              enum: ['DOCTOR', 'NURSE', 'ASSISTANT', 'ADMIN'] 
            },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Patient: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            hospitalNumber: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            dateOfBirth: { type: 'string', format: 'date' },
            gender: { type: 'string', enum: ['MALE', 'FEMALE', 'OTHER', 'UNKNOWN'] },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            address: { type: 'string' },
            city: { type: 'string' },
            zipCode: { type: 'string' },
            status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'DECEASED'] },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Encounter: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            type: { type: 'string', enum: ['INPATIENT', 'OUTPATIENT', 'EMERGENCY'] },
            status: { type: 'string', enum: ['PLANNED', 'IN_PROGRESS', 'FINISHED', 'CANCELLED'] },
            start: { type: 'string', format: 'date-time' },
            end: { type: 'string', format: 'date-time' },
            reason: { type: 'string' },
            patientId: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        MedicalRecord: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            type: { type: 'string', enum: ['NOTE', 'CONSULTATION', 'REPORT', 'PROCEDURE'] },
            title: { type: 'string' },
            content: { type: 'string' },
            patientId: { type: 'integer' },
            encounterId: { type: 'integer' },
            authorId: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Diagnosis: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            code: { type: 'string' },
            description: { type: 'string' },
            type: { type: 'string', enum: ['PRIMARY', 'SECONDARY'] },
            patientId: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    },
    security: [
      {
        BearerAuth: []
      }
    ]
  },
  apis: ['./backend/src/routes/*.ts', './backend/src/controllers/*.ts']
};

export const swaggerSpec = swaggerJsdoc(options);
