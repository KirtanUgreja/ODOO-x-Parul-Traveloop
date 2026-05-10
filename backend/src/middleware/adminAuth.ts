import { Response, NextFunction } from 'express';
import { RequestWithUser } from './auth';

export const adminProtect = (req: RequestWithUser, res: Response, next: NextFunction) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
    });
  }
};
