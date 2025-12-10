import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, validateUserAccess } from '../../middleware/auth';
import { generateTestToken, mockUser, mockUser2 } from '../utils/testHelpers';

// Mock Prisma Client
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    mail: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn()
    },
    $disconnect: jest.fn()
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient)
  };
});

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'mail-service' });
});

// Test routes
app.get('/api/mails/user/:userId', authenticateToken, validateUserAccess, async (req, res) => {
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

app.get('/api/mails/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const mail = await prisma.mail.findUnique({
      where: { id }
    });
    
    if (!mail) {
      return res.status(404).json({ error: 'Mail not found' });
    }
    
    if (mail.userId !== req.user?.userId) {
      return res.status(403).json({ error: 'Access denied to this mail' });
    }
    
    res.json(mail);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mail' });
  }
});

app.post('/api/mails', authenticateToken, async (req: any, res) => {
  try {
    const { userId, from, to, subject, body } = req.body;
    
    if (!userId || !from || !to || !subject || !body) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (userId !== req.user?.userId) {
      return res.status(403).json({ error: 'Cannot create mails for other users' });
    }

    const mail = await prisma.mail.create({
      data: { userId, from, to, subject, body }
    });
    
    res.status(201).json(mail);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create mail' });
  }
});

app.patch('/api/mails/:id/read', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    
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

app.delete('/api/mails/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    
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

app.get('/api/mails/user/:userId/count', authenticateToken, validateUserAccess, async (req, res) => {
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

describe('Mail API Endpoints', () => {
  let token: string;
  let token2: string;

  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
    token = generateTestToken(mockUser.userId, mockUser.email);
    token2 = generateTestToken(mockUser2.userId, mockUser2.email);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    it('should return health status without authentication', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'ok',
        service: 'mail-service'
      });
    });
  });

  describe('GET /api/mails/user/:userId', () => {
    it('should return mails for authenticated user', async () => {
      const mockMails = [
        {
          id: '1',
          userId: mockUser.userId,
          from: 'sender@example.com',
          to: 'receiver@example.com',
          subject: 'Test 1',
          body: 'Body 1',
          isRead: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      (prisma.mail.findMany as jest.Mock).mockResolvedValue(mockMails);

      const response = await request(app)
        .get(`/api/mails/user/${mockUser.userId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockMails);
      expect(prisma.mail.findMany).toHaveBeenCalledWith({
        where: { userId: mockUser.userId },
        orderBy: { createdAt: 'desc' }
      });
    });

    it('should deny access without token', async () => {
      const response = await request(app).get(`/api/mails/user/${mockUser.userId}`);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Access token required' });
    });

    it('should deny access to other user mails', async () => {
      const response = await request(app)
        .get(`/api/mails/user/${mockUser2.userId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ error: "Access denied to this user's data" });
    });
  });

  describe('GET /api/mails/:id', () => {
    it('should return mail if user owns it', async () => {
      const mockMail = {
        id: 'mail-123',
        userId: mockUser.userId,
        from: 'sender@example.com',
        to: 'receiver@example.com',
        subject: 'Test',
        body: 'Body',
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      (prisma.mail.findUnique as jest.Mock).mockResolvedValue(mockMail);

      const response = await request(app)
        .get('/api/mails/mail-123')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockMail);
    });

    it('should deny access to mail owned by other user', async () => {
      const mockMail = {
        id: 'mail-123',
        userId: mockUser2.userId,
        from: 'sender@example.com',
        to: 'receiver@example.com',
        subject: 'Test',
        body: 'Body',
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      (prisma.mail.findUnique as jest.Mock).mockResolvedValue(mockMail);

      const response = await request(app)
        .get('/api/mails/mail-123')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ error: 'Access denied to this mail' });
    });

    it('should return 404 if mail not found', async () => {
      (prisma.mail.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/mails/nonexistent')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Mail not found' });
    });
  });

  describe('POST /api/mails', () => {
    it('should create mail for authenticated user', async () => {
      const newMail = {
        userId: mockUser.userId,
        from: 'sender@example.com',
        to: 'receiver@example.com',
        subject: 'New Mail',
        body: 'Mail content'
      };

      const createdMail = {
        id: 'new-mail-id',
        ...newMail,
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      (prisma.mail.create as jest.Mock).mockResolvedValue(createdMail);

      const response = await request(app)
        .post('/api/mails')
        .set('Authorization', `Bearer ${token}`)
        .send(newMail);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(createdMail);
    });

    it('should deny creating mail for other users', async () => {
      const newMail = {
        userId: mockUser2.userId,
        from: 'sender@example.com',
        to: 'receiver@example.com',
        subject: 'New Mail',
        body: 'Mail content'
      };

      const response = await request(app)
        .post('/api/mails')
        .set('Authorization', `Bearer ${token}`)
        .send(newMail);

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ error: 'Cannot create mails for other users' });
    });

    it('should reject request with missing fields', async () => {
      const invalidMail = {
        userId: mockUser.userId,
        from: 'sender@example.com'
        // missing to, subject, body
      };

      const response = await request(app)
        .post('/api/mails')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidMail);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Missing required fields' });
    });
  });

  describe('PATCH /api/mails/:id/read', () => {
    it('should mark mail as read if user owns it', async () => {
      const existingMail = {
        id: 'mail-123',
        userId: mockUser.userId,
        from: 'sender@example.com',
        to: 'receiver@example.com',
        subject: 'Test',
        body: 'Body',
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const updatedMail = { ...existingMail, isRead: true };

      (prisma.mail.findUnique as jest.Mock).mockResolvedValue(existingMail);
      (prisma.mail.update as jest.Mock).mockResolvedValue(updatedMail);

      const response = await request(app)
        .patch('/api/mails/mail-123/read')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedMail);
    });

    it('should deny marking other user mail as read', async () => {
      const existingMail = {
        id: 'mail-123',
        userId: mockUser2.userId,
        isRead: false
      };

      (prisma.mail.findUnique as jest.Mock).mockResolvedValue(existingMail);

      const response = await request(app)
        .patch('/api/mails/mail-123/read')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ error: 'Access denied to this mail' });
    });
  });

  describe('DELETE /api/mails/:id', () => {
    it('should delete mail if user owns it', async () => {
      const existingMail = {
        id: 'mail-123',
        userId: mockUser.userId
      };

      (prisma.mail.findUnique as jest.Mock).mockResolvedValue(existingMail);
      (prisma.mail.delete as jest.Mock).mockResolvedValue(existingMail);

      const response = await request(app)
        .delete('/api/mails/mail-123')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(204);
    });

    it('should deny deleting other user mail', async () => {
      const existingMail = {
        id: 'mail-123',
        userId: mockUser2.userId
      };

      (prisma.mail.findUnique as jest.Mock).mockResolvedValue(existingMail);

      const response = await request(app)
        .delete('/api/mails/mail-123')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ error: 'Access denied to this mail' });
    });
  });

  describe('GET /api/mails/user/:userId/count', () => {
    it('should return mail counts for user', async () => {
      (prisma.mail.count as jest.Mock)
        .mockResolvedValueOnce(3) // unread
        .mockResolvedValueOnce(10); // total

      const response = await request(app)
        .get(`/api/mails/user/${mockUser.userId}/count`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        unreadCount: 3,
        totalCount: 10
      });
    });

    it('should deny access to other user counts', async () => {
      const response = await request(app)
        .get(`/api/mails/user/${mockUser2.userId}/count`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ error: "Access denied to this user's data" });
    });
  });
});
