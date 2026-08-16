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

    // Upsert user into our Prisma database to ensure they exist
    const user = await prisma.user.upsert({
      where: { supabaseId: supabaseUser.id },
      update: { email: supabaseUser.email! },
      create: {
        supabaseId: supabaseUser.id,
        email: supabaseUser.email!,
        // We can default to USER, but the frontend passes role on signup
      }
    });

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};
