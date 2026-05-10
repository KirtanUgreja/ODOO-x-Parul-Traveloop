import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';

interface TokenPayload {
  userId: string;
}

export interface RequestWithUser extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    isAdmin: boolean;
  };
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  const request = req as RequestWithUser;
  let token;

  if (
    request.headers.authorization &&
    request.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = request.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'secret'
      ) as TokenPayload;

      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          isAdmin: true,
        },
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, user not found',
        });
      }

      // Attach user to request object
      request.user = user;
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(401).json({
        success: false,
        message: 'Not authorized, token failed',
      });
    }
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Not authorized, no token',
    });
  }
};
