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

    // Handle demo bypass tokens for testing
    if (token?.startsWith('demo-token-')) {
      const isHost = token.includes('host') || token.includes('owner');
      const isAdminToken = token.includes('admin');
      const demoEmail = (req.headers['x-demo-email'] as string) || 
        (isAdminToken ? 'admin@gmail.com' : isHost ? 'demo.host@playgrid.com' : 'demo.player@playgrid.com');
      
      let user = await prisma.user.findUnique({ where: { email: demoEmail } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            supabaseId: `demo-id-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            email: demoEmail,
            role: demoEmail === 'admin@gmail.com' ? 'ADMIN' : isHost ? 'GROUND_OWNER' : 'USER',
            profile: {
              create: {
                name: demoEmail === 'admin@gmail.com' ? 'Platform Administrator' : demoEmail.split('@')[0] || 'Demo User',
                favoriteSports: ['Cricket', 'Football'],
                levels: ['Intermediate']
              }
            }
          }
        });
      }

      if (user.email === 'admin@gmail.com' && user.role !== 'ADMIN') {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { role: 'ADMIN' }
        });
      }

      if (user.isSuspended) {
        res.status(403).json({ error: 'Your account has been suspended due to policy violations.' });
        return;
      }

      req.user = user;
      return next();
    }

    // Verify token with Supabase Auth
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token);
    
    if (error || !supabaseUser) {
      res.status(401).json({ error: 'Unauthorized: Invalid token' });
      return;
    }

    let user = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id }
    });

    if (!user) {
      try {
        const isAdmin = supabaseUser.email === 'admin@gmail.com';
        user = await prisma.user.create({
          data: {
            supabaseId: supabaseUser.id,
            email: supabaseUser.email!,
            role: isAdmin ? 'ADMIN' : 'USER'
          }
        });
      } catch (err: any) {
        if (err?.code === 'P2002') {
          user = await prisma.user.findUnique({
            where: { supabaseId: supabaseUser.id }
          });
        } else {
          throw err;
        }
      }
    }

    if (user && user.email === 'admin@gmail.com' && user.role !== 'ADMIN') {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: 'ADMIN' }
      });
    }

    if (!user) {
      res.status(500).json({ error: 'Failed to synchronize user account' });
      return;
    }

    if (user.isSuspended) {
      res.status(403).json({ error: 'Your account has been suspended due to policy violations.' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    res.status(403).json({ error: 'Forbidden: Platform Admin privileges required' });
    return;
  }
  next();
};

export const requireOwner = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || (req.user.role !== 'GROUND_OWNER' && req.user.role !== 'POOL_OWNER' && req.user.role !== 'ADMIN')) {
    res.status(403).json({ error: 'Forbidden: Venue Owner privileges required' });
    return;
  }
  next();
};

