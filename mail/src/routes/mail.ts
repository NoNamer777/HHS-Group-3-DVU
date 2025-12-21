import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateM2M, AuthRequest } from '../middleware/auth';
import { isValidEmail } from '../utils/validation';

const router = Router();

// Singleton pattern to avoid multiple Prisma instances
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Get mail count for user (protected met M2M token) - MOET VOOR /user/:userId
router.get('/user/:userId/count', authenticateM2M, async (req: AuthRequest, res: Response) => {
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
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all mails for a user (protected met M2M token)
router.get('/user/:userId', authenticateM2M, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const mails = await prisma.mail.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(mails);
  } catch (error) {
    console.error('Error fetching mails:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific mail (protected met M2M token)
router.get('/:id', authenticateM2M, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const mail = await prisma.mail.findUnique({
      where: { id }
    });
    
    if (!mail) {
      return res.status(404).json({ error: 'Mail not found' });
    }
    
    res.json(mail);
  } catch (error) {
    console.error('Error fetching mail:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new mail (protected met M2M token)
router.post('/', authenticateM2M, async (req: AuthRequest, res: Response) => {
  try {
    const { userId, from, to, subject, body } = req.body;
    
    if (!userId || !from || !to || !subject || !body) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Validate email format
    if (!isValidEmail(from) || !isValidEmail(to)) {
      return res.status(400).json({ error: 'Invalid email format' });
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
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark mail as read (protected met M2M token)
router.patch('/:id/read', authenticateM2M, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // First check if mail exists
    const existingMail = await prisma.mail.findUnique({
      where: { id }
    });
    
    if (!existingMail) {
      return res.status(404).json({ error: 'Mail not found' });
    }
    
    const mail = await prisma.mail.update({
      where: { id },
      data: { isRead: true }
    });
    res.json(mail);
  } catch (error) {
    console.error('Error updating mail:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a mail (protected met M2M token)
router.delete('/:id', authenticateM2M, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // First check if mail exists
    const existingMail = await prisma.mail.findUnique({
      where: { id }
    });
    
    if (!existingMail) {
      return res.status(404).json({ error: 'Mail not found' });
    }
    
    await prisma.mail.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting mail:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
