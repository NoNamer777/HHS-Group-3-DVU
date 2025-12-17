import request from 'supertest';
import express from 'express';
import authRoutes from '../src/routes/auth';
import { authService } from '../src/services/authService';

// Mock auth service
jest.mock('../src/services/authService', () => ({
  authService: {
    register: jest.fn(),
    login: jest.fn(),
    refreshAccessToken: jest.fn(),
    logout: jest.fn(),
    logoutAll: jest.fn()
  }
}));

// Mock auth middleware
jest.mock('../src/middleware/auth', () => ({
  authenticateToken: (req: any, res: any, next: any) => {
    req.user = { userId: 'test-user-123', email: 'test@example.com' };
    next();
  },
  AuthRequest: {}
}));

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const mockResult = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          username: 'testuser'
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      };

      (authService.register as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          username: 'testuser'
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockResult);
      expect(authService.register).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
        'testuser'
      );
    });

    it('should reject registration without email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject registration without password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle registration errors', async () => {
      (authService.register as jest.Mock).mockRejectedValue(
        new Error('User already exists')
      );

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('User already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with email', async () => {
      const mockResult = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          username: 'testuser'
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      };

      (authService.login as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          emailOrUsername: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
    });

    it('should login with username', async () => {
      const mockResult = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          username: 'testuser'
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      };

      (authService.login as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          emailOrUsername: 'testuser',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
    });

    it('should reject login with invalid credentials', async () => {
      (authService.login as jest.Mock).mockRejectedValue(
        new Error('Invalid credentials')
      );

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          emailOrUsername: 'test@example.com',
          password: 'wrong-password'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should reject login without credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh access token', async () => {
      const mockResult = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token'
      };

      (authService.refreshAccessToken as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: 'old-refresh-token'
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
    });

    it('should reject refresh without token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject invalid refresh token', async () => {
      (authService.refreshAccessToken as jest.Mock).mockRejectedValue(
        new Error('Invalid or expired refresh token')
      );

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: 'invalid-token'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid or expired refresh token');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      (authService.logout as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post('/api/auth/logout')
        .send({
          refreshToken: 'refresh-token'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Logged out successfully');
    });

    it('should reject logout without token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/logout-all', () => {
    it('should logout from all devices', async () => {
      (authService.logoutAll as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post('/api/auth/logout-all')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Logged out from all devices successfully');
      expect(authService.logoutAll).toHaveBeenCalledWith('test-user-123');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user info', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body.user).toEqual({
        userId: 'test-user-123',
        email: 'test@example.com'
      });
    });
  });
});
