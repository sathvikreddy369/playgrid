import { Request, Response } from 'express';
import prisma from '../utils/db';

export class AuthController {
  static async sync(req: Request, res: Response) {
    try {
      const firebaseUid = (req as any).firebaseUid;
      if (!firebaseUid) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Check if user exists
      let user = await prisma.user.findUnique({
        where: { firebaseUid },
        include: { profile: true, badges: { include: { badge: true } }, communityMemberships: { include: { community: true } } }
      });

      if (!user) {
        // Create user
        const { email, name } = req.body || {};
        user = await prisma.user.create({
          data: {
            firebaseUid,
            email: email || '',
            name: name || 'Anonymous User',
            profile: {
              create: {} // Create empty profile
            }
          },
          include: { profile: true, badges: { include: { badge: true } }, communityMemberships: { include: { community: true } } }
        });
      }

      res.status(200).json(user);
    } catch (error: any) {
      console.error('Sync error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async me(req: Request, res: Response) {
    try {
      const firebaseUid = (req as any).firebaseUid;
      const user = await prisma.user.findUnique({
        where: { firebaseUid },
        include: { profile: true, badges: { include: { badge: true } }, communityMemberships: { include: { community: true } } }
      });
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      res.status(200).json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async upgradeToOrganizer(req: Request, res: Response) {
    try {
      const firebaseUid = (req as any).firebaseUid;
      const user = await prisma.user.update({
        where: { firebaseUid },
        data: { role: 'ORGANIZER' }
      });
      res.status(200).json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async makeMeAdmin(req: Request, res: Response) {
    try {
      const firebaseUid = (req as any).firebaseUid;
      const user = await prisma.user.update({
        where: { firebaseUid },
        data: { role: 'ADMIN' }
      });
      res.status(200).json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateProfile(req: Request, res: Response) {
    try {
      const firebaseUid = (req as any).firebaseUid;
      const data = req.body;
      
      const user = await prisma.user.findUnique({ where: { firebaseUid } });
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const updatedProfile = await prisma.profile.upsert({
        where: { userId: user.id },
        update: data,
        create: {
          userId: user.id,
          ...data
        }
      });
      res.status(200).json(updatedProfile);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
