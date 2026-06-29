import { User, Profile } from '@prisma/client';
export declare class AuthService {
    /**
     * Syncs a Firebase user with the database.
     * Creates the user and a default profile if they don't exist.
     */
    static syncUser(firebaseUid: string, email: string, name: string): Promise<{
        user: User;
        profile: Profile | null;
    }>;
}
//# sourceMappingURL=auth.service.d.ts.map