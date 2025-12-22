import { Request, Response, NextFunction } from 'express';
import { auth, AuthResult, UnauthorizedError, InvalidTokenError } from 'express-oauth2-jwt-bearer';

// Auth0 M2M token validator
const validateM2MToken = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: 'RS256'
});

export type AuthRequest = Request & {
  auth?: AuthResult;
};

// Middleware voor M2M authenticatie met betere error handling
export const authenticateM2M = (req: Request, res: Response, next: NextFunction) => {
  validateM2MToken(req, res, (err: any) => {
    if (err) {
      // Log specifieke authenticatiefouten server-side voor debugging
      const errorType = err instanceof UnauthorizedError
        ? 'UnauthorizedError'
        : err instanceof InvalidTokenError
        ? 'InvalidTokenError'
        : 'UnknownAuthError';
      
      console.error('M2M authentication failed', {
        type: errorType,
        name: err.name,
        message: err.message,
        code: err.code,
      });
      
      // Convert alle errors naar 401 Unauthorized voor de client
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Valid M2M token required'
      });
    }
    next();
  });
};

// Optionele middleware om te checken op specifieke permissions
export const requirePermission = (permission: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const permissions = (req.auth?.payload?.permissions || []) as string[];
    
    if (!permissions.includes(permission)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: permission 
      });
    }
    
    next();
  };
};
