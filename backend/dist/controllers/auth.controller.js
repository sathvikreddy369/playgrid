"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const db_1 = __importDefault(require("../utils/db"));
class AuthController {
    static async sync(req, res) {
        try {
            const firebaseUid = req.firebaseUid;
            if (!firebaseUid) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            // Check if user exists
            let user = await db_1.default.user.findUnique({
                where: { firebaseUid },
                include: { profile: true, badges: { include: { badge: true } }, communityMemberships: { include: { community: true } } }
            });
            if (!user) {
                // Create user
                const { email, name } = req.body || {};
                user = await db_1.default.user.create({
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
        }
        catch (error) {
            console.error('Sync error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    static async me(req, res) {
        try {
            const firebaseUid = req.firebaseUid;
            const user = await db_1.default.user.findUnique({
                where: { firebaseUid },
                include: { profile: true, badges: { include: { badge: true } }, communityMemberships: { include: { community: true } } }
            });
            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            res.status(200).json(user);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async upgradeToOrganizer(req, res) {
        try {
            const firebaseUid = req.firebaseUid;
            const user = await db_1.default.user.update({
                where: { firebaseUid },
                data: { role: 'ORGANIZER' }
            });
            res.status(200).json(user);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async makeMeAdmin(req, res) {
        try {
            const firebaseUid = req.firebaseUid;
            const user = await db_1.default.user.update({
                where: { firebaseUid },
                data: { role: 'ADMIN' }
            });
            res.status(200).json(user);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async updateProfile(req, res) {
        try {
            const firebaseUid = req.firebaseUid;
            const data = req.body;
            const user = await db_1.default.user.findUnique({ where: { firebaseUid } });
            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            const updatedProfile = await db_1.default.profile.upsert({
                where: { userId: user.id },
                update: data,
                create: {
                    userId: user.id,
                    ...data
                }
            });
            res.status(200).json(updatedProfile);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
exports.AuthController = AuthController;
