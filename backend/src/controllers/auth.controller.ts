import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/db';
import { AppError } from '../utils/AppError';

export class AuthController {
  static async sync(req: Request, res: Response, next: NextFunction) {
    try {
      const firebaseUid = req.firebaseUid;
      if (!firebaseUid) {
        throw AppError.unauthorized('Unauthorized');
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
    } catch (error) {
      next(error);
    }
  }

  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) {
        throw AppError.unauthorized('User not found');
      }

      const fullUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: { profile: true, badges: { include: { badge: true } }, communityMemberships: { include: { community: true } } }
      });
      if (!fullUser) {
        throw AppError.notFound('User not found');
      }
      res.status(200).json(fullUser);
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) {
        throw AppError.unauthorized('User not found');
      }

      // req.body is already validated and stripped by Zod middleware
      const data = req.body;

      const updatedProfile = await prisma.profile.upsert({
        where: { userId: user.id },
        update: data,
        create: {
          userId: user.id,
          ...data
        }
      });
      res.status(200).json(updatedProfile);
    } catch (error) {
      next(error);
    }
  }
}
