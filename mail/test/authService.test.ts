import { authService } from '../src/services/authService';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    user: {
      findFirst: jest.fn(),
      create: jest.fn()
    },
    refreshToken: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn()
    }
  };

  return {
    PrismaClient: jest.fn(() => mockPrismaClient)
  };
});

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn()
}));

// Mock jwt
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn((payload, secret, options) => `mock-jwt-token-${payload.userId}`),
  verify: jest.fn()
}));

const prisma = new PrismaClient();

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({});

      const result = await authService.register('test@example.com', 'password123', 'testuser');

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('test@example.com');
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('should reject registration if user already exists', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({
        id: 'existing-user',
        email: 'test@example.com'
      });

      await expect(
        authService.register('test@example.com', 'password123')
      ).rejects.toThrow('User with this email or username already exists');
    });
  });

  describe('login', () => {
    it('should login with email successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({});

      const result = await authService.login('test@example.com', 'password123');

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should login with username successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({});

      const result = await authService.login('testuser', 'password123');

      expect(result).toHaveProperty('user');
      expect(result.user.username).toBe('testuser');
    });

    it('should reject login with invalid credentials', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        authService.login('test@example.com', 'wrong-password')
      ).rejects.toThrow('Invalid credentials');
    });

    it('should reject login with wrong password', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        password: 'hashed-password'
      };

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login('test@example.com', 'wrong-password')
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh token successfully', async () => {
      const jwt = require('jsonwebtoken');
      const mockDecoded = {
        userId: 'user-123',
        email: 'test@example.com'
      };

      const mockStoredToken = {
        id: 'token-123',
        token: 'old-refresh-token',
        userId: 'user-123',
        isRevoked: false,
        expiresAt: new Date(Date.now() + 86400000)
      };

      jwt.verify.mockReturnValue(mockDecoded);
      (prisma.refreshToken.findFirst as jest.Mock).mockResolvedValue(mockStoredToken);
      (prisma.refreshToken.update as jest.Mock).mockResolvedValue({});
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({});

      const result = await authService.refreshAccessToken('old-refresh-token');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(prisma.refreshToken.update).toHaveBeenCalledWith({
        where: { id: 'token-123' },
        data: { isRevoked: true }
      });
    });

    it('should reject expired refresh token', async () => {
      const jwt = require('jsonwebtoken');
      jwt.verify.mockImplementation(() => {
        throw new Error('Token expired');
      });

      await expect(
        authService.refreshAccessToken('expired-token')
      ).rejects.toThrow('Invalid or expired refresh token');
    });

    it('should reject revoked refresh token', async () => {
      const jwt = require('jsonwebtoken');
      const mockDecoded = {
        userId: 'user-123',
        email: 'test@example.com'
      };

      jwt.verify.mockReturnValue(mockDecoded);
      (prisma.refreshToken.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        authService.refreshAccessToken('revoked-token')
      ).rejects.toThrow('Invalid or expired refresh token');
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      (prisma.refreshToken.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      await authService.logout('refresh-token');

      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { token: 'refresh-token' },
        data: { isRevoked: true }
      });
    });
  });

  describe('logoutAll', () => {
    it('should logout from all devices', async () => {
      (prisma.refreshToken.updateMany as jest.Mock).mockResolvedValue({ count: 3 });

      await authService.logoutAll('user-123');

      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        data: { isRevoked: true }
      });
    });
  });

  describe('cleanupExpiredTokens', () => {
    it('should cleanup expired and revoked tokens', async () => {
      (prisma.refreshToken.deleteMany as jest.Mock).mockResolvedValue({ count: 5 });

      await authService.cleanupExpiredTokens();

      expect(prisma.refreshToken.deleteMany).toHaveBeenCalled();
    });
  });
});
