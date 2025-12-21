import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth';
import mailRoutes from './routes/mail';

dotenv.config();

const app = express();

// Singleton pattern to avoid multiple Prisma instances
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check (no auth required)
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'mail-service' });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Mail routes
app.use('/api/mails', mailRoutes);

// Start server only if not in test mode
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Mail service running on http://localhost:${PORT}`);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

// Export for testing
export { app, prisma };
