"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const firebase_1 = require("../utils/firebase");
const db_1 = __importDefault(require("../utils/db"));
class AuthController {
    /**
     * Called by the frontend immediately after Firebase login.
     * Syncs the user to PostgreSQL.
     */
    static async sync(req, res) {
        try {
            // The firebaseUid is injected by requireAuth middleware
            const firebaseUid = req.firebaseUid;
            if (!firebaseUid) {
                res.status(401).json({ error: 'Unauthorized: Missing Firebase UID' });
                return;
            }
            // Fetch user details from Firebase to ensure we have the latest email/name
            if (!firebase_1.auth) {
                res.status(500).json({ error: 'Firebase Auth is not initialized properly on the server' });
                return;
            }
            const firebaseUser = await firebase_1.auth.getUser(firebaseUid);
            const email = firebaseUser.email || '';
            const name = firebaseUser.displayName || 'Unknown User';
            const { user, profile } = await auth_service_1.AuthService.syncUser(firebaseUid, email, name);
            res.status(200).json({
                message: 'User synced successfully',
                user,
                profile,
            });
        }
        catch (error) {
            console.error('Auth Sync Error:', error);
            res.status(500).json({ error: 'Failed to sync user' });
        }
    }
    /**
     * Get current user details and profile
     */
    static async me(req, res) {
        try {
            if (!req.user) {
                res.status(404).json({ error: 'User not found in database' });
                return;
            }
            // req.user already contains the user object from the middleware.
            // We can also fetch the profile if needed.
            const profile = await db_1.default.profile.findUnique({
                where: { userId: req.user.id }
            });
            res.status(200).json({ user: req.user, profile });
        }
        catch (error) {
            console.error('Fetch Me Error:', error);
            res.status(500).json({ error: 'Failed to fetch user profile' });
        }
    }
    /**
     * Upgrade current user to ORGANIZER role
     */
    static async upgradeToOrganizer(req, res) {
        try {
            const firebaseUid = req.firebaseUid;
            if (!firebaseUid) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const updatedUser = await db_1.default.user.update({
                where: { firebaseUid },
                data: { role: 'ORGANIZER' },
            });
            res.status(200).json({ message: 'Successfully upgraded to Organizer', user: updatedUser });
        }
        catch (error) {
            console.error('Upgrade Error:', error);
            res.status(500).json({ error: 'Failed to upgrade role' });
        }
    }
    /**
     * Upgrade current user to ADMIN role (For MVP/Testing)
     */
    static async makeMeAdmin(req, res) {
        try {
            const firebaseUid = req.firebaseUid;
            if (!firebaseUid) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const updatedUser = await db_1.default.user.update({
                where: { firebaseUid },
                data: { role: 'ADMIN' },
            });
            res.status(200).json({ message: 'Successfully upgraded to Admin', user: updatedUser });
        }
        catch (error) {
            console.error('Admin Upgrade Error:', error);
            res.status(500).json({ error: 'Failed to upgrade to admin' });
        }
    }
}
exports.AuthController = AuthController;
// End of controller
//# sourceMappingURL=auth.controller.js.map