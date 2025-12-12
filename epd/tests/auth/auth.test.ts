import request from 'supertest';
import express from 'express';
import authRoutes from '../../backend/src/routes/auth.routes';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Authentication API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: `test${Date.now()}@example.com`,
          password: 'password123',
          role: 'DOCTOR'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('expiresIn');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email');
    });

    it('should return 400 if email already exists', async () => {
      const email = `duplicate${Date.now()}@example.com`;
      
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email,
          password: 'password123',
          role: 'DOCTOR'
        });

      // Duplicate registration
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email,
          password: 'password123',
          role: 'DOCTOR'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Email already in use');
    });

    it('should return 500 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'incomplete@example.com'
        });

      expect(response.status).toBe(500);
    });
  });

  describe('POST /api/auth/login', () => {
    const testUser = {
      firstName: 'Login',
      lastName: 'Test',
      email: `logintest${Date.now()}@example.com`,
      password: 'password123',
      role: 'DOCTOR'
    };

    beforeAll(async () => {
      // Create test user
      await request(app)
        .post('/api/auth/register')
        .send(testUser);
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('expiresIn');
      expect(response.body).toHaveProperty('user');
      expect(response.body.message).toBe('Logged in');
    });

    it('should return 401 with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should return 401 with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });
  });

  describe('GET /api/auth/profile', () => {
    let authToken: string;
    const testUser = {
      firstName: 'Profile',
      lastName: 'Test',
      email: `profiletest${Date.now()}@example.com`,
      password: 'password123',
      role: 'DOCTOR'
    };

    beforeAll(async () => {
      // Register and login
      await request(app)
        .post('/api/auth/register')
        .send(testUser);

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      authToken = loginResponse.body.accessToken;
    });

    it('should return user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('email');
      expect(response.body.email).toBe(testUser.email);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('No token provided');
    });

    it('should return 403 with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Invalid token');
    });
  });

  describe('POST /api/auth/refresh', () => {
    let refreshToken: string;

    beforeAll(async () => {
      const testUser = {
        firstName: 'Refresh',
        lastName: 'Test',
        email: `refreshtest${Date.now()}@example.com`,
        password: 'password123',
        role: 'DOCTOR'
      };

      await request(app)
        .post('/api/auth/register')
        .send(testUser);

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      refreshToken = loginResponse.body.refreshToken;
    });

    it('should refresh access token with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('expiresIn');
    });

    it('should return 400 without refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Refresh token required');
    });

    it('should return 401 with invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid refresh token');
    });
  });

  describe('POST /api/auth/logout', () => {
    let refreshToken: string;

    beforeEach(async () => {
      const testUser = {
        firstName: 'Logout',
        lastName: 'Test',
        email: `logouttest${Date.now()}@example.com`,
        password: 'password123',
        role: 'DOCTOR'
      };

      await request(app)
        .post('/api/auth/register')
        .send(testUser);

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      refreshToken = loginResponse.body.refreshToken;
    });

    it('should logout and revoke refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Logged out successfully');

      // Try to use revoked token
      const refreshResponse = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(refreshResponse.status).toBe(401);
      expect(refreshResponse.body.error).toBe('Refresh token has been revoked');
    });

    it('should return 400 without refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Refresh token required');
    });
  });

  describe('POST /api/auth/revoke-all', () => {
    let accessToken: string;
    let refreshToken1: string;
    let refreshToken2: string;

    beforeAll(async () => {
      const testUser = {
        firstName: 'RevokeAll',
        lastName: 'Test',
        email: `revokealltest${Date.now()}@example.com`,
        password: 'password123',
        role: 'DOCTOR'
      };

      await request(app)
        .post('/api/auth/register')
        .send(testUser);

      // First login
      const login1 = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      accessToken = login1.body.accessToken;
      refreshToken1 = login1.body.refreshToken;

      // Second login (simulate another device)
      const login2 = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      refreshToken2 = login2.body.refreshToken;
    });

    it('should revoke all refresh tokens for the user', async () => {
      const response = await request(app)
        .post('/api/auth/revoke-all')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('All tokens revoked successfully');

      // Try to use first revoked token
      const refresh1 = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: refreshToken1 });

      expect(refresh1.status).toBe(401);

      // Try to use second revoked token
      const refresh2 = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: refreshToken2 });

      expect(refresh2.status).toBe(401);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/auth/revoke-all');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('No token provided');
    });
  });
});
