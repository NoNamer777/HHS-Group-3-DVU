import { Request, Response } from 'express';
import { authenticateToken, validateUserAccess, AuthRequest } from '../../middleware/auth';
import { generateTestToken, mockUser } from '../utils/testHelpers';

describe('Auth Middleware', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      headers: {},
      params: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    nextFunction = jest.fn();
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('authenticateToken', () => {
    it('should reject request without authorization header', () => {
      authenticateToken(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Access token required'
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should reject request with invalid token', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token'
      };

      authenticateToken(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid or expired token'
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should accept valid token and attach user to request', () => {
      const token = generateTestToken(mockUser.userId, mockUser.email);
      mockRequest.headers = {
        authorization: `Bearer ${token}`
      };

      authenticateToken(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.user).toEqual({
        userId: mockUser.userId,
        email: mockUser.email
      });
    });

    it('should reject token without Bearer prefix', () => {
      const token = generateTestToken(mockUser.userId, mockUser.email);
      mockRequest.headers = {
        authorization: token
      };

      authenticateToken(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('validateUserAccess', () => {
    beforeEach(() => {
      mockRequest.user = {
        userId: mockUser.userId,
        email: mockUser.email
      };
    });

    it('should allow access to own user data', () => {
      mockRequest.params = { userId: mockUser.userId };

      validateUserAccess(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should deny access to other user data', () => {
      mockRequest.params = { userId: 'other-user-id' };

      validateUserAccess(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Access denied to this user's data"
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should reject if user not authenticated', () => {
      mockRequest.user = undefined;
      mockRequest.params = { userId: mockUser.userId };

      validateUserAccess(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Not authenticated'
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should pass if no userId in params', () => {
      mockRequest.params = {};

      validateUserAccess(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
    });
  });
});
