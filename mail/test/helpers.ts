import jwt from 'jsonwebtoken';

export const generateTestToken = (userId: string, email: string): string => {
  const secret = process.env.JWT_SECRET || 'test-secret';
  return jwt.sign({ userId, email }, secret, { expiresIn: '1h' });
};

export const mockUser = {
  userId: 'test-user-123',
  email: 'test@example.com'
};

export const mockUser2 = {
  userId: 'test-user-456',
  email: 'test2@example.com'
};
