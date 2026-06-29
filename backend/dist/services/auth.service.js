"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const db_1 = __importDefault(require("../utils/db"));
class AuthService {
    /**
     * Syncs a Firebase user with the database.
     * Creates the user and a default profile if they don't exist.
     */
    static async syncUser(firebaseUid, email, name) {
        // Upsert User
        const user = await db_1.default.user.upsert({
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
        const profile = await db_1.default.profile.upsert({
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
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map