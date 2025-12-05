import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  
  res.status(500).json({
    error: 'Er is een fout opgetreden',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};
