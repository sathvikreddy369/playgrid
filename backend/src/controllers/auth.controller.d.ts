import { Request, Response } from 'express';
export declare class AuthController {
    /**
     * Called by the frontend immediately after Firebase login.
     * Syncs the user to PostgreSQL.
     */
    static sync(req: Request, res: Response): Promise<void>;
    /**
     * Get current user details and profile
     */
    static me(req: Request, res: Response): Promise<void>;
    /**
     * Upgrade current user to ORGANIZER role
     */
    static upgradeToOrganizer(req: Request, res: Response): Promise<void>;
    /**
     * Upgrade current user to ADMIN role (For MVP/Testing)
     */
    static makeMeAdmin(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=auth.controller.d.ts.map