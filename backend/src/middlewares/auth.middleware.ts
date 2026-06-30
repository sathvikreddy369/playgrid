import { Request, Response, NextFunction } from 'express';
import { auth } from '../utils/firebase';
import prisma from '../utils/db';
import { Role } from '@prisma/client';

export const requireFirebaseUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized: No token provided' });
      return;
    }

    const idToken = authHeader.split('Bearer ')[1];
    if (!auth) {
      res.status(500).json({ error: 'Firebase Auth is not initialized properly on the server' });
      return;
    }

    const decodedToken = await auth.verifyIdToken(idToken);
    req.firebaseUid = decodedToken.uid;
    next();
  } catch (error) {
    console.error('Firebase Auth Error:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    return;
  }
};

export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized: No token provided' });
      return;
    }

    const idToken = authHeader.split('Bearer ')[1];

    if (!auth) {
      res.status(500).json({ error: 'Firebase Auth is not initialized properly on the server' });
      return;
    }

    // Verify token
    const decodedToken = await auth.verifyIdToken(idToken);
    req.firebaseUid = decodedToken.uid;

    // Fetch user from DB and attach to req
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
    });

    if (user) {
      if (user.isBlocked) {
        res.status(403).json({ error: 'Your account has been blocked by an administrator.' });
        return;
      }
      req.user = user;
      next();
    } else {
      res.status(401).json({ error: 'Unauthorized: User not synced to database yet' });
      return;
    }
  } catch (error) {
    console.error('Authentication Error:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    return;
  }
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const idToken = authHeader.split('Bearer ')[1];
    if (!auth) {
      next();
      return;
    }

    const decodedToken = await auth.verifyIdToken(idToken);
    req.firebaseUid = decodedToken.uid;

    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
    });

    if (user && !user.isBlocked) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Silently continue if token is invalid for optional auth
    next();
  }
};

export const requireRole = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized: User not found in database' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
      return;
    }

    next();
  };
};
