import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, validateUserAccess, AuthRequest } from '../middleware/auth';

const router = Router();

// Singleton pattern to avoid multiple Prisma instances
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Get all mails for a user (protected)
router.get('/user/:userId', authenticateToken, validateUserAccess, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const mails = await prisma.mail.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(mails);
  } catch (error) {
    console.error('Error fetching mails:', error);
    res.status(500).json({ error: 'Failed to fetch mails' });
  }
});

// Get a specific mail (protected, with ownership check)
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
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
    console.error('Error fetching mail:', error);
    res.status(500).json({ error: 'Failed to fetch mail' });
  }
});

// Create a new mail (protected)
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { userId, from, to, subject, body } = req.body;
    
    if (!userId || !from || !to || !subject || !body) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(from) || !emailRegex.test(to)) {
      return res.status(400).json({ error: 'Invalid email format' });
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
    console.error('Error creating mail:', error);
    res.status(500).json({ error: 'Failed to create mail' });
  }
});

// Mark mail as read (protected, with ownership check)
router.patch('/:id/read', authenticateToken, async (req: AuthRequest, res: Response) => {
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
    console.error('Error updating mail:', error);
    res.status(500).json({ error: 'Failed to update mail' });
  }
});

// Delete a mail (protected, with ownership check)
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
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
    console.error('Error deleting mail:', error);
    res.status(500).json({ error: 'Failed to delete mail' });
  }
});

// Get mail count for user (protected)
router.get('/user/:userId/count', authenticateToken, validateUserAccess, async (req: AuthRequest, res: Response) => {
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
    console.error('Error counting mails:', error);
    res.status(500).json({ error: 'Failed to count mails' });
  }
});

export default router;
