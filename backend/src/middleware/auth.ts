import { Request, Response, NextFunction } from 'express';
import { supabase } from '../supabaseClient';
import { prisma } from '../db';
import { User } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid authorization header' });
      return;
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token with Supabase
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token);
    
    if (error || !supabaseUser) {
      res.status(401).json({ error: 'Unauthorized: Invalid token' });
      return;
    }

    // Read-only lookup by default to prevent write-on-read overhead on every request
    let user = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id }
    });

    // Safe user provisioning fallback if user does not exist in DB yet
    if (!user) {
      try {
        user = await prisma.user.create({
          data: {
            supabaseId: supabaseUser.id,
            email: supabaseUser.email!
          }
        });
      } catch (err: any) {
        // Handle potential concurrent creation race condition (Prisma P2002 unique constraint error)
        if (err?.code === 'P2002') {
          user = await prisma.user.findUnique({
            where: { supabaseId: supabaseUser.id }
          });
        } else {
          throw err;
        }
      }
    }

    if (!user) {
      res.status(500).json({ error: 'Failed to synchronize user account' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};

