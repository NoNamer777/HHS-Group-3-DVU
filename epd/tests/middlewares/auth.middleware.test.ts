import { authenticateToken, authorizeRoles } from '../../backend/src/middlewares/auth.middleware';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

describe('Authentication Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    nextFunction = jest.fn();
  });

  describe('authenticateToken', () => {
    it('should return 401 if no token provided', () => {
      authenticateToken(
        mockRequest as any,
        mockResponse as any,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'No token provided' });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 403 with invalid token', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token'
      };

      authenticateToken(
        mockRequest as any,
        mockResponse as any,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid token' });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next() with valid token', () => {
      const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
      const payload = { id: 1, email: 'test@example.com', role: 'DOCTOR' };
      const token = jwt.sign(payload, secret);

      mockRequest.headers = {
        authorization: `Bearer ${token}`
      };

      authenticateToken(
        mockRequest as any,
        mockResponse as any,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest).toHaveProperty('user');
    });
  });

  describe('authorizeRoles', () => {
    it('should return 401 if user not authenticated', () => {
      const middleware = authorizeRoles('DOCTOR');

      middleware(
        mockRequest as any,
        mockResponse as any,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Not authenticated' });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 403 if user lacks required role', () => {
      (mockRequest as any).user = { id: 1, email: 'test@example.com', role: 'NURSE' };

      const middleware = authorizeRoles('DOCTOR', 'ADMIN');

      middleware(
        mockRequest as any,
        mockResponse as any,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Insufficient permissions' });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next() if user has required role', () => {
      (mockRequest as any).user = { id: 1, email: 'test@example.com', role: 'DOCTOR' };

      const middleware = authorizeRoles('DOCTOR', 'NURSE');

      middleware(
        mockRequest as any,
        mockResponse as any,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should work with multiple allowed roles', () => {
      (mockRequest as any).user = { id: 1, email: 'test@example.com', role: 'ADMIN' };

      const middleware = authorizeRoles('DOCTOR', 'NURSE', 'ADMIN');

      middleware(
        mockRequest as any,
        mockResponse as any,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
    });
  });
});
