import prisma from '../utils/db';
import { User, Profile } from '@prisma/client';

export class AuthService {
  /**
   * Syncs a Firebase user with the database.
   * Creates the user and a default profile if they don't exist.
   */
  static async syncUser(
    firebaseUid: string,
    email: string,
    name: string
  ): Promise<{ user: User; profile: Profile | null }> {
    // Upsert User
    const user = await prisma.user.upsert({
      where: { firebaseUid },
      update: {
        email, // Update email in case it changed in Google
        name,
      },
      create: {
        firebaseUid,
        email,
        name,
        role: 'PLAYER',
        reputation: 100,
      },
    });

    // Upsert Profile
    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      update: {}, // Don't overwrite existing profile data during sync
      create: {
        userId: user.id,
        sports: [],
      },
    });

    return { user, profile };
  }
}
