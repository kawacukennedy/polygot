import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
  user?: any; // Assuming user ID and role are available from JWT payload
}

export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
};
