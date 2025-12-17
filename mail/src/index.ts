import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, validateUserAccess, AuthRequest } from './middleware/auth';
import authRoutes from './routes/auth';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
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

// Get all mails for a user (protected)
app.get('/api/mails/user/:userId', authenticateToken, validateUserAccess, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const mails = await prisma.mail.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(mails);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mails' });
  }
});

// Get a specific mail (protected, with ownership check)
app.get('/api/mails/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const mail = await prisma.mail.findUnique({
      where: { id }
    });
    
    if (!mail) {
      return res.status(404).json({ error: 'Mail not found' });
    }
    
    // Check if user owns this mail
    if (mail.userId !== req.user?.userId) {
      return res.status(403).json({ error: 'Access denied to this mail' });
    }
    
    res.json(mail);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mail' });
  }
});

// Create a new mail (protected)
app.post('/api/mails', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { userId, from, to, subject, body } = req.body;
    
    if (!userId || !from || !to || !subject || !body) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Users can only create mails for themselves
    if (userId !== req.user?.userId) {
      return res.status(403).json({ error: 'Cannot create mails for other users' });
    }

    const mail = await prisma.mail.create({
      data: {
        userId,
        from,
        to,
        subject,
        body
      }
    });
    
    res.status(201).json(mail);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create mail' });
  }
});

// Mark mail as read (protected, with ownership check)
app.patch('/api/mails/:id/read', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // First check if mail exists and user owns it
    const existingMail = await prisma.mail.findUnique({
      where: { id }
    });
    
    if (!existingMail) {
      return res.status(404).json({ error: 'Mail not found' });
    }
    
    if (existingMail.userId !== req.user?.userId) {
      return res.status(403).json({ error: 'Access denied to this mail' });
    }
    
    const mail = await prisma.mail.update({
      where: { id },
      data: { isRead: true }
    });
    res.json(mail);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update mail' });
  }
});

// Delete a mail (protected, with ownership check)
app.delete('/api/mails/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // First check if mail exists and user owns it
    const existingMail = await prisma.mail.findUnique({
      where: { id }
    });
    
    if (!existingMail) {
      return res.status(404).json({ error: 'Mail not found' });
    }
    
    if (existingMail.userId !== req.user?.userId) {
      return res.status(403).json({ error: 'Access denied to this mail' });
    }
    
    await prisma.mail.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete mail' });
  }
});

// Get mail count for user (protected)
app.get('/api/mails/user/:userId/count', authenticateToken, validateUserAccess, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const unreadCount = await prisma.mail.count({
      where: { userId, isRead: false }
    });
    const totalCount = await prisma.mail.count({
      where: { userId }
    });
    res.json({ unreadCount, totalCount });
  } catch (error) {
    res.status(500).json({ error: 'Failed to count mails' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Mail service running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
