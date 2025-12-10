import { Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { AuthRequest } from '../types';
import { userService } from '../services/user.service';
import { prisma } from '../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const ACCESS_TOKEN_EXPIRY = '15m'; // Short-lived access token
const REFRESH_TOKEN_EXPIRY_DAYS = 7; // Refresh token valid for 7 days

export const authController = {
  async register(req: AuthRequest, res: Response) {
    try {
      const { firstName, lastName, email, password, role } = req.body;

      // Check if user exists
      const existingUser = await userService.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await userService.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role
      });

      // Generate tokens
      const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRY, algorithm: 'HS256' }
      );

      const refreshToken = crypto.randomBytes(64).toString('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

      // Store refresh token
      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt
        }
      });

      res.status(201).json({
        message: 'User created',
        accessToken,
        refreshToken,
        expiresIn: ACCESS_TOKEN_EXPIRY,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Error creating user' });
    }
  },

  async login(req: AuthRequest, res: Response) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await userService.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate tokens
      const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRY, algorithm: 'HS256' }
      );

      const refreshToken = crypto.randomBytes(64).toString('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

      // Store refresh token
      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt
        }
      });

      res.json({
        message: 'Logged in',
        accessToken,
        refreshToken,
        expiresIn: ACCESS_TOKEN_EXPIRY,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login error' });
    }
  },

  async getProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const user = await userService.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      console.error('Profile error:', error);
      res.status(500).json({ error: 'Error fetching profile' });
    }
  },

  async refresh(req: AuthRequest, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token required' });
      }

      // Find refresh token
      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true }
      });

      if (!storedToken) {
        return res.status(401).json({ error: 'Invalid refresh token' });
      }

      // Check if token is revoked
      if (storedToken.revokedAt) {
        return res.status(401).json({ error: 'Refresh token has been revoked' });
      }

      // Check if token is expired
      if (storedToken.expiresAt < new Date()) {
        return res.status(401).json({ error: 'Refresh token expired' });
      }

      // Generate new access token
      const accessToken = jwt.sign(
        { id: storedToken.user.id, email: storedToken.user.email, role: storedToken.user.role },
        JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRY, algorithm: 'HS256' }
      );

      res.json({
        accessToken,
        expiresIn: ACCESS_TOKEN_EXPIRY
      });
    } catch (error) {
      console.error('Refresh error:', error);
      res.status(500).json({ error: 'Error refreshing token' });
    }
  },

  async logout(req: AuthRequest, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token required' });
      }

      // Revoke refresh token
      await prisma.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { revokedAt: new Date() }
      });

      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Error logging out' });
    }
  },

  async revokeAllTokens(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Revoke all refresh tokens for the user
      await prisma.refreshToken.updateMany({
        where: { 
          userId: req.user.id,
          revokedAt: null
        },
        data: { revokedAt: new Date() }
      });

      res.json({ message: 'All tokens revoked successfully' });
    } catch (error) {
      console.error('Revoke tokens error:', error);
      res.status(500).json({ error: 'Error revoking tokens' });
    }
  }
};
